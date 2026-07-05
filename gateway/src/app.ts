import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import proxyRouter from './proxies/index';

const app = express();
// app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[Gateway] Received request: ${req.method} ${req.originalUrl}`);
  next();
});
// SECURITY
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limit → chống spam attack
app.use(
  '/api',
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 phút
    max: 2000,
  }),
);

//BODY PARSERS

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true }));

// Routers (proxy routes)
app.use(proxyRouter);

// HEALTH CHECK

app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'API Gateway',
    timestamp: Date.now(),
  });
});

app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//GLOBAL ERROR HANDLER

app.use(globalErrorHandler);

export default app;
