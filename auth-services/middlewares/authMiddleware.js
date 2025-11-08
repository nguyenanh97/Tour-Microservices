import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { jwtPayload } from '../utils/jwtPayloadSchema.js';

const publicKey = fs.readFileSync(
  path.join(process.cwd(), 'config/jwtRS256.key.pub'),
  'utf-8',
);

export const protect = catchAsync(async (req, res, next) => {
  // Tạo JWT => User
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError('You are not logged in! please log in to get access.', 401),
    );
  }

  const token = authHeader.split(' ')[1];

  // kiểm tra tải trọng của user
  let decoded;
  try {
    decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

    //validate payload bằng Zod
    decoded = jwtPayload.parse(decoded);
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }

  // tìm dữ liệu ở đb xem có tồn tại user không
  const currentUser = await User.findById(decoded.id);

  //không tồn tại
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401),
    );
  }

  // kiểm tra xem user có đổi password không
  if (currentUser.changedPasswordAfter(decoded.iat)) {
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
    ...currentUser.toObject(),
    id: currentUser._id.toString(),
  };
  next();
});

// kiểm tra role phân quyền
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

// verify Email === true
export const checkVerifyEmail = (req, res, next) => {
  if (!req.user.verified) {
    return next(
      new AppError('Please verify your email to access this feature.', 403),
    );
  }
  next();
};

// # Tạo private key
// openssl genrsa -out jwtRS256.key 2048

// # Xuất public key
// openssl rsa -in jwtRS256.key -pubout -out jwtRS256.key.pub
