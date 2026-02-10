import { prisma } from '../../../lib/prisma.js';
import { productService } from '../products/product.service.js';

export interface KnowledgeBaseEntry {
  sector: string;
  policyType: string;
  policyTypeHe: string;
  recommendedLimit?: number;
  isMandatory: boolean;
  commonEndorsements: string[];
  riskFactors: string[];
  description?: string;
  descriptionHe?: string;
}

// Maps old policy type codes to new product codes
const POLICY_CODE_MAP: Record<string, string> = {
  GENERAL_LIABILITY: 'THIRD_PARTY_LIABILITY',
  EMPLOYER_LIABILITY: 'EMPLOYERS_LIABILITY',
  PROPERTY_FIRE: 'FIRE_CONSEQUENTIAL_LOSS',
  PROPERTY: 'FIRE_CONSEQUENTIAL_LOSS',
  FIRE: 'FIRE_CONSEQUENTIAL_LOSS',
  CAR_INSURANCE: 'CONTRACTOR_WORKS_CAR',
  ELECTRONIC_EQUIPMENT: 'ELECTRONIC_EQUIPMENT',
  HEAVY_EQUIPMENT: 'HEAVY_ENGINEERING_EQUIPMENT',
  PRODUCT_LIABILITY: 'PRODUCT_LIABILITY',
  CARGO: 'CARGO_IN_TRANSIT',
  CASH: 'CASH_MONEY',
  FIDELITY: 'FIDELITY_CRIME',
  TERRORISM: 'TERRORISM',
  MECHANICAL: 'MECHANICAL_BREAKDOWN',
};

export class KnowledgeBaseService {
  // Try new product tables first, fall back to old InsuranceKnowledgeBase
  async findBySector(sector: string) {
    try {
      const products = await productService.findBySector(sector);
      if (products.length > 0) {
        return products.map((p) => this.productToKnowledgeEntry(sector, p));
      }
    } catch {
      // New tables may not exist yet, fall back
    }

    return prisma.insuranceKnowledgeBase.findMany({
      where: { sector },
      orderBy: [{ isMandatory: 'desc' }, { policyType: 'asc' }],
    });
  }

  async findAll() {
    try {
      const matrix = await productService.getSectorMatrix();
      const entries: ReturnType<typeof this.productToKnowledgeEntry>[] = [];
      for (const [sector, items] of Object.entries(matrix)) {
        for (const item of items) {
          entries.push(this.productToKnowledgeEntry(sector, { ...item.product, necessity: item.necessity }));
        }
      }
      if (entries.length > 0) {
        return entries.sort((a, b) => {
          if (a.sector !== b.sector) return a.sector.localeCompare(b.sector);
          if (a.isMandatory !== b.isMandatory) return a.isMandatory ? -1 : 1;
          return a.policyType.localeCompare(b.policyType);
        });
      }
    } catch {
      // Fall back
    }

    return prisma.insuranceKnowledgeBase.findMany({
      orderBy: [{ sector: 'asc' }, { isMandatory: 'desc' }, { policyType: 'asc' }],
    });
  }

  async getSectors() {
    try {
      const mappings = await prisma.sectorProductMapping.findMany({
        select: { sector: true },
        distinct: ['sector'],
        orderBy: { sector: 'asc' },
      });
      if (mappings.length > 0) {
        return mappings.map((m) => m.sector);
      }
    } catch {
      // Fall back
    }

    const results = await prisma.insuranceKnowledgeBase.findMany({
      select: { sector: true },
      distinct: ['sector'],
      orderBy: { sector: 'asc' },
    });
    return results.map((r) => r.sector);
  }

  async create(data: KnowledgeBaseEntry) {
    return prisma.insuranceKnowledgeBase.create({
      data: {
        sector: data.sector,
        policyType: data.policyType,
        policyTypeHe: data.policyTypeHe,
        recommendedLimit: data.recommendedLimit,
        isMandatory: data.isMandatory,
        commonEndorsements: data.commonEndorsements,
        riskFactors: data.riskFactors,
        description: data.description,
        descriptionHe: data.descriptionHe,
      },
    });
  }

