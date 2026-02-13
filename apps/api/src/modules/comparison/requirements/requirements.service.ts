// @ts-nocheck
import { prisma } from '../../../lib/prisma.js';
import type { Prisma } from '@prisma/client';

export interface CreateTemplateInput {
  name: string;
  nameHe: string;
  description?: string;
  descriptionHe?: string;
  sector?: string;
  contractType?: string;
  requirements: CreateRequirementInput[];
}

export interface CreateRequirementInput {
  policyType: string;
  policyTypeHe: string;
  minimumLimit: number;
  minimumLimitPerPeriod?: number;
  minimumLimitPerOccurrence?: number;
  maximumDeductible?: number;
  requiredEndorsements?: string[];
  requireAdditionalInsured?: boolean;
  requireWaiverSubrogation?: boolean;
  minimumValidityDays?: number;
  isMandatory?: boolean;
  policyWording?: string;
  currency?: string;
  cancellationNoticeDays?: number;
  serviceCodes?: string[];
  notes?: string;
  notesHe?: string;
}

export class RequirementsService {
  // Create a new requirement template
  async createTemplate(data: CreateTemplateInput) {
    return prisma.comparisonTemplate.create({
      data: {
        name: data.name,
        nameHe: data.nameHe,
        description: data.description,
        descriptionHe: data.descriptionHe,
        sector: data.sector,
        contractType: data.contractType,
        requirements: {
          create: data.requirements.map((req) => ({
            policyType: req.policyType,
            policyTypeHe: req.policyTypeHe,
            minimumLimit: req.minimumLimit,
            minimumLimitPerPeriod: req.minimumLimitPerPeriod ?? req.minimumLimit,
            minimumLimitPerOccurrence: req.minimumLimitPerOccurrence ?? req.minimumLimit,
            maximumDeductible: req.maximumDeductible,
            requiredEndorsements: req.requiredEndorsements || [],
            requireAdditionalInsured: req.requireAdditionalInsured || false,
            requireWaiverSubrogation: req.requireWaiverSubrogation || false,
            minimumValidityDays: req.minimumValidityDays,
            isMandatory: req.isMandatory ?? true,
            policyWording: req.policyWording,
            currency: req.currency || 'ILS',
            cancellationNoticeDays: req.cancellationNoticeDays,
            serviceCodes: req.serviceCodes || [],
            notes: req.notes,
            notesHe: req.notesHe,
          })),
        },
      },
      include: {
        requirements: true,
      },
    });
  }

  // Get all templates
  async getTemplates(filters?: { sector?: string; isActive?: boolean }) {
    return prisma.comparisonTemplate.findMany({
      where: {
        ...(filters?.sector && { sector: filters.sector }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      include: {
        requirements: true,
        _count: {
          select: { analyses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get template by ID
  async getTemplate(id: string) {
    return prisma.comparisonTemplate.findUnique({
      where: { id },
      include: {
        requirements: true,
      },
    });
  }

  // Update template
  async updateTemplate(
    id: string,
    data: Partial<Omit<CreateTemplateInput, 'requirements'>>
  ) {
    return prisma.comparisonTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameHe && { nameHe: data.nameHe }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.descriptionHe !== undefined && { descriptionHe: data.descriptionHe }),
        ...(data.sector !== undefined && { sector: data.sector }),
        ...(data.contractType !== undefined && { contractType: data.contractType }),
      },
      include: {
        requirements: true,
      },
    });
  }

  // Delete template
  async deleteTemplate(id: string) {
    try {
      await prisma.comparisonTemplate.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Add requirement to template
  async addRequirement(templateId: string, requirement: CreateRequirementInput) {
    return prisma.comparisonRequirement.create({
      data: {
        templateId,
        policyType: requirement.policyType,
        policyTypeHe: requirement.policyTypeHe,
        minimumLimit: requirement.minimumLimit,
        minimumLimitPerPeriod: requirement.minimumLimitPerPeriod ?? requirement.minimumLimit,
        minimumLimitPerOccurrence: requirement.minimumLimitPerOccurrence ?? requirement.minimumLimit,
        maximumDeductible: requirement.maximumDeductible,
        requiredEndorsements: requirement.requiredEndorsements || [],
        requireAdditionalInsured: requirement.requireAdditionalInsured || false,
        requireWaiverSubrogation: requirement.requireWaiverSubrogation || false,
        minimumValidityDays: requirement.minimumValidityDays,
        isMandatory: requirement.isMandatory ?? true,
        policyWording: requirement.policyWording,
        currency: requirement.currency || 'ILS',
        cancellationNoticeDays: requirement.cancellationNoticeDays,
        serviceCodes: requirement.serviceCodes || [],
        notes: requirement.notes,
        notesHe: requirement.notesHe,
      },
    });
  }

  // Update requirement
  async updateRequirement(id: string, data: Partial<CreateRequirementInput>) {
    return prisma.comparisonRequirement.update({
      where: { id },
      data: {
        ...(data.policyType && { policyType: data.policyType }),
        ...(data.policyTypeHe && { policyTypeHe: data.policyTypeHe }),
        ...(data.minimumLimit !== undefined && { minimumLimit: data.minimumLimit }),
        ...(data.minimumLimitPerPeriod !== undefined && { minimumLimitPerPeriod: data.minimumLimitPerPeriod }),
        ...(data.minimumLimitPerOccurrence !== undefined && { minimumLimitPerOccurrence: data.minimumLimitPerOccurrence }),
        ...(data.maximumDeductible !== undefined && { maximumDeductible: data.maximumDeductible }),
        ...(data.requiredEndorsements && { requiredEndorsements: data.requiredEndorsements }),
        ...(data.requireAdditionalInsured !== undefined && { requireAdditionalInsured: data.requireAdditionalInsured }),
        ...(data.requireWaiverSubrogation !== undefined && { requireWaiverSubrogation: data.requireWaiverSubrogation }),
        ...(data.minimumValidityDays !== undefined && { minimumValidityDays: data.minimumValidityDays }),
        ...(data.isMandatory !== undefined && { isMandatory: data.isMandatory }),
        ...(data.policyWording !== undefined && { policyWording: data.policyWording }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.cancellationNoticeDays !== undefined && { cancellationNoticeDays: data.cancellationNoticeDays }),
        ...(data.serviceCodes !== undefined && { serviceCodes: data.serviceCodes }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.notesHe !== undefined && { notesHe: data.notesHe }),
      },
    });
  }

  // Delete requirement
  async deleteRequirement(id: string) {
    try {
      await prisma.comparisonRequirement.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const requirementsService = new RequirementsService();
