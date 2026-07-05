import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const protect = catchAsync(async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  if (!userId) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }
  req.user = {
    id: userId,
    role: userRole || 'user',
    verified: req.headers['x-user-verified'] === 'true',
  };
  next();
});

//
export const restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};
