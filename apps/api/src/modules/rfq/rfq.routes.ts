import type { FastifyPluginAsync } from 'fastify';

import { clientRoutes } from './clients/client.routes.js';
import { knowledgeBaseRoutes } from './knowledge-base/knowledge-base.routes.js';
import { questionnaireRoutes } from './questionnaire/questionnaire.routes.js';
import { documentRoutes } from './documents/document.routes.js';

export const rfqRoutes: FastifyPluginAsync = async (fastify) => {
  // Register all RFQ sub-routes
  await fastify.register(clientRoutes, { prefix: '/clients' });
  await fastify.register(knowledgeBaseRoutes, { prefix: '/knowledge-base' });
  await fastify.register(questionnaireRoutes, { prefix: '/questionnaire' });
  await fastify.register(documentRoutes, { prefix: '/documents' });
};
