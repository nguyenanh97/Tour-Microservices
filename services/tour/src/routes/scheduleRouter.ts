import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import {
  validateScheduleCreate,
  validateScheduleUpdate,
} from '../middlewares/scheduleValidation';
import {
  createSchedule,
  updateSchedule,
  getAllSchedule,
  deleteSchedule,
} from '../controllers/tourScheduleController';

//{ mergeParams: true } ':tourId' =>TourRouter
const router = express.Router({ mergeParams: true });

// 2. Schedules nested routes
router
  .route('/')
  .get(getAllSchedule)
  .post(protect, restrictTo('admin'), validateScheduleCreate, createSchedule);

router
  .route('/:scheduleId')
  .patch(protect, restrictTo('admin'), validateScheduleUpdate, updateSchedule)
  .delete(protect, restrictTo('admin'), deleteSchedule);

export default router;
