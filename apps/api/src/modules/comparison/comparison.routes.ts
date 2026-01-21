import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { comparisonDocumentService } from './documents/document.service.js';
import { ocrService } from './documents/ocr.service.js';
import { requirementsService } from './requirements/requirements.service.js';
import { analysisService } from './analysis/analysis.service.js';

// Schemas
const uploadDocumentSchema = z.object({
  fileName: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  content: z.string(), // base64 encoded
  vendorId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1),
  nameHe: z.string().min(1),
  description: z.string().optional(),
  descriptionHe: z.string().optional(),
  sector: z.string().optional(),
  contractType: z.string().optional(),
  requirements: z.array(
    z.object({
      policyType: z.string(),
      policyTypeHe: z.string(),
      minimumLimit: z.number(),
      maximumDeductible: z.number().optional(),
      requiredEndorsements: z.array(z.string()).optional(),
      requireAdditionalInsured: z.boolean().optional(),
      requireWaiverSubrogation: z.boolean().optional(),
      minimumValidityDays: z.number().optional(),
      isMandatory: z.boolean().optional(),
      notes: z.string().optional(),
      notesHe: z.string().optional(),
    })
  ),
});

const analyzeSchema = z.object({
  documentId: z.string().uuid(),
  templateId: z.string().uuid(),
});

export const comparisonRoutes: FastifyPluginAsync = async (fastify) => {
  // ==================== DOCUMENTS ====================

  // Upload document
  fastify.post('/documents', async (request, reply) => {
    const data = uploadDocumentSchema.parse(request.body);

    // Generate S3 key (would upload to S3 in production)
    const s3Key = `comparison-documents/${Date.now()}-${data.fileName}`;

    // Create document record
    const document = await comparisonDocumentService.uploadDocument({
      fileName: data.fileName,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      s3Key,
      vendorId: data.vendorId,
      clientId: data.clientId,
    });

    return reply.status(201).send({ success: true, data: document });
  });

  // Get document by ID
  fastify.get<{ Params: { id: string } }>('/documents/:id', async (request, reply) => {
    const document = await comparisonDocumentService.getDocument(request.params.id);

    if (!document) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' },
      });
    }

    return { success: true, data: document };
  });

  // List documents
  fastify.get('/documents', async (request) => {
    const { vendorId, clientId, status } = request.query as {
      vendorId?: string;
      clientId?: string;
      status?: string;
    };

    const documents = await comparisonDocumentService.getDocuments({
      vendorId,
      clientId,
      status: status as 'uploaded' | 'processing' | 'processed' | 'failed' | undefined,
    });

    return { success: true, data: documents };
  });

  // Process document (run OCR)
  fastify.post<{ Params: { id: string } }>('/documents/:id/process', async (request, reply) => {
    const document = await comparisonDocumentService.getDocument(request.params.id);

    if (!document) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' },
      });
    }

    // Update status to processing
    await comparisonDocumentService.updateStatus(document.id, 'processing');

    try {
      // In production, fetch from S3 and process
      // For now, use mock extraction
      const extractedData = await ocrService.extractFromPdf(
        Buffer.from('mock'),
        document.originalName
      );

      // Update document with extracted data
      const updatedDocument = await comparisonDocumentService.updateStatus(
        document.id,
        'processed',
        extractedData
      );

      return { success: true, data: updatedDocument };
    } catch (error) {
      await comparisonDocumentService.updateStatus(document.id, 'failed');
      throw error;
    }
  });

  // Delete document
  fastify.delete<{ Params: { id: string } }>('/documents/:id', async (request, reply) => {
    const deleted = await comparisonDocumentService.deleteDocument(request.params.id);

    if (!deleted) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' },
      });
    }

    return { success: true, data: { deleted: true } };
  });

  // ==================== TEMPLATES ====================

  // Create template
  fastify.post('/templates', async (request, reply) => {
    const data = createTemplateSchema.parse(request.body);
    const template = await requirementsService.createTemplate(data);
    return reply.status(201).send({ success: true, data: template });
  });

  // Get all templates
  fastify.get('/templates', async (request) => {
    const { sector, isActive } = request.query as {
      sector?: string;
      isActive?: string;
    };

    const templates = await requirementsService.getTemplates({
      sector,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    return { success: true, data: templates };
  });

  // Get template by ID
  fastify.get<{ Params: { id: string } }>('/templates/:id', async (request, reply) => {
    const template = await requirementsService.getTemplate(request.params.id);

    if (!template) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
    }

    return { success: true, data: template };
  });

  // Update template
  fastify.patch<{ Params: { id: string } }>('/templates/:id', async (request, reply) => {
    const data = request.body as Partial<z.infer<typeof createTemplateSchema>>;
    const template = await requirementsService.updateTemplate(request.params.id, data);

    if (!template) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
    }

    return { success: true, data: template };
  });

  // Delete template
  fastify.delete<{ Params: { id: string } }>('/templates/:id', async (request, reply) => {
    const deleted = await requirementsService.deleteTemplate(request.params.id);

    if (!deleted) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
    }

    return { success: true, data: { deleted: true } };
  });

  // ==================== ANALYSIS ====================

  // Run analysis
  fastify.post('/analyze', async (request, reply) => {
    const data = analyzeSchema.parse(request.body);

    try {
      const result = await analysisService.analyze(data.documentId, data.templateId);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      return reply.status(400).send({
        success: false,
        error: { code: 'ANALYSIS_FAILED', message },
      });
    }
  });

  // Get analysis by ID
  fastify.get<{ Params: { id: string } }>('/analyses/:id', async (request, reply) => {
    const analysis = await analysisService.getAnalysis(request.params.id);

    if (!analysis) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis not found' },
      });
    }

    return { success: true, data: analysis };
  });

  // Get analyses for a document
  fastify.get<{ Params: { documentId: string } }>(
    '/documents/:documentId/analyses',
    async (request) => {
      const analyses = await analysisService.getDocumentAnalyses(request.params.documentId);
      return { success: true, data: analyses };
    }
  );

  // Delete analysis
  fastify.delete<{ Params: { id: string } }>('/analyses/:id', async (request, reply) => {
    const deleted = await analysisService.deleteAnalysis(request.params.id);

    if (!deleted) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis not found' },
      });
    }

    return { success: true, data: { deleted: true } };
  });
};
