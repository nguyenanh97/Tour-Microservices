import { Router } from 'express';
import authProxy from './auth.proxy';
import userProxy from './user.proxy';
import tourProxy from './tour.proxy';
import bookingProxy from './booking.proxy';
import notificationProxy from './notification.proxy';

const proxyRouter = Router();

// PROTECTED
proxyRouter.use(authProxy);
proxyRouter.use(userProxy);
proxyRouter.use(tourProxy);
proxyRouter.use(bookingProxy);
// proxyRouter.use(paymentProxy);
proxyRouter.use(notificationProxy);

export default proxyRouter;
