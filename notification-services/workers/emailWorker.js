import notificationQueue from '../queues/queueEmail.js';
import sendEmail from '../services/sendEmail.js';
import logger from '../utils/logger.js';
logger.info('🚀 Email Worker started...');

// concurrency = 5
notificationQueue.process(5, async job => {
  await sendEmail(job.data);
});
notificationQueue.on('completed', job => {
  process.env.NODE_ENV === 'development'
    ? logger.info(
        `✅ Job ${job.id} completed with data: ${JSON.stringify(job.data)}`,
      )
    : logger.info(`✅ Job ${job.id} completed`);
});

//job fail
notificationQueue.on('failed', (job, err) =>
  logger.error(`❌ Job ${job.id} failed: ${err.message}`, { stack: err.stack }),
);

if (process.env.NODE_ENV === 'production') {
  notificationQueue.clean(10_000, 'completed');
  notificationQueue.clean(900_000, 'failed');
} else {
  logger.warn('⚠️ Running in DEV mode, jobs will be kept for debugging');
}
// Graceful shutdown
const shutdown = async () => {
  logger.info('🛑 Shutting down email worker...');
  try {
    await notificationQueue.close();
    logger.info('🔻 Email queue closed');
  } catch (err) {
    logger.error('❌ Error closing email queue', {
      stack: err.message,
      stack: err.stack,
    });
  }
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
