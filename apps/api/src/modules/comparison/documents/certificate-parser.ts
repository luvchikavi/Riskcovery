// @ts-nocheck
import mammoth from 'mammoth';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

// ============================================================
// Certificate Template Parser
//
// Parses Israeli insurance certificate templates (Word .docx format)
// to understand the field layout and structure.
// This information is then used by the OCR service to improve
// extraction accuracy from real certificate PDFs.
// ============================================================

/** Represents a single field in a certificate section */
export interface CertificateField {
  name: string;
  nameHe: string;
  type: 'text' | 'date' | 'number' | 'currency' | 'code' | 'boolean';
  required: boolean;
  pattern?: string; // Regex pattern for extraction
}

/** Represents a section of the certificate template */
export interface CertificateSection {
  name: string;
  nameHe: string;
  order: number;
  repeating: boolean; // e.g. policies section repeats per policy type
  fields: CertificateField[];
}

/** The full field map extracted from a certificate template */
export interface CertificateFieldMap {
  templateName: string;
  version: string;
  parsedAt: string;
  sections: CertificateSection[];
}

// Standard Israeli certificate field map (רשות שוק ההון format)
// Based on the regulated certificate format from the Capital Market Authority
const STANDARD_FIELD_MAP: CertificateFieldMap = {
  templateName: 'Israeli Insurance Certificate (Standard)',
  version: '2022',
  parsedAt: new Date().toISOString(),
  sections: [
    {
      name: 'header',
      nameHe: 'כותרת',
      order: 0,
      repeating: false,
      fields: [
        { name: 'certificateNumber', nameHe: 'אסמכתא', type: 'text', required: true, pattern: 'אסמכתא[:\\s]*(\\d+)' },
        { name: 'issueDate', nameHe: 'תאריך הנפקת האישור', type: 'date', required: true, pattern: 'תאריך הנפקת האישור[:\\s]*(\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4})' },
        { name: 'insurerName', nameHe: 'שם חברת הביטוח', type: 'text', required: true },
        { name: 'agentName', nameHe: 'שם סוכן הביטוח', type: 'text', required: false },
        { name: 'agentLicense', nameHe: 'מספר רישיון סוכן', type: 'text', required: false, pattern: 'רישיון[:\\s]*(\\d+)' },
      ],
    },
    {
      name: 'requester',
      nameHe: 'מבקש האישור',
      order: 1,
      repeating: false,
      fields: [
        { name: 'requesterName', nameHe: 'שם מבקש האישור', type: 'text', required: true, pattern: 'מבקש האישור(?:\\s*הראשי)?[:\\s]*(?:שם[:\\s]*)?([^\\n\\r,]+)' },
        { name: 'requesterId', nameHe: 'ת.ז./ח.פ. מבקש האישור', type: 'text', required: false, pattern: 'מבקש האישור[^]*?ת\\.?ז\\.?/ח\\.?פ\\.?[:\\s]*(\\d{9})' },
      ],
    },
    {
      name: 'insured',
      nameHe: 'המבוטח',
      order: 2,
      repeating: false,
      fields: [
        { name: 'insuredName', nameHe: 'שם המבוטח', type: 'text', required: true, pattern: 'שם המבוטח[:\\s]*([^\\n\\r]+)' },
        { name: 'insuredId', nameHe: 'ת.ז./ח.פ. המבוטח', type: 'text', required: true, pattern: 'ח\\.?פ\\.?[:\\s]*(\\d{9})' },
        { name: 'insuredAddress', nameHe: 'מען המבוטח', type: 'text', required: false, pattern: 'מען[:\\s]*([^\\n\\r]+)' },
      ],
    },
    {
      name: 'serviceDescription',
      nameHe: 'תיאור השירות',
      order: 3,
      repeating: false,
      fields: [
        { name: 'serviceCode', nameHe: 'קוד השירות', type: 'code', required: true, pattern: 'קוד(?:\\s*ה)?שירות[:\\s]*(\\d{2,3})' },
        { name: 'serviceDescription', nameHe: 'תיאור השירות', type: 'text', required: false },
      ],
    },
    {
      name: 'policies',
      nameHe: 'פוליסות',
      order: 4,
      repeating: true,
      fields: [
        { name: 'policyType', nameHe: 'ענף הביטוח', type: 'text', required: true },
        { name: 'policyNumber', nameHe: 'מספר הפוליסה', type: 'text', required: true, pattern: 'מספר[\\s]*(?:ה)?פוליסה[:\\s]*([\\d-]+)' },
        { name: 'coverageLimit', nameHe: 'גבול אחריות', type: 'currency', required: true, pattern: 'גבול אחריות[^]*?([\\d,]+)[\\s]*₪' },
        { name: 'deductible', nameHe: 'השתתפות עצמית', type: 'currency', required: false, pattern: 'השתתפות עצמית[^]*?([\\d,]+)' },
        { name: 'effectiveDate', nameHe: 'תאריך תחילה', type: 'date', required: true, pattern: 'תאריך תחילה[:\\s]*(\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4})' },
        { name: 'expirationDate', nameHe: 'תאריך סיום', type: 'date', required: true, pattern: 'תאריך סיום[:\\s]*(\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4})' },
        { name: 'retroactiveDate', nameHe: 'תאריך רטרו', type: 'date', required: false, pattern: 'תאריך רטרו[:\\s]*(\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4})' },
        { name: 'triggerBasis', nameHe: 'בסיס הכיסוי', type: 'text', required: false },
      ],
    },
    {
      name: 'endorsements',
      nameHe: 'הרחבות / כיסויים נוספים',
      order: 5,
      repeating: true,
      fields: [
        { name: 'endorsementCode', nameHe: 'קוד הרחבה', type: 'code', required: true, pattern: '\\b(3\\d{2}|4[0-3]\\d|440)\\b' },
        { name: 'endorsementDescription', nameHe: 'תיאור ההרחבה', type: 'text', required: false },
        { name: 'endorsementApplies', nameHe: 'חל/לא חל', type: 'boolean', required: true },
      ],
    },
    {
      name: 'specialConditions',
      nameHe: 'תנאים מיוחדים',
      order: 6,
      repeating: false,
      fields: [
        { name: 'additionalInsured', nameHe: 'מבוטח נוסף', type: 'boolean', required: false },
        { name: 'waiverOfSubrogation', nameHe: 'ויתור על תחלוף', type: 'boolean', required: false },
        { name: 'primaryInsurance', nameHe: 'ראשוניות', type: 'boolean', required: false },
      ],
    },
  ],
};

