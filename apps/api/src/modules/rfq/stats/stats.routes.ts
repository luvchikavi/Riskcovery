// @ts-nocheck
import type { FastifyPluginAsync } from 'fastify';

import { requireAuth } from '../../../plugins/auth.js';
import { statsService } from './stats.service.js';

export const statsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  fastify.get('/', async (request) => {
    const orgId = request.currentUser!.organizationId;
    const stats = await statsService.getDashboardStats(orgId);
    return { success: true, data: stats };
  });
};
