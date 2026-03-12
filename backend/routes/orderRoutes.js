import express from 'express';
import {
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
} from '../controllers/orderController.js';
import { protect, admin, rider } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/rider').get(protect, rider, getRiderOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/proof').put(protect, submitPaymentProof);
router.route('/:id/verify').put(protect, admin, verifyPayment);
router.route('/:id/status').put(protect, rider, updateOrderStatus);
router.route('/:id/assign').put(protect, admin, assignRider);

export default router;
