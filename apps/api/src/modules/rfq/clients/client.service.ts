import { prisma } from '../../../lib/prisma.js';
import type { CreateClientInput, UpdateClientInput, ClientQuery } from './client.schema.js';

export class ClientService {
  async create(organizationId: string, data: CreateClientInput) {
    return prisma.rfqClient.create({
      data: {
        organizationId,
        ...data,
        annualRevenue: data.annualRevenue ? data.annualRevenue : undefined,
      },
    });
  }

  async findAll(organizationId: string, query: ClientQuery) {
    const { page, pageSize, sector, search } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      organizationId,
      ...(sector && { sector }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { contactName: { contains: search, mode: 'insensitive' as const } },
          { contactEmail: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [clients, totalItems] = await Promise.all([
      prisma.rfqClient.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { questionnaires: true, documents: true },
          },
        },
      }),
      prisma.rfqClient.count({ where }),
    ]);

    return {
      data: clients,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async findById(organizationId: string, id: string) {
    return prisma.rfqClient.findFirst({
      where: { id, organizationId },
      include: {
        questionnaires: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateClientInput) {
    // First verify the client belongs to this organization
    const existing = await prisma.rfqClient.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return null;
    }

    return prisma.rfqClient.update({
      where: { id },
      data: {
        ...data,
        annualRevenue: data.annualRevenue ? data.annualRevenue : undefined,
      },
    });
  }

  async delete(organizationId: string, id: string) {
    const existing = await prisma.rfqClient.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return false;
    }

    await prisma.rfqClient.delete({ where: { id } });
    return true;
  }

  async updateRiskProfile(organizationId: string, id: string, riskProfile: Record<string, unknown>) {
    const existing = await prisma.rfqClient.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return null;
    }

    return prisma.rfqClient.update({
      where: { id },
      data: { riskProfile: riskProfile as object },
    });
  }
}

export const clientService = new ClientService();
