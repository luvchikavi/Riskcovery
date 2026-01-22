/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: This file uses 'any' types because the QuestionnaireTemplate model is new and
// prisma generate needs to be run to generate the types.
// After running `npx prisma generate`, the types will be available.

import { prisma } from '../../../lib/prisma.js';

export interface CreateTemplateData {
  sector: string;
  sectorHe: string;
  description?: string;
  descriptionHe?: string;
  version?: string;
  isActive?: boolean;
}

export interface UpdateTemplateData {
  sectorHe?: string;
  description?: string;
  descriptionHe?: string;
  version?: string;
  isActive?: boolean;
}

// Use any for now - will be properly typed after prisma generate
const db = prisma as any;

export class TemplateService {
  async create(data: CreateTemplateData) {
    return db.questionnaireTemplate.create({
      data: {
        sector: data.sector.toUpperCase(),
        sectorHe: data.sectorHe,
        description: data.description,
        descriptionHe: data.descriptionHe,
        version: data.version || '1.0',
        isActive: data.isActive ?? true,
      },
      include: {
        sections: {
          include: { questions: true },
          orderBy: { order: 'asc' },
        },
        rules: {
          orderBy: { priority: 'asc' },
        },
      },
    });
  }

  async list(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    return db.questionnaireTemplate.findMany({
      where,
      include: {
        _count: {
          select: {
            sections: true,
            rules: true,
          },
        },
      },
      orderBy: { sector: 'asc' },
    });
  }

  async getById(id: string) {
    return db.questionnaireTemplate.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        rules: {
          orderBy: { priority: 'asc' },
        },
      },
    });
  }

  async getBySector(sector: string) {
    return db.questionnaireTemplate.findUnique({
      where: { sector: sector.toUpperCase() },
      include: {
        sections: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        rules: {
          where: { isActive: true },
          orderBy: { priority: 'asc' },
        },
      },
    });
  }

  async update(id: string, data: UpdateTemplateData) {
    return db.questionnaireTemplate.update({
      where: { id },
      data: {
        sectorHe: data.sectorHe,
        description: data.description,
        descriptionHe: data.descriptionHe,
        version: data.version,
        isActive: data.isActive,
      },
      include: {
        sections: {
          include: { questions: true },
          orderBy: { order: 'asc' },
        },
        rules: {
          orderBy: { priority: 'asc' },
        },
      },
    });
  }

  async delete(id: string) {
    return db.questionnaireTemplate.delete({
      where: { id },
    });
  }

  async duplicate(id: string, newSector: string, newSectorHe: string) {
    const original = await this.getById(id);
    if (!original) {
      throw new Error('Template not found');
    }

    return db.questionnaireTemplate.create({
      data: {
        sector: newSector.toUpperCase(),
        sectorHe: newSectorHe,
        description: original.description,
        descriptionHe: original.descriptionHe,
        version: '1.0',
        isActive: false,
        sections: {
          create: original.sections.map((section: any, sectionIndex: number) => ({
            title: section.title,
            titleHe: section.titleHe,
            description: section.description,
            descriptionHe: section.descriptionHe,
            order: sectionIndex,
            showIf: section.showIf,
            questions: {
              create: section.questions.map((q: any, qIndex: number) => ({
                questionId: q.questionId,
                label: q.label,
                labelHe: q.labelHe,
                description: q.description,
                descriptionHe: q.descriptionHe,
                type: q.type,
                options: q.options,
                placeholder: q.placeholder,
                placeholderHe: q.placeholderHe,
                required: q.required,
                order: qIndex,
                min: q.min,
                max: q.max,
                showIf: q.showIf,
                riskWeight: q.riskWeight,
                policyAffinity: q.policyAffinity,
              })),
            },
          })),
        },
        rules: {
          create: original.rules.map((rule: any) => ({
            name: rule.name,
            nameHe: rule.nameHe,
            description: rule.description,
            descriptionHe: rule.descriptionHe,
            priority: rule.priority,
            isActive: rule.isActive,
            conditions: rule.conditions,
            actions: rule.actions,
          })),
        },
      },
      include: {
        sections: {
          include: { questions: true },
          orderBy: { order: 'asc' },
        },
        rules: {
          orderBy: { priority: 'asc' },
        },
      },
    });
  }
}

export const templateService = new TemplateService();
