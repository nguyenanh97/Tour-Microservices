import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { enqueueEmail } from './queues/queueEmail.js';
import logger from './utils/logger.js';
import internalAuth from './services/internalAuth.js';
const app = express();
app.use(express.json());
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'notification', time: Date.now() }),
);
// Route POST /email để nhận yêu cầu gửi email từ các service khác
app.post('/email', internalAuth, async (req, res) => {
  const { to, subject, text, html } = req.body || {};
  if (!to || !subject)
    return res.status(400).json({ message: 'Missing to/subject' });
  try {
    await enqueueEmail({ to, subject, text, html });
    return res.json({ status: 'queued' });
  } catch (err) {
    (logger ? logger.error : console.error)(
      ' [POST /email] enqueue failed:',
      err.message,
    );
    return res.status(500).json({ message: 'Queue error', error: err.message });
  }
});

app.get('/', (req, res) => res.send('Notification Service Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Notification-service listening on port ${PORT}`),
);
