import type { ExtractedCertificateData, ExtractedPolicy } from '../comparison.types.js';

// OCR Service for extracting data from insurance certificates
// This service can integrate with various OCR providers (OpenAI Vision, Google Vision, Azure, etc.)

export class OcrService {
  // Extract data from a PDF buffer using AI/OCR
  async extractFromPdf(pdfBuffer: Buffer, fileName: string): Promise<ExtractedCertificateData> {
    // For now, return a mock extraction
    // TODO: Integrate with OpenAI Vision API or other OCR service
    console.log(`Processing PDF: ${fileName}, size: ${pdfBuffer.length} bytes`);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock data structure
    return this.createMockExtraction();
  }

  // Extract from base64 image
  async extractFromImage(base64Image: string, mimeType: string): Promise<ExtractedCertificateData> {
    console.log(`Processing image, type: ${mimeType}`);

    // TODO: Integrate with OpenAI Vision API
    return this.createMockExtraction();
  }

  // Parse raw OCR text into structured data
  parseOcrText(rawText: string): ExtractedCertificateData {
    const data: ExtractedCertificateData = {
      policies: [],
      rawText,
    };

    // Extract certificate metadata
    data.certificateNumber = this.extractPattern(rawText, /מספר אישור[:\s]*([^\n\r]+)/i);
    data.issueDate = this.extractDate(rawText, /תאריך הנפקה[:\s]*([^\n\r]+)/i);
    data.expiryDate = this.extractDate(rawText, /תוקף עד[:\s]*([^\n\r]+)/i);
    data.insurerName = this.extractPattern(rawText, /חברת ביטוח[:\s]*([^\n\r]+)/i);
    data.agentName = this.extractPattern(rawText, /סוכן[:\s]*([^\n\r]+)/i);

    // Extract insured details
    data.insuredName = this.extractPattern(rawText, /שם המבוטח[:\s]*([^\n\r]+)/i);
    data.insuredId = this.extractPattern(rawText, /ח\.?פ\.?[:\s]*(\d{9})/i);
    data.insuredAddress = this.extractPattern(rawText, /כתובת[:\s]*([^\n\r]+)/i);

    // Extract policies
    data.policies = this.extractPolicies(rawText);

    // Check for additional insured
    const additionalInsuredMatch = rawText.match(/מבוטח נוסף|additional insured/i);
    const waiverMatch = rawText.match(/ויתור על זכות התחלוף|waiver of subrogation/i);

    if (additionalInsuredMatch || waiverMatch) {
      data.additionalInsured = {
        isNamedAsAdditional: !!additionalInsuredMatch,
        waiverOfSubrogation: !!waiverMatch,
      };
    }

    return data;
  }

  // Extract pattern from text
  private extractPattern(text: string, pattern: RegExp): string | undefined {
    const match = text.match(pattern);
    return match?.[1]?.trim();
  }

  // Extract and parse date
  private extractDate(text: string, pattern: RegExp): string | undefined {
    const match = text.match(pattern);
    if (!match || !match[1]) return undefined;

    const dateStr = match[1].trim();
    // Try to parse various date formats
    const datePatterns = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,  // DD/MM/YYYY
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,  // YYYY/MM/DD
    ];

    for (const dp of datePatterns) {
      const dateMatch = dateStr.match(dp);
      if (dateMatch) {
        return dateStr;
      }
    }

