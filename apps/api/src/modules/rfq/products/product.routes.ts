// @ts-nocheck
import type { FastifyPluginAsync } from 'fastify';

import { productService } from './product.service.js';

export const productRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all products (list, without extensions)
  fastify.get('/', async () => {
    const products = await productService.findAll();
    return { success: true, data: products };
  });

  // Get sector matrix (all sectors × products)
  fastify.get('/sector-matrix', async () => {
    const matrix = await productService.getSectorMatrix();
    return { success: true, data: matrix };
  });

  // Get all cross-policy relations
  fastify.get('/relations', async () => {
    const relations = await productService.getAllRelations();
    return { success: true, data: relations };
  });

  // Get products for a specific sector
  fastify.get<{ Params: { sector: string } }>('/sector/:sector', async (request) => {
    const products = await productService.findBySector(request.params.sector);
    return { success: true, data: products };
  });

  // Get single product by code (includes extensions and exclusions)
  fastify.get<{ Params: { code: string } }>('/:code', async (request, reply) => {
    const product = await productService.findByCode(request.params.code);
    if (!product) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }
    return { success: true, data: product };
  });

  // Get extensions for a product
  fastify.get<{ Params: { code: string } }>('/:code/extensions', async (request) => {
    const extensions = await productService.getExtensions(request.params.code);
    return { success: true, data: extensions };
  });

  // Get exclusions for a product
  fastify.get<{ Params: { code: string } }>('/:code/exclusions', async (request) => {
    const exclusions = await productService.getExclusions(request.params.code);
    return { success: true, data: exclusions };
  });

  // Get related products
  fastify.get<{ Params: { code: string } }>('/:code/relations', async (request) => {
    const relations = await productService.getRelatedProducts(request.params.code);
    return { success: true, data: relations };
  });
};
