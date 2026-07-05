import { importPKCS8, importSPKI } from 'jose';

let accessPrivateKey: CryptoKey;
let accessPublicKey: CryptoKey;
let refreshPrivateKey: CryptoKey;
let refreshPublicKey: CryptoKey;

let initialized = false;

export const loadKeys = async () => {
  if (initialized) return;

  if (!process.env.JWT_PRIVATE_KEY) throw new Error('❌ Missing JWT_PRIVATE_KEY');
  if (!process.env.JWT_PUBLIC_KEY) throw new Error('❌ Missing JWT_PUBLIC_KEY');
  if (!process.env.REFRESH_PRIVATE_KEY)
    throw new Error('❌ Missing JWT_REFRESH_PRIVATE_KEY');
  if (!process.env.REFRESH_PUBLIC_KEY)
    throw new Error('❌ Missing JWT_REFRESH_PUBLIC_KEY');

  accessPrivateKey = await importPKCS8(
    process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n').trim(),
    'RS256',
  );

  accessPublicKey = await importSPKI(
    process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n').trim(),
    'RS256',
  );

  refreshPrivateKey = await importPKCS8(
    process.env.REFRESH_PRIVATE_KEY.replace(/\\n/g, '\n').trim(),
    'RS256',
  );

  refreshPublicKey = await importSPKI(
    process.env.REFRESH_PUBLIC_KEY.replace(/\\n/g, '\n').trim(),
    'RS256',
  );

  initialized = true;
};

export const getAccessPrivateKey = () => {
  if (!accessPrivateKey) throw new Error('Access private key not initialized');
  return accessPrivateKey;
};

export const getAccessPublicKey = () => {
  if (!accessPublicKey) throw new Error('Access public key not initialized');
  return accessPublicKey;
};

export const getRefreshPrivateKey = () => {
  if (!refreshPrivateKey) throw new Error('Refresh private key not initialized');
  return refreshPrivateKey;
};

export const getRefreshPublicKey = () => {
  if (!refreshPublicKey) throw new Error('Refresh public key not initialized');
  return refreshPublicKey;
};
