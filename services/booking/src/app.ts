import dotenv from 'dotenv';
const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env';
dotenv.config({ path: envFile });
import express, { Request, Response, NextFunction } from 'express';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import bookingRouter from './routes/bookingRoute';
import logger from './utils/logger';

const app = express();
app.use(express.json());

// Routes
app.use('/', bookingRouter);
console.log('🚀 Tour router mounted at /');

// Global error handler for 404
app.all('/*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Enhanced error handling middleware
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
  });
  globalErrorHandler(err, req, res, next);
});

export default app;
