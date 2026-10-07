import express from 'express';
import { protect, restrictTo } from '../middleweres/authMiddleware';
import {
  createBooking,
  updateBooking,
  updateBookingAdmin,
  getBookingId,
  getAllBookings,
  getMeBookings,
  cancelBooking,
} from '../controllers/bookingController';
import {
  validateBookingCreate,
  validateBookingUpdate,
  validateBookingStatus,
} from '../middleweres/bookingValidation';
const router = express.Router();
router.route('/').post(protect, validateBookingCreate, createBooking);
router.route('/me').get(protect, getMeBookings);
router.route('/:id/cancel').patch(protect, cancelBooking);
// Admin

router.route('/admin').get(protect, restrictTo('admin'), getAllBookings);

router
  .route('/:id')
  .patch(protect, validateBookingUpdate, updateBooking)
  .get(protect, getBookingId);

router
  .route('/:id/status')
  .patch(protect, restrictTo('admin'), validateBookingStatus, updateBookingAdmin);
export default router;
