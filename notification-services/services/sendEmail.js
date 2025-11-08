import dotenv from 'dotenv';
dotenv.config();
import logger from '../utils/logger.js';
import createEmailTransporter from '../config/cfmail.js';
import cf from '../config/config.js';
const sendEmail = async ({ to, subject, text, html }) => {
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
    logger.error(`❌ Failed to send email to ${to}: ${err.message}`);
    throw err;
  }
};
export default sendEmail;
