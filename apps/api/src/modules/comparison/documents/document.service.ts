import { prisma } from '../../../lib/prisma.js';
import type {
  UploadedDocument,
  DocumentStatus,
  ExtractedCertificateData,
} from '../comparison.types.js';

export class ComparisonDocumentService {
  // Upload a new document
  async uploadDocument(
    data: {
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
      s3Key: string;
      content?: string;
      vendorId?: string;
      clientId?: string;
    }
  ): Promise<UploadedDocument> {
    const doc = await prisma.comparisonDocument.create({
      data: {
        fileName: data.fileName,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        s3Key: data.s3Key,
        fileContent: data.content,
        status: 'uploaded',
        vendorId: data.vendorId,
        clientId: data.clientId,
      },
    });

    return this.mapToDocument(doc);
  }

  // Get document by ID
  async getDocument(id: string): Promise<UploadedDocument | null> {
    const doc = await prisma.comparisonDocument.findUnique({
      where: { id },
    });

    return doc ? this.mapToDocument(doc) : null;
  }

  // Get documents for a vendor/client
  async getDocuments(filters: {
    vendorId?: string;
    clientId?: string;
    status?: DocumentStatus;
  }): Promise<UploadedDocument[]> {
    const docs = await prisma.comparisonDocument.findMany({
      where: {
        ...(filters.vendorId && { vendorId: filters.vendorId }),
        ...(filters.clientId && { clientId: filters.clientId }),
        ...(filters.status && { status: filters.status }),
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return docs.map((doc) => this.mapToDocument(doc));
  }

  // Update document status
  async updateStatus(
    id: string,
    status: DocumentStatus,
    extractedData?: ExtractedCertificateData
  ): Promise<UploadedDocument | null> {
    const doc = await prisma.comparisonDocument.update({
      where: { id },
      data: {
        status,
        ...(extractedData && { extractedData: extractedData as object }),
        ...(status === 'processed' && { processedAt: new Date() }),
      },
    });

    return this.mapToDocument(doc);
  }

  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    try {
      await prisma.comparisonDocument.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Map database record to UploadedDocument type
  private mapToDocument(doc: {
    id: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    s3Key: string;
    status: string;
    extractedData: unknown;
    fileContent: string | null;
    uploadedAt: Date;
    processedAt: Date | null;
    vendorId: string | null;
    clientId: string | null;
  }): UploadedDocument {
    return {
      id: doc.id,
      fileName: doc.fileName,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      size: doc.size,
      s3Key: doc.s3Key,
      status: doc.status as DocumentStatus,
      extractedData: doc.extractedData as ExtractedCertificateData | undefined,
      fileContent: doc.fileContent || undefined,
      uploadedAt: doc.uploadedAt,
      processedAt: doc.processedAt || undefined,
      vendorId: doc.vendorId || undefined,
      clientId: doc.clientId || undefined,
    };
  }
}

export const comparisonDocumentService = new ComparisonDocumentService();
