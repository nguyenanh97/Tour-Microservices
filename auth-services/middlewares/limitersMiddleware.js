import rateLimit from 'express-rate-limit';

function createLimiter({ max, windowMs, message }) {
  return rateLimit({
    max,
    windowMs,
    message,
    standardHeaders: true,
    legacyHeaders: false,
  });
}
export const loginLimiter = createLimiter({
  max: 5,
  windowMs: 10 * 60 * 1000,
  message: 'Too many login attempts, please try again after 15 minutes.',
});

export const signupLimiter = createLimiter({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: 'Too many signup attempts, please try again after 1 hour.',
});

export const resetPasswordLimiter = createLimiter({
  max: 3,
  windowMs: 30 * 60 * 1000,
  message: 'Too many password reset requests, please try again after 1 hour.',
});

export const updatePasswordLimiter = createLimiter({
  max: 3,
  windowMs: 30 * 60 * 1000,
  message: 'Too many password update attempts. Please try again after 1 hour.',
});

export const forgotPasswordLimiter = createLimiter({
  max: 3,
  windowMs: 60 * 60 * 1000,
  message: 'Too many password reset requests. Please try again after 1 hour.',
});

export const verifyEmailLimiter = createLimiter({
  max: 3,
  windowMs: 30 * 60 * 1000,
  message:
    'Too many verification attempts. Please wait 30 minutes before trying again.',
});

export const resendVerifyEmailLimiter = createLimiter({
  max: 3,
  windowMs: 60 * 60 * 1000,
  message: 'Too many verification email requests. Please try again after 1 hour.',
});
export const accountRestoredLimiter = createLimiter({
  max: 3,
  windowMs: 60 * 60 * 1000,
  message: 'Too many accountRestore email requests. Please try again after 1 hour.',
});
//npm install express-rate-limit
