import Bull from 'bull';
import { getRedisClient, connectRedis } from '../services/redis';
import logger from '../utils/logger';
import cf from '../config/config';

connectRedis(); //kết nối Redis

const redis = getRedisClient();
if (!redis) {
  throw new Error(
    'Redis client not initialized. Did you forget to call connectRedis()?',
  );
}
// TYPES
interface EmailJobPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}
const notificationQueue = new Bull<EmailJobPayload>('notification:email:send', {
  redis: {
    host: cf.redis.host,
    port: cf.redis.port,
    password: cf.redis.password || undefined,
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
export const enqueueEmail = async (payload: EmailJobPayload): Promise<string> => {
  const job = await notificationQueue.add(payload);
  if (process.env.NODE_ENV !== 'production') {
    logger.info(` Enqueued email job ${job.id} ->${payload.to}`);
  }
  return String(job.id);
};
export default notificationQueue;
