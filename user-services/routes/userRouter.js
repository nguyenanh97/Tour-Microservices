import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';
import internalAuth from '../middlewares/internalAuth.js';

router.get(
  '/me',
  authMiddleware.protect,
  authMiddleware.checkVerifyEmail,
  userController.getMe,
);

// Update Me
router.patch(
  '/updateMe',
  authMiddleware.protect,
  authMiddleware.checkVerifyEmail,
  userController.updateMe,
);

//auth->user
router.post('/', internalAuth, userController.createUserProfile);
router.patch('/restore/:id', internalAuth, userController.resToreMe);

// GET Id
router.get(
  '/:id',
  authMiddleware.protect,
  authMiddleware.checkVerifyEmail,
  userController.getUserId,
);

//

//
router.delete('/:id', internalAuth, userController.deleteProfileMe);
export default router;
