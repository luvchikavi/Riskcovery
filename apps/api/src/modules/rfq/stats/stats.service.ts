// @ts-nocheck
import { prisma } from '../../../lib/prisma.js';

export interface DashboardStats {
  totalClients: number;
  totalQuestionnaires: number;
  totalDocuments: number;
  recentClients: Array<{
    id: string;
    name: string;
    sector: string;
    contactEmail: string | null;
    createdAt: Date;
    _count: { questionnaires: number; documents: number };
  }>;
  clientsBySector: Record<string, number>;
}

export class StatsService {
  async getDashboardStats(organizationId: string): Promise<DashboardStats> {
    const orgFilter = { organizationId };

    const [
      totalClients,
      totalQuestionnaires,
      totalDocuments,
      recentClients,
      sectorGroups,
    ] = await Promise.all([
      prisma.rfqClient.count({ where: orgFilter }),
      prisma.rfqQuestionnaire.count({
        where: { client: { organizationId } },
      }),
      prisma.rfqDocument.count({
        where: { client: { organizationId } },
      }),
      prisma.rfqClient.findMany({
        where: orgFilter,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          sector: true,
          contactEmail: true,
          createdAt: true,
          _count: { select: { questionnaires: true, documents: true } },
        },
      }),
      prisma.rfqClient.groupBy({
        by: ['sector'],
        where: orgFilter,
        _count: { _all: true },
      }),
    ]);

    const clientsBySector: Record<string, number> = {};
    for (const group of sectorGroups) {
      clientsBySector[group.sector] = group._count._all;
    }

    return {
      totalClients,
      totalQuestionnaires,
      totalDocuments,
      recentClients,
      clientsBySector,
    };
  }
}

export const statsService = new StatsService();
