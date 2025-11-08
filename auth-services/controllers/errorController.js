import AppError from '../utils/appError.js';
// name :cast DB
const handlCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  return new AppError(message, 400);
};
//trùng lặp
const handlDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value :${value} Please use another value ! `;
  return new AppError(message, 400);
};
// xác thực
const handlValidationErrorDB = err => {
  const validaErrors = Object.values(err.errors).map(val => val.message);

  const message = `Invalid input data.${validaErrors.join('. ')}`;
  return new AppError(message, 400);
};

// JWT Error
const handlJwtErrorDB = () =>
  new AppError('Invalid Token. Please log in again  ', 401);

// Token Error
const handlTokenExpiredErrorDB = () =>
  new AppError(' Your token has expired ! Pleas log in again ', 401);

const sendErrorDev = (err, res) => {
  if (res.headersSent) return;

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //  client err
  if (res.headersSent) return;
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // log err

    console.error('ERROR', err);
    // err programming err
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    sendErrorDev(err, res);
  } else if (env === 'production') {
    let error = { ...err, message: err.message };

    if (error.name === 'CastError') error = handlCastErrorDB(error);
    if (error.code === 11000) error = handlDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handlValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handlJwtErrorDB(error);
    if (error.name === 'TokenExpiredError') error = handlTokenExpiredErrorDB(error);
    sendErrorProd(error, res);
  } else {
    // Fallback cho test / undefined / staging
    sendErrorDev(err, res);
  }
};
