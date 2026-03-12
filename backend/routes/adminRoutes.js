import express from 'express';
import { getAdminMetrics, getAdminRiders } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/metrics').get(protect, admin, getAdminMetrics);
router.route('/riders').get(protect, admin, getAdminRiders);

export default router;
