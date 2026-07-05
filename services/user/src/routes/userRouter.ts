import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import internalAuth from '../middlewares/internalAuth';

//auth->user
router.post('/', internalAuth, userController.createUserProfile);
router.delete('/:id', internalAuth, userController.deleteProfileMe);

// UserProfile Routes
router.use(protect, restrictTo('user'));
router.get('/me', userController.getMe);

router.patch('/updateMe', userController.updateMe);

// GET Id
router.get('/:id', userController.getUserId);

export default router;
