import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import {
  ValidationError as SequelizeValidationError,
  UniqueConstraintError,
} from 'sequelize';
import AppError from '../utils/appError';

//TYPE GUARD FUNCTIONS

function isDuplicateError(err: unknown): err is UniqueConstraintError {
  return err instanceof UniqueConstraintError;
}
function isValidationError(err: unknown): err is SequelizeValidationError {
  return err instanceof SequelizeValidationError;
}
function isJWTError(err: unknown): err is JsonWebTokenError {
  return err instanceof JsonWebTokenError;
}

function isJWTExpiredError(err: unknown): err is TokenExpiredError {
  return err instanceof TokenExpiredError;
}

// ERROR TRANSFORMER FUNCTIONS

const handleDuplicateFieldDB = (err: UniqueConstraintError) => {
  const field = err.errors[0]?.path || 'unknown';
  const value = err.errors[0]?.value || 'unknown';
  const message = `Duplicate field value: ${field} = ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: SequelizeValidationError) => {
  const errors = err.errors.map(e => e.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

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
      status: 'Error',
      message: 'Something went very wrong!',
    });
  }
};
function normalizeError(error: unknown): AppError {
  // Keep AppError
  if (error instanceof AppError) return error;
  if (isDuplicateError(error)) return handleDuplicateFieldDB(error);
  else if (isValidationError(error)) return handleValidationErrorDB(error);
  else if (isJWTExpiredError(error)) return handleJWTExpiredError();
  else if (isJWTError(error)) return handleJWTError();
  // Fallback
  if (error instanceof Error) return new AppError(error.message, 500);
  return new AppError('An unknown error occurred', 500);
}

//GLOBAL ERROR HANDLER MIDDLEWARE

export default (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  //dev Error handling
  const env = process.env.NODE_ENV || 'development';
  const err = normalizeError(error);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env === 'development') {
    return sendErrorDev(err, res);
  }

  // porduction error handling
  return sendErrorProd(err, res);
};
