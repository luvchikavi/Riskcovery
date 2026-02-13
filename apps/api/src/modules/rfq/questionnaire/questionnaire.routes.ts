// @ts-nocheck
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { questionnaireService } from './questionnaire.service.js';
import type { QuestionnaireAnswers } from './questionnaire.types.js';

const saveAnswersSchema = z.object({
  clientId: z.string().uuid(),
  answers: z.record(z.unknown()),
  status: z.enum(['draft', 'completed']).optional(),
});

export const questionnaireRoutes: FastifyPluginAsync = async (fastify) => {
  // Get available sectors
  fastify.get('/sectors', async () => {
    const sectors = await questionnaireService.getAvailableSectorsAsync();
    return { success: true, data: sectors };
  });

  // Get questionnaire template by sector
  fastify.get<{ Params: { sector: string } }>('/template/:sector', async (request, reply) => {
    const template = await questionnaireService.getTemplateAsync(request.params.sector);
    if (!template) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
    }
    return { success: true, data: template };
  });

  // Save questionnaire answers
  fastify.post('/', async (request, reply) => {
    const { clientId, answers, status } = saveAnswersSchema.parse(request.body);
    const questionnaire = await questionnaireService.saveAnswers(
      clientId,
      answers as QuestionnaireAnswers,
      status
    );
    return reply.status(201).send({ success: true, data: questionnaire });
  });

  // Update questionnaire answers
  fastify.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { answers, status } = request.body as { answers: QuestionnaireAnswers; status?: string };
    const questionnaire = await questionnaireService.updateAnswers(
      request.params.id,
      answers,
      status
    );

    if (!questionnaire) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Questionnaire not found' },
      });
    }

    return { success: true, data: questionnaire };
  });

  // Get questionnaire by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const questionnaire = await questionnaireService.getQuestionnaire(request.params.id);

    if (!questionnaire) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Questionnaire not found' },
      });
    }

    return { success: true, data: questionnaire };
  });

  // Get questionnaires for a client
  fastify.get<{ Querystring: { clientId: string } }>('/client', async (request) => {
    const questionnaires = await questionnaireService.getClientQuestionnaires(
      request.query.clientId
    );
    return { success: true, data: questionnaires };
  });

  // Generate coverage recommendations (legacy format)
  fastify.post<{ Params: { sector: string } }>('/recommendations/:sector', async (request) => {
    const answers = request.body as QuestionnaireAnswers;
    const [recommendations, riskScore] = await Promise.all([
      questionnaireService.generateRecommendations(request.params.sector, answers),
      questionnaireService.calculateRiskScoreAsync(request.params.sector, answers),
    ]);

    return {
      success: true,
      data: {
        recommendations,
        riskScore,
        riskLevel: riskScore < 30 ? 'LOW' : riskScore < 60 ? 'MEDIUM' : 'HIGH',
      },
    };
  });

  // Generate enriched recommendations with product catalog data
  fastify.post<{ Params: { sector: string } }>('/recommendations/:sector/enriched', async (request) => {
    const answers = request.body as QuestionnaireAnswers;
    const [enriched, riskScore] = await Promise.all([
      questionnaireService.generateEnrichedRecommendations(request.params.sector, answers),
      questionnaireService.calculateRiskScoreAsync(request.params.sector, answers),
    ]);

    return {
      success: true,
      data: {
        recommendations: enriched.recommendations,
        coverageGaps: enriched.coverageGaps,
        riskScore,
        riskLevel: riskScore < 30 ? 'LOW' : riskScore < 60 ? 'MEDIUM' : 'HIGH',
      },
    };
  });

  // Generate enriched recommendations WITH insurer suggestions
  fastify.post<{ Params: { sector: string } }>('/recommendations/:sector/with-insurers', async (request) => {
    const answers = request.body as QuestionnaireAnswers;
    const [enriched, riskScore] = await Promise.all([
      questionnaireService.generateEnrichedRecommendations(request.params.sector, answers),
      questionnaireService.calculateRiskScoreAsync(request.params.sector, answers),
    ]);

    // Get insurer suggestions for each recommended product
    const productCodes = enriched.recommendations.map((r) => r.productCode);
    const insurerSuggestions = await questionnaireService.getInsurerSuggestions(productCodes);

    return {
      success: true,
      data: {
        recommendations: enriched.recommendations,
        coverageGaps: enriched.coverageGaps,
        insurerSuggestions,
        riskScore,
        riskLevel: riskScore < 30 ? 'LOW' : riskScore < 60 ? 'MEDIUM' : 'HIGH',
      },
    };
  });

  // Calculate risk score
  fastify.post<{ Params: { sector: string } }>('/risk-score/:sector', async (request) => {
    const answers = request.body as QuestionnaireAnswers;
    const riskScore = await questionnaireService.calculateRiskScoreAsync(
      request.params.sector,
      answers
    );

    return {
      success: true,
      data: {
        riskScore,
        riskLevel: riskScore < 30 ? 'LOW' : riskScore < 60 ? 'MEDIUM' : 'HIGH',
      },
    };
  });
};
