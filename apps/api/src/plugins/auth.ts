import fp from 'fastify-plugin';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { env } from '../config/env.js';

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: CurrentUser;
  }
}

const DEV_USER: CurrentUser = {
  userId: 'dev-user-id',
  email: 'dev@riscovery.com',
  name: 'Dev User',
  role: 'ADMIN',
  organizationId: 'org-placeholder',
};

export default fp(async (fastify) => {
  fastify.decorateRequest('currentUser', undefined);

  fastify.addHook('onRequest', async (request) => {
    const authHeader = request.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const decoded = fastify.jwt.verify<CurrentUser>(token);
        request.currentUser = {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          organizationId: decoded.organizationId,
        };
      } catch {
        // Invalid token — fall through to dev fallback or leave undefined
        request.log.warn('Invalid JWT token');
      }
    }

    // Dev fallback: if no user was set and we're in development, use DEV_USER
    if (!request.currentUser && env.NODE_ENV === 'development') {
      request.currentUser = DEV_USER;
    }
  });
});

/**
 * Route-level guard: returns 401 if no authenticated user.
 * Use as a preHandler on routes that require authentication.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.currentUser) {
    return reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }
}
