import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendPushNotification } from '../utils/notification.js';
import User from '../models/User.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentProofImage,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentProofImage,
      status: paymentMethod === 'Mobile Money Payment' ? (paymentProofImage ? 'Pending Verification' : 'Pending Payment') : 'Order placed',
      paymentStatus: paymentProofImage ? 'Pending Verification' : 'Pending'
    });

    const createdOrder = await order.save();
    
    // Notify customer about new order
    const user = await User.findById(req.user._id);
    if (user && user.fcmToken) {
      await sendPushNotification(user.fcmToken, 'Order Placed!', `Your order #${createdOrder._id} has been successfully placed.`);
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email phone'
  ).populate('rider', 'name phone');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };
    order.status = 'Confirmed';
    order.paymentStatus = 'Confirmed';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status (Admin/Rider)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Rider
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    if (req.body.status === 'Delivered') {
      order.deliveredAt = Date.now();
      order.isPaid = true; // Assuming CoD pays when delivered
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Assign Rider to Order (Admin)
// @route   PUT /api/orders/:id/assign
// @access  Private/Admin
const assignRider = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.rider = req.body.riderId;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get rider orders
// @route   GET /api/orders/rider
// @access  Private/Rider
const getRiderOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ rider: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Submit payment proof (Customer)
// @route   PUT /api/orders/:id/proof
// @access  Private
const submitPaymentProof = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this order');
    }
    
    order.paymentProofImage = req.body.image;
    order.paymentStatus = 'Pending Verification';
    order.status = 'Pending Verification';

    const updatedOrder = await order.save();

    // Notify admins about new payment proof
    try {
      const admins = await User.find({ role: 'admin' });
      for (const adminUser of admins) {
        if (adminUser.fcmToken) {
          await sendPushNotification(
            adminUser.fcmToken, 
            'New Payment Proof!', 
            `Customer ${req.user.name} uploaded proof for Order #${order._id.toString().substring(order._id.toString().length - 8)}`
          );
        }
      }
    } catch (notifyError) {
      console.error('Admin notification failed:', notifyError);
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Verify payment (Admin)
// @route   PUT /api/orders/:id/verify
// @access  Private/Admin
const verifyPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const { status, note } = req.body; // status: 'Confirmed' or 'Rejected'
    
    if (status === 'Confirmed') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'Confirmed';
      order.status = 'Confirmed';
    } else if (status === 'Rejected') {
      order.paymentStatus = 'Rejected';
      order.rejectionNote = note;
      order.status = 'Pending Payment'; // Allow re-upload
    }

    const updatedOrder = await order.save();
    
    // Notify customer
    const user = await User.findById(order.user);
    if (user && user.fcmToken) {
      const message = status === 'Confirmed' 
        ? 'Payment confirmed! We are now preparing your order.' 
        : `Payment rejected. Reason: ${note}`;
      await sendPushNotification(user.fcmToken, 'Payment Update', message);
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  assignRider,
  getMyOrders,
  getRiderOrders,
  getOrders,
  submitPaymentProof,
  verifyPayment,
};
