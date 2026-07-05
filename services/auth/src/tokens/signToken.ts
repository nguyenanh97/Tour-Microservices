import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import {
  getAccessPrivateKey,
  getRefreshPrivateKey,
  getAccessPublicKey,
  getRefreshPublicKey,
} from '../configs/keys/key';
const ISSUER = process.env.JWT_ISSUER ?? 'http://auth-service:3000';
const AUDIENCE = process.env.JWT_AUDIENCE ?? 'udmnode';
const ACCESS_KID = process.env.JWT_ACCESS_KID ?? 'access-2025-12';
const REFRESH_KID = process.env.JWT_REFRESH_KID ?? 'refresh-2025-12';
const REFRESH_ISSUER = process.env.JWT_REFRESH_ISSUER ?? ISSUER;

// Interface cho payload, chỉ chứa thông tin cần thiết để tạo token
interface TokenPayload {
  id: string | number;
  role: string;
  verified?: boolean;
}

// SIGN
type ExpiresIn = string | number;

function normalizeExpires(
  envVal: string | undefined,
  fallback: ExpiresIn,
): ExpiresIn {
  if (!envVal) return fallback;
  const v = envVal.trim();
  if (!v) return fallback;

  // số giây
  if (/^\d+$/.test(v)) return Number(v) as ExpiresIn;

  // dạng ms-style: 30s, 15m, 12h, 7d, 1w, 1y, 100ms
  if (/^\d+\s*(ms|s|m|h|d|w|y)$/.test(v)) return v.replace(/\s+/g, '') as ExpiresIn;

  return fallback;
}

// SIGN
export const signAccessToken = async (user: TokenPayload): Promise<string> => {
  const payload: JWTPayload = {
    role: user.role,
    verified: user.verified,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid: ACCESS_KID, type: 'JWT' })
    .setSubject(String(user.id))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(normalizeExpires(process.env.JWT_ACCESS_EXPIRES_IN, '15m'))
    .setIssuedAt()
    .sign(getAccessPrivateKey());
};

export const signRefreshToken = async (userId: string | number): Promise<string> => {
  return await new SignJWT({})
    .setProtectedHeader({
      alg: 'RS256',
      kid: REFRESH_KID,
      type: 'JWT',
    })
    .setSubject(String(userId))
    .setIssuer(REFRESH_ISSUER)
    .setAudience('refresh')
    .setExpirationTime(normalizeExpires(process.env.JWT_REFRESH_EXPIRES_IN, '7d'))
    .sign(getRefreshPrivateKey());
};

// VERIFY
// type Claims = JwtPayload & { id?: string; role?: string; verified?: boolean };
export const verifyAccessToken = async (
  token: string,
): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getAccessPublicKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      typ: 'JWT',
    });
    if (!payload.sub || typeof payload.role !== 'string') return null;

    return {
      id: payload.sub,
      role: payload.role as string,
      verified: typeof payload.verified === 'boolean' ? payload.verified : undefined,
    };
  } catch (err) {
    return null;
  }
};

export const verifyRefreshToken = async (
  token: string,
): Promise<{ id: string } | null> => {
  try {
    const { payload } = await jwtVerify(token, getRefreshPublicKey(), {
      issuer: REFRESH_ISSUER,
      audience: 'refresh',
      typ: 'JWT',
    });
    if (!payload.sub) return null;
    return { id: payload.sub };
  } catch (err) {
    return null;
  }
};
