import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
  }

  res.json(cart);
});

// @desc    Update user cart
// @route   POST /api/cart
// @access  Private
const updateCart = asyncHandler(async (req, res) => {
  const { items, totalPrice } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = items;
    cart.totalPrice = totalPrice;
    const updatedCart = await cart.save();
    res.json(updatedCart);
  } else {
    cart = await Cart.create({
      user: req.user._id,
      items,
      totalPrice
    });
    res.json(cart);
  }
});

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    cart.totalPrice = 0;
    const updatedCart = await cart.save();
    res.json(updatedCart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

export { getCart, updateCart, clearCart };
