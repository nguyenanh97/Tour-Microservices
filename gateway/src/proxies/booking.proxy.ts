import { Router } from 'express';
import createProxy from '../utils/createProxy';
import { protect } from '../middlewares/authMiddleware';
const router = Router();
const { BOOKING_SERVICE_URL } = process.env;
if (!BOOKING_SERVICE_URL) {
  throw new Error('BOOKING_SERVICE_URL is not defined ');
}
router.use(
  '/api/v1/bookings',
  protect,
  createProxy(BOOKING_SERVICE_URL, { '^/api/v1/bookings': '' }),
);

export default router;
