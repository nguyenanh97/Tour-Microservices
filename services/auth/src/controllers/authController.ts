import { Request, Response, NextFunction } from 'express';
import { Op, Sequelize } from 'sequelize';
import User from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import sendAuthToken from '../tokens/sendAuthToken';
import { hashToken } from '../tokens/tokenUtils';
import validator from 'validator';
import sequelize from '../configs/db';
import normalizeEmailInput from '../utils/emailInput';
import {
  notifyUserRegistered,
  notifyReverify,
  notifyPasswordChanged,
  notifyPasswordReset,
} from '../services/notificationClient';
import { createUserProfile, deleteUserProfile } from '../services/userClient';

// USER SIGNUP
export const userSignup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    let committed = false;

    // Create User
    const { password, passwordConfirm } = req.body;
    if (!password || !passwordConfirm || password !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }

    try {
      // Create user in DB
      const normalizedEmail = normalizeEmailInput(req.body.email);

      // ✅ chặn email đang active theo emailOriginal
      const existed = await User.findOne({
        where: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('emailOriginal')),
          normalizedEmail,
        ),
      });
      if (existed) {
        return next(new AppError('This email is already in use.', 409));
      }

      const newUser = await User.create(
        {
          name: req.body.name,
          email: normalizedEmail,
          password: req.body.password,
        },
        {
          transaction,
        },
      );

      // Create profile (cross-service)
      try {
        await createUserProfile({
          userId: String(newUser.id),
          name: newUser.name,
          email: newUser.emailOriginal ?? newUser.email,
        });
      } catch (profileErr: any) {
        console.error('[signup] Failed to create profile:', profileErr.message);
        throw new AppError(
          'Service unavailable. Could not create user profile.',
          503,
        );
      }

      // Create verify token & save
      const verifyToken = await newUser.createEmailVerifyToken();
      await newUser.save({ validate: false, transaction });

      //  Commit
      await transaction.commit();
      committed = true;

      //Build verify link
      const verifyURL = `${req.protocol}://${req.get(
        'host',
      )}/api/v1/auth/verifyEmail/${verifyToken}`;

      // Async email
      setImmediate(() => {
        notifyUserRegistered({ email: newUser.email, name: newUser.name }, verifyURL)
          .then(ok => {
            if (!ok && process.env.NODE_ENV !== 'production') {
              console.log('[signup] notifyUserRegistered failed');
            }
          })
          .catch(err => {
            console.error('[signup] notifyUserRegistered exception:', err?.message);
          });
      });
      // Send response
      return await sendAuthToken(newUser, 201, res);
    } catch (err) {
      if (!committed) await transaction.rollback();
      return next(err);
    } finally {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Transaction] Completed');
      }
    }
  },
);

// USER LOGIN
export const userLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as { email: string; password: string };

    // check mail-password
    if (!email || !password) {
      return next(new AppError('Please check your email and password again !', 400));
    }

    // check if user exists && password is correct
    const normalizedEmail = normalizeEmailInput(email);

    const user = await User.scope('withPassword').findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('emailOriginal')),
        normalizedEmail,
      ),
    });
    if (!user) {
      return next(new AppError('Incorrect Email or Password', 401));
    }
    const isCorrect = await user.correctPassword(password);
    if (!isCorrect) {
      return next(new AppError('Incorrect Email or Password', 401));
    }
    sendAuthToken(user, 200, res);
  },
);

