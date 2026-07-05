import { Request } from 'express';
import { ClientRequest, ServerResponse } from 'http';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

const createProxy = (target: string, pathRewrite?: Record<string, string>) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    secure: false,
    timeout: 30000,
    proxyTimeout: 30000,

    on: {
      proxyReq(proxyReq: ClientRequest, req: Request) {
        console.log(
          `[Gateway] --> ${req.method} ${req.originalUrl} => ${target}${req.url}`,
        );

        // Quan trọng: forward lại body đã bị express.json() đọc
        fixRequestBody(proxyReq, req);

        if (typeof req.headers['x-user-id'] === 'string') {
          proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        }
        if (typeof req.headers['x-user-role'] === 'string') {
          proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
        }
        if (typeof req.headers['x-user-verified'] === 'string') {
          proxyReq.setHeader('x-user-verified', req.headers['x-user-verified']);
        }
      },

      proxyRes(proxyRes, req) {
        console.log(`[Gateway] <-- ${proxyRes.statusCode} from ${target}${req.url}`);
      },

      error(err, _req, res) {
        console.error('[Gateway] Proxy Error:', err);

        if (res instanceof ServerResponse) {
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad Gateway', message: err.message }));
          }
          return;
        }

        // socket case

        res.destroy?.();
      },
    },
  });

export default createProxy;
