import { Router } from 'express';
import createProxy from '../utils/createProxy';
const router = Router();
const { PAYMENT_SERVICE_URL } = process.env;
if (!PAYMENT_SERVICE_URL) {
  throw new Error('PAYMENT_SERVICE_URL is not defined ');
}
router.use(
  '/api/v1/payments',
  createProxy(PAYMENT_SERVICE_URL, { '^/api/v1/payments': '' }),
);

export default router;
