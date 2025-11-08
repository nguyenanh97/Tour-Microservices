import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import globalErrorHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';
dotenv.config();
const app = express();

// Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
// Services
const {
  AUTH_SERVICE_URL,
  TOUR_SERVICE_URL,
  NOTIFICATION_SERVICE_URL,
  USER_SERVICE_URL,
} = process.env;

const createProxy = (target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    proxyTimeout: 15000,
    timeout: 15000,
  });

//rewrite rules
const authRewrite = { '^/api/v1/auth': '' };
const userRewrite = { '^/api/v1/users': '' };
const tourRewrite = { '^/api/v1/tours': '' };
const notificationRewrite = { '^/api/v1/notifications': '' };

// Proxy - Auth-service
app.use('/api/v1/auth', createProxy(AUTH_SERVICE_URL, authRewrite));

// Proxy Notification-service
app.use(
  '/api/v1/notifications',
  createProxy(NOTIFICATION_SERVICE_URL, notificationRewrite),
);

// Proxy Tour-service
app.use('/api/v1/tours', createProxy(TOUR_SERVICE_URL, tourRewrite));

// Proxy User- Sevices

app.use('/api/v1/users', createProxy(USER_SERVICE_URL, userRewrite));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Ok...', service: 'API Gateway', timestamp: Date.now() });
});
// Global error handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

export default app;
