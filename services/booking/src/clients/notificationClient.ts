import { AxiosInstance, AxiosError } from 'axios';
import axios from 'axios';
import { randomUUID } from 'crypto';
const NOTIFICATION_API = process.env.NOTIF_API_BASE;
if (!NOTIFICATION_API) {
  throw new Error('Missing NOTIFICATION_API environment variable');
}
const NOTIF_INTERNAL = process.env.NOTIF_INTERNAL_TOKEN;
if (!NOTIF_INTERNAL) {
  throw new Error('Missing NOTIF_INTERNAL environment variable');
}
const client: AxiosInstance = axios.create({
  baseURL: `${NOTIFICATION_API}`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

//InterFaces
interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Error Normalizer
function normalizer(error: AxiosError | any): Error {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    'Notification service unavailable';
  return new Error(`[NotificationService] ${message}`);
}

// Send Email
export async function sendEmailNotification({
  to,
  subject,
  text,
  html,
}: SendEmailInput): Promise<boolean> {
  if (!to || !subject) {
    console.warn('[notificationClient] Missing to/subject, skip');
    return false;
  }
  try {
    const reqId = randomUUID();
    await client.post(
      '/email',
      { to, subject, text, html },
      {
        headers: { 'X-Request-ID': reqId, 'x-internal-token': NOTIF_INTERNAL },
      },
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log('[notificationClient] Email request sent:', to, subject);
    }
    return true;
  } catch (err) {
    const error = err as AxiosError;
    console.error(
      '[notificationClient] Failed to enqueue email:',
      error.response?.data || error.message,
    );
    return false;
  }
}
