import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Get dashboard metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
const getAdminMetrics = asyncHandler(async (req, res) => {
  const usersCount = await User.countDocuments();
  const productsCount = await Product.countDocuments();
  const ordersCount = await Order.countDocuments();

  const orders = await Order.find({});
  const totalSales = orders.reduce((acc, item) => acc + (item.isPaid ? item.totalPrice : 0), 0);

  // Group by date for charts (simple logic)
  const salesByDate = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    usersCount,
    productsCount,
    ordersCount,
    totalSales,
    salesByDate,
  });
});

// @desc    Get all riders
// @route   GET /api/admin/riders
// @access  Private/Admin
const getAdminRiders = asyncHandler(async (req, res) => {
  const riders = await User.find({ role: 'rider' }).select('name email phone');
  res.json(riders);
});

export { getAdminMetrics, getAdminRiders };
