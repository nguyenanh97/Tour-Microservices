import { Router } from 'express';
import createProxy from '../utils/createProxy';
import { protect } from '../middlewares/authMiddleware';
const router = Router();
const { NOTIFICATION_SERVICE_URL } = process.env;
if (!NOTIFICATION_SERVICE_URL) {
  throw new Error('NOTIFICATION_SERVICE_URL is not defined');
}
router.use(
  '/api/v1/notification',
  createProxy(NOTIFICATION_SERVICE_URL, { '^/api/v1/notification': '' }),
);

export default router;
