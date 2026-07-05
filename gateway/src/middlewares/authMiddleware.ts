import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS_URL =
  process.env.AUTH_JWKS_URL || 'http://auth:3000/.well-known/jwks.json';
const ISSUER = process.env.JWT_ISSUER || 'http://auth:3000';
const AUDIENCE = process.env.JWT_AUDIENCE || 'udmnode';

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export async function protect(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.header('authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const token = m[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['RS256'],
    });

    // lưu payload nếu cần dùng trong gateway
    (req as any).user = payload;

    // XÓA header giả mạo từ client
    delete (req.headers as any)['x-user-id'];
    delete (req.headers as any)['x-user-role'];
    delete (req.headers as any)['x-user-verified'];

    // QUAN TRỌNG: forward identity xuống service qua headers
    const userId = (payload.sub ?? (payload as any).id) as string | undefined;
    if (userId) req.headers['x-user-id'] = String(userId);

    const role = (payload as any).role as string | undefined;
    if (role) req.headers['x-user-role'] = String(role);

    const verified = (payload as any).verified;
    if (verified !== undefined) req.headers['x-user-verified'] = String(verified);

    return next();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[gateway protect] jwtVerify error:', (err as any)?.message);
    }
    return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  }
}
