import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { Request, Response, NextFunction } from 'express';

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  const userVerified = req.headers['x-user-verified'];

  if (!userId) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  req.user = {
    id: String(userId),
    role: (userRole && String(userRole)) || 'user',
    verified: userVerified === 'true',
  };

  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role || 'user')) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

export const checkVerifyEmail = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.verified) {
    return next(
      new AppError('Please verify your email to access this feature.', 403),
    );
  }
  next();
};
