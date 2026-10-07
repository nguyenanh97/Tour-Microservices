import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import { sendResponse } from '../utils/apiResponse';
import filterFieldsSoft from '../utils/filterFieldsSoft';
import AppError from '../utils/appError';
import userProfile from '../models/profileModel';
import { ProfileService } from '../services/profileService';
import { AuthRequest } from '../utils/authRequest';
import {
  CreateProfileDto,
  UpdateProfileDto,
  toProfileResponseDto,
  CreateProfileInternalDto,
} from '../dtos/user.dto';

// Create
export const createProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allowed: (keyof CreateProfileInternalDto)[] = [
      'userId',
      'name',
      'email',
      'avatar',
      'phone',
      'address',
      'bio',
      'age',
    ];
    const profileData = filterFieldsSoft(
      req.body,
      allowed,
    ) as CreateProfileInternalDto;
    const newProfile = await ProfileService.createProfile(profileData);
    const profileDto = toProfileResponseDto(newProfile);
    res.status(201).json({ status: 'success', data: profileDto });
  },
);

// Get Profile
export const getProfileMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId =
      req.user?.id || req.user?.sub || (req.header('x-user-id') as string);
    if (!userId) {
      return next(new AppError('Unauthorized - You are not logged in!', 401));
    }
    const rawProfile = await ProfileService.getProfileIdOrUserId(userId);
    const newProfile = toProfileResponseDto(rawProfile);
    sendResponse.success(res, newProfile);
  },
);

// Update
export const updateProfile = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId =
      req.user?.id || req.user?.sub || (req.header('x-user-id') as string);
    if (!userId) return next(new AppError('Unauthorized', 401));
    const allowed: (keyof UpdateProfileDto)[] = [
      'name',
      'avatar',
      'phone',
      'address',
      'bio',
      'age',
    ];
    const updates = filterFieldsSoft(req.body, allowed) as UpdateProfileDto;

    const updateProfile = await ProfileService.updateProfile(userId, updates);
    const updateDto = toProfileResponseDto(updateProfile);

    sendResponse.success(res, updateDto);
  },
);

// // Get ID (Admin)

export const getUserProfileId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const profile = await ProfileService.getProfileUserId(id);
    const profileDto = toProfileResponseDto(profile);
    sendResponse.success(res, profileDto);
  },
);
//

//Delete
export const deleteUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) {
      return next(new AppError('User ID is required', 400));
    }
    await ProfileService.deleteProfile(id);
    res.status(204).send();
  },
);
