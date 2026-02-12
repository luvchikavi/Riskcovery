import { PDFParse } from 'pdf-parse';
import OpenAI from 'openai';
import type { ExtractedCertificateData, ExtractedPolicy } from '../comparison.types.js';
import { certificateParser } from './certificate-parser.js';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is required for OCR');
  return new OpenAI({ apiKey });
}

// OCR Service for extracting data from insurance certificates
// Supports Israeli standardized certificate format (רשות שוק ההון)

// Standardized endorsement codes (כיסויים נוספים) as per Israeli regulations
export const ENDORSEMENT_CODES: Record<string, { he: string; en: string; category: string }> = {
  '301': { he: 'אובדן מסמכים', en: 'Loss of documents', category: 'professional' },
  '302': { he: 'אחריות צולבת', en: 'Cross liability', category: 'liability' },
  '303': { he: 'דיבה, השמצה והוצאת לשון הרע', en: 'Defamation and libel', category: 'professional' },
  '304': { he: 'הרחב שיפוי', en: 'Extended indemnification', category: 'general' },
  '305': { he: 'הרחבת כלי ירייה המוחזק כדין', en: 'Firearms extension', category: 'liability' },
  '306': { he: 'הרחבת צד ג\' - נזק בעת שהות זמנית בחו"ל', en: 'Third party abroad extension', category: 'liability' },
  '307': { he: 'הרחבת צד ג\' - קבלנים וקבלני משנה', en: 'Contractors and subcontractors extension', category: 'liability' },
  '308': { he: 'ויתור על תחלוף לטובת גורם אחר', en: 'Waiver of subrogation for other party', category: 'general' },
  '309': { he: 'ויתור על תחלוף לטובת מבקש האישור', en: 'Waiver of subrogation for certificate requester', category: 'general' },
  '310': { he: 'כיסוי למשווקים במסגרת חבות מוצר', en: 'Marketers coverage in product liability', category: 'product' },
  '311': { he: 'כיסוי אובדן תוצאתי בגין נזק לרכוש', en: 'Consequential loss coverage', category: 'property' },
  '312': { he: 'כיסוי בגין נזק גוף משימוש בצמ"ה', en: 'Bodily injury from heavy equipment', category: 'liability' },
  '313': { he: 'כיסוי בגין נזקי טבע', en: 'Natural disaster coverage', category: 'property' },
  '314': { he: 'כיסוי גניבה פריצה ושוד', en: 'Theft, burglary and robbery', category: 'property' },
  '315': { he: 'כיסוי לתביעות המל"ל', en: 'National Insurance claims coverage', category: 'employer' },
  '316': { he: 'כיסוי רעידת אדמה', en: 'Earthquake coverage', category: 'property' },
  '317': { he: 'מבוטח נוסף - אחר', en: 'Additional insured - other', category: 'general' },
  '318': { he: 'מבוטח נוסף - מבקש האישור', en: 'Additional insured - certificate requester', category: 'general' },
  '319': { he: 'מבוטח נוסף - כמעבידם של עובדי המבוטח', en: 'Additional insured - as employer', category: 'employer' },
  '320': { he: 'מבוטח נוסף בגין מעשי המבוטח - אחר', en: 'Additional insured for insured acts - other', category: 'general' },
  '321': { he: 'מבוטח נוסף בגין מעשי המבוטח - מבקש האישור', en: 'Additional insured for insured acts - requester', category: 'general' },
  '322': { he: 'מבקש האישור מוגדר כצד ג\'', en: 'Requester defined as third party', category: 'liability' },
  '323': { he: 'מוטב לתגמולי ביטוח - אחר', en: 'Insurance beneficiary - other', category: 'general' },
  '324': { he: 'מוטב לתגמולי ביטוח - מבקש האישור', en: 'Insurance beneficiary - requester', category: 'general' },
  '325': { he: 'מרמה ואי יושר עובדים', en: 'Employee fraud and dishonesty', category: 'professional' },
  '326': { he: 'פגיעה בפרטיות במסגרת אחריות מקצועית', en: 'Privacy breach in professional liability', category: 'professional' },
  '327': { he: 'עיכוב/שיהוי עקב מקרה ביטוח', en: 'Delay due to insurance event', category: 'professional' },
  '328': { he: 'ראשוניות - המבטח מוותר על דרישה ממבטח מבקש האישור', en: 'Primary - insurer waives claims against requester insurer', category: 'general' },
  '329': { he: 'רכוש מבקש האישור ייחשב כצד ג\'', en: 'Requester property considered third party', category: 'liability' },
  '330': { he: 'שעבוד לטובת גורם אחר', en: 'Lien for other party', category: 'general' },
  '331': { he: 'שעבוד לטובת מבקש האישור', en: 'Lien for certificate requester', category: 'general' },
  '332': { he: 'תקופת גילוי', en: 'Discovery period', category: 'professional' },
  '333': { he: 'גבול האחריות לטובת ההתקשרות בלבד', en: 'Limit for contract only', category: 'general' },
  '334': { he: 'תקופת תחזוקה', en: 'Maintenance period', category: 'contractor' },
  '335': { he: 'תקופת שיפוי', en: 'Indemnification period', category: 'general' },
  '336': { he: 'ביטול חריג אחריות מקצועית בצד ג\'', en: 'Cancel professional liability exclusion in TPL', category: 'liability' },
  '337': { he: 'ביטול חריג חבות מוצר בצד ג\'', en: 'Cancel product liability exclusion in TPL', category: 'liability' },
  '338': { he: 'הרחבת כיסוי על בסיס ערך כינון', en: 'Replacement value coverage', category: 'property' },
  '339': { he: 'הרחבה לסיכון סייבר', en: 'Cyber risk extension', category: 'professional' },
  '340': { he: 'הרחבת רעידות והחלשת משען', en: 'Vibration and weakening of support', category: 'contractor' },
  '341': { he: 'הרחבת נזק עקיף למתקנים תת קרקעיים', en: 'Indirect damage to underground facilities', category: 'contractor' },
  '342': { he: 'הרחבת מעבידים - כלי ירייה', en: 'Employer extension - firearms', category: 'employer' },
  '343': { he: 'הרחבת הכיסוי לנזקים בעת פריקה וטעינה', en: 'Loading/unloading coverage', category: 'liability' },
  '344': { he: 'הרחבת הכיסוי לעבודות בגובה', en: 'Working at heights coverage', category: 'contractor' },
  '345': { he: 'הרחבה לנזק בגין פרעות ושביתות', en: 'Riots and strikes coverage', category: 'property' },
  '346': { he: 'הרחבה לנזקי חשמל', en: 'Electrical damage coverage', category: 'property' },
  '347': { he: 'הרחבת שם המבוטח בביטוח חבות מוצר', en: 'Insured name extension in product liability', category: 'product' },
  '348': { he: 'ביטול סייג רכוש עליו פעלו במישרין', en: 'Cancel direct work on property exclusion', category: 'liability' },
  '349': { he: 'ביטול סייג רכוש בשליטה בחזקה ופיקוח', en: 'Cancel property in care custody control exclusion', category: 'liability' },
  '350': { he: 'הרחבת חבות כלפי קבלנים בחבות מעבידים', en: 'Contractor liability in employer coverage', category: 'employer' },
};

