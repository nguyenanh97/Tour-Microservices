import express from 'express';
import { importSPKI, exportJWK, JWK } from 'jose';
const router = express.Router();
let jwks: { keys: JWK[] } | null = null;
async function initJWKS() {
  if (!process.env.JWT_PUBLIC_KEY) {
    throw new Error('JWT_PUBLIC_KEY is missing');
  }
  const pubPem = process.env.JWT_PUBLIC_KEY!.trim();
  const key = await importSPKI(pubPem, 'RS256');
  const jwk = await exportJWK(key);
  jwks = {
    keys: [
      {
        ...jwk,
        kid: process.env.JWT_ACCESS_KID ?? 'access-2025-12',
        alg: 'RS256',
        use: 'sig',
      },
    ],
  };
}
void initJWKS();

router.get('/.well-known/jwks.json', async (_req, res) => {
  try {
    if (!jwks) {
      await initJWKS(); // lazy init – AN TOÀN
    }
    res.set('Cache-Control', 'public, max-age=300');
    res.json(jwks);
  } catch (err) {
    console.error('JWKS error:', err);
    res.status(500).json({ message: 'JWKS not available' });
  }
});

export default router;
