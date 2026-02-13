// @ts-nocheck
import type { FastifyPluginAsync } from 'fastify';

import { clientService } from './client.service.js';
import { createClientSchema, updateClientSchema, clientQuerySchema } from './client.schema.js';
import { requireAuth } from '../../../plugins/auth.js';

export const clientRoutes: FastifyPluginAsync = async (fastify) => {
  // All client routes require authentication
  fastify.addHook('preHandler', requireAuth);

  // List clients
  fastify.get('/', async (request, reply) => {
    const query = clientQuerySchema.parse(request.query);
    const orgId = request.currentUser!.organizationId;
    const result = await clientService.findAll(orgId, query);

    return {
      success: true,
      data: result,
    };
  });

  // Get client by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const orgId = request.currentUser!.organizationId;
    const client = await clientService.findById(orgId, request.params.id);

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
    const orgId = request.currentUser!.organizationId;
    const client = await clientService.create(orgId, data);

    return reply.status(201).send({ success: true, data: client });
  });

  // Update client
  fastify.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const data = updateClientSchema.parse(request.body);
    const orgId = request.currentUser!.organizationId;
    const client = await clientService.update(orgId, request.params.id, data);

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
    const orgId = request.currentUser!.organizationId;
    const deleted = await clientService.delete(orgId, request.params.id);

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
    const orgId = request.currentUser!.organizationId;
    const riskProfile = request.body as Record<string, unknown>;
    const client = await clientService.updateRiskProfile(orgId, request.params.id, riskProfile);

    if (!client) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Client not found' },
      });
    }

    return { success: true, data: client };
  });
};
