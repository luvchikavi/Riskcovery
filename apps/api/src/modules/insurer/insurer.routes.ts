// @ts-nocheck
import type { FastifyPluginAsync } from 'fastify';
import { insurerService } from './insurer.service.js';

export const insurerRoutes: FastifyPluginAsync = async (fastify) => {
  // ==================== LIST INSURERS ====================

  /**
   * GET /insurers
   * Return all active insurers with their policy counts.
   */
  fastify.get('/', async () => {
    const insurers = await insurerService.listInsurers();
    return { success: true, data: insurers };
  });

  // ==================== COMPARE ROUTES (before :code so they don't clash) ====================

  /**
   * GET /insurers/compare/:productCode
   * Compare all insurers for a given product type.
   */
  fastify.get<{ Params: { productCode: string } }>(
    '/compare/:productCode',
    async (request) => {
      const comparisons = await insurerService.compareByProduct(
        request.params.productCode,
      );
      return { success: true, data: comparisons };
    },
  );

  /**
   * GET /insurers/compare/:productCode/extensions
   * Side-by-side extension comparison matrix for a product type.
   */
  fastify.get<{ Params: { productCode: string } }>(
    '/compare/:productCode/extensions',
    async (request) => {
      const matrix = await insurerService.getExtensionMatrix(
        request.params.productCode,
      );
      return { success: true, data: matrix };
    },
  );

  // ==================== SINGLE INSURER ====================

  /**
   * GET /insurers/:code
   * Get insurer details by code (e.g. "CLAL", "PHOENIX").
   */
  fastify.get<{ Params: { code: string } }>(
    '/:code',
    async (request, reply) => {
      const insurer = await insurerService.getInsurer(request.params.code);

      if (!insurer) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Insurer not found' },
        });
      }

      return { success: true, data: insurer };
    },
  );

  // ==================== INSURER POLICIES ====================

  /**
   * GET /insurers/:code/policies
   * Get all policies for a specific insurer.
   */
  fastify.get<{ Params: { code: string } }>(
    '/:code/policies',
    async (request, reply) => {
      const result = await insurerService.getInsurerPolicies(
        request.params.code,
      );

      if (!result) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Insurer not found' },
        });
      }

      return { success: true, data: result };
    },
  );

  /**
   * GET /insurers/:code/policies/:productCode
   * Get a specific policy for a specific insurer, including extensions and exclusions.
   */
  fastify.get<{ Params: { code: string; productCode: string } }>(
    '/:code/policies/:productCode',
    async (request, reply) => {
      const result = await insurerService.getInsurerPolicy(
        request.params.code,
        request.params.productCode,
      );

      if (!result) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Insurer or policy not found',
          },
        });
      }

      return { success: true, data: result };
    },
  );
};
