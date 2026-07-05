import axios from 'axios';
import { randomUUID } from 'crypto';
const baseURL =
  process.env.NOTIFICATION_API_BASE || 'http://gateway:8080/api/v1/notifications';
const client = axios.create({
  baseURL,
  timeout: 5000,
});

// Send Email
export async function sendEmailNotification({ to, subject, text, html }) {
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
        headers: { 'X-Request-ID': reqId },
      },
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log('[notificationClient] Email request sent:', to, subject);
    }
  } catch (err) {
    console.error(
      '[notificationClient] Failed to enqueue email:',
      err.response?.data || err.message,
    );
    return false;
  }
}
