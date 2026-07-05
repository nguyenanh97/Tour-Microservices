import dotenv from 'dotenv';
// Load ENV
const envFile =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'development'
      ? '.env.development'
      : '.env';

dotenv.config({ path: envFile });
import sequelize from './configs/db';
import app from './app';
import logger from './utils/logger';

// Uncaught Exception

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  console.error(err);
  console.log('UncaughtException! Shutting Down...');
  process.exit(1);
});

// Unhandled Promise Rejection

process.on('unhandledRejection', (err: any) => {
  logger.error('Unhandled Rejection:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  console.error('UnhandledRejection! Shutting down...');
  process.exit(1);
});

// DB connection with retry
const connectWithRetry = async (retries = 5, delay = 2000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      logger.info('✅ MySQL User_Db connected!');
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
      } else {
        await sequelize.sync();
      }
      return;
    } catch (err) {
      console.log(`DB not ready, retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('DB connection failed after retries');
};

// Start server (NO DB FOR GATEWAY)

const startServer = async (): Promise<void> => {
  try {
    await connectWithRetry();
    console.log('Database connected successfully');
    const port = process.env.PORT || 3000;

    const server = app.listen(port, () => {
      logger.info(` User Service running on port ${port}`);
      console.log(` User Service running on port ${port}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`${signal} received. Closing server...`);
      server.close(() => {
        console.log('User Service stopped gracefully');
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    console.error('DB Connection Error:', err);
    process.exit(1);
  }
};

startServer();
