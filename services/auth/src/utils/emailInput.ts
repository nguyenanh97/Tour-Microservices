import validator from 'validator';
import AppError from './appError';
const normalizeEmailInput = (value: string): string => {
  const email = String(value ?? '')
    .trim()
    .toLowerCase();
  if (!validator.isEmail(email)) {
    throw new AppError('Invalid email format', 400);
  }
  const normalize = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false, // giữ +tag nếu muốn
    outlookdotcom_remove_subaddress: false,
  });
  return String(normalize || email)
    .trim()
    .toLowerCase();
};
export default normalizeEmailInput;
