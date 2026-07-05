import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { jwtVerify } from 'jose';
import { getAccessPublicKey } from '../configs/keys/key';
import { jwtPayload } from '../utils/jwtPayload';

const ISSUER = process.env.JWT_ISSUER;
const AUDIENCE = process.env.JWT_AUDIENCE!;

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Tạo JWT => User
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError('You are not logged in! please log in to get access.', 401),
      );
    }

    const token = authHeader.split(' ')[1];

    // kiểm tra tải trọng của user
    let payload;
    try {
      const result = await jwtVerify(token, getAccessPublicKey(), {
        issuer: ISSUER,
        audience: AUDIENCE,
      });
      payload = jwtPayload.parse(result.payload);
    } catch (err) {
      return next(new AppError('Invalid or expired token.', 401));
    }

    // tìm dữ liệu ở đb xem có tồn tại user không
    const currentUser = await User.findByPk(payload.sub);

    //không tồn tại
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401),
      );
    }

    // kiểm tra xem user có đổi password không
    if (payload.iat && currentUser.changedPasswordAfter(payload.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401),
      );
    }

    // kiểm tra user đã  xác minh mail chưa
    if (!currentUser.verified) {
      return next(
        new AppError('Email is not verified. Please verify your account.', 403),
      );
    }

    // gán thông tin vào req.user
    req.user = {
      id: currentUser.id,
      role: payload.role,
      verified: payload.verified ?? false,
    };
    next();
  },
);

// kiểm tra role phân quyền
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

// verify Email === true
export const checkVerifyEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user!.verified) {
    return next(
      new AppError('Please verify your email to access this feature.', 403),
    );
  }
  next();
};
