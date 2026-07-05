import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import AppError from '../utils/appError';

//TYPE GUARD FUNCTIONS
function isJWTError(err: unknown): err is JsonWebTokenError {
  return err instanceof JsonWebTokenError;
}

function isJWTExpiredError(err: unknown): err is TokenExpiredError {
  return err instanceof TokenExpiredError;
}

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

// GLOBAL ERROR HANDLER

const sendErrorDev = (err: AppError, res: Response) => {
  if (res.headersSent) return;
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (res.headersSent) return;
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

//GLOBAL ERROR HANDLER MIDDLEWARE
export default (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  //dev Error handling

  let err: AppError;
  if (error instanceof AppError) {
    err = error;
  } else if (error instanceof Error) {
    err = new AppError(error.message, 500);
  } else {
    err = new AppError('An unknown error occurred', 500);
  }
  const env = process.env.NODE_ENV || 'development';
  if (env === 'development') {
    return sendErrorDev(err, res);
  }

  // porduction error handling

  let processedError = err;

  if (isJWTExpiredError(error)) processedError = handleJWTExpiredError();
  else if (isJWTError(error)) processedError = handleJWTError();

  return sendErrorProd(processedError, res);
};
