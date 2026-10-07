import { Op, fn, col, where } from 'sequelize';
import UserProfile from '../models/profileModel';
import AppError from '../utils/appError';
import {
  CreateProfileDto,
  UpdateProfileDto,
  CreateProfileInternalDto,
} from '../dtos/user.dto';

export class ProfileService {
  // Get Id or UserId
  static async getProfileIdOrUserId(idParam: string): Promise<UserProfile> {
    const idNum = Number.parseInt(idParam, 10);
    const pyPk = Number.isFinite(idNum) ? await UserProfile.findByPk(idNum) : null;
    const profile =
      pyPk ?? (await UserProfile.findOne({ where: { userId: idParam } }));
    if (!profile) {
      throw new AppError('User profile not found', 404);
    }

    return profile;
  }

  // // Get ID
  static async getProfileUserId(userId: string): Promise<UserProfile> {
    const profile = await UserProfile.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new AppError('Profile not found for this user.', 404);
    }
    return profile;
  }

  //Create
  static async createProfile(dto: CreateProfileInternalDto): Promise<UserProfile> {
    if (!dto.userId || !dto.name) {
      throw new AppError('Missing userId or name for profile creation', 400);
    }

    // existing user
    const existing = await UserProfile.findOne({
      where: { userId: dto.userId },
      paranoid: false,
    });
    if (existing) {
      throw new AppError(
        'Profile for this userId already exists. Use a new userId.',
        409,
      );
    }
    return await UserProfile.create(dto);
  }

  // Update

  static async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    const profile = await UserProfile.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new AppError('Profile not found for this user.', 404);
    }
    await profile.update(dto);
    return profile;
  }
  // Delete

  static async deleteProfile(userId: string): Promise<void> {
    const existing = await UserProfile.findOne({
      where: { userId },
      paranoid: false,
    });
    if (!existing) {
      throw new AppError('User profile not found to delete', 404);
    }

    if (existing.deletedAt) {
      return;
    }
    await existing.destroy({ force: false });
  }
}
