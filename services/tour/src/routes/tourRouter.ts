import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import {
  validateTourCreate,
  validateTourUpdate,
  validateDistanceParams,
} from '../middlewares/tourValidation';
import internalAuth from '../middlewares/internalAuth';
import {
  createTour,
  updateTour,
  deleteTour,
  getAllTours,
  getTourID,
  getDistancens,
  getMonthlyPlan,
  getTourWithin,
  getTourStats,
  getAllDeletedTour,
  restoreTour,
} from '../controllers/tourController';
import { bookedSeats } from '../controllers/tourScheduleController';

import scheduleRouter from './scheduleRouter';
import { validateBookedSeats } from '../middlewares/scheduleValidation';

const router = express.Router();
router.patch(
  '/schedule/:scheduleId/seats',
  internalAuth,
  validateBookedSeats,
  bookedSeats
);

// Admin
router.route('/trash').get(protect, restrictTo('admin'), getAllDeletedTour);
router.route('/:id/restore').patch(protect, restrictTo('admin'), restoreTour);

//Tours routes
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin'), validateTourCreate, createTour);
router.route('/tours-stats').get(protect, getTourStats);

//Get monthly tour plan for a specific year
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin'), getMonthlyPlan);

// Get tours within a specified distance from a given locati
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(validateDistanceParams, getTourWithin);

// Distances routing
router.route('/distances/:latlng/unit/:unit').get(getDistancens);
router.route('/distances/:distance/:latlng/unit/:unit').get(getDistancens);

//  ID
router
  .route('/:id')
  .get(getTourID)
  .patch(protect, restrictTo('admin'), validateTourUpdate, updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);

// Schedule Router { mergeParams: true }
router.use('/:tourId/schedules', scheduleRouter);

export default router;
