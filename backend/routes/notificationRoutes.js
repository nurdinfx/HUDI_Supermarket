import express from 'express';
const router = express.Router();
import {
  getNotifications,
  markAsRead,
  createNotification,
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, getNotifications)
  .post(protect, admin, createNotification);

router.route('/:id/read').put(protect, markAsRead);

export default router;
