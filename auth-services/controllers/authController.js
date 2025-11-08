import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import hashToken from '../utils/hashToken.js';
import createSendToken from '../services/createSendToken.js';
import mongoose from 'mongoose';
import validator from 'validator';
import {
  notifyUserRegistered,
  notifyReverify,
  notifyPasswordChanged,
  notifyPasswordReset,
  notifyAccountRestored,
  notifyAccountRestoreRequested,
} from '../services/notificationClient.js';
import {
  resToreMe,
  createUserProfile,
  deleteUserProfile,
} from '../services/userClient.js';
import e from 'express';

// USER SIGNUP
export const userSignup = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let comitted = false;
  try {
    const docs = await User.create(
      [
        {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          passwordConfirm: req.body.passwordConfirm,
        },
      ],
      { session },
    );

    const createdUser = docs[0];
    await createUserProfile(createdUser);
    const verifyToken = await createdUser.createEmailVerifyToken();
    await createdUser.save({ validateBeforeSave: false, session });
    await session.commitTransaction();
    comitted = true;

    // Tạo URL verify email
    const verifyURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyEmail/${verifyToken}`;

    createSendToken(createdUser, 201, res);
    // test Email response
    // response
    // SendMail

    setImmediate(() => {
      notifyUserRegistered(createdUser, verifyURL)
        .then(ok => {
          if (!ok && process.env.NODE_ENV !== 'production') {
            console.log('[signup] notifyUserRegistered failed');
          }
        })
        .catch(err => console.error('notifyUserRegistered exception:', err.message));
    });
  } catch (err) {
    if (!comitted) await session.abortTransaction();
    return next(err);
  } finally {
    session.endSession();
  }
});

// USER LOGIN
export const userLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check mail-password
  if (!email || !password) {
    return next(new AppError('Please check your email and password again !', 400));
  }

  // check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password ', 401));
  }
  createSendToken(user, 201, res);
});

// ForgotPassword(quên mk=> send mail)
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new AppError('There is no user with email address.', 404));
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `Forgot your password ? Submit a PATCH requets with your new Password and passwordComfirm to 
  ${resetURL}.\nIf you didn't forget your password ,please ignore this email!`;

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
});

// ResetPassword (đổi mk băng Url mail)
export const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(new AppError('Please provide password and passwordConfirm', 400));
  }

  if (password !== passwordConfirm)
    return next(new AppError('Passwords do not match', 400));

  const hashedToken = hashToken(req.params.token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  createSendToken(user, 200, res);
});

// Update Password
export const updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, passwordCurrent } = req.body;
  if (!password || !passwordConfirm || !passwordCurrent) {
    return next(
      new AppError(
        'Please provide current password, new password and password confirmation',
        400,
      ),
    );
  }
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new AppError('User not found', 404));

  // passwordCurrent === DB.password
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  if (password !== passwordConfirm) {
    return next(
      new AppError('New password and authentication password do not match', 400),
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
  createSendToken(user, 200, res);

  setImmediate(() => {
    notifyPasswordChanged(user).catch(err =>
      console.error('[updatePassword] notifyPasswordChanged error:', err.message),
    );
  });
});

//DeleteMe
export const deleteMe = catchAsync(async (req, res, next) => {
  // Mark user. Auth-services
  await User.findByIdAndUpdate(req.user.id, { active: false });

  //Call user-service to delete profile
  try {
    await deleteUserProfile(req.user.id);
    res.cookie('refreshToken', 'loggerdout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(204).send();
  } catch (err) {
    console.error(
      `[auth-deleteMe] CRITICAL: Failed to delete user profile for ${req.user.id}`,
    );
  }
});

// VerifyEmail
export const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = hashToken(req.params.token);
  const user = await User.findOne({
    verifyToken: hashedToken,
    verifyTokenExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  if (user.verified)
    return next(new AppError('Email has already been verified', 400));

  user.verified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 200, res);
});

