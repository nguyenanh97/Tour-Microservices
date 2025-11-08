import crypto from 'crypto';
const hashedToken = token => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
export default hashedToken;
