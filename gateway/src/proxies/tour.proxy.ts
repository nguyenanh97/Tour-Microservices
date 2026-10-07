import { Router } from 'express';
import createProxy from '../utils/createProxy';
import { protect } from '../middlewares/authMiddleware';

const router = Router();
const { TOUR_SERVICE_URL } = process.env;
if (!TOUR_SERVICE_URL) {
  throw new Error('TOUR_SERVICE_URL is not defined ');
}

// 1. Sanitize security headers for all incoming client requests on this proxy path
router.use('/api/v1/tours', (req, res, next) => {
  delete req.headers['x-user-id'];
  delete req.headers['x-user-role'];
  delete req.headers['x-user-verified'];
  next();
});

// 2. Protect mutating methods (POST, PATCH, DELETE)
router.use('/api/v1/tours', (req, res, next) => {
  const isMutating = ['POST', 'PATCH', 'DELETE'].includes(req.method);
  const isSensitiveGet =
    req.method === 'GET' &&
    (req.path.startsWith('/trash') ||
      req.path.startsWith('/tours-stats') ||
      req.path.startsWith('/monthly-plan'));
  if (isMutating || isSensitiveGet) {
    return protect(req, res, next);
  }
  next();
});

router.use('/api/v1/tours', createProxy(TOUR_SERVICE_URL, { '^/api/v1/tours': '' }));
export default router;
