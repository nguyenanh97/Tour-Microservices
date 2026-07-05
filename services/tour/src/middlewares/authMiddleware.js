import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { jwtPayload } from '../utils/jwtPayloadSchema.js';
const publicKey = fs.readFileSync(
  path.join(process.cwd(), 'config/jwtRS256.key.pub'),
  'utf-8'
);

export const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authenticated', 401));
  }
  const token = authHeader.split(' ')[1];

  // check payload
  try {
    let decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    decoded = jwtPayload.parse(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }
});
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

export const checkVerifyEmail = (req, res, next) => {
  if (!req.user.verified) {
    return next(
      new AppError('Please verify your email to access this feature.', 403)
    );
  }
  next();
};
