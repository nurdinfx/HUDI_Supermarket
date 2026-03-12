import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendPushNotification } from '../utils/notification.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: 'i' } }
    : {};

  let categoryFilter = {};
  if (req.query.category) {
    // Import Category since we need to look up its ID
    const Category = (await import('../models/Category.js')).default;
    const categoryDoc = await Category.findOne({ name: req.query.category });
    if (categoryDoc) {
      categoryFilter = { category: categoryDoc._id };
    } else {
      // If category not found, return empty results
      return res.json({ products: [], page: 1, pages: 1 });
    }
  }

  const combinedFilter = { ...keyword, ...categoryFilter };

  const count = await Product.countDocuments(combinedFilter);
  const products = await Product.find(combinedFilter)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, images, category, countInStock, discount, isFeatured, isTrending } = req.body;

  const product = new Product({
    name: name || 'Sample name',
    price: price || 0,
    user: req.user._id,
    images: images || (image ? [image] : ['/images/sample.jpg']),
    category: category || null,
    countInStock: countInStock || 0,
    numReviews: 0,
    description: description || 'Sample description',
    discount: discount || 0,
    isFeatured: isFeatured || false,
    isTrending: isTrending || false
  });

  const createdProduct = await product.save();

  // Broadcast notification to all customers
  try {
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
    for (const user of users) {
      await sendPushNotification(
        user.fcmToken,
        '🛍️ New Product Arrival!',
        `${createdProduct.name} is now available in our supermarket! Check it out.`,
        { productId: createdProduct._id.toString(), type: 'NEW_PRODUCT' }
      );
    }
  } catch (error) {
    console.error('Broadcast notification failed:', error);
  }

  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, images, category, countInStock, discount, isFeatured, isTrending } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    
    // Handle both single 'image' and 'images' array
    if (images) {
      product.images = images;
    } else if (image) {
      product.images = [image];
    }
    
    product.category = category;
    product.countInStock = countInStock;
    product.discount = discount;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isTrending !== undefined) product.isTrending = isTrending;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