    return dateStr;
  }

  // Extract policies from text
  private extractPolicies(text: string): ExtractedPolicy[] {
    const policies: ExtractedPolicy[] = [];

    // Common Israeli policy types to look for
    const policyTypes = [
      { en: 'GENERAL_LIABILITY', he: 'אחריות כלפי צד שלישי', patterns: [/אחריות כלפי צד שלישי|צד ג/i] },
      { en: 'EMPLOYER_LIABILITY', he: 'אחריות מעבידים', patterns: [/אחריות מעבידים|חבות מעבידים/i] },
      { en: 'PROFESSIONAL_INDEMNITY', he: 'אחריות מקצועית', patterns: [/אחריות מקצועית|ביטוח מקצועי/i] },
      { en: 'CAR_INSURANCE', he: 'ביטוח רכב', patterns: [/ביטוח רכב|רכב מנועי|חובה רכב/i] },
      { en: 'PROPERTY', he: 'ביטוח רכוש', patterns: [/ביטוח רכוש|רכוש מבנה/i] },
      { en: 'PRODUCT_LIABILITY', he: 'אחריות מוצר', patterns: [/אחריות מוצר|חבות מוצר/i] },
      { en: 'CYBER_LIABILITY', he: 'ביטוח סייבר', patterns: [/סייבר|cyber/i] },
      { en: 'D_AND_O', he: 'נושאי משרה', patterns: [/נושאי משרה|דירקטורים/i] },
    ];

    for (const policyType of policyTypes) {
      for (const pattern of policyType.patterns) {
        if (pattern.test(text)) {
          const policy: ExtractedPolicy = {
            policyType: policyType.en,
            policyTypeHe: policyType.he,
            endorsements: [],
            confidence: 0.7,
          };

          // Try to extract limit for this policy
          const limitPattern = new RegExp(
            `${policyType.he}[^\\d]*([\\d,]+)\\s*(אלף|מיליון)?\\s*(ש"ח|₪|ILS)?`,
            'i'
          );
          const limitMatch = text.match(limitPattern);
          if (limitMatch && limitMatch[1]) {
            let limit = parseInt(limitMatch[1].replace(/,/g, ''), 10);
            if (limitMatch[2] === 'אלף') limit *= 1000;
            if (limitMatch[2] === 'מיליון') limit *= 1000000;
            policy.coverageLimit = limit;
          }

          policies.push(policy);
          break;
        }
      }
    }

    return policies;
  }

  // Create mock extraction for testing
  private createMockExtraction(): ExtractedCertificateData {
    return {
      certificateNumber: 'CERT-2024-12345',
      issueDate: '2024-01-15',
      expiryDate: '2025-01-14',
      insurerName: 'הראל חברה לביטוח',
      insurerNameHe: 'הראל חברה לביטוח',
      agentName: 'סוכנות ביטוח ישראל',

      insuredName: 'חברת בדיקה בע"מ',
      insuredId: '515123456',
      insuredAddress: 'תל אביב, רחוב הרצל 1',

      policies: [
        {
          policyType: 'GENERAL_LIABILITY',
          policyTypeHe: 'אחריות כלפי צד שלישי',
          policyNumber: 'GL-2024-001',
          coverageLimit: 5000000,
          deductible: 10000,
          effectiveDate: '2024-01-15',
          expirationDate: '2025-01-14',
          endorsements: ['הרחבת נזקי מים', 'כיסוי לעבודות קבלניות'],
          confidence: 0.85,
        },
        {
          policyType: 'EMPLOYER_LIABILITY',
          policyTypeHe: 'אחריות מעבידים',
          policyNumber: 'EL-2024-001',
          coverageLimit: 10000000,
          deductible: 5000,
          effectiveDate: '2024-01-15',
          expirationDate: '2025-01-14',
          endorsements: [],
          confidence: 0.90,
        },
        {
          policyType: 'PROFESSIONAL_INDEMNITY',
          policyTypeHe: 'אחריות מקצועית',
          policyNumber: 'PI-2024-001',
          coverageLimit: 3000000,
          deductible: 25000,
          effectiveDate: '2024-01-15',
          expirationDate: '2025-01-14',
          endorsements: ['כיסוי רטרואקטיבי'],
          confidence: 0.80,
        },
      ],

      additionalInsured: {
        name: 'LHD Insurance Consulting',
        isNamedAsAdditional: true,
        waiverOfSubrogation: true,
      },

      confidence: 0.85,
    };
  }
}

export const ocrService = new OcrService();
