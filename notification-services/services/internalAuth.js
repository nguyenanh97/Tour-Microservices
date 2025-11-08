import AppError from '../utils/appError.js';

export default function internalAuth(req, res, next) {
  const token = req.header('x-internal-token');
  if (!token || token !== process.env.NOTIF_INTERNAL_TOKEN) {
    return next(new AppError('Unauthorized service call', 401));
  }
  next();
}
