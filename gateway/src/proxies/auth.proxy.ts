import { Router } from 'express';
import createProxy from '../utils/createProxy';
import { protect } from '../middlewares/authMiddleware';
const router = Router();
const { AUTH_SERVICE_URL } = process.env;
console.log('AUTH_SERVICE_URL:', AUTH_SERVICE_URL);
if (!AUTH_SERVICE_URL) {
  throw new Error('AUTH_SERVICE_URL is not defined ');
}
//PROTECTED auth routes
// router.use(
//   '/api/v1/auth/deleteMe',
//   protect,
//   createProxy(AUTH_SERVICE_URL, { '^/api/v1/auth': '' }),
// );

//
router.use('/api/v1/auth', createProxy(AUTH_SERVICE_URL, { '^/api/v1/auth': '' }));
export default router;
