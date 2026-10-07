import express from 'express';
const router = express.Router();
import * as userController from '../controllers/profileController';
import {
  protect,
  restrictTo,
  allowInternalOrAdmin,
} from '../middlewares/authMiddleware';
import internalAuth from '../middlewares/internalAuth';

import {
  validateUserCreateProfile,
  validateUserProfileUpdate,
} from '../middlewares/userValidation';

router.post(
  '/',
  internalAuth,
  validateUserCreateProfile,
  userController.createProfile,
);
router.delete('/:id', internalAuth, userController.deleteUserProfile);

router.get('/me', protect, userController.getProfileMe);
router.patch(
  '/updateMe',
  protect,
  validateUserProfileUpdate,
  userController.updateProfile,
);

// Admin
router.get('/:id', allowInternalOrAdmin, userController.getUserProfileId);

export default router;
