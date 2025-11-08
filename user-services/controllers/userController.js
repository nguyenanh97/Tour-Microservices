import userProfile from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import { sendResponse } from '../utils/apiResponse.js';
import filterFieldsSoft from '../utils/filterFieldsSoft.js';
import AppError from '../utils/appError.js';

export const getMe = catchAsync(async (req, res, next) => {
  const profile = await userProfile.findOne({ userId: req.user.sub || req.user.id });

  if (!profile) {
    return next(new AppError('noProfile not found for this user.', 404));
  }
  sendResponse.success(res, profile);
});

export const updateMe = catchAsync(async (req, res, next) => {
  const allowed = ['name', 'avatar', 'phone', 'address', 'bio', 'metadata', 'age'];
  const updates = filterFieldsSoft(req.body, allowed);
  const profile = await userProfile.findOneAndUpdate(
    {
      userId: req.user.sub || req.user.id,
    },
    updates,
    { new: true, runValidators: true },
  );

  if (!profile) return next(new AppError('noProfile not found for this user.', 404));

  //Response
  sendResponse.success(res, profile);
});

export const getUserId = catchAsync(async (req, res, next) => {
  const profile = await userProfile.findById(req.params.id);

  if (!profile) return next(new AppError('User not found', 404));

  sendResponse.success(res, profile);
});
//
export const deleteProfileMe = catchAsync(async (req, res, next) => {
  const userProfileToDelete = await userProfile.findOneAndUpdate(
    { userId: req.params.id },
    { active: false, deletedAt: Date.now() },
    { new: true, skipHooks: true },
  );

  if (!userProfileToDelete) {
    return next(new AppError('User profile not found to delete', 404));
  }
  res.status(204).send();
});

//
export const resToreMe = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  if (!userId) {
    return next(
      new AppError('No user profile found to restore for that user ID', 404),
    );
  }
  try {
    const profile = await userProfile.create({ userId, name, email });
    return res.status(201).json({ status: 'success', data: profile });
  } catch (err) {}
  const profile = await userProfile
    .findOneAndUpdate(
      { userId },
      {
        $set: { active: true },
        $unset: { deletedAt: '' },
      },
      { new: true },
    )
    .setOptions({ includeInactive: true });

  if (!profile) {
    return next(
      new AppError('No user profile found to restore for that user ID', 404),
    );
  }
  //response
  res.status(200).json({
    status: 'success',
    data: { profile },
  });
});

//
export const createUserProfile = catchAsync(async (req, res, next) => {
  const { userId, name, email } = req.body;
  if (!userId || !name) {
    return next(new AppError('Missing userId or name for profile creation', 400));
  }
  const profile = await userProfile.create({ userId, name, email });
  console.log(`[user-service] Profile created for userId: ${userId}`);
  res.status(201).json({ status: 'success', data: profile });
});
