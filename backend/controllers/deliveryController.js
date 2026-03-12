import asyncHandler from 'express-async-handler';
import Delivery from '../models/Delivery.js';
import Order from '../models/Order.js';

// @desc    Get all deliveries (Admin)
// @route   GET /api/deliveries
// @access  Private/Admin
const getDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find({}).populate('order').populate('rider', 'name phone');
  res.json(deliveries);
});

// @desc    Get rider deliveries
// @route   GET /api/deliveries/rider
// @access  Private/Rider
const getRiderDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find({ rider: req.user._id }).populate('order');
  res.json(deliveries);
});

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private/Rider/Admin
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status, lat, lng, notes } = req.body;
  const delivery = await Delivery.findById(req.params.id);

  if (delivery) {
    delivery.status = status || delivery.status;
    if (lat && lng) {
      delivery.deliveryLocation = { lat, lng };
    }
    if (notes) delivery.notes = notes;

    if (status === 'Picked Up') delivery.pickupTime = Date.now();
    if (status === 'Delivered') delivery.deliveryTime = Date.now();

    const updatedDelivery = await delivery.save();

    // Sync status with Order
    const order = await Order.findById(delivery.order);
    if (order) {
      order.status = status === 'Delivered' ? 'Delivered' : 'Out for delivery';
      await order.save();
    }

    res.json(updatedDelivery);
  } else {
    res.status(404);
    throw new Error('Delivery not found');
  }
});

// @desc    Create a delivery assignment
// @route   POST /api/deliveries
// @access  Private/Admin
const createDelivery = asyncHandler(async (req, res) => {
  const { orderId, riderId } = req.body;

  const deliveryExists = await Delivery.findOne({ order: orderId });
  if (deliveryExists) {
    res.status(400);
    throw new Error('Delivery already assigned for this order');
  }

  const delivery = new Delivery({
    order: orderId,
    rider: riderId,
  });

  const createdDelivery = await delivery.save();
  res.status(201).json(createdDelivery);
});

export { getDeliveries, getRiderDeliveries, updateDeliveryStatus, createDelivery };
