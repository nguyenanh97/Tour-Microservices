import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import authProxy from './auth.proxy';
import userProxy from './user.proxy';

const proxyRouter = Router();

// PROTECTED
proxyRouter.use(authProxy);
proxyRouter.use(userProxy);
// proxyRouter.use(tourProxy);
// proxyRouter.use(bookingProxy);
// proxyRouter.use(paymentProxy);
// proxyRouter.use(notificationProxy);

export default proxyRouter;
