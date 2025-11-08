import express from 'express';
import validate from '../middlewares/validationMiddleware.js';
import {
  protect,
  restrictTo,
  checkVerifyEmail,
} from '../middlewares/authMiddleware.js';
const router = express.Router();
import {
  createTour,
  updateTour,
  deleteTour,
  getAllTours,
  getTourID,
  getDistancens,
  getMonthlyPlan,
  getTourWithin,
  getTopcheap,
  getTourStats,
} from '../controllers/tourController.js';

// All middlewares

router.route('/').get(getAllTours).post(restrictTo('admin'), createTour);
//router.param('id');
router.route('/top-5-cheap').get(getTopcheap, getAllTours);
router.route('/tours-stats').get(getTourStats);
//
router.route('/monthly-plan/:year').get(getMonthlyPlan);

//
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(validate, getTourWithin);

router.route('/distances/:distance/:latlng/unit/:unit').get(validate, getDistancens);

//
//
router
  .route('/:id')
  .get(getTourID)
  .patch(restrictTo('admin'), updateTour)
  .delete(restrictTo('admin'), deleteTour);

export default router;
