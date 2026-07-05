import { Router } from 'express';
import createProxy from '../utils/createProxy';
const router = Router();
const { TOUR_SERVICE_URL } = process.env;
if (!TOUR_SERVICE_URL) {
  throw new Error('TOUR_SERVICE_URL is not defined ');
}
router.use('/api/v1/tours', createProxy(TOUR_SERVICE_URL, { '^/api/v1/tours': '' }));
export default router;
