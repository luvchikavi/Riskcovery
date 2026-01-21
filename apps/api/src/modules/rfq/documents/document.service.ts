import { prisma } from '../../../lib/prisma.js';
import type { CoverageRecommendation } from '../questionnaire/questionnaire.service.js';

export interface RfqDocumentData {
  clientName: string;
  companyId?: string;
  sector: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  generatedAt: Date;
  validUntil: Date;
  recommendations: CoverageRecommendation[];
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  answers: Record<string, unknown>;
}

export interface GeneratedDocument {
  id: string;
  fileName: string;
  format: 'pdf' | 'docx' | 'xlsx';
  content: Buffer;
  mimeType: string;
}

export class DocumentService {
  // Generate RFQ document in specified format
  async generateRfqDocument(
    clientId: string,
    data: RfqDocumentData,
    format: 'pdf' | 'docx' | 'xlsx'
  ): Promise<GeneratedDocument> {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `RFQ_${data.clientName.replace(/\s+/g, '_')}_${timestamp}.${format}`;

    let content: Buffer;
    let mimeType: string;

    switch (format) {
      case 'pdf':
        content = await this.generatePdf(data);
        mimeType = 'application/pdf';
        break;
      case 'docx':
        content = await this.generateWord(data);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'xlsx':
        content = await this.generateExcel(data);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }

    // Save document reference to database
    const doc = await prisma.rfqDocument.create({
      data: {
        clientId,
        fileName,
        s3Key: `rfq-documents/${clientId}/${fileName}`, // Would be uploaded to S3
        format,
      },
    });

    return {
      id: doc.id,
      fileName,
      format,
      content,
      mimeType,
    };
  }

  // Generate PDF document
  private async generatePdf(data: RfqDocumentData): Promise<Buffer> {
    // Build PDF content as HTML that can be converted to PDF
    const html = this.buildHtmlContent(data);

    // For now, return the HTML as a buffer (in production, use puppeteer/pdfkit)
    // This is a placeholder - you would integrate with a PDF library
    return Buffer.from(html, 'utf-8');
  }

  // Generate Word document
  private async generateWord(data: RfqDocumentData): Promise<Buffer> {
    // Build document content
    // For now, return HTML content (in production, use docx library)
    const content = this.buildDocumentContent(data);
    return Buffer.from(content, 'utf-8');
  }

  // Generate Excel document
  private async generateExcel(data: RfqDocumentData): Promise<Buffer> {
    // Build Excel content as CSV (in production, use xlsx library)
    const rows: string[] = [];

    // Header
    rows.push('RFQ Document - Request for Quotation');
    rows.push(`Client: ${data.clientName}`);
    rows.push(`Sector: ${data.sector}`);
    rows.push(`Generated: ${data.generatedAt.toISOString()}`);
    rows.push(`Valid Until: ${data.validUntil.toISOString()}`);
    rows.push(`Risk Score: ${data.riskScore} (${data.riskLevel})`);
    rows.push('');

    // Coverage recommendations table
    rows.push('Policy Type,Policy Type (Hebrew),Recommended Limit,Mandatory,Endorsements');

    for (const rec of data.recommendations) {
      rows.push([
        rec.policyType,
        rec.policyTypeHe,
        rec.recommendedLimit.toString(),
        rec.isMandatory ? 'Yes' : 'No',
        rec.endorsements.join('; '),
      ].join(','));
    }

    return Buffer.from(rows.join('\n'), 'utf-8');
  }

