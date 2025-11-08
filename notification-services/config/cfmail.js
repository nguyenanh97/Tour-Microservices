import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import cf from './config.js';
import logger from '../utils/logger.js';
const createEmailTransporter = () => {
  const transport = nodemailer.createTransport({
    host: cf.email.host,
    port: Number(cf.email.port),
    secure: cf.email.secure === 'true',
    auth: { user: cf.email.user, pass: cf.email.pass },
    tls: { rejectUnauthorized: false },
  });

  transport
    .verify()
    .then(() => logger.info('✅ SMTP transporter is ready'))
    .catch(err => logger.error('❌ SMTP transporter error:', err));
  return transport;
};

export default createEmailTransporter;
