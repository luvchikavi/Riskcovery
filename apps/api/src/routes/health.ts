import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
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

  fastify.get('/health/ready', async () => {
    // Add database and redis health checks here
    return {
      success: true,
      data: {
        status: 'ready',
        services: {
          database: 'healthy',
          redis: 'healthy',
        },
      },
    };
  });
};
