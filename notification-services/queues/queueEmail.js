import Bull from 'bull';
import { getRedisClient, connectRedis } from '../services/redis.js';
import logger from '../utils/logger.js';
import cf from '../config/config.js';

connectRedis(); //kết nối Redis

const redis = getRedisClient();
if (!redis) {
  throw new Error(
    'Redis client not initialized. Did you forget to call connectRedis()?',
  );
}

const notificationQueue = new Bull('notification:email:send', {
  redis: {
    host: cf.redis.host,
    port: cf.redis.port,
    password: cf.redis.password,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: process.env.NODE_ENV === 'production',
  },
});

// Event listeners
notificationQueue.on('completed', job => console.log(`✅ Job ${job.id} completed`));
notificationQueue.on('failed', (job, err) =>
  console.error(`❌ Job ${job.id} failed`, err),
);

// Hàm enqueue email
export const enqueueEmail = async payload => {
  const job = await notificationQueue.add(payload);
  if (process.env.NODE_ENV !== 'production') {
    logger.info(` Enqueued email job ${job.id} ->${payload.to}`);
  }
  return job.id;
};
export default notificationQueue;
