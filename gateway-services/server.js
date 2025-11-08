import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import logger from './utils/logger.js';
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
  });
  logger.error(err);
  console.log('UncaughtException! Shutting Down...');
  process.exit(1);
});
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  logger.info(`Gateway running on, ${port}`);
});
console.log(`Gateway running on port ${port}`);
// Unhandled Rejection
process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  console.log('Unhandled Rejection! Shutting Down...');
  server.close(() => {
    process.exit(1);
  });
});
