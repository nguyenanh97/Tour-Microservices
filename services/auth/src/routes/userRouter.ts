import { protect, checkVerifyEmail } from '../middlewares/authMiddleware';
import express from 'express';
import * as limitersMiddleware from '../middlewares/limitersMiddleware';
import * as authController from '../controllers/authController';
const router = express.Router();

//Sign,login
router.post('/signup', limitersMiddleware.signupLimiter, authController.userSignup);
router.post('/login', limitersMiddleware.loginLimiter, authController.userLogin);

// verify,resendVerify
router.get('/verifyEmail/:token', authController.verifyEmail);
router.post('/resendVerifyEmail', authController.resendVerifyEmail);

//password
router.post(
  '/forgotPassword',
  limitersMiddleware.forgotPasswordLimiter,
  authController.forgotPassword,
);
router.patch(
  '/resetPassword/:token',
  limitersMiddleware.resetPasswordLimiter,
  authController.resetPassword,
);

// ME
router.use(protect, checkVerifyEmail);
router.patch(
  '/updatePassword',
  limitersMiddleware.updatePasswordLimiter,
  authController.updatePassword,
);
// router.delete('/deleteMe', deleteMe);
router.delete('/deleteMe', authController.deleteMe);
export default router;