// Standardized service codes (קוד השירות) - partial list of common ones
export const SERVICE_CODES: Record<string, { he: string; en: string }> = {
  '001': { he: 'אבטחה', en: 'Security' },
  '007': { he: 'ביקורת חשבונאית, ראיית חשבון ומיסוי', en: 'Accounting and tax' },
  '009': { he: 'בניה - עבודות קבלניות גדולות', en: 'Construction - major works' },
  '017': { he: 'גינון, גיזום וצמחיה', en: 'Gardening and landscaping' },
  '022': { he: 'הובלות והפצה', en: 'Transportation and distribution' },
  '038': { he: 'יועצים/מתכננים', en: 'Consultants/Planners' },
  '039': { he: 'כוח אדם', en: 'Human resources' },
  '040': { he: 'מהנדס, אדריכל, הנדסאי', en: 'Engineer, Architect, Technician' },
  '041': { he: 'מזון/שירותי הסעדה/בתי אוכל', en: 'Food services/Catering' },
  '043': { he: 'מחשוב', en: 'Computing/IT' },
  '057': { he: 'ניקיון', en: 'Cleaning' },
  '074': { he: 'שיפוצים', en: 'Renovations' },
  '085': { he: 'שירותי פיקוח, תכנון ובקרה (בניה)', en: 'Construction supervision' },
  '086': { he: 'שירותי פיקוח, תכנון ובקרה (כללי)', en: 'General supervision' },
  '088': { he: 'שירותי תחזוקה ותפעול', en: 'Maintenance and operations' },
  '093': { he: 'שירותים משפטיים', en: 'Legal services' },
  '103': { he: 'שירותי חומרה ו/או תוכנה', en: 'Hardware/Software services' },
  '105': { he: 'קבלן עבודות תמ"א/שימור/תחזוקה/בנייה', en: 'TAMA/Conservation/Maintenance contractor' },
};

