import dotenv from 'dotenv';
dotenv.config();
import logger from '../utils/logger';
import createEmailTransporter from '../config/cfmail';
import cf from '../config/config';
import type { SendMailOptions } from 'nodemailer';
interface SendEmailParams extends SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<void> => {
  const emailTransporter = createEmailTransporter();
  const mailOption = {
    from: cf.email.from,
    to,
    subject,
    text,
    html,
  };
  try {
    await emailTransporter.sendMail(mailOption);
    logger.info(`✅ Email sent to: ${to}`);
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`❌ Failed to send email to ${to}: ${err.message}`);
    } else {
      logger.error('❌ Failed to send email', err);
    }
    throw err;
  }
};
export default sendEmail;
