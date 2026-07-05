import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import { enqueueEmail } from './queues/queueEmail';
import logger from './utils/logger';
import internalAuth from './services/internalAuth';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'notification', time: Date.now() }),
);

// Route POST /email để nhận yêu cầu gửi email từ các service khác
app.post(
  '/email',
  internalAuth,
  async (req: Request, res: Response): Promise<void> => {
    const { to, subject, text, html } = (req.body ?? {}) as {
      to?: string;
      subject?: string;
      text?: string;
      html: string;
    };
    if (!to || !subject) {
      res.status(400).json({ message: 'Missing to/subject' });
      return;
    }

    try {
      await enqueueEmail({ to, subject, text, html });
      res.json({ status: 'queued' });
      return;
    } catch (err) {
      if (err instanceof Error) {
        logger.error('[POST /email] enqueue failed:', err.message);
        res.status(500).json({ message: 'Queue error', error: err.message });
        return;
      }
      logger.error('[POST /email] enqueue failed (unknown error)', err);
      res.status(500).json({ message: 'Queue error' });
      return;
    }
  },
);

app.get('/', (req, res) => res.send('Notification Service Running'));

export default app;
