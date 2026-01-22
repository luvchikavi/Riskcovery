/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: This file uses 'any' types because the QuestionnaireSection model is new and
// prisma generate needs to be run to generate the types.
// After running `npx prisma generate`, the types will be available.

import { prisma } from '../../../lib/prisma.js';
import { Prisma } from '@prisma/client';

export interface CreateSectionData {
  templateId: string;
  title: string;
  titleHe: string;
  description?: string;
  descriptionHe?: string;
  order?: number;
  showIf?: Array<{ questionId: string; operator: string; value: unknown }>;
}

export interface UpdateSectionData {
  title?: string;
  titleHe?: string;
  description?: string;
  descriptionHe?: string;
  order?: number;
  showIf?: Array<{ questionId: string; operator: string; value: unknown }> | null;
}

// Use any for now - will be properly typed after prisma generate
const db = prisma as any;

export class SectionService {
  async create(data: CreateSectionData) {
    const maxOrder = await db.questionnaireSection.aggregate({
      where: { templateId: data.templateId },
      _max: { order: true },
    });

    return db.questionnaireSection.create({
      data: {
        templateId: data.templateId,
        title: data.title,
        titleHe: data.titleHe,
        description: data.description,
        descriptionHe: data.descriptionHe,
        order: data.order ?? (maxOrder._max.order ?? -1) + 1,
        showIf: data.showIf,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getById(id: string) {
    return db.questionnaireSection.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        template: true,
      },
    });
  }

  async update(id: string, data: UpdateSectionData) {
    return db.questionnaireSection.update({
      where: { id },
      data: {
        title: data.title,
        titleHe: data.titleHe,
        description: data.description,
        descriptionHe: data.descriptionHe,
        order: data.order,
        showIf: data.showIf === null ? Prisma.JsonNull : data.showIf,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async delete(id: string) {
    return db.questionnaireSection.delete({
      where: { id },
    });
  }

  async reorder(templateId: string, sectionIds: string[]) {
    const updates = sectionIds.map((id, index) =>
      db.questionnaireSection.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    return db.questionnaireSection.findMany({
      where: { templateId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }
}

export const sectionService = new SectionService();
