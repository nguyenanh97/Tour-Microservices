import express from 'express';
const router = express.Router();
import * as paymentController from '../controllers/paymentController.js';
import * as authMiddleware from '../src/middlewares/authMiddleware.js';
//payment->booking
router.post(
  '/create-checkout-session',
  authMiddleware.internalAuth,
  paymentController.createCheckoutSession,
);
export default router;
