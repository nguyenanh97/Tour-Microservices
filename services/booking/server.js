import dotenv from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env';
dotenv.config({ path: envFile });
import app from './app.js';
import connectDB from './configs/db.js';
import logger from './utils/logger.js';

// Uncaught Exception
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
  });
  console.error(err);
  console.log('UncaughtException! Shutting Down...');
  process.exit(1);
});

// handle DB retry
const connectWithRetry = async (retries, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const pool = await connectDB();
      return pool;
    } catch (err) {
      console.log(`DB not ready, retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};

// db connection and server start
(async () => {
  try {
    await connectWithRetry();
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      logger.info(`App running on port ${port}`);
    });

    // UnHandled Rejection
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
  } catch (err) {
    console.log('DB Connection Error:', err);
    process.exit(1);
  }
})();
