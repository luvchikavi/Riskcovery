import 'dotenv/config';

import { buildApp } from './app.js';
import { env } from './config/env.js';
import { disconnectPrisma } from './lib/prisma.js';

const start = async () => {
  const app = await buildApp();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}. Shutting down gracefully...`);
    try {
      await app.close();
      app.log.info('Server closed');
      await disconnectPrisma();
      app.log.info('Disconnected from database');
    } catch (err) {
      app.log.error(err, 'Error during shutdown');
    }
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    await app.listen({ port: env.PORT, host: '::' });
    app.log.info(`Server running on http://localhost:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
