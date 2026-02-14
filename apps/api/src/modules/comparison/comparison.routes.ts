// @ts-nocheck
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import mammoth from 'mammoth';
import { comparisonDocumentService } from './documents/document.service.js';
import { ocrService, ENDORSEMENT_CODES } from './documents/ocr.service.js';
import { requirementsService } from './requirements/requirements.service.js';
import { analysisService } from './analysis/analysis.service.js';
import { requireAuth } from '../../plugins/auth.js';

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
      minimumLimitPerPeriod: z.number().optional(),
      minimumLimitPerOccurrence: z.number().optional(),
      maximumDeductible: z.number().optional(),
      requiredEndorsements: z.array(z.string()).optional(),
      requireAdditionalInsured: z.boolean().optional(),
      requireWaiverSubrogation: z.boolean().optional(),
      minimumValidityDays: z.number().optional(),
      isMandatory: z.boolean().optional(),
      policyWording: z.string().optional(),
      currency: z.string().optional(),
      cancellationNoticeDays: z.number().optional(),
      serviceCodes: z.array(z.string()).optional(),
      notes: z.string().optional(),
      notesHe: z.string().optional(),
    })
  ),
});

const importDocxSchema = z.object({
  fileName: z.string(),
  content: z.string(), // base64 encoded .docx
});

const analyzeSchema = z.object({
  documentId: z.string().uuid(),
  templateId: z.string().uuid(),
});