  async upsert(data: KnowledgeBaseEntry) {
    return prisma.insuranceKnowledgeBase.upsert({
      where: {
        sector_policyType: {
          sector: data.sector,
          policyType: data.policyType,
        },
      },
      create: {
        sector: data.sector,
        policyType: data.policyType,
        policyTypeHe: data.policyTypeHe,
        recommendedLimit: data.recommendedLimit,
        isMandatory: data.isMandatory,
        commonEndorsements: data.commonEndorsements,
        riskFactors: data.riskFactors,
        description: data.description,
        descriptionHe: data.descriptionHe,
      },
      update: {
        policyTypeHe: data.policyTypeHe,
        recommendedLimit: data.recommendedLimit,
        isMandatory: data.isMandatory,
        commonEndorsements: data.commonEndorsements,
        riskFactors: data.riskFactors,
        description: data.description,
        descriptionHe: data.descriptionHe,
      },
    });
  }

  async delete(sector: string, policyType: string) {
    try {
      await prisma.insuranceKnowledgeBase.delete({
        where: {
          sector_policyType: { sector, policyType },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Get recommended coverages for a client based on their sector and profile
  async getRecommendations(sector: string, riskProfile?: Record<string, unknown>) {
    const baseRequirements = await this.findBySector(sector);

    // Apply risk-based adjustments
    return baseRequirements.map((req) => {
      let adjustedLimit = req.recommendedLimit ? Number(req.recommendedLimit) : 0;

      // Adjust based on risk factors in profile
      if (riskProfile) {
        const employeeCount = riskProfile.employeeCount as number | undefined;
        const annualRevenue = riskProfile.annualRevenue as number | undefined;
        const hasInternationalOps = riskProfile.hasInternationalOperations as boolean | undefined;

        // Scale limits based on company size
        if (employeeCount && employeeCount > 100) {
          adjustedLimit *= 1.5;
        }
        if (annualRevenue && annualRevenue > 50000000) {
          adjustedLimit *= 1.25;
        }
        if (hasInternationalOps) {
          adjustedLimit *= 1.2;
        }
      }

      return {
        ...req,
        recommendedLimit: adjustedLimit,
        adjustmentApplied: adjustedLimit !== Number(req.recommendedLimit),
      };
    });
  }

  // Resolve old policy code to new product code
  resolveProductCode(oldCode: string): string {
    return POLICY_CODE_MAP[oldCode] || oldCode;
  }

  // Convert a product + necessity into the KnowledgeBase shape for backward compatibility
  private productToKnowledgeEntry(
    sector: string,
    product: { code: string; nameEn: string; nameHe: string; description?: string | null; descriptionHe?: string | null; necessity?: string }
  ) {
    return {
      id: product.code,
      sector,
      policyType: product.code,
      policyTypeHe: product.nameHe,
      recommendedLimit: this.getDefaultLimit(product.code),
      isMandatory: product.necessity === 'mandatory',
      commonEndorsements: [] as string[],
      riskFactors: [] as string[],
      description: product.description ?? undefined,
      descriptionHe: product.descriptionHe ?? undefined,
    };
  }

  // Default recommended limits per product type (in ILS)
  private getDefaultLimit(productCode: string): number {
    const defaults: Record<string, number> = {
      FIRE_CONSEQUENTIAL_LOSS: 10000000,
      MECHANICAL_BREAKDOWN: 5000000,
      THIRD_PARTY_LIABILITY: 5000000,
      EMPLOYERS_LIABILITY: 10000000,
      PRODUCT_LIABILITY: 5000000,
      CASH_MONEY: 500000,
      FIDELITY_CRIME: 2000000,
      CARGO_IN_TRANSIT: 2000000,
      TERRORISM: 10000000,
      ELECTRONIC_EQUIPMENT: 3000000,
      HEAVY_ENGINEERING_EQUIPMENT: 5000000,
      CONTRACTOR_WORKS_CAR: 10000000,
    };
    return defaults[productCode] || 5000000;
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
