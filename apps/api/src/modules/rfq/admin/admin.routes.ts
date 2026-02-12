import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { templateService } from './template.service.js';
import { sectionService } from './section.service.js';
import { questionService } from './question.service.js';
import { ruleService } from './rule.service.js';

// Validation schemas
const createTemplateSchema = z.object({
  sector: z.string().min(1),
  sectorHe: z.string().min(1),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  version: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateTemplateSchema = z.object({
  sectorHe: z.string().optional(),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  version: z.string().optional(),
  isActive: z.boolean().optional(),
});

const duplicateTemplateSchema = z.object({
  newSector: z.string().min(1),
  newSectorHe: z.string().min(1),
});

const conditionSchema = z.object({
  questionId: z.string(),
  operator: z.string(),
  value: z.unknown().transform((v) => v ?? ''),
});

const createSectionSchema = z.object({
  title: z.string().min(1),
  titleHe: z.string().min(1),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  order: z.number().optional(),
  showIf: z.array(conditionSchema).optional(),
});

const updateSectionSchema = z.object({
  title: z.string().optional(),
  titleHe: z.string().optional(),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  order: z.number().optional(),
  showIf: z.array(conditionSchema).nullable().optional(),
});

const reorderSectionsSchema = z.object({
  sectionIds: z.array(z.string().uuid()),
});

const questionConditionSchema = z.object({
  questionId: z.string(),
  operator: z.enum(['equals', 'notEquals', 'greaterThan', 'lessThan', 'contains', 'in']),
  value: z.unknown().transform((v) => v ?? ''),
});

const optionSchema = z.object({
  value: z.string(),
  label: z.string(),
  labelHe: z.string(),
});

const createQuestionSchema = z.object({
  questionId: z.string().min(1),
  label: z.string().min(1),
  labelHe: z.string().min(1),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  type: z.enum(['text', 'number', 'select', 'multiselect', 'boolean', 'date', 'currency']),
  options: z.array(optionSchema).optional(),
  placeholder: z.string().optional(),
  placeholderHe: z.string().optional(),
  required: z.boolean().optional(),
  order: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  showIf: z.array(questionConditionSchema).optional(),
  riskWeight: z.number().optional(),
  policyAffinity: z.array(z.string()).optional(),
});

const updateQuestionSchema = z.object({
  questionId: z.string().optional(),
  label: z.string().optional(),
  labelHe: z.string().optional(),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  type: z.enum(['text', 'number', 'select', 'multiselect', 'boolean', 'date', 'currency']).optional(),
  options: z.array(optionSchema).nullable().optional(),
  placeholder: z.string().optional(),
  placeholderHe: z.string().optional(),
  required: z.boolean().optional(),
  order: z.number().optional(),
  min: z.number().nullable().optional(),
  max: z.number().nullable().optional(),
  showIf: z.array(questionConditionSchema).nullable().optional(),
  riskWeight: z.number().nullable().optional(),
  policyAffinity: z.array(z.string()).optional(),
});

const reorderQuestionsSchema = z.object({
  sectionId: z.string().uuid(),
  questionIds: z.array(z.string().uuid()),
});

const moveQuestionSchema = z.object({
  newSectionId: z.string().uuid(),
  newOrder: z.number().optional(),
});

const ruleConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'notEquals', 'greaterThan', 'lessThan', 'in', 'contains']),
  value: z.unknown().transform((v) => v ?? ''),
});

const ruleActionSchema = z.object({
  type: z.enum(['addPolicy', 'removePolicy', 'adjustLimit', 'addEndorsement', 'setMandatory']),
  policyType: z.string().optional(),
  endorsement: z.string().optional(),
  multiplier: z.number().optional(),
  amount: z.number().optional(),
  mandatory: z.boolean().optional(),
});

const createRuleSchema = z.object({
  name: z.string().min(1),
  nameHe: z.string().min(1),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
  conditions: z.array(ruleConditionSchema),
  actions: z.array(ruleActionSchema),
});

const updateRuleSchema = z.object({
  name: z.string().optional(),
  nameHe: z.string().optional(),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
  conditions: z.array(ruleConditionSchema).optional(),
  actions: z.array(ruleActionSchema).optional(),
});

