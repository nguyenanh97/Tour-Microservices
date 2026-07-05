import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

export default function internalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.header('x-internal-token');
  if (!token || token !== process.env.NOTIF_INTERNAL_TOKEN) {
    return next(new AppError('Unauthorized service call', 401));
  }
  next();
}
