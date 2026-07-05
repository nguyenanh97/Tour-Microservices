import { Job } from 'bull';
import notificationQueue from '../queues/queueEmail';
import sendEmail from '../services/sendEmail';
import logger from '../utils/logger';
logger.info('🚀 Email Worker started...');

// concurrency = 5
interface EmailJobPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

//PROCESS JOBS
notificationQueue.process(5, async (job: Job<EmailJobPayload>): Promise<void> => {
  await sendEmail(job.data);
});

// EVENTS
notificationQueue.on('completed', (job: Job<EmailJobPayload>) => {
  process.env.NODE_ENV === 'development'
    ? logger.info(
        `✅ Job ${job.id} completed with data: ${JSON.stringify(job.data)}`,
      )
    : logger.info(`✅ Job ${job.id} completed`);
});

//JOB FAILED
notificationQueue.on(
  'failed',
  (job: Job<EmailJobPayload> | undefined, err: Error) => {
    logger.error(`❌ Job ${job?.id ?? 'unknown'} failed`, {
      message: err.message,
      stack: err.stack,
    });
  },
);
//CLEAN JOBS
if (process.env.NODE_ENV === 'production') {
  notificationQueue.clean(10_000, 'completed');
  notificationQueue.clean(900_000, 'failed');
} else {
  logger.warn('⚠️ Running in DEV mode, jobs will be kept for debugging');
}
//  GRACEFUL SHUTDOWN
const shutdown = async () => {
  logger.info('🛑 Shutting down email worker...');
  try {
    await notificationQueue.close();
    logger.info('🔻 Email queue closed');
  } catch (err) {
    const error = err as Error;
    logger.error('❌ Error closing email queue', {
      message: error.message,
      stack: error.stack,
    });
  }
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
