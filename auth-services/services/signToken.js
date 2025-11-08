import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
const privateKey = fs.readFileSync(
  path.join(process.cwd(), 'config/jwtRS256.key'),
  'utf-8',
);
const publicKey = fs.readFileSync(
  path.join(process.cwd(), 'config/jwtRS256.key.pub'),
  'utf-8',
);

const refreshPrivateKey = fs.readFileSync(
  path.join(process.cwd(), 'config/jwtRS256.refresh.key'),
  'utf-8',
);
const refreshPublicKey = fs.readFileSync(
  path.join(process.cwd(), 'config/jwtRS256.refresh.key.pub'),
  'utf-8',
);

// SIGN
export const signAccessToken = user => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role, verified: user.verified },
    privateKey,
    {
      algorithm: 'RS256',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    },
  );
};

export const signRefreshToken = userId => {
  return jwt.sign({ id: userId }, refreshPrivateKey, {
    algorithm: 'RS256',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

// VERIFY
export const verifyAccessToken = token => {
  try {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  } catch (err) {
    return null; // hoặc throw error nếu muốn
  }
};

export const verifyRefreshToken = token => {
  try {
    return jwt.verify(token, refreshPublicKey, { algorithms: ['RS256'] });
  } catch (err) {
    return null;
  }
};
