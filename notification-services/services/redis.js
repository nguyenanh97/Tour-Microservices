import Redis from 'ioredis';
import logger from '../utils/logger.js';
let redisClient;
export const connectRedis = () => {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      retryStrategy: times => Math.min(times * 100, 3000),
    });
  } else if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      retryStrategy: times => Math.min(times * 100, 3000),
    });
  } else {
    logger.warn(
      '⚠️ Redis config not found (REDIS_URL or REDIS_HOST/PORT). Disabled.',
    );
    return null;
  }

  redisClient
    .connect()
    .then(() => logger.info('Redis connected'))
    .catch(err => logger.error('Redis connection error', err));

  // Listen events
  redisClient.on('connect', () => logger.info('🔌 Redis client connecting...'));
  redisClient.on('ready', () => logger.info('✅ Redis client ready'));
  redisClient.on('error', err => logger.error(`❌ Redis error: ${err.message}`));
  redisClient.on('reconnecting', () => logger.warn('⚠️ Redis reconnecting...'));
  redisClient.on('end', () => logger.info('🛑 Redis connection closed'));

  // Handle shutdown

  const shutdown = async () => {
    if (redisClient) {
      try {
        await redisClient.quit();
        logger.info('🔻 Redis client disconnected gracefully');
      } catch (err) {
        logger.error('❌ Error during Redis shutdown', err);
      }
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return redisClient;
};
export const getRedisClient = () => redisClient;