export class CertificateParser {
  /**
   * Get the standard Israeli certificate field map.
   * This is the baseline structure used for extraction.
   */
  getStandardFieldMap(): CertificateFieldMap {
    return STANDARD_FIELD_MAP;
  }

  /**
   * Parse a Word (.docx) template to extract the field structure.
   * Enriches the standard field map with any additional fields
   * found in the template.
   */
  async parseWordTemplate(filePath: string): Promise<CertificateFieldMap> {
    if (!existsSync(filePath)) {
      console.log(`Template file not found at ${filePath}, using standard field map`);
      return this.getStandardFieldMap();
    }

    const buffer = await readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    console.log(`Parsed Word template: ${filePath} (${text.length} chars)`);

    // Start from standard field map
    const fieldMap: CertificateFieldMap = {
      ...STANDARD_FIELD_MAP,
      templateName: `Parsed from: ${filePath.split('/').pop() || 'unknown'}`,
      parsedAt: new Date().toISOString(),
    };

    // Look for additional fields not in the standard map
    const additionalFields = this.detectAdditionalFields(text);
    if (additionalFields.length > 0) {
      fieldMap.sections.push({
        name: 'templateSpecific',
        nameHe: 'שדות ייחודיים לתבנית',
        order: 7,
        repeating: false,
        fields: additionalFields,
      });
    }

    return fieldMap;
  }