const reorderRulesSchema = z.object({
  ruleIds: z.array(z.string().uuid()),
});

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // ==================== TEMPLATES ====================

  // List all templates
  fastify.get('/templates', async (request) => {
    const { includeInactive } = request.query as { includeInactive?: string };
    const templates = await templateService.list(includeInactive === 'true');
    return { success: true, data: templates };
  });

  // Get template by ID
  fastify.get<{ Params: { id: string } }>('/templates/:id', async (request, reply) => {
    const template = await templateService.getById(request.params.id);
    if (!template) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
    }
    return { success: true, data: template };
  });

  // Create template
  fastify.post('/templates', async (request, reply) => {
    const data = createTemplateSchema.parse(request.body);
    const template = await templateService.create(data);
    return reply.status(201).send({ success: true, data: template });
  });

  // Update template
  fastify.put<{ Params: { id: string } }>('/templates/:id', async (request, reply) => {
    const data = updateTemplateSchema.parse(request.body);
    try {
      const template = await templateService.update(request.params.id, data);
      return { success: true, data: template };
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
    }
  });

  // Delete template
  fastify.delete<{ Params: { id: string } }>('/templates/:id', async (request, reply) => {
    try {
      await templateService.delete(request.params.id);
      return { success: true, data: { deleted: true } };
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
    }
  });

  // Duplicate template
  fastify.post<{ Params: { id: string } }>('/templates/:id/duplicate', async (request, reply) => {
    const { newSector, newSectorHe } = duplicateTemplateSchema.parse(request.body);
    try {
      const template = await templateService.duplicate(request.params.id, newSector, newSectorHe);
      return reply.status(201).send({ success: true, data: template });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: { code: 'DUPLICATE_FAILED', message: (error as Error).message },
      });
    }
  });

  // ==================== SECTIONS ====================

  // Add section to template
  fastify.post<{ Params: { templateId: string } }>(
    '/templates/:templateId/sections',
    async (request, reply) => {
      const data = createSectionSchema.parse(request.body) as any;
      const section = await sectionService.create({
        ...data,
        templateId: request.params.templateId,
      });
      return reply.status(201).send({ success: true, data: section });
    }
  );

  // Get section by ID
  fastify.get<{ Params: { id: string } }>('/sections/:id', async (request, reply) => {
    const section = await sectionService.getById(request.params.id);
    if (!section) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Section not found' },
      });
    }
    return { success: true, data: section };
  });

  // Update section
  fastify.put<{ Params: { id: string } }>('/sections/:id', async (request, reply) => {
    const data = updateSectionSchema.parse(request.body) as any;
    try {
      const section = await sectionService.update(request.params.id, data);
      return { success: true, data: section };
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Section not found' },
      });
    }
  });

  // Delete section
  fastify.delete<{ Params: { id: string } }>('/sections/:id', async (request, reply) => {
    try {
      await sectionService.delete(request.params.id);
      return { success: true, data: { deleted: true } };
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Section not found' },
      });
    }
  });

  // Reorder sections
  fastify.patch<{ Params: { templateId: string } }>(
    '/templates/:templateId/sections/reorder',
    async (request) => {
      const { sectionIds } = reorderSectionsSchema.parse(request.body);
      const sections = await sectionService.reorder(request.params.templateId, sectionIds);
      return { success: true, data: sections };
    }
  );

  // ==================== QUESTIONS ====================

  // Add question to section
  fastify.post<{ Params: { sectionId: string } }>(
    '/sections/:sectionId/questions',
    async (request, reply) => {
      const data = createQuestionSchema.parse(request.body) as any;
      const question = await questionService.create({
        ...data,
        sectionId: request.params.sectionId,
      });
      return reply.status(201).send({ success: true, data: question });
    }
  );

  // Get question by ID
  fastify.get<{ Params: { id: string } }>('/questions/:id', async (request, reply) => {
    const question = await questionService.getById(request.params.id);
    if (!question) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Question not found' },
      });
    }
    return { success: true, data: question };
  });

  // Update question
  fastify.put<{ Params: { id: string } }>('/questions/:id', async (request, reply) => {
    const data = updateQuestionSchema.parse(request.body) as any;
    try {
      const question = await questionService.update(request.params.id, data);
      return { success: true, data: question };
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Question not found' },
      });
    }
  });

  // Delete question
  fastify.delete<{ Params: { id: string } }>('/questions/:id', async (request, reply) => {
    try {
      await questionService.delete(request.params.id);
      return { success: true, data: { deleted: true } };
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Question not found' },
      });
    }
  });

  // Reorder questions
  fastify.patch('/questions/reorder', async (request) => {
    const { sectionId, questionIds } = reorderQuestionsSchema.parse(request.body);
    const questions = await questionService.reorder(sectionId, questionIds);
    return { success: true, data: questions };
  });

  // Move question to another section
  fastify.patch<{ Params: { id: string } }>('/questions/:id/move', async (request, reply) => {
    const { newSectionId, newOrder } = moveQuestionSchema.parse(request.body);
    try {
      const question = await questionService.moveToSection(
        request.params.id,
        newSectionId,
        newOrder
      );
      return { success: true, data: question };
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Question not found' },
      });
    }
  });

  // Duplicate question
  fastify.post<{ Params: { id: string } }>('/questions/:id/duplicate', async (request, reply) => {
    const { newQuestionId } = request.body as { newQuestionId?: string };
    try {
      const question = await questionService.duplicate(request.params.id, newQuestionId);
      return reply.status(201).send({ success: true, data: question });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: { code: 'DUPLICATE_FAILED', message: (error as Error).message },
      });
    }
  });

  // ==================== RULES ====================

  // Add rule to template
  fastify.post<{ Params: { templateId: string } }>(
    '/templates/:templateId/rules',
    async (request, reply) => {
      const data = createRuleSchema.parse(request.body) as any;
      const rule = await ruleService.create({
        ...data,
        templateId: request.params.templateId,
      });
      return reply.status(201).send({ success: true, data: rule });
    }
  );

  // Get rules for template
  fastify.get<{ Params: { templateId: string } }>(
    '/templates/:templateId/rules',
    async (request) => {
      const { includeInactive } = request.query as { includeInactive?: string };
      const rules = await ruleService.getByTemplateId(
        request.params.templateId,
        includeInactive === 'true'
      );
      return { success: true, data: rules };
    }
  );

  // Get rule by ID
  fastify.get<{ Params: { id: string } }>('/rules/:id', async (request, reply) => {
    const rule = await ruleService.getById(request.params.id);
    if (!rule) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rule not found' },
      });
    }
    return { success: true, data: rule };
  });

  // Update rule
  fastify.put<{ Params: { id: string } }>('/rules/:id', async (request, reply) => {
    const data = updateRuleSchema.parse(request.body) as any;
    try {
      const rule = await ruleService.update(request.params.id, data);
      return { success: true, data: rule };
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rule not found' },
      });
    }
  });

  // Delete rule
  fastify.delete<{ Params: { id: string } }>('/rules/:id', async (request, reply) => {
    try {
      await ruleService.delete(request.params.id);
      return { success: true, data: { deleted: true } };
    } catch {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rule not found' },
      });
    }
  });

  // Toggle rule active status
  fastify.patch<{ Params: { id: string } }>('/rules/:id/toggle', async (request, reply) => {
    try {
      const rule = await ruleService.toggleActive(request.params.id);
      return { success: true, data: rule };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: { code: 'TOGGLE_FAILED', message: (error as Error).message },
      });
    }
  });

  // Duplicate rule
  fastify.post<{ Params: { id: string } }>('/rules/:id/duplicate', async (request, reply) => {
    try {
      const rule = await ruleService.duplicate(request.params.id);
      return reply.status(201).send({ success: true, data: rule });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: { code: 'DUPLICATE_FAILED', message: (error as Error).message },
      });
    }
  });

  // Reorder rule priorities
  fastify.patch<{ Params: { templateId: string } }>(
    '/templates/:templateId/rules/reorder',
    async (request) => {
      const { ruleIds } = reorderRulesSchema.parse(request.body);
      const rules = await ruleService.reorderPriorities(request.params.templateId, ruleIds);
      return { success: true, data: rules };
    }
  );
};