// ForgotPassword(quên mk=> send mail)
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body as { email: string };
    if (!email) return next(new AppError('Please provide your email address', 400));

    // ✅ lookup theo emailOriginal
    const normalizedEmail = normalizeEmailInput(email);
    const user = await User.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('emailOriginal')),
        normalizedEmail,
      ),
    });

    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'If email exists, reset instructions sent.',
      });
    }
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validate: false });
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/auth/resetPassword/${resetToken}`;
    res.status(200).json({
      status: 'success',
      message: 'If email exists,  reset instructions sent.',
      testToken: process.env.NODE_ENV === 'test' ? resetToken : undefined,
    });

    //  send mail
    setImmediate(() => {
      notifyPasswordReset(user, resetURL).catch(err =>
        console.error('[forgotPassword] notifyPasswordReset error:', err.message),
      );
    });
  },
);

// ResetPassword (đổi mk băng Url mail)
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, passwordConfirm } = req.body as {
      password: string;
      passwordConfirm: string;
    };

    if (!password || !passwordConfirm || password !== passwordConfirm) {
      return next(new AppError('Please provide password and passwordConfirm', 400));
    }

    const hashedToken = hashToken(req.params.token) as string;

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) return next(new AppError('Token is invalid or has expired', 400));
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    sendAuthToken(user, 200, res);
  },
);

// Update Password
export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { passwordCurrent, password, passwordConfirm } = req.body as {
      password: string;
      passwordConfirm: string;
      passwordCurrent: string;
    };
    if (!passwordCurrent || !password || !passwordConfirm) {
      return next(new AppError('Please provide all password fields', 400));
    }

    if (!req.user || !req.user.id) {
      return next(new AppError('User not authenticated', 401));
    }

    const user = await User.scope('withPassword').findByPk(req.user!.id);
    if (!user) return next(new AppError('User not found', 404));

    // passwordCurrent === DB.password

    const isCorrect = await user.correctPassword(passwordCurrent);
    if (!isCorrect) {
      return next(new AppError('Your current password is incorrect', 401));
    }

    if (password !== passwordConfirm) {
      return next(
        new AppError('New password and confirmation password do not match', 400),
      );
    }

    // !password
    if (await user.correctPassword(password)) {
      return next(
        new AppError('New password cannot be the same as current password', 400),
      );
    }

    // Strong password check
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return next(new AppError('Password not strong enough', 400));
    }
    user.password = password;

    user.passwordChangedAt = new Date();
    await user.save();
    sendAuthToken(user, 200, res);

    setImmediate(() => {
      notifyPasswordChanged(user).catch(err =>
        console.error('[updatePassword] notifyPasswordChanged error:', err.message),
      );
    });
  },
);

/////////////////
//DeleteMe
export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const u: any = (req as any).user;
    const userId = u?.id ?? u?.sub;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Lấy user để tombstone email
    const user = await User.unscoped().findByPk(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    // Tombstone email để giải phóng unique
    const tombstone = `${user.emailOriginal || user.email}#deleted#${Date.now()}#${user.id}`;
    await user.update({ email: tombstone, active: false });

    // Soft delete user (paranoid)
    await user.destroy({ force: false });

    //Call user-service to delete profile
    try {
      await deleteUserProfile(String(userId));
      res.cookie('refreshToken', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });
      res.status(204).send();
    } catch (err) {
      console.error(
        `[auth-deleteMe] CRITICAL: Failed to delete user profile for ${userId}`,
        err,
      );
      // Không cần revert active/email vì user đã bị soft delete
      return next(
        new AppError('Failed to delete account. Please try again later.', 500),
      );
    }
  },
);

// VerifyEmail
export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;

    if (!token) return next(new AppError('Token is required', 400));

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      where: {
        verifyToken: hashedToken,
        verifyTokenExpires: { [Op.gt]: Date.now() },
      },
    });
    if (!user) return next(new AppError('Token is invalid or has expired', 400));

    if (user.verified === true)
      return next(new AppError('Email has already been verified', 400));

    user.verified = true;
    user.verifyToken = null;
    user.verifyTokenExpires = null;
    await user.save({ validate: false });
    sendAuthToken(user, 200, res);
  },
);

// ResendVerifyEmail
export const resendVerifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body as { email: string };

    // check mail
    if (!email) return next(new AppError('Email is required', 400));

    // ✅ lookup theo emailOriginal
    const normalizedEmail = normalizeEmailInput(email);
    const user = await User.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('emailOriginal')),
        normalizedEmail,
      ),
    });
    if (!user)
      return res.status(200).json({
        status: 'success',
        message: 'If the email is registered, a verification email has been sent.',
      });

    //check verified === true
    if (user.verified) return next(new AppError('User already verified', 400));

    //check sendMail >= 3/1h
    const oneHour = 60 * 60 * 1000;

    if (
      user.resendVerifyAt &&
      Date.now() - user.resendVerifyAt.getTime() < oneHour &&
      (user.resendVerifyCount ?? 0) >= 3
    ) {
      return next(
        new AppError('Too many verification emails. Please try again later.', 429),
      );
    }
    // Reset hoặc tăng số lần gửi lại
    if (
      !user.resendVerifyAt ||
      Date.now() - user.resendVerifyAt.getTime() > oneHour
    ) {
      user.resendVerifyAt = new Date();
      user.resendVerifyCount = 1;
    } else {
      user.resendVerifyCount = (user.resendVerifyCount ?? 0) + 1;
    }
    // Tạo token xác minh mới
    const token = await user.createEmailVerifyToken();
    await user.save({ validate: false });
    const verifyURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/auth/verifyEmail/${token}`;

    res.status(200).json({
      status: 'success',
      message: 'Verification email resent. Please check your inbox.',
    });
    // Gửi job vào queue (tách html/text)
    setImmediate(() => {
      notifyReverify(user, verifyURL).catch(err =>
        console.error('[resendVerifyEmail] notifyReverify error:', err.message),
      );
    });
  },
);