// ResendVerifyEmail
export const resendVerifyEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // check mail
  if (!email) return next(new AppError('Email is required', 400));

  // check user.mail
  const user = await User.findOne({ email });
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
    user.resendVerifyCount >= 3
  ) {
    return next(
      new AppError('Too many verification emails. Please try again later.', 429),
    );
  }
  // Reset hoặc tăng số lần gửi lại
  if (!user.resendVerifyAt || Date.now() - user.resendVerifyAt.getTime() > oneHour) {
    user.resendVerifyCount = 1;
    user.resendVerifyAt = new Date();
  } else {
    user.resendVerifyCount += 1;
  }
  // Tạo token xác minh mới
  const token = await user.createEmailVerifyToken();
  await user.save({ validateBeforeSave: false });
  const verifyURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyEmail/${token}`;

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
});

// resToreMe

export const requestRestoreAccount = catchAsync(async (req, res, next) => {
  // Chuẩn hóa email để khớp DB (trim + lowercase + normalize)
  const normalizedEmail =
    validator
      .normalizeEmail(rawEmail, { gmail_remove_dots: false })
      ?.trim()
      .toLowerCase() || rawEmail.trim().toLowerCase();

  const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ciEmail = new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i');
  let user =
    (await User.findOne({ email: ciEmail }, null, { skipQueryMiddleware: true })) ||
    null;
  //
  if (!user) {
    const rawUserData = await User.collection.findOne({
      email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' },
    });
    if (rawUserData) {
      user = User.hydrate(rawUserData); // Chuyển dữ liệu thô thành Mongoose document
      console.log(
        `[requestRestoreAccount] Found user via raw driver (active: ${user.active})`,
      );
    }
  }
  //
  if (!user) {
    console.log(
      '[requestRestoreAccount] User not found for email:',
      normalizedEmail,
      '. Sending generic success response for security.',
    );
    return res.status(200).json({
      status: 'success',
      message: 'If email exists, restore instructions sent.',
    });
  }

  //
  let restoreToken;
  if (user) {
    restoreToken = await user.createRestoreToken();
    await user.save({ validateBeforeSave: false });

    const fonEndUrl = (
      process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`
    ).replace(/\/$/, '');
    const resToreUrl = `${fonEndUrl}/api/v1/auth/restore-account?token=${restoreToken}`;

    // email
    setImmediate(() => {
      console.log(
        `[requestRestoreAccount] Attempting to send restore email to ${user.email}`,
      );
      void notifyAccountRestoreRequested(user, resToreUrl).catch(err =>
        console.error('requestRestoreAccount] notify error:', err?.message || err),
      );
    });
  }

  // response
  res.status(200).json({
    status: 'success',
    message: 'If email exists, restore instructions sent.',
    testToken: process.env.NODE_ENV !== 'production' ? restoreToken : undefined,
  });
});

//

export const restoreAccount = catchAsync(async (req, res, next) => {
  const token = req.body?.token || req.query?.token || null;
  if (!token) return next(new AppError('Restore token is required', 400));
  const hashedToken = hashToken(token);

  let user = await User.findOne({
    restoreToken: hashedToken,
    restoreTokenExpires: { $gt: Date.now() },
  }).setOptions({ includeInactive: true });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.active = true;
  user.restoreToken = undefined;
  user.restoreTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });
  try {
    const result = await resToreMe(user.id);
    if (!result || (result.status && result.status >= 400)) {
      throw Object.assign(new Error('user-service restore failed'), {
        response: { status: result.status, data: result.data },
      });
    }
  } catch (err) {
    const status = err.response?.status || err?.status;
    if (status === 404 || status === 400) {
      //create Profile
      const fallbackName = user.name || user.email?.split('@')[0] || 'User';
      try {
        await createUserProfile({
          userId: user.id,
          name: fallbackName,
          email: user.email,
        });
      } catch (err) {
        console.error(
          '[restoreAccount] createUserProfile failed:',
          err?.response?.data || err?.message || err,
        );
        return next(new AppError('Failed to restore user profile ', 500));
      }
    } else {
      console.error(
        '[restoreAccount] user-service call failed:',
        err?.response?.data || err?.message || err,
      );
      return next(new AppError('Failed to restore user profile ', 500));
    }
  }
  //  Notify user asynchronously (không block)
  setImmediate(() => {
    try {
      void notifyAccountRestored(user).catch(err =>
        console.error(
          '[restoreAccount] notifyAccountRestored error for',
          user?.email || user?.id,
          err?.message || err,
        ),
      );
    } catch (err) {
      console.error('[restoreAccount] notifyAccountRestored sync error:', err);
    }
  });
  createSendToken(user, 200, res);
});
