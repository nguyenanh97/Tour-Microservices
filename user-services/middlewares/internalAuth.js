import crypto from 'crypto';
import AppError from '../utils/appError.js';
const headerName = 'x-internal-token';
function safeCompare(a = '', b = '') {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) {
      const max = Math.max(bufA.length, bufB.length);
      const pa = Buffer.alloc(max);
      const pb = Buffer.alloc(max);
      bufA.copy(pa);
      bufB.copy(pb);
      return crypto.timingSafeEqual(pa, pb) && false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

//
export default function internalAuth(req, res, next) {
  const token = req.header(headerName);
  if (!token || !process.env.USER_INTERNAL_TOKEN) {
    return next(new AppError('Unauthorized', 401));
  }
  if (!safeCompare(token, process.env.USER_INTERNAL_TOKEN)) {
    return next(new AppError('Unauthorized', 401));
  }
  next();
}
