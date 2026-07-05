import crypto from 'crypto';
//
interface GenerateToken {
  rawToken: string;
  hashedToken: string;
  expiresAt: number;
}

// hash token
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

//Expiration time (ms), default 1 hour
export const generateToken = (
  expiresInMs: number = 60 * 60 * 1000,
): GenerateToken => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  return {
    rawToken,
    hashedToken: hashToken(rawToken),
    expiresAt: Date.now() + expiresInMs,
  };
};