  /**
   * Parse all Word templates in a directory.
   * Returns the combined field map with fields from all templates.
   */
  async parseTemplateDirectory(dirPath: string): Promise<CertificateFieldMap> {
    if (!existsSync(dirPath)) {
      console.log(`Template directory not found at ${dirPath}, using standard field map`);
      return this.getStandardFieldMap();
    }

    const { readdirSync } = await import('node:fs');
    const files = readdirSync(dirPath).filter(
      (f) => f.endsWith('.docx') && !f.startsWith('~$')
    );

    if (files.length === 0) {
      console.log('No .docx files found in template directory');
      return this.getStandardFieldMap();
    }

    console.log(`Found ${files.length} template files to parse`);

    const allAdditionalFields: CertificateField[] = [];
    for (const file of files) {
      const fullPath = `${dirPath}/${file}`;
      const parsed = await this.parseWordTemplate(fullPath);
      const templateSection = parsed.sections.find((s) => s.name === 'templateSpecific');
      if (templateSection) {
        for (const field of templateSection.fields) {
          if (!allAdditionalFields.some((f) => f.name === field.name)) {
            allAdditionalFields.push(field);
          }
        }
      }
    }

    const combined = this.getStandardFieldMap();
    combined.templateName = `Combined from ${files.length} templates`;
    combined.parsedAt = new Date().toISOString();

    if (allAdditionalFields.length > 0) {
      combined.sections.push({
        name: 'templateSpecific',
        nameHe: 'שדות ייחודיים לתבניות',
        order: 7,
        repeating: false,
        fields: allAdditionalFields,
      });
    }

    return combined;
  }

  /**
   * Detect additional fields from template text that are not in the standard map.
   */
  private detectAdditionalFields(text: string): CertificateField[] {
    const fields: CertificateField[] = [];
    const standardFieldNames = STANDARD_FIELD_MAP.sections.flatMap((s) =>
      s.fields.map((f) => f.nameHe)
    );

    // Common Hebrew field label patterns (ending with colon or followed by empty space)
    const labelPattern = /([א-ת\s]{3,30})(?:\s*[:]\s*)/g;
    let match;
    while ((match = labelPattern.exec(text)) !== null) {
      const label = match[1]!.trim();
      // Skip if already known
      if (standardFieldNames.some((n) => label.includes(n) || n.includes(label))) {
        continue;
      }
      // Skip common non-field words
      if (['הערה', 'הערות', 'שים לב', 'חשוב', 'תנאי'].includes(label)) {
        continue;
      }
      // Add as discovered field
      if (!fields.some((f) => f.nameHe === label)) {
        const safeName = label.replace(/\s+/g, '_');
        fields.push({
          name: `custom_${safeName}`,
          nameHe: label,
          type: 'text',
          required: false,
        });
      }
    }

    return fields;
  }

  /**
   * Extract regex patterns from the field map for use in OCR extraction.
   * Returns a flat list of { fieldName, pattern } for all fields that have patterns.
   */
  getExtractionPatterns(fieldMap?: CertificateFieldMap): Array<{
    section: string;
    fieldName: string;
    fieldNameHe: string;
    pattern: RegExp;
    type: CertificateField['type'];
  }> {
    const map = fieldMap || STANDARD_FIELD_MAP;
    const patterns: Array<{
      section: string;
      fieldName: string;
      fieldNameHe: string;
      pattern: RegExp;
      type: CertificateField['type'];
    }> = [];

    for (const section of map.sections) {
      for (const field of section.fields) {
        if (field.pattern) {
          patterns.push({
            section: section.name,
            fieldName: field.name,
            fieldNameHe: field.nameHe,
            pattern: new RegExp(field.pattern, 'i'),
            type: field.type,
          });
        }
      }
    }

    return patterns;
  }
}

export const certificateParser = new CertificateParser();
