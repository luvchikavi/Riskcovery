// @ts-nocheck
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import { env } from './config/env.js';
import jwtPlugin from './plugins/jwt.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { rfqRoutes } from './modules/rfq/rfq.routes.js';
import { comparisonRoutes } from './modules/comparison/comparison.routes.js';
import { insurerRoutes } from './modules/insurer/insurer.routes.js';
import { disconnectPrisma } from './lib/prisma.js';

export async function buildApp() {
  const app = Fastify({
    logger:
      env.NODE_ENV !== 'production'
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
              },
            },
          }
        : true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  // Security plugins
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  // Build allowed origins list: env-configured + known Vercel deployments
  const allowedOrigins = new Set(env.CORS_ORIGINS);
  allowedOrigins.add('https://riskcovery-api.vercel.app');
  allowedOrigins.add('http://localhost:3000');

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.has(origin)) {
        cb(null, true);
      } else {
        app.log.warn(`CORS blocked origin: ${origin}, allowed: ${[...allowedOrigins].join(', ')}`);
        cb(null, false);
      }
    },
    credentials: true,
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: '1 minute',
  });

  // Auth plugins
  await app.register(jwtPlugin);
  await app.register(authPlugin);

  // Routes
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(rfqRoutes, { prefix: '/api/v1/rfq' });
  await app.register(comparisonRoutes, { prefix: '/api/v1/comparison' });
  await app.register(insurerRoutes, { prefix: '/api/v1/insurers' });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error({ err: error, requestId: request.id }, 'Request error');

    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;

    reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message,
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Clean shutdown hook
  app.addHook('onClose', async () => {
    app.log.info('Disconnecting from database...');
    await disconnectPrisma();
  });

  return app;
}