export const comparisonRoutes: FastifyPluginAsync = async (fastify) => {
  // Auth is applied per-route on write operations (POST/PUT/DELETE).
  // GET routes are open so the page can load before the session token is set.

  // ==================== DOCUMENTS ====================

  // Upload document
  fastify.post('/documents', { preHandler: [requireAuth] }, async (request, reply) => {
    const data = uploadDocumentSchema.parse(request.body);

    // Generate S3 key (would upload to S3 in production)
    const s3Key = `comparison-documents/${Date.now()}-${data.fileName}`;

    // Create document record (store base64 content for OCR processing)
    const document = await comparisonDocumentService.uploadDocument({
      fileName: data.fileName,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      s3Key,
      content: data.content,
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
  fastify.post<{ Params: { id: string } }>('/documents/:id/process', { preHandler: [requireAuth] }, async (request, reply) => {
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
      let extractedData;

      if (document.mimeType.startsWith('image/') && document.fileContent) {
        // Image file — route directly to Vision OCR
        extractedData = await ocrService.extractFromImage(
          document.fileContent,
          document.mimeType
        );
      } else {
        // PDF or fallback — use pdf-parse with Vision fallback for scanned PDFs
        const pdfBuffer = document.fileContent
          ? Buffer.from(document.fileContent, 'base64')
          : Buffer.from('mock');

        extractedData = await ocrService.extractFromPdf(
          pdfBuffer,
          document.originalName
        );
      }

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
  fastify.delete<{ Params: { id: string } }>('/documents/:id', { preHandler: [requireAuth] }, async (request, reply) => {
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
  fastify.post('/templates', { preHandler: [requireAuth] }, async (request, reply) => {
    const data = createTemplateSchema.parse(request.body) as import('./requirements/requirements.service.js').CreateTemplateInput;
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
  fastify.patch<{ Params: { id: string } }>('/templates/:id', { preHandler: [requireAuth] }, async (request, reply) => {
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
  fastify.delete<{ Params: { id: string } }>('/templates/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const deleted = await requirementsService.deleteTemplate(request.params.id);

    if (!deleted) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
    }

    return { success: true, data: { deleted: true } };
  });

  // Import template from DOCX file
  fastify.post('/templates/import-docx', { preHandler: [requireAuth] }, async (request, reply) => {
    const data = importDocxSchema.parse(request.body);

    try {
      const buffer = Buffer.from(data.content, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      // Extract service type from filename
      const serviceType = data.fileName
        .replace(/\.docx$/i, '')
        .replace(/\s*-\s*(ל?מועצ(?:ות|ה))$/, '')
        .trim();

      // Policy type detection
      const POLICY_TYPE_MAP = [
        { en: 'GENERAL_LIABILITY', he: 'צד שלישי', aliases: ['צד ג\'', 'צד ג', 'אחריות כלפי צד שלישי'] },
        { en: 'EMPLOYER_LIABILITY', he: 'חבות מעבידים', aliases: ['אחריות מעבידים'] },
        { en: 'PROFESSIONAL_INDEMNITY', he: 'אחריות מקצועית', aliases: ['ביטוח מקצועי'] },
        { en: 'CONTRACTOR_ALL_RISKS', he: 'כל הסיכונים עבודות קבלניות', aliases: ['עבודות קבלניות', 'ביטוח קבלנים', 'כל הסיכונים'] },
        { en: 'PRODUCT_LIABILITY', he: 'חבות מוצר', aliases: ['אחריות מוצר'] },
        { en: 'PROPERTY', he: 'ביטוח רכוש', aliases: ['רכוש'] },
        { en: 'CAR_THIRD_PARTY', he: 'ביטוח רכב צד ג\'', aliases: ['רכב צד שלישי'] },
        { en: 'CAR_COMPULSORY', he: 'ביטוח חובה', aliases: ['חובה רכב'] },
        { en: 'MOTOR_VEHICLE', he: 'ביטוח רכב', aliases: ['רכב'] },
      ];

      // Extract endorsement codes
      const endorsementCodes: string[] = [];
      const codePattern = /\b(3\d{2}|4[0-3]\d|440)\b/g;
      const codeMatches = text.match(codePattern);
      if (codeMatches) {
        for (const match of codeMatches) {
          if (ENDORSEMENT_CODES[match] && !endorsementCodes.includes(match)) {
            endorsementCodes.push(match);
          }
        }
      }

      // Find policy types in text
      const requirements: Array<{
        policyType: string;
        policyTypeHe: string;
        minimumLimit: number;
        minimumLimitPerPeriod: number;
        minimumLimitPerOccurrence: number;
        requiredEndorsements: string[];
        requireAdditionalInsured: boolean;
        requireWaiverSubrogation: boolean;
        policyWording?: string;
        currency: string;
        isMandatory: boolean;
      }> = [];

      for (const pt of POLICY_TYPE_MAP) {
        const allPatterns = [pt.he, ...pt.aliases];
        let found = false;
        for (const pattern of allPatterns) {
          const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (new RegExp(escaped, 'i').test(text)) {
            found = true;
            break;
          }
        }
        if (!found) continue;

        // Parse coverage amounts (dual)
        const escaped = pt.he.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const sectionRegex = new RegExp(`${escaped}[\\s\\S]{0,500}`, 'i');
        const sectionMatch = text.match(sectionRegex);
        const sectionText = sectionMatch ? sectionMatch[0] : text;

        const amounts: number[] = [];
        const amountMatches = sectionText.match(/[\d,]+(?:\s*₪)?/g);
        if (amountMatches) {
          for (const m of amountMatches) {
            const num = parseInt(m.replace(/[,₪\s]/g, ''), 10);
            if (num >= 10000) amounts.push(num);
          }
        }
        const millionPattern = /(\d+(?:\.\d+)?)\s*מ[יי]?ל[יי]?ון/g;
        let mm;
        while ((mm = millionPattern.exec(sectionText)) !== null) {
          if (mm[1]) amounts.push(parseFloat(mm[1]) * 1_000_000);
        }

        const limitPerPeriod = amounts.length > 0 ? amounts[0]! : 1_000_000;
        const limitPerOccurrence = amounts.length > 1 ? amounts[1]! : limitPerPeriod;
        const limit = Math.max(limitPerPeriod, limitPerOccurrence);

        // Detect policy wording
        const policyWording = /ביט/i.test(sectionText)
          ? (sectionText.match(/ביט\s*\d{4}/i)?.[0] || 'ביט')
          : undefined;

        // Detect currency
        let currency = 'ILS';
        if (/\$|USD/i.test(sectionText)) currency = 'USD';
        else if (/€|EUR/i.test(sectionText)) currency = 'EUR';

        const hasAdditionalInsured = endorsementCodes.some((c) =>
          ['317', '318', '319', '320', '321'].includes(c)
        ) || /מבוטח נוסף/i.test(sectionText);

        const hasWaiver = endorsementCodes.some((c) =>
          ['308', '309'].includes(c)
        ) || /ויתור\s+(?:על\s+)?(?:זכות\s+)?תחלוף/i.test(sectionText);

        requirements.push({
          policyType: pt.en,
          policyTypeHe: pt.he,
          minimumLimit: limit,
          minimumLimitPerPeriod: limitPerPeriod,
          minimumLimitPerOccurrence: limitPerOccurrence,
          requiredEndorsements: endorsementCodes,
          requireAdditionalInsured: hasAdditionalInsured,
          requireWaiverSubrogation: hasWaiver,
          policyWording,
          currency,
          isMandatory: true,
        });
      }

      // Fallback if no policies detected
      if (requirements.length === 0) {
        requirements.push({
          policyType: 'GENERAL_LIABILITY',
          policyTypeHe: 'צד שלישי',
          minimumLimit: 5_000_000,
          minimumLimitPerPeriod: 5_000_000,
          minimumLimitPerOccurrence: 5_000_000,
          requiredEndorsements: endorsementCodes,
          requireAdditionalInsured: endorsementCodes.some((c) => ['317', '318', '319', '320', '321'].includes(c)),
          requireWaiverSubrogation: endorsementCodes.some((c) => ['308', '309'].includes(c)),
          currency: 'ILS',
          isMandatory: true,
        });
      }

      const template = await requirementsService.createTemplate({
        name: `Imported - ${serviceType}`,
        nameHe: `ייבוא - ${serviceType}`,
        description: `Imported from ${data.fileName}`,
        descriptionHe: `יובא מקובץ ${data.fileName}`,
        sector: 'IMPORTED',
        contractType: 'DOCX_IMPORT',
        requirements,
      });

      return reply.status(201).send({ success: true, data: template });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      return reply.status(400).send({
        success: false,
        error: { code: 'IMPORT_FAILED', message },
      });
    }
  });

  // ==================== ANALYSIS ====================

  // Run analysis
  fastify.post('/analyze', { preHandler: [requireAuth] }, async (request, reply) => {
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
  fastify.delete<{ Params: { id: string } }>('/analyses/:id', { preHandler: [requireAuth] }, async (request, reply) => {
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
