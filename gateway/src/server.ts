import dotenv from 'dotenv';
import app from './app';
import logger from './utils/logger';

// ==============================
// Load ENV
// ==============================
const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env';

dotenv.config({ path: envFile });

// ==============================
// Uncaught Exception
// ==============================
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  console.error(err);
  process.exit(1);
});

// ==============================
// Unhandled Promise Rejection
// ==============================
process.on('unhandledRejection', (err: any) => {
  logger.error('Unhandled Rejection:', err);
  console.error(err);
  process.exit(1);
});

// ==============================
// Start server (NO DB FOR GATEWAY)
// ==============================
const startServer = (): void => {
  const port = process.env.PORT || 3000;

  const server = app.listen(port, () => {
    logger.info(`API Gateway running on port ${port}`);
    console.log(`API Gateway running on port ${port}`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`${signal} received. Closing server...`);
    server.close(() => {
      console.log('Server closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
