// @ts-nocheck
import { prisma } from '../../../lib/prisma.js';

export class ProductService {
  async findAll() {
    return prisma.insuranceProduct.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async findByCode(code: string) {
    return prisma.insuranceProduct.findUnique({
      where: { code },
      include: {
        extensions: { orderBy: { code: 'asc' } },
        exclusions: { orderBy: { nameEn: 'asc' } },
      },
    });
  }

  async findBySector(sector: string) {
    const mappings = await prisma.sectorProductMapping.findMany({
      where: { sector: sector.toUpperCase() },
      include: {
        product: true,
      },
      orderBy: { necessity: 'asc' },
    });

    return mappings.map((m) => ({
      ...m.product,
      necessity: m.necessity,
    }));
  }

  async getExtensions(productCode: string) {
    const product = await prisma.insuranceProduct.findUnique({ where: { code: productCode } });
    if (!product) return [];

    return prisma.policyExtension.findMany({
      where: { productId: product.id },
      orderBy: { code: 'asc' },
    });
  }

  async getExclusions(productCode: string) {
    const product = await prisma.insuranceProduct.findUnique({ where: { code: productCode } });
    if (!product) return [];

    return prisma.policyExclusion.findMany({
      where: { productId: product.id },
      orderBy: { nameEn: 'asc' },
    });
  }

  async getRelatedProducts(productCode: string) {
    const product = await prisma.insuranceProduct.findUnique({ where: { code: productCode } });
    if (!product) return [];

    const [relationsFrom, relationsTo] = await Promise.all([
      prisma.crossPolicyRelation.findMany({
        where: { fromProductId: product.id },
        include: { toProduct: true },
      }),
      prisma.crossPolicyRelation.findMany({
        where: { toProductId: product.id },
        include: { fromProduct: true },
      }),
    ]);

    return [
      ...relationsFrom.map((r) => ({
        product: r.toProduct,
        relationType: r.relationType,
        description: r.description,
        direction: 'outgoing' as const,
      })),
      ...relationsTo.map((r) => ({
        product: r.fromProduct,
        relationType: r.relationType,
        description: r.description,
        direction: 'incoming' as const,
      })),
    ];
  }

  async getSectorMatrix() {
    const mappings = await prisma.sectorProductMapping.findMany({
      include: { product: true },
      orderBy: [{ sector: 'asc' }, { necessity: 'asc' }],
    });

    // Group by sector
    const matrix: Record<string, { product: typeof mappings[0]['product']; necessity: string }[]> = {};
    for (const m of mappings) {
      if (!matrix[m.sector]) matrix[m.sector] = [];
      matrix[m.sector]!.push({ product: m.product, necessity: m.necessity });
    }
    return matrix;
  }

  async getAllRelations() {
    return prisma.crossPolicyRelation.findMany({
      include: {
        fromProduct: true,
        toProduct: true,
      },
    });
  }
}

export const productService = new ProductService();