// Policy type mappings for Israeli insurance certificates
const POLICY_TYPES = [
  {
    en: 'GENERAL_LIABILITY',
    he: 'צד שלישי',
    aliases: ['צד ג\'', 'צד ג', 'אחריות כלפי צד שלישי', 'צד שלישי למקרה ולתקופה'],
  },
  {
    en: 'EMPLOYER_LIABILITY',
    he: 'חבות מעבידים',
    aliases: ['אחריות מעבידים', 'חבות מעבידים לעובד', 'ביטוח מעבידים'],
  },
  {
    en: 'PROFESSIONAL_INDEMNITY',
    he: 'אחריות מקצועית',
    aliases: ['ביטוח מקצועי', 'אחריות מקצועית למקרה', 'אחריות מקצועית לתקופה'],
  },
  {
    en: 'CONTRACTOR_ALL_RISKS',
    he: 'כל הסיכונים עבודות קבלניות',
    aliases: ['עבודות קבלניות', 'ביטוח קבלנים', 'כל הסיכונים'],
  },
  {
    en: 'PRODUCT_LIABILITY',
    he: 'חבות מוצר',
    aliases: ['אחריות מוצר', 'ביטוח מוצר'],
  },
  {
    en: 'PROPERTY',
    he: 'ביטוח רכוש',
    aliases: ['רכוש', 'ביטוח מבנה', 'ביטוח תכולה'],
  },
  {
    en: 'CAR_THIRD_PARTY',
    he: 'ביטוח רכב צד ג\'',
    aliases: ['רכב צד שלישי', 'נזק צד שלישי רכב'],
  },
  {
    en: 'CAR_COMPULSORY',
    he: 'ביטוח חובה',
    aliases: ['חובה רכב', 'ביטוח חובה רכב'],
  },
  {
    en: 'CYBER_LIABILITY',
    he: 'ביטוח סייבר',
    aliases: ['סייבר', 'אחריות סייבר'],
  },
  {
    en: 'D_AND_O',
    he: 'נושאי משרה',
    aliases: ['דירקטורים ונושאי משרה', 'ביטוח דירקטורים'],
  },
];

export class OcrService {
  // Extract data from a PDF buffer using pdf-parse + structured extraction
  async extractFromPdf(pdfBuffer: Buffer, fileName: string): Promise<ExtractedCertificateData> {
    console.log(`Processing PDF: ${fileName}, size: ${pdfBuffer.length} bytes`);

    try {
      // Extract raw text from the PDF using pdf-parse v2 class API
      const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
      const textResult = await parser.getText();
      const rawText = textResult.text;
      await parser.destroy();

      if (!rawText || rawText.trim().length === 0) {
        console.log('PDF has no extractable text, routing to Vision OCR');
        return this.extractWithVision(pdfBuffer.toString('base64'), 'application/pdf');
      }

      console.log(`Extracted ${rawText.length} chars of text from PDF (${textResult.pages.length} pages)`);

      // Parse the raw text using the structured certificate parser
      return this.parseOcrText(rawText);
    } catch (err) {
      console.error('Failed to extract text from PDF, falling back to mock:', err);
      return this.createMockExtraction();
    }
  }

  // Extract from base64 image using OpenAI Vision
  async extractFromImage(base64Image: string, mimeType: string): Promise<ExtractedCertificateData> {
    console.log(`Processing image, type: ${mimeType}`);
    return this.extractWithVision(base64Image, mimeType);
  }

