// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: This file uses 'any' types because the Question model is new and
// prisma generate needs to be run to generate the types.
// After running `npx prisma generate`, the types will be available.

import { prisma } from '../../../lib/prisma.js';
import { Prisma } from '@prisma/client';

export interface QuestionOption {
  value: string;
  label: string;
  labelHe: string;
}

export interface QuestionCondition {
  questionId: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'in';
  value: unknown;
}

export interface CreateQuestionData {
  sectionId: string;
  questionId: string;
  label: string;
  labelHe: string;
  description?: string;
  descriptionHe?: string;
  type: string;
  options?: QuestionOption[];
  placeholder?: string;
  placeholderHe?: string;
  required?: boolean;
  order?: number;
  min?: number;
  max?: number;
  showIf?: QuestionCondition[];
  riskWeight?: number;
  policyAffinity?: string[];
}

export interface UpdateQuestionData {
  questionId?: string;
  label?: string;
  labelHe?: string;
  description?: string;
  descriptionHe?: string;
  type?: string;
  options?: QuestionOption[] | null;
  placeholder?: string;
  placeholderHe?: string;
  required?: boolean;
  order?: number;
  min?: number | null;
  max?: number | null;
  showIf?: QuestionCondition[] | null;
  riskWeight?: number | null;
  policyAffinity?: string[];
}

// Use any for now - will be properly typed after prisma generate
const db = prisma as any;

export class QuestionService {
  async create(data: CreateQuestionData) {
    const maxOrder = await db.question.aggregate({
      where: { sectionId: data.sectionId },
      _max: { order: true },
    });

    return db.question.create({
      data: {
        sectionId: data.sectionId,
        questionId: data.questionId,
        label: data.label,
        labelHe: data.labelHe,
        description: data.description,
        descriptionHe: data.descriptionHe,
        type: data.type,
        options: data.options,
        placeholder: data.placeholder,
        placeholderHe: data.placeholderHe,
        required: data.required ?? false,
        order: data.order ?? (maxOrder._max.order ?? -1) + 1,
        min: data.min,
        max: data.max,
        showIf: data.showIf,
        riskWeight: data.riskWeight ?? 0,
        policyAffinity: data.policyAffinity ?? [],
      },
    });
  }

  async getById(id: string) {
    return db.question.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            template: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateQuestionData) {
    return db.question.update({
      where: { id },
      data: {
        questionId: data.questionId,
        label: data.label,
        labelHe: data.labelHe,
        description: data.description,
        descriptionHe: data.descriptionHe,
        type: data.type,
        options: data.options === null ? Prisma.JsonNull : data.options,
        placeholder: data.placeholder,
        placeholderHe: data.placeholderHe,
        required: data.required,
        order: data.order,
        min: data.min,
        max: data.max,
        showIf: data.showIf === null ? Prisma.JsonNull : data.showIf,
        riskWeight: data.riskWeight,
        policyAffinity: data.policyAffinity,
      },
    });
  }

  async delete(id: string) {
    return db.question.delete({
      where: { id },
    });
  }

  async reorder(sectionId: string, questionIds: string[]) {
    const updates = questionIds.map((id, index) =>
      db.question.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    return db.question.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
    });
  }

  async moveToSection(questionId: string, newSectionId: string, newOrder?: number) {
    let order = newOrder;
    if (order === undefined) {
      const maxOrder = await db.question.aggregate({
        where: { sectionId: newSectionId },
        _max: { order: true },
      });
      order = (maxOrder._max.order ?? -1) + 1;
    }

    return db.question.update({
      where: { id: questionId },
      data: {
        sectionId: newSectionId,
        order,
      },
    });
  }

  async duplicate(id: string, newQuestionId?: string) {
    const original = await this.getById(id);
    if (!original) {
      throw new Error('Question not found');
    }

    const maxOrder = await db.question.aggregate({
      where: { sectionId: original.sectionId },
      _max: { order: true },
    });

    return db.question.create({
      data: {
        sectionId: original.sectionId,
        questionId: newQuestionId || `${original.questionId}_copy`,
        label: `${original.label} (Copy)`,
        labelHe: `${original.labelHe} (העתק)`,
        description: original.description,
        descriptionHe: original.descriptionHe,
        type: original.type,
        options: original.options,
        placeholder: original.placeholder,
        placeholderHe: original.placeholderHe,
        required: original.required,
        order: (maxOrder._max.order ?? 0) + 1,
        min: original.min,
        max: original.max,
        showIf: original.showIf,
        riskWeight: original.riskWeight,
        policyAffinity: original.policyAffinity,
      },
    });
  }
}

export const questionService = new QuestionService();
