import { Response } from 'express';
import { signAccessToken, signRefreshToken } from './signToken';
import User from '../models/userModel';

const sendAuthToken = async (
  user: User,
  statusCode: number,
  res: Response,
): Promise<Response> => {
  const accessToken = await signAccessToken(user);
  const refreshToken = await signRefreshToken(user.id);

  // Cấu hình cookie
  const refreshCookieOptions = {
    expires: new Date(
      Date.now() +
        (Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth/refresh',
  };

  // Xóa password
  const sanitizedUserData = user.get({ plain: true }) as any;
  delete sanitizedUserData.password;

  const sanitizedUser = sanitizedUserData;
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  return res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: { user: sanitizedUser },
  });
};

export default sendAuthToken;
