import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Liveness probe — always 200
  fastify.get('/health', async () => {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
      },
    };
  });

  // Readiness probe — pings database
  fastify.get('/health/ready', async (_request, reply) => {
    const services: Record<string, string> = {};

    try {
      await prisma.$queryRaw`SELECT 1`;
      services.database = 'healthy';
    } catch (err) {
      services.database = 'unhealthy';
      fastify.log.error({ err }, 'Database health check failed');
      return reply.status(503).send({
        success: false,
        data: {
          status: 'not_ready',
          services,
        },
      });
    }

    return {
      success: true,
      data: {
        status: 'ready',
        services,
      },
    };
  });
};
