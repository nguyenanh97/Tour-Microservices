import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const protect = catchAsync(async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  if (!userId) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }
  req.user = {
    id: String(userId),
    role: (userRole && String(userRole)) || 'user',
    verified: req.headers['x-user-verified'] === 'true',
  };
  next();
});

//
export const restrictTo = (...role: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !role.includes(req.user.role || 'user')) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};
