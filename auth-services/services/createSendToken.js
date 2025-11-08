import { signRefreshToken } from './signToken.js';
import { signAccessToken } from './signToken.js';
const createSendToken = (user, statuscode, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user._id);

  // Cấu hình cookie cho refresh token
  const refreshCookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // test dev
    secure: process.env.NODE_ENV === 'production', // chỉ bật https khi prod
  };

  // Remove Password
  user.password = undefined;

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  res.status(statuscode).json({
    status: 'success',
    accessToken,
    data: { user },
  });
};
export default createSendToken;
