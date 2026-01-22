/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: This file uses 'any' types because the CoverageRule model is new and
// prisma generate needs to be run to generate the types.
// After running `npx prisma generate`, the types will be available.

import { prisma } from '../../../lib/prisma.js';

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'in' | 'contains';
  value: unknown;
}

export interface RuleAction {
  type: 'addPolicy' | 'removePolicy' | 'adjustLimit' | 'addEndorsement' | 'setMandatory';
  policyType?: string;
  endorsement?: string;
  multiplier?: number;
  amount?: number;
  mandatory?: boolean;
}

export interface CreateRuleData {
  templateId: string;
  name: string;
  nameHe: string;
  description?: string;
  descriptionHe?: string;
  priority?: number;
  isActive?: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface UpdateRuleData {
  name?: string;
  nameHe?: string;
  description?: string;
  descriptionHe?: string;
  priority?: number;
  isActive?: boolean;
  conditions?: RuleCondition[];
  actions?: RuleAction[];
}

// Use any for now - will be properly typed after prisma generate
const db = prisma as any;

export class RuleService {
  async create(data: CreateRuleData) {
    return db.coverageRule.create({
      data: {
        templateId: data.templateId,
        name: data.name,
        nameHe: data.nameHe,
        description: data.description,
        descriptionHe: data.descriptionHe,
        priority: data.priority ?? 50,
        isActive: data.isActive ?? true,
        conditions: data.conditions,
        actions: data.actions,
      },
    });
  }

  async getById(id: string) {
    return db.coverageRule.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });
  }

  async getByTemplateId(templateId: string, includeInactive = false) {
    return db.coverageRule.findMany({
      where: {
        templateId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { priority: 'asc' },
    });
  }

  async update(id: string, data: UpdateRuleData) {
    return db.coverageRule.update({
      where: { id },
      data: {
        name: data.name,
        nameHe: data.nameHe,
        description: data.description,
        descriptionHe: data.descriptionHe,
        priority: data.priority,
        isActive: data.isActive,
        conditions: data.conditions,
        actions: data.actions,
      },
    });
  }

  async delete(id: string) {
    return db.coverageRule.delete({
      where: { id },
    });
  }

  async duplicate(id: string) {
    const original = await this.getById(id);
    if (!original) {
      throw new Error('Rule not found');
    }

    return db.coverageRule.create({
      data: {
        templateId: original.templateId,
        name: `${original.name} (Copy)`,
        nameHe: `${original.nameHe} (העתק)`,
        description: original.description,
        descriptionHe: original.descriptionHe,
        priority: original.priority,
        isActive: false,
        conditions: original.conditions,
        actions: original.actions,
      },
    });
  }

  async toggleActive(id: string) {
    const rule = await this.getById(id);
    if (!rule) {
      throw new Error('Rule not found');
    }

    return db.coverageRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });
  }

  async reorderPriorities(templateId: string, ruleIds: string[]) {
    const updates = ruleIds.map((id, index) =>
      db.coverageRule.update({
        where: { id },
        data: { priority: (index + 1) * 10 },
      })
    );

    await prisma.$transaction(updates);

    return db.coverageRule.findMany({
      where: { templateId },
      orderBy: { priority: 'asc' },
    });
  }
}

export const ruleService = new RuleService();
