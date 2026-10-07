import axios, { AxiosInstance } from 'axios';
const baseURL = process.env.NOTIF_API_BASE;
const NOTIF_INTERNAL = process.env.NOTIF_INTERNAL_TOKEN;
if (!NOTIF_INTERNAL) {
  throw new Error('Missing NOTIF_INTERNAL_TOKEN environment variable');
}
if (!baseURL) {
  throw new Error('Missing NOTIF_API_BASE environment variable');
}

const client: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// Headers cho internal auth
const internalHeaders = () => ({ 'x-internal-token': NOTIF_INTERNAL });

// INTERNAL

interface EmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
interface UserMinimal {
  email: string;
  name?: string;
}

//Gửi email
export async function sendEmailNotification({
  to,
  subject,
  text,
  html,
}: EmailPayload) {
  if (!to || !subject) {
    console.warn('[notificationClient] Missing to/subject, skip');
    return false;
  }
  try {
    await client.post(
      '/email',
      { to, subject, text, html },
      { headers: internalHeaders() },
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[notificationClient] Sent to ${baseURL}/email`, { to, subject });
    }
    return true;
  } catch (err: unknown) {
    const msg =
      (err as any)?.response?.data ?? (err as Error)?.message ?? 'Unknown error';
    console.error(
      '[notificationClient] Failed to send request to notification service:',
      msg,
    );
    return false;
  }
}
// Các “event” logic hoá (optional)
export async function notifyUserRegistered(
  user: UserMinimal,
  verifyURL: string,
): Promise<boolean> {
  return sendEmailNotification({
    to: user.email,
    subject: 'Verify your email',
    text: `Click this link to verify your email:\n${verifyURL}`,
  });
}
//
export async function notifyReverify(
  user: UserMinimal,
  verifyURL: string,
): Promise<boolean> {
  return sendEmailNotification({
    to: user.email,
    subject: 'Re-verify your account',
    html: `<p>Click to verify: <a href="${verifyURL}">${verifyURL}</a></p>`,
    text: `Verify: ${verifyURL}`,
  });
}

//
export async function notifyPasswordReset(
  user: UserMinimal,
  resetURL: string,
): Promise<boolean> {
  return sendEmailNotification({
    to: user.email,
    subject: 'Password Reset Request',
    text: `Click this link to reset your password:\n${resetURL}`,
  });
}
//
export async function notifyPasswordChanged(user: UserMinimal): Promise<boolean> {
  return sendEmailNotification({
    to: user.email,
    subject: 'Your password was changed',
    text: `Hi ${user.name}, your password has just been updated.`,
  });
}
