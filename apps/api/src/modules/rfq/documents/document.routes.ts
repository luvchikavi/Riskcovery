import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { documentService, type RfqDocumentData } from './document.service.js';
import { questionnaireService } from '../questionnaire/questionnaire.service.js';
import { clientService } from '../clients/client.service.js';
import type { QuestionnaireAnswers } from '../questionnaire/questionnaire.types.js';

const generateDocumentSchema = z.object({
  clientId: z.string().uuid(),
  answers: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()])),
  format: z.enum(['pdf', 'docx', 'xlsx']).default('pdf'),
});

export const documentRoutes: FastifyPluginAsync = async (fastify) => {
  // Generate RFQ document
  fastify.post('/generate', async (request, reply) => {
    const { clientId, answers, format } = generateDocumentSchema.parse(request.body);
    const orgId = request.currentUser!.organizationId;

    // Get client details
    const client = await clientService.findById(orgId, clientId);
    if (!client) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Client not found' },
      });
    }

    // Generate recommendations and calculate risk score
    const [recommendations, riskScore] = await Promise.all([
      questionnaireService.generateRecommendations(client.sector, answers as QuestionnaireAnswers),
      questionnaireService.calculateRiskScoreAsync(client.sector, answers as QuestionnaireAnswers),
    ]);

    // Build document data
    const documentData: RfqDocumentData = {
      clientName: client.name,
      companyId: client.companyId || undefined,
      sector: client.sector,
      contactName: client.contactName || undefined,
      contactEmail: client.contactEmail || undefined,
      contactPhone: client.contactPhone || undefined,
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      recommendations,
      riskScore,
      riskLevel: riskScore < 30 ? 'LOW' : riskScore < 60 ? 'MEDIUM' : 'HIGH',
      answers: answers as Record<string, unknown>,
    };

    // Generate document
    const document = await documentService.generateRfqDocument(clientId, documentData, format);

    // Return document for download
    return reply
      .header('Content-Type', document.mimeType)
      .header('Content-Disposition', `attachment; filename="${document.fileName}"`)
      .send(document.content);
  });

  // Get documents for a client
  fastify.get<{ Querystring: { clientId: string } }>('/', async (request) => {
    const documents = await documentService.getClientDocuments(request.query.clientId);
    return { success: true, data: documents };
  });

  // Get document metadata by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const document = await documentService.getDocument(request.params.id);

    if (!document) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' },
      });
    }

    return { success: true, data: document };
  });

  // Preview document (returns HTML for PDF preview)
  fastify.post('/preview', async (request, reply) => {
    const { clientId, answers } = generateDocumentSchema.parse(request.body);

    const client = await clientService.findById(request.currentUser!.organizationId, clientId);
    if (!client) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Client not found' },
      });
    }

    const [recommendations, riskScore] = await Promise.all([
      questionnaireService.generateRecommendations(client.sector, answers as QuestionnaireAnswers),
      questionnaireService.calculateRiskScoreAsync(client.sector, answers as QuestionnaireAnswers),
    ]);

    return {
      success: true,
      data: {
        client: {
          name: client.name,
          sector: client.sector,
          companyId: client.companyId,
        },
        recommendations,
        riskScore,
        riskLevel: riskScore < 30 ? 'LOW' : riskScore < 60 ? 'MEDIUM' : 'HIGH',
        generatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  });
};
