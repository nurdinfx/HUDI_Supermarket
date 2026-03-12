import express from 'express';
const router = express.Router();
import { processPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/process', protect, processPayment);

export default router;
