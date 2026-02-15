import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import { env } from './config/env.js';
import { disconnectPrisma } from './lib/prisma.js';
import { comparisonRoutes } from './modules/comparison/comparison.routes.js';
import { insurerRoutes } from './modules/insurer/insurer.routes.js';
import { rfqRoutes } from './modules/rfq/rfq.routes.js';
import authPlugin from './plugins/auth.js';
import jwtPlugin from './plugins/jwt.js';
import { healthRoutes } from './routes/health.js';

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
    bodyLimit: 10 * 1024 * 1024, // 10 MB max body size
  });

  // Security plugins
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  await app.register(cors, {
    origin: env.CORS_ORIGINS,
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
    // Zod validation errors → 400 with field details
    if (error.name === 'ZodError' && 'issues' in error) {
      const issues = (
        error as unknown as { issues: Array<{ path: (string | number)[]; message: string }> }
      ).issues;
      const details: Record<string, string> = {};
      for (const issue of issues) {
        details[issue.path.join('.')] = issue.message;
      }

      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
        meta: {
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

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
