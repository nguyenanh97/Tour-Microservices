import dotenv from 'dotenv';
dotenv.config();
import nodemailer, { Transporter } from 'nodemailer';
import cf from './config';
import logger from '../utils/logger';
const createEmailTransporter = (): Transporter => {
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
