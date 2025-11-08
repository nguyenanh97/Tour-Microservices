import axios from 'axios';
import { randomUUID } from 'crypto';
const baseURL =
  process.env.NOTIFICATION_API_BASE || 'http://gateway:8080/api/v1/notifications'; // fallback

const client = axios.create({
  baseURL,
  timeout: 5000,
});

//Gửi email
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
        headers: {
          'X-Request-ID': reqId,
          'x-internal-token': process.env.NOTIF_INTERNAL_TOKEN,
        },
      },
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[notificationClient] Sent to ${baseURL}/email`, { to, subject });
    }
    // <- add this
    return true;
  } catch (err) {
    console.error(
      '[notificationClient] Failed to enqueue email:',
      err.response?.data || err.message,
    );
    return false;
  }
}
// Các “event” logic hoá (optional)
export async function notifyUserRegistered(user, verifyURL) {
  return sendEmailNotification({
    to: user.email,
    subject: 'Verify your email',
    text: `Click this link to verify your email:\n${verifyURL}`,
  });
}
export async function notifyReverify(user, verifyURL) {
  return sendEmailNotification({
    to: user.email,
    subject: 'Re-verify your account',
    html: `<p>Click to verify: <a href="${verifyURL}">${verifyURL}</a></p>`,
    text: `Verify: ${verifyURL}`,
  });
}

export async function notifyPasswordReset(user, resetURL) {
  return sendEmailNotification({
    to: user.email,
    subject: 'Password Reset Request',
    text: `Click this link to reset your password:\n${resetURL}`,
  });
}
//
export async function notifyPasswordChanged(user) {
  return sendEmailNotification({
    to: user.email,
    subject: 'Your password was changed',
    text: `Hi ${user.name}, your password has just been updated.`,
  });
}

//
export async function notifyAccountRestoreRequested(user, restoreURL) {
  if (!user || !user.email) {
    console.warn(
      '[notificationClient] notifyAccountRestoreRequested missing user/email, skip',
    );
    return false;
  }
  const text = `Hi ${user.name || 'there'},\n\nWe received a request to restore your account.\nClick this link to continue:\n${restoreURL}\n\nIf this wasn't you, you can ignore this email.`;
  const html = `<p>Hi ${user.name || 'there'},</p>
    <p>We received a request to <strong>restore your account</strong>.</p>
    <p>Click this link to continue: <a href="${restoreURL}">${restoreURL}</a></p>
    <p>If this wasn't you, you can ignore this email.</p>`;
  return sendEmailNotification({
    to: user.email,
    subject: 'Restore your account',
    text,
    html,
  });
}

//
export async function notifyAccountRestored(user) {
  if (!user || !user.email) {
    console.warn(
      '[notificationClient] notifyAccountRestored missing user/email, skip',
    );
    return false;
  }

  const frontend = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const loginLink = frontend ? `${frontend}` : '';

  const text = `Hi ${user.name || 'there'},\n\nYour account has been restored. You can now log in${loginLink ? ' at ' + loginLink : ''}.\n\nIf this wasn't you, contact support.`;
  const html = `<p>Hi ${user.name || 'there'},</p>
    <p>Your account has been <strong>restored</strong>. ${loginLink ? `You can <a href="${loginLink}">log in here</a>.` : 'You can now log in.'}</p>
    <p>If this wasn't you, please contact support.</p>`;

  return sendEmailNotification({
    to: user.email,
    subject: 'Your account has been restored',
    text,
    html,
  });
}
