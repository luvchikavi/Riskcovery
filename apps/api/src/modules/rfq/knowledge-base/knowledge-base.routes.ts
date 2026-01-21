import type { FastifyPluginAsync } from 'fastify';

import { knowledgeBaseService } from './knowledge-base.service.js';

export const knowledgeBaseRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all sectors
  fastify.get('/sectors', async () => {
    const sectors = await knowledgeBaseService.getSectors();
    return { success: true, data: sectors };
  });

  // Get all knowledge base entries
  fastify.get('/', async () => {
    const entries = await knowledgeBaseService.findAll();
    return { success: true, data: entries };
  });

  // Get knowledge base by sector
  fastify.get<{ Params: { sector: string } }>('/sector/:sector', async (request) => {
    const entries = await knowledgeBaseService.findBySector(request.params.sector);
    return { success: true, data: entries };
  });

  // Get recommendations for a client
  fastify.post<{ Params: { sector: string } }>('/recommendations/:sector', async (request) => {
    const riskProfile = request.body as Record<string, unknown> | undefined;
    const recommendations = await knowledgeBaseService.getRecommendations(
      request.params.sector,
      riskProfile
    );
    return { success: true, data: recommendations };
  });

  // Create/update knowledge base entry (admin only)
  fastify.post('/', async (request, reply) => {
    const data = request.body as Parameters<typeof knowledgeBaseService.upsert>[0];
    const entry = await knowledgeBaseService.upsert(data);
    return reply.status(201).send({ success: true, data: entry });
  });

  // Delete knowledge base entry (admin only)
  fastify.delete<{ Params: { sector: string; policyType: string } }>(
    '/:sector/:policyType',
    async (request, reply) => {
      const deleted = await knowledgeBaseService.delete(
        request.params.sector,
        request.params.policyType
      );

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Entry not found' },
        });
      }

      return { success: true, data: { deleted: true } };
    }
  );
};
