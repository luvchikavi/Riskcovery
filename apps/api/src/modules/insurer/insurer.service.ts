import { prisma } from '../../lib/prisma.js';

export const insurerService = {
  /**
   * Return all active insurers.
   */
  async listInsurers() {
    return prisma.insurer.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' },
      include: {
        _count: {
          select: { policies: true },
        },
      },
    });
  },

  /**
   * Get a single insurer by its unique code (e.g. "CLAL", "PHOENIX").
   * Includes the count of policies attached to this insurer.
   */
  async getInsurer(code: string) {
    return prisma.insurer.findUnique({
      where: { code },
      include: {
        _count: {
          select: { policies: true },
        },
      },
    });
  },

  /**
   * Get all policies (up to 12 BIT product types) for a given insurer.
   */
  async getInsurerPolicies(code: string) {
    const insurer = await prisma.insurer.findUnique({
      where: { code },
      include: {
        policies: {
          where: { isActive: true },
          orderBy: { productCode: 'asc' },
        },
      },
    });

    if (!insurer) return null;

    return {
      insurer,
      policies: insurer.policies,
    };
  },

  /**
   * Get a specific insurer policy by insurer code + product code,
   * including its extensions and exclusions.
   */
  async getInsurerPolicy(code: string, productCode: string) {
    const insurer = await prisma.insurer.findUnique({
      where: { code },
      include: {
        policies: {
          where: { productCode },
          include: {
            extensions: { orderBy: { code: 'asc' } },
            exclusions: { orderBy: { code: 'asc' } },
          },
          take: 1,
        },
      },
    });

    if (!insurer) return null;

    const policy = insurer.policies[0];
    if (!policy) return null;

    return {
      insurer: { ...insurer, policies: undefined },
      policy,
    };
  },

  /**
   * Compare all insurers for a given product type.
   * Returns an array of { insurer, policy, extensions, exclusions } for each
   * insurer that has a policy for that product code.
   */
  async compareByProduct(productCode: string) {
    const policies = await prisma.insurerPolicy.findMany({
      where: {
        productCode,
        isActive: true,
        insurer: { isActive: true },
      },
      include: {
        insurer: true,
        extensions: {
          orderBy: { code: 'asc' },
        },
        exclusions: {
          orderBy: { code: 'asc' },
        },
      },
      orderBy: {
        insurer: { nameEn: 'asc' },
      },
    });

    return policies.map((p) => ({
      insurer: p.insurer,
      policy: {
        id: p.id,
        productCode: p.productCode,
        policyFormCode: p.policyFormCode,
        bitStandard: p.bitStandard,
        editionYear: p.editionYear,
        structure: p.structure,
        strengths: p.strengths,
        weaknesses: p.weaknesses,
        notableTerms: p.notableTerms,
        isMaster: p.isMaster,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
      extensions: p.extensions,
      exclusions: p.exclusions,
    }));
  },

  /**
   * Build a side-by-side extension comparison matrix for a product type.
   *
   * Returns an array of rows, one per unique extension code found across all
   * insurers.  Each row contains:
   *   { code, nameHe, nameEn, insurers: { [insurerCode]: { has, limit?, limitNotes? } } }
   */
  async getExtensionMatrix(productCode: string) {
    const policies = await prisma.insurerPolicy.findMany({
      where: {
        productCode,
        isActive: true,
        insurer: { isActive: true },
      },
      include: {
        insurer: true,
        extensions: {
          orderBy: { code: 'asc' },
        },
      },
      orderBy: {
        insurer: { nameEn: 'asc' },
      },
    });

    // Collect every unique extension code across all insurers.
    const extensionMap = new Map<
      string,
      {
        code: string;
        nameHe: string;
        nameEn: string;
        insurers: Record<string, { has: boolean; limit?: number; limitNotes?: string }>;
      }
    >();

    // All active insurer codes involved, so we can fill in "has: false" later.
    const insurerCodes = policies.map((p) => p.insurer.code);

    for (const policy of policies) {
      for (const ext of policy.extensions) {
        if (!extensionMap.has(ext.code)) {
          extensionMap.set(ext.code, {
            code: ext.code,
            nameHe: ext.nameHe,
            nameEn: ext.nameEn,
            insurers: {},
          });
        }

        const row = extensionMap.get(ext.code)!;
        row.insurers[policy.insurer.code] = {
          has: true,
          limit: ext.defaultLimit ? Number(ext.defaultLimit) : undefined,
          limitNotes: ext.limitNotes ?? undefined,
        };
      }
    }

    // Fill in missing insurer columns with { has: false }.
    for (const row of extensionMap.values()) {
      for (const ic of insurerCodes) {
        if (!row.insurers[ic]) {
          row.insurers[ic] = { has: false };
        }
      }
    }

    // Return sorted by extension code.
    return Array.from(extensionMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true })
    );
  },
};
