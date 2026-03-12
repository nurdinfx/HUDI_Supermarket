import express from 'express';
const router = express.Router();
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/:id').delete(protect, admin, deleteCoupon);
router.post('/validate', protect, validateCoupon);

export default router;
