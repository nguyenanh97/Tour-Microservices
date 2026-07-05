import { Request, Response, NextFunction } from 'express';
import userProfile from '../models/profileModel';
import catchAsync from '../utils/catchAsync';
import { sendResponse } from '../utils/apiResponse';
import filterFieldsSoft from '../utils/filterFieldsSoft';
import AppError from '../utils/appError';

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const uid = req.user?.sub || req.user?.id || req.header('x-user-id');
    if (!uid) return next(new AppError('Unauthorized', 401));

    const profile = await userProfile.findOne({ where: { userId: String(uid) } });
    if (!profile) {
      return next(new AppError('noProfile not found for this user.', 404));
    }

    sendResponse.success(res, profile);
  },
);

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allowed = ['name', 'avatar', 'phone', 'address', 'bio', 'metadata', 'age'];
    const updates = filterFieldsSoft(req.body, allowed);

    const uid = req.user?.sub || req.user?.id || req.header('x-user-id');
    if (!uid) return next(new AppError('Unauthorized', 401));

    // MySQL: update returns [affectedCount]
    const [count] = await userProfile.update(updates, {
      where: { userId: uid },
    });
    if (!count) return next(new AppError('noProfile not found for this user.', 404));

    // Retrieve records after update
    const profile = await userProfile.findOne({ where: { userId: uid } });
    if (!profile)
      return next(new AppError('noProfile not found for this user.', 404));

    //Response
    sendResponse.success(res, profile);
  },
);

export const getUserId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idParam = req.params.id;
    const idNum = Number.parseInt(idParam, 10);

    const byPk = Number.isFinite(idNum) ? await userProfile.findByPk(idNum) : null;
    const profile =
      byPk ?? (await userProfile.findOne({ where: { userId: idParam } }));

    if (!profile) return next(new AppError('User not found', 404));

    sendResponse.success(res, profile);
  },
);
//
export const deleteProfileMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }
    // Lấy cả bản ghi đã bị soft delete (paranoid: false) để kiểm tra tồn tại
    const existing = await userProfile.findOne({
      where: { userId },
      paranoid: false,
    });

    if (!existing) {
      return next(new AppError('User profile not found to delete', 404));
    }

    // Nếu đã bị soft delete rồi, trả về 204 (idempotent)
    if (existing.deletedAt) {
      return res.status(204).send();
    }
    // Soft delete instance để chạy hooks đầy đủ
    await existing.destroy({ force: false });
    return res.status(204).send();
  },
);

//Không cho phép restore
export const resToreMe = catchAsync(
  async (_req: Request, _res: Response, next: NextFunction) => {
    return next(
      new AppError('Restore is not allowed for soft-deleted profiles', 409),
    );
  },
);

//
export const createUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, name, email } = req.body as {
      userId: string;
      name: string;
      email?: string;
    };
    if (!userId || !name) {
      return next(new AppError('Missing userId or name for profile creation', 400));
    }

    // Avoid creating duplicates
    const existing = await userProfile.findOne({
      where: { userId },
      paranoid: false,
    });
    if (existing) {
      return next(
        new AppError(
          'Profile for this userId already existed (deleted). Use a new userId.',
          409,
        ),
      );
    }

    const profile = await userProfile.create({ userId, name, email });
    res.status(201).json({ status: 'success', data: profile });
  },
);

/////
//DeleteMe
// export const deleteMe = catchAsync(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const u: any = (req as any).user;
//     const userId = u?.id ?? u?.sub;
//     if (!userId) {
//       return next(new AppError('User not authenticated', 401));
//     }

//     // Mark user. Auth-services
//     const [updated] = await User.update(
//       { active: false },
//       { where: { id: userId } },
//     );

//     //Call user-service to delete profile
//     try {
//       await deleteUserProfile(userId);
//       res.cookie('refreshToken', 'loggedout', {
//         expires: new Date(Date.now() + 10 * 1000),
//         httpOnly: true,
//       });
//       res.status(204).send();
//     } catch (err) {
//       console.error(
//         `[auth-deleteMe] CRITICAL: Failed to delete user profile for ${userId}`,
//         err,
//       );
//       // Revert active = true
//       await User.update({ active: true }, { where: { id: userId } });

//       return next(
//         new AppError('Failed to delete account. Please try again later.', 500),
//       );
//     }
//   },
// );
