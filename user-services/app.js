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
import userRouter from './routes/userRouter.js';
import logger from './utils/logger.js';

const app = express();
app.use(express.json());

// Routes
app.use('/', userRouter);
console.log('🚀 User router mounted at /api/v1/users');

// Global error handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Enhanced error handling
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
  });
  globalErrorHandler(err, req, res, next);
});

export default app;