  // Build HTML content for PDF
  private buildHtmlContent(data: RfqDocumentData): string {
    const totalLimit = data.recommendations.reduce((sum, r) => sum + r.recommendedLimit, 0);
    const mandatoryCount = data.recommendations.filter((r) => r.isMandatory).length;

    return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Heebo', Arial, sans-serif; padding: 40px; direction: rtl; }
    h1 { color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 10px; }
    h2 { color: #1E293B; margin-top: 30px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .client-info { background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .risk-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      color: white;
    }
    .risk-low { background: #059669; }
    .risk-medium { background: #D97706; }
    .risk-high { background: #DC2626; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #E2E8F0; padding: 12px; text-align: right; }
    th { background: #F1F5F9; font-weight: 600; }
    tr:nth-child(even) { background: #F8FAFC; }
    .mandatory { color: #DC2626; font-weight: bold; }
    .summary { background: #EFF6FF; padding: 20px; border-radius: 8px; margin-top: 30px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>בקשה להצעת מחיר לביטוח</h1>
      <p>Request for Quotation (RFQ)</p>
    </div>
    <div style="text-align: left;">
      <p><strong>תאריך:</strong> ${data.generatedAt.toLocaleDateString('he-IL')}</p>
      <p><strong>תוקף עד:</strong> ${data.validUntil.toLocaleDateString('he-IL')}</p>
    </div>
  </div>

  <div class="client-info">
    <h2>פרטי הלקוח</h2>
    <p><strong>שם החברה:</strong> ${data.clientName}</p>
    ${data.companyId ? `<p><strong>ח.פ/ע.מ:</strong> ${data.companyId}</p>` : ''}
    <p><strong>ענף:</strong> ${data.sector}</p>
    ${data.contactName ? `<p><strong>איש קשר:</strong> ${data.contactName}</p>` : ''}
    ${data.contactEmail ? `<p><strong>דוא"ל:</strong> ${data.contactEmail}</p>` : ''}
    ${data.contactPhone ? `<p><strong>טלפון:</strong> ${data.contactPhone}</p>` : ''}
    <p>
      <strong>רמת סיכון:</strong>
      <span class="risk-badge risk-${data.riskLevel.toLowerCase()}">${data.riskScore}% - ${data.riskLevel}</span>
    </p>
  </div>

  <h2>דרישות ביטוח מומלצות</h2>
  <table>
    <thead>
      <tr>
        <th>סוג הביטוח</th>
        <th>גבול אחריות מומלץ</th>
        <th>חובה</th>
        <th>הרחבות נדרשות</th>
      </tr>
    </thead>
    <tbody>
      ${data.recommendations
        .map(
          (rec) => `
        <tr>
          <td><strong>${rec.policyTypeHe}</strong><br><small>${rec.policyType}</small></td>
          <td>₪${rec.recommendedLimit.toLocaleString()}</td>
          <td class="${rec.isMandatory ? 'mandatory' : ''}">${rec.isMandatory ? 'כן' : 'לא'}</td>
          <td>${rec.endorsements.join(', ') || '-'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="summary">
    <h2>סיכום</h2>
    <p><strong>סה"כ פוליסות:</strong> ${data.recommendations.length}</p>
    <p><strong>פוליסות חובה:</strong> ${mandatoryCount}</p>
    <p><strong>סה"כ גבולות אחריות:</strong> ₪${totalLimit.toLocaleString()}</p>
  </div>

  <div class="footer">
    <p>מסמך זה הופק באופן אוטומטי על ידי מערכת Riscovery</p>
    <p>התוכן מבוסס על המידע שהוזן ועל בסיס הידע הביטוחי של המערכת</p>
    <p>יש להתייעץ עם יועץ ביטוח מוסמך לפני קבלת החלטות</p>
  </div>
</body>
</html>
    `.trim();
  }

  // Build plain text content for Word
  private buildDocumentContent(data: RfqDocumentData): string {
    let content = `
בקשה להצעת מחיר לביטוח
REQUEST FOR QUOTATION (RFQ)
================================

תאריך: ${data.generatedAt.toLocaleDateString('he-IL')}
תוקף עד: ${data.validUntil.toLocaleDateString('he-IL')}

פרטי הלקוח
----------
שם החברה: ${data.clientName}
${data.companyId ? `ח.פ/ע.מ: ${data.companyId}` : ''}
ענף: ${data.sector}
${data.contactName ? `איש קשר: ${data.contactName}` : ''}
${data.contactEmail ? `דוא"ל: ${data.contactEmail}` : ''}
${data.contactPhone ? `טלפון: ${data.contactPhone}` : ''}

רמת סיכון: ${data.riskScore}% (${data.riskLevel})

דרישות ביטוח מומלצות
====================

`;

    for (const rec of data.recommendations) {
      content += `
${rec.policyTypeHe} (${rec.policyType})
  - גבול אחריות: ₪${rec.recommendedLimit.toLocaleString()}
  - חובה: ${rec.isMandatory ? 'כן' : 'לא'}
  - הרחבות: ${rec.endorsements.join(', ') || 'אין'}
`;
    }

    content += `
סיכום
=====
סה"כ פוליסות: ${data.recommendations.length}
פוליסות חובה: ${data.recommendations.filter((r) => r.isMandatory).length}
סה"כ גבולות אחריות: ₪${data.recommendations.reduce((sum, r) => sum + r.recommendedLimit, 0).toLocaleString()}

---
מסמך זה הופק באופן אוטומטי על ידי מערכת Riscovery
    `.trim();

    return content;
  }

  // Get documents for a client
  async getClientDocuments(clientId: string) {
    return prisma.rfqDocument.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get document by ID
  async getDocument(id: string) {
    return prisma.rfqDocument.findUnique({
      where: { id },
    });
  }
}

export const documentService = new DocumentService();
