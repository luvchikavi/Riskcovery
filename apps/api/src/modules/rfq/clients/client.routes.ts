import type { FastifyPluginAsync } from 'fastify';

import { clientService } from './client.service.js';
import { createClientSchema, updateClientSchema, clientQuerySchema } from './client.schema.js';

// TODO: Get organizationId from authenticated user
const TEMP_ORG_ID = 'org-placeholder';

export const clientRoutes: FastifyPluginAsync = async (fastify) => {
  // List clients
  fastify.get('/', async (request, reply) => {
    const query = clientQuerySchema.parse(request.query);
    const result = await clientService.findAll(TEMP_ORG_ID, query);

    return {
      success: true,
      ...result,
    };
  });

  // Get client by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const client = await clientService.findById(TEMP_ORG_ID, request.params.id);

    if (!client) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Client not found' },
      });
    }

    return { success: true, data: client };
  });

  // Create client
  fastify.post('/', async (request, reply) => {
    const data = createClientSchema.parse(request.body);
    const client = await clientService.create(TEMP_ORG_ID, data);

    return reply.status(201).send({ success: true, data: client });
  });

  // Update client
  fastify.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const data = updateClientSchema.parse(request.body);
    const client = await clientService.update(TEMP_ORG_ID, request.params.id, data);

    if (!client) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Client not found' },
      });
    }

    return { success: true, data: client };
  });

  // Delete client
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const deleted = await clientService.delete(TEMP_ORG_ID, request.params.id);

    if (!deleted) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Client not found' },
      });
    }

    return { success: true, data: { deleted: true } };
  });

  // Update risk profile
  fastify.put<{ Params: { id: string } }>('/:id/risk-profile', async (request, reply) => {
    const riskProfile = request.body as Record<string, unknown>;
    const client = await clientService.updateRiskProfile(TEMP_ORG_ID, request.params.id, riskProfile);

    if (!client) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Client not found' },
      });
    }

    return { success: true, data: client };
  });
};
