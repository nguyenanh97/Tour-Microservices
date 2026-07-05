import dotenv from 'dotenv';
const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env';
dotenv.config({ path: envFile });

import express from 'express';
import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import paymentRouter from './routes/paymentRouter.js';
import { stripeWebhook } from './controllers/paymentController.js';
import logger from './utils/logger.js';
const app = express();

//Webhook endpoint must be before body parser
app.post(
  '/api/v1/payments/webhook/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook,
);

// Routes
app.use(express.json());
app.use('/', paymentRouter);
console.log('🚀 Payment router mounted at /api/v1/payments');

// Global error handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// enhanced error handling
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
  });
  globalErrorHandler(err, req, res, next);
});
