import { protect, checkVerifyEmail } from '../middlewares/authMiddleware.js';
import express from 'express';
import {
  loginLimiter,
  signupLimiter,
  resetPasswordLimiter,
  updatePasswordLimiter,
  resendVerifyEmailLimiter,
  verifyEmailLimiter,
  forgotPasswordLimiter,
} from '../middlewares/limitersMiddleware.js';

import {
  userSignup,
  userLogin,
  verifyEmail,
  resendVerifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  requestRestoreAccount,
  restoreAccount,
  deleteMe,
} from '../controllers/authController.js';
const router = express.Router();

//Sign,login
router.post('/signup', signupLimiter, userSignup);
router.post('/login', loginLimiter, userLogin);

// verify,resendVerify
router.get('/verifyEmail/:token', verifyEmailLimiter, verifyEmail);
router.post('/resendVerifyEmail', resendVerifyEmailLimiter, resendVerifyEmail);

//password

router.post('/forgotPassword', forgotPasswordLimiter, forgotPassword);
router.patch('/resetPassword/:token', resetPasswordLimiter, resetPassword);
//
router.post('/request-restore', requestRestoreAccount);
router.get('/restore-account', restoreAccount);
router.get('/restore', restoreAccount);

// ME
router.use(protect, checkVerifyEmail);
router.patch('/updatePassword', updatePasswordLimiter, updatePassword);
router.delete('/deleteMe', deleteMe);
export default router;
