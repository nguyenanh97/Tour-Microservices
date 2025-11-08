import winston from 'winston';
import cf from '../config/config.js';

const logger = winston.createLogger({
  level: cf.logLevel || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true }),
  ),
  transports: [
    // Combined logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxFiles: 5,
      maxsize: 5 * 1024 * 1024, // 10MB
    }),

    // Errors logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxFiles: 5,
      maxsize: 5 * 1024 * 1024, // 10MB
    }),
  ],
});

// Console log chỉ khi không phải production
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}
export default logger;