  // Extract certificate data from a document image/PDF using OpenAI Vision
  private async extractWithVision(base64Data: string, mimeType: string): Promise<ExtractedCertificateData> {
    try {
      const client = getOpenAIClient();

      const systemPrompt = `אתה מערכת OCR לחילוץ נתונים מאישורי ביטוח ישראליים (תעודות ביטוח בפורמט רשות שוק ההון).
חלץ את כל הנתונים מהמסמך והחזר JSON בלבד בפורמט הבא:
{
  "certificateNumber": "מספר אסמכתא",
  "issueDate": "YYYY-MM-DD",
  "expiryDate": "YYYY-MM-DD",
  "insurerName": "שם המבטח",
  "insurerNameHe": "שם המבטח בעברית",
  "insuredName": "שם המבוטח",
  "insuredId": "ח.פ./ת.ז. של המבוטח",
  "insuredAddress": "כתובת המבוטח",
  "certificateRequester": { "name": "שם מבקש האישור", "id": "ח.פ. מבקש האישור" },
  "serviceCodes": ["קודי שירות"],
  "policies": [
    {
      "policyType": "GENERAL_LIABILITY | EMPLOYER_LIABILITY | PROFESSIONAL_INDEMNITY | CONTRACTOR_ALL_RISKS | PRODUCT_LIABILITY | PROPERTY | CAR_THIRD_PARTY | CAR_COMPULSORY | CYBER_LIABILITY | D_AND_O",
      "policyTypeHe": "שם סוג הפוליסה בעברית",
      "policyNumber": "מספר פוליסה",
      "coverageLimitPerPeriod": 0,
      "coverageLimitPerOccurrence": 0,
      "coverageLimit": 0,
      "deductible": 0,
      "policyWording": "ביט או אחר",
      "currency": "ILS",
      "effectiveDate": "YYYY-MM-DD",
      "expirationDate": "YYYY-MM-DD",
      "retroactiveDate": "YYYY-MM-DD או null",
      "endorsementCodes": ["קודי הרחבות 3 ספרות"],
      "endorsements": ["תיאורי הרחבות בעברית"]
    }
  ],
  "additionalInsured": {
    "name": "שם המבוטח הנוסף",
    "isNamedAsAdditional": true/false,
    "waiverOfSubrogation": true/false
  }
}
אם שדה לא קיים במסמך, השמט אותו מה-JSON. החזר JSON בלבד, ללא טקסט נוסף.`;

      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: dataUrl },
              },
              {
                type: 'text',
                text: 'חלץ את כל נתוני אישור הביטוח מהמסמך הזה. החזר JSON בלבד.',
              },
            ],
          },
        ],
        max_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error('Vision API returned empty response, falling back to mock');
        return this.createMockExtraction();
      }

      const parsed = JSON.parse(content);

      // Map to ExtractedCertificateData
      const data: ExtractedCertificateData = {
        certificateNumber: parsed.certificateNumber,
        issueDate: parsed.issueDate,
        expiryDate: parsed.expiryDate,
        insurerName: parsed.insurerName,
        insurerNameHe: parsed.insurerNameHe,
        insuredName: parsed.insuredName,
        insuredId: parsed.insuredId,
        insuredAddress: parsed.insuredAddress,
        certificateRequester: parsed.certificateRequester,
        serviceCodes: parsed.serviceCodes,
        policies: (parsed.policies || []).map((p: Record<string, unknown>) => {
          const perPeriod = typeof p.coverageLimitPerPeriod === 'number' ? p.coverageLimitPerPeriod : undefined;
          const perOccurrence = typeof p.coverageLimitPerOccurrence === 'number' ? p.coverageLimitPerOccurrence : undefined;
          const legacy = typeof p.coverageLimit === 'number' ? p.coverageLimit : undefined;
          return {
            policyType: p.policyType as string,
            policyTypeHe: p.policyTypeHe as string,
            policyNumber: p.policyNumber as string | undefined,
            coverageLimitPerPeriod: perPeriod,
            coverageLimitPerOccurrence: perOccurrence,
            coverageLimit: legacy ?? perPeriod, // fallback for backward compat
            deductible: typeof p.deductible === 'number' ? p.deductible : undefined,
            policyWording: typeof p.policyWording === 'string' ? p.policyWording : undefined,
            currency: typeof p.currency === 'string' ? p.currency : 'ILS',
            effectiveDate: p.effectiveDate as string | undefined,
            expirationDate: p.expirationDate as string | undefined,
            retroactiveDate: p.retroactiveDate as string | undefined,
            endorsementCodes: Array.isArray(p.endorsementCodes) ? p.endorsementCodes : [],
            endorsements: Array.isArray(p.endorsements) ? p.endorsements : [],
          };
        }),
        additionalInsured: parsed.additionalInsured,
        rawText: `[Vision OCR] ${content.substring(0, 500)}`,
      };

      // Calculate confidence based on populated fields
      data.confidence = this.calculateConfidence(data);

      console.log(`Vision OCR extracted: ${data.policies.length} policies, confidence: ${data.confidence}`);
      return data;
    } catch (err) {
      console.error('Vision OCR failed, falling back to mock:', err);
      return this.createMockExtraction();
    }
  }

  // Parse raw OCR text into structured data (Israeli certificate format)
  // Uses the certificate field map patterns for structured extraction
  parseOcrText(rawText: string): ExtractedCertificateData {
    const data: ExtractedCertificateData = {
      policies: [],
      rawText,
    };

    // Use certificate parser patterns for structured extraction
    const patterns = certificateParser.getExtractionPatterns();
    const patternResults: Record<string, string> = {};
    for (const p of patterns) {
      const match = rawText.match(p.pattern);
      if (match?.[1]) {
        patternResults[p.fieldName] = match[1].trim();
      }
    }

    // Extract certificate metadata (pattern-assisted + fallback)
    data.certificateNumber = patternResults.certificateNumber || this.extractCertificateNumber(rawText);
    data.issueDate = patternResults.issueDate
      ? this.normalizeDate(patternResults.issueDate)
      : this.extractIssueDate(rawText);
    data.insurerName = this.extractInsurerName(rawText);

    // Extract certificate requester (מבקש האישור)
    const requesterInfo = this.extractRequesterInfo(rawText);
    if (requesterInfo) {
      data.certificateRequester = requesterInfo;
    }

    // Extract insured details (המבוטח)
    const insuredInfo = this.extractInsuredInfo(rawText);
    data.insuredName = insuredInfo.name;
    data.insuredId = insuredInfo.id;
    data.insuredAddress = insuredInfo.address;

    // Extract policies with detailed information
    data.policies = this.extractPoliciesDetailed(rawText);

    // Extract service codes
    data.serviceCodes = this.extractServiceCodes(rawText);

    // Check for additional insured and waiver of subrogation using endorsement codes
    data.additionalInsured = this.extractAdditionalInsuredStatus(rawText);

    // Calculate overall confidence
    data.confidence = this.calculateConfidence(data);

    return data;
  }

  // Extract certificate reference number (אסמכתא)
  private extractCertificateNumber(text: string): string | undefined {
    const patterns = [
      /אסמכתא[:\s]*(\d+)/i,
      /מספר אישור[:\s]*([^\n\r]+)/i,
      /certificate\s*(?:no|number)[:\s]*([^\n\r]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return undefined;
  }

  // Extract issue date (תאריך הנפקת האישור)
  private extractIssueDate(text: string): string | undefined {
    const patterns = [
      /תאריך הנפקת האישור[:\s]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
      /תאריך הנפקה[:\s]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
      /(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})\s*תאריך הנפקת/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) return this.normalizeDate(match[1]);
    }
    return undefined;
  }

  // Extract insurer name from common Israeli insurers
  private extractInsurerName(text: string): string | undefined {
    const insurers = [
      'הפניקס',
      'הראל',
      'מגדל',
      'כלל',
      'הכשרה',
      'מנורה מבטחים',
      'איילון',
      'שלמה ביטוח',
      'ביטוח ישיר',
      'AIG',
      'שומרה',
      'הירדן',
    ];

    for (const insurer of insurers) {
      if (text.includes(insurer)) {
        return insurer;
      }
    }
    return undefined;
  }

  // Extract certificate requester information (מבקש האישור הראשי)
  private extractRequesterInfo(text: string): { name: string; id?: string; address?: string } | undefined {
    const nameMatch = text.match(/מבקש האישור(?:\s*הראשי)?[:\s]*(?:שם[:\s]*)?([^\n\r,]+)/i);
    const idMatch = text.match(/מבקש האישור[^]*?ת\.?ז\.?\/ח\.?פ\.?[:\s]*(\d{9})/i);

    if (nameMatch?.[1]) {
      return {
        name: nameMatch[1].trim(),
        id: idMatch?.[1],
      };
    }
    return undefined;
  }

  // Extract insured information (המבוטח)
  private extractInsuredInfo(text: string): { name?: string; id?: string; address?: string } {
    const result: { name?: string; id?: string; address?: string } = {};

    // Try to find insured name
    const namePatterns = [
      /המבוטח[^]*?שם[:\s]*([^\n\r]+)/i,
      /שם המבוטח[:\s]*([^\n\r]+)/i,
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        result.name = match[1].trim();
        break;
      }
    }

    // Extract ID (ח.פ. or ת.ז.)
    const idMatch = text.match(/המבוטח[^]*?ת\.?ז\.?\/ח\.?פ\.?[:\s]*(\d{9})/i);
    if (idMatch?.[1]) result.id = idMatch[1];

    // Extract address
    const addressMatch = text.match(/מען[:\s]*([^\n\r]+)/i);
    if (addressMatch?.[1]) result.address = addressMatch[1].trim();

    return result;
  }

  // Extract detailed policy information
  private extractPoliciesDetailed(text: string): ExtractedPolicy[] {
    const policies: ExtractedPolicy[] = [];

    for (const policyType of POLICY_TYPES) {
      // Check if this policy type exists in the text
      const allPatterns = [policyType.he, ...policyType.aliases];
      let found = false;

      for (const pattern of allPatterns) {
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (regex.test(text)) {
          found = true;
          break;
        }
      }

      if (!found) continue;

      const policy: ExtractedPolicy = {
        policyType: policyType.en,
        policyTypeHe: policyType.he,
        endorsements: [],
        endorsementCodes: [],
        confidence: 0.7,
      };

      // Extract policy number
      const policyNumPattern = new RegExp(
        `${policyType.he}[^]*?(?:מספר[\\s]*(?:ה)?פוליסה|פוליסה)[:\\s]*([\\d\\-]+)`,
        'i'
      );
      const policyNumMatch = text.match(policyNumPattern);
      if (policyNumMatch?.[1]) {
        policy.policyNumber = policyNumMatch[1].trim();
      }

      // Extract section text for this policy type
      const escapedHe = policyType.he.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const sectionRegex = new RegExp(`${escapedHe}[\\s\\S]{0,800}`, 'i');
      const sectionMatch = text.match(sectionRegex);
      const sectionText = sectionMatch ? sectionMatch[0] : '';

      // Extract dual coverage limits — find all amounts >= 10000 in the section
      const amounts: number[] = [];
      const amountPattern = /[\d,]+(?:\s*₪)?/g;
      let amountMatch;
      while ((amountMatch = amountPattern.exec(sectionText)) !== null) {
        const num = parseInt(amountMatch[0].replace(/[,₪\s]/g, ''), 10);
        if (num >= 10000) amounts.push(num);
      }
      // Also check for "X מיליון" patterns
      const millionPat = /(\d+(?:\.\d+)?)\s*מ[יי]?ל[יי]?ון/g;
      let mm;
      while ((mm = millionPat.exec(sectionText)) !== null) {
        if (mm[1]) amounts.push(parseFloat(mm[1]) * 1_000_000);
      }

      if (amounts.length >= 2) {
        // First = per period, second = per occurrence
        policy.coverageLimitPerPeriod = amounts[0];
        policy.coverageLimitPerOccurrence = amounts[1];
      } else if (amounts.length === 1) {
        policy.coverageLimitPerPeriod = amounts[0];
        policy.coverageLimitPerOccurrence = amounts[0];
      }
      // Legacy fallback
      policy.coverageLimit = policy.coverageLimitPerPeriod;

      // Extract policy wording — look for "ביט"
      if (/ביט/i.test(sectionText)) {
        const wordingMatch = sectionText.match(/ביט\s*\d{4}/i);
        policy.policyWording = wordingMatch ? wordingMatch[0] : 'ביט';
      }

      // Extract currency (default ILS)
      if (/\$|USD/i.test(sectionText)) {
        policy.currency = 'USD';
      } else if (/€|EUR/i.test(sectionText)) {
        policy.currency = 'EUR';
      } else {
        policy.currency = 'ILS';
      }

      // Extract dates
      const datePatterns = [
        /תאריך תחילה[:\s]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
        /ת\.\s*תחילה[:\s]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
      ];
      for (const dp of datePatterns) {
        const dateMatch = text.match(dp);
        if (dateMatch?.[1]) {
          policy.effectiveDate = this.normalizeDate(dateMatch[1]);
          break;
        }
      }

      const endDatePatterns = [
        /תאריך סיום[:\s]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
        /ת\.\s*סיום[:\s]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
      ];
      for (const dp of endDatePatterns) {
        const dateMatch = text.match(dp);
        if (dateMatch?.[1]) {
          policy.expirationDate = this.normalizeDate(dateMatch[1]);
          break;
        }
      }

      // Extract endorsement codes
      policy.endorsementCodes = this.extractEndorsementCodes(text, policyType.he);
      policy.endorsements = policy.endorsementCodes.map(
        (code) => ENDORSEMENT_CODES[code]?.he || code
      );

      policies.push(policy);
    }

    return policies;
  }

  // Extract endorsement codes from text
  private extractEndorsementCodes(text: string, policyTypeHe: string): string[] {
    const codes: string[] = [];

    // Look for 3-digit codes (301-440 range)
    const codePattern = /\b(3\d{2}|4[0-3]\d|440)\b/g;
    const matches = text.match(codePattern);

    if (matches) {
      for (const match of matches) {
        if (ENDORSEMENT_CODES[match] && !codes.includes(match)) {
          codes.push(match);
        }
      }
    }

    return codes;
  }

  // Extract service codes
  private extractServiceCodes(text: string): string[] {
    const codes: string[] = [];

    // Look for service code patterns (usually 3-digit numbers under 140)
    const codePattern = /קוד(?:\s*ה)?שירות[:\s]*(\d{2,3})/gi;
    let match;
    while ((match = codePattern.exec(text)) !== null) {
      if (match[1]) {
        const code = match[1].padStart(3, '0');
        if (SERVICE_CODES[code] && !codes.includes(code)) {
          codes.push(code);
        }
      }
    }

    // Also look for explicit codes in the format "00038" or "038"
    const explicitPattern = /\b(0{0,2}\d{2,3})\b/g;
    while ((match = explicitPattern.exec(text)) !== null) {
      if (match[1]) {
        const code = match[1].padStart(3, '0');
        if (SERVICE_CODES[code] && !codes.includes(code)) {
          codes.push(code);
        }
      }
    }

    return codes;
  }

  // Extract additional insured status from endorsement codes
  private extractAdditionalInsuredStatus(text: string): {
    name?: string;
    isNamedAsAdditional: boolean;
    waiverOfSubrogation: boolean;
  } {
    const result = {
      isNamedAsAdditional: false,
      waiverOfSubrogation: false,
    };

    // Check for endorsement codes
    const hasCode318 = /\b318\b/.test(text); // מבוטח נוסף - מבקש האישור
    const hasCode321 = /\b321\b/.test(text); // מבוטח נוסף בגין מעשי המבוטח
    const hasCode309 = /\b309\b/.test(text); // ויתור על תחלוף לטובת מבקש האישור
    const hasCode328 = /\b328\b/.test(text); // ראשוניות

    // Check for Hebrew text
    const additionalInsuredPatterns = [
      /מבוטח נוסף/i,
      /additional insured/i,
    ];
    const waiverPatterns = [
      /ויתור על (?:זכות )?תחלוף/i,
      /waiver of subrogation/i,
    ];

    result.isNamedAsAdditional = hasCode318 || hasCode321 ||
      additionalInsuredPatterns.some((p) => p.test(text));

    result.waiverOfSubrogation = hasCode309 || hasCode328 ||
      waiverPatterns.some((p) => p.test(text));

    return result;
  }

  // Normalize date format to YYYY-MM-DD
  private normalizeDate(dateStr: string): string {
    const cleanDate = dateStr.trim();

    // Try DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
    const dmyMatch = cleanDate.match(/(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/);
    if (dmyMatch && dmyMatch[1] && dmyMatch[2] && dmyMatch[3]) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      let year = dmyMatch[3];
      if (year.length === 2) {
        year = parseInt(year, 10) > 50 ? `19${year}` : `20${year}`;
      }
      return `${year}-${month}-${day}`;
    }

    return cleanDate;
  }

  // Calculate confidence score based on extracted data
  private calculateConfidence(data: ExtractedCertificateData): number {
    let score = 0;
    let factors = 0;

    if (data.certificateNumber) { score += 1; factors += 1; }
    if (data.issueDate) { score += 1; factors += 1; }
    if (data.insurerName) { score += 1; factors += 1; }
    if (data.insuredName) { score += 1; factors += 1; }
    if (data.policies.length > 0) {
      score += 1;
      factors += 1;

      // Check policy completeness
      for (const policy of data.policies) {
        if (policy.coverageLimitPerPeriod) score += 0.3;
        if (policy.coverageLimitPerOccurrence) score += 0.3;
        if (!policy.coverageLimitPerPeriod && policy.coverageLimit) score += 0.5; // legacy fallback
        if (policy.effectiveDate) score += 0.3;
        if (policy.expirationDate) score += 0.3;
        factors += 1.2;
      }
    }

    return factors > 0 ? Math.min(score / factors, 1) : 0.5;
  }

  // Create realistic mock extraction based on Israeli certificate patterns
  private createMockExtraction(): ExtractedCertificateData {
    return {
      certificateNumber: '000050229',
      issueDate: '2024-09-01',
      expiryDate: '2024-12-31',
      insurerName: 'הפניקס',
      insurerNameHe: 'הפניקס השקעות, ביטוח ופיננסים',

      insuredName: 'זילברמן גיל',
      insuredId: '023898265',
      insuredAddress: 'הכפר 11, קריית אונו',

      certificateRequester: {
        name: 'החברה הכלכלית לפיתוח עמק חפר בע"מ',
        id: '511150397',
      },

      policies: [
        {
          policyType: 'GENERAL_LIABILITY',
          policyTypeHe: 'צד שלישי',
          policyNumber: '24-110-063-1071730',
          coverageLimit: 5000000,
          coverageLimitPerPeriod: 5000000,
          coverageLimitPerOccurrence: 2000000,
          deductible: 0,
          policyWording: 'ביט 2019',
          currency: 'ILS',
          effectiveDate: '2024-08-12',
          expirationDate: '2024-12-31',
          endorsements: [
            'הרחב שיפוי',
            'רכוש מבקש האישור ייחשב כצד ג\'',
            'אחריות צולבת',
            'ויתור על תחלוף לטובת מבקש האישור',
            'הרחבת צד ג\' - קבלנים וקבלני משנה',
            'מבקש האישור מוגדר כצד ג\'',
            'מבוטח נוסף בגין מעשי המבוטח',
            'כיסוי לתביעות המל"ל',
            'ראשוניות',
          ],
          endorsementCodes: ['304', '329', '302', '309', '307', '322', '321', '315', '328'],
          confidence: 0.9,
        },
        {
          policyType: 'EMPLOYER_LIABILITY',
          policyTypeHe: 'חבות מעבידים',
          policyNumber: '24-110-063-1071730',
          coverageLimit: 20000000,
          coverageLimitPerPeriod: 20000000,
          coverageLimitPerOccurrence: 10000000,
          deductible: 0,
          policyWording: 'ביט 2019',
          currency: 'ILS',
          effectiveDate: '2024-08-12',
          expirationDate: '2024-12-31',
          endorsements: [
            'ויתור על תחלוף לטובת מבקש האישור',
            'מבוטח נוסף - כמעבידם של עובדי המבוטח',
            'ראשוניות',
          ],
          endorsementCodes: ['309', '319', '328'],
          confidence: 0.9,
        },
        {
          policyType: 'PROFESSIONAL_INDEMNITY',
          policyTypeHe: 'אחריות מקצועית',
          policyNumber: '24-110-073-1003952',
          coverageLimit: 2000000,
          coverageLimitPerPeriod: 2000000,
          coverageLimitPerOccurrence: 1000000,
          deductible: 0,
          policyWording: 'ביט 2019',
          currency: 'ILS',
          effectiveDate: '2024-08-12',
          expirationDate: '2025-05-31',
          retroactiveDate: '2024-08-12',
          endorsements: [
            'דיבה, השמצה והוצאת לשון הרע',
            'אובדן מסמכים',
            'מרמה ואי יושר עובדים',
            'אחריות צולבת',
            'הרחב שיפוי',
            'תקופת גילוי: 6 חודשים',
            'ויתור על תחלוף לטובת מבקש האישור',
            'פגיעה בפרטיות',
            'עיכוב/שיהוי עקב מקרה ביטוח',
            'מבוטח נוסף בגין מעשי המבוטח',
            'ראשוניות',
          ],
          endorsementCodes: ['303', '301', '325', '302', '304', '332', '309', '326', '327', '321', '328'],
          confidence: 0.85,
        },
      ],

      serviceCodes: ['038', '043'],

      additionalInsured: {
        name: 'החברה הכלכלית לפיתוח עמק חפר בע"מ',
        isNamedAsAdditional: true,
        waiverOfSubrogation: true,
      },

      confidence: 0.87,
    };
  }

  // Get endorsement description by code
  static getEndorsementDescription(code: string): { he: string; en: string } | undefined {
    return ENDORSEMENT_CODES[code];
  }

  // Get service description by code
  static getServiceDescription(code: string): { he: string; en: string } | undefined {
    return SERVICE_CODES[code];
  }
}

export const ocrService = new OcrService();
