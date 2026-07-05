import { Router } from 'express';
import createProxy from '../utils/createProxy';
import { protect } from '../middlewares/authMiddleware';
const router = Router();
const { USER_SERVICE_URL } = process.env;
if (!USER_SERVICE_URL) {
  throw new Error('USER_SERVICE_URL is not defined ');
}
router.use(
  '/api/v1/users',
  protect,
  createProxy(USER_SERVICE_URL, { '^/api/v1/users': '' }),
);

export default router;
