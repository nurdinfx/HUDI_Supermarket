import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Most specific routes first
router.get('/ping', (req, res) => res.json({ message: 'Product routes are active' }));
router.post('/:id/reviews', protect, createProductReview);

// Standard product routes
router.get('/', getProducts);
router.post('/', protect, admin, createProduct);

router.get('/:id', getProductById);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
