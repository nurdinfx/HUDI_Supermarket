import express from 'express';
const router = express.Router();
import {
  getDeliveries,
  getRiderDeliveries,
  updateDeliveryStatus,
  createDelivery,
} from '../controllers/deliveryController.js';
import { protect, admin, rider } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, admin, getDeliveries)
  .post(protect, admin, createDelivery);

router.route('/rider').get(protect, rider, getRiderDeliveries);
router.route('/:id/status').put(protect, rider, updateDeliveryStatus);

export default router;
