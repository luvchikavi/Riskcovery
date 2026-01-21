import { prisma } from '../../../lib/prisma.js';

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

export class KnowledgeBaseService {
  async findBySector(sector: string) {
    return prisma.insuranceKnowledgeBase.findMany({
      where: { sector },
      orderBy: [{ isMandatory: 'desc' }, { policyType: 'asc' }],
    });
  }

  async findAll() {
    return prisma.insuranceKnowledgeBase.findMany({
      orderBy: [{ sector: 'asc' }, { isMandatory: 'desc' }, { policyType: 'asc' }],
    });
  }

  async getSectors() {
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
}

export const knowledgeBaseService = new KnowledgeBaseService();
