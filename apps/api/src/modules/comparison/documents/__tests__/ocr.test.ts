import { describe, it, expect } from 'vitest';
import { OcrService, normalizePolicyType } from '../ocr.service.js';

const ocr = new OcrService();

describe('OcrService.parseOcrText — amount extraction', () => {
  it('extracts ₪-prefixed amounts correctly', () => {
    const text = `
      צד שלישי
      גבול אחריות לתקופה: 5,000,000 ₪
      גבול אחריות למקרה: 2,000,000 ₪
    `;
    const result = ocr.parseOcrText(text);
    const policy = result.policies.find(p => p.policyType === 'GENERAL_LIABILITY');
    expect(policy).toBeDefined();
    expect(policy!.coverageLimitPerPeriod).toBe(5_000_000);
    expect(policy!.coverageLimitPerOccurrence).toBe(2_000_000);
  });

  it('extracts million pattern amounts', () => {
    const text = `
      חבות מעבידים
      גבול אחריות: 10 מיליון
    `;
    const result = ocr.parseOcrText(text);
    const policy = result.policies.find(p => p.policyType === 'EMPLOYER_LIABILITY');
    expect(policy).toBeDefined();
    expect(policy!.coverageLimitPerPeriod).toBe(10_000_000);
  });

  it('does NOT confuse policy numbers with coverage amounts', () => {
    const text = `
      צד שלישי
      מספר פוליסה: 25-081-630-1055058
      גבול אחריות לתקופה: 2,000,000 ₪
      גבול אחריות למקרה: 2,000,000 ₪
    `;
    const result = ocr.parseOcrText(text);
    const policy = result.policies.find(p => p.policyType === 'GENERAL_LIABILITY');
    expect(policy).toBeDefined();
    // Should NOT extract 1055058 as a coverage amount
    expect(policy!.coverageLimitPerPeriod).toBe(2_000_000);
    expect(policy!.coverageLimitPerOccurrence).toBe(2_000_000);
    // Policy number should be extracted correctly
    expect(policy!.policyNumber).toBe('25-081-630-1055058');
  });

  it('does NOT extract IDs preceded by ח.פ. as amounts', () => {
    const text = `
      צד שלישי
      ח.פ. 511150397
      גבול אחריות: 5,000,000 ₪
    `;
    const result = ocr.parseOcrText(text);
    const policy = result.policies.find(p => p.policyType === 'GENERAL_LIABILITY');
    expect(policy).toBeDefined();
    expect(policy!.coverageLimitPerPeriod).toBe(5_000_000);
  });

  it('extracts deductible correctly', () => {
    const text = `
      צד שלישי
      גבול אחריות: 5,000,000 ₪
      השתתפות עצמית: 2,500
    `;
    const result = ocr.parseOcrText(text);
    const policy = result.policies.find(p => p.policyType === 'GENERAL_LIABILITY');
    expect(policy).toBeDefined();
    expect(policy!.deductible).toBe(2_500);
  });
});

describe('OcrService.parseOcrText — section boundaries', () => {
  it('does not bleed amounts from one policy section to another', () => {
    const text = `
      צד שלישי
      גבול אחריות לתקופה: 5,000,000 ₪
      גבול אחריות למקרה: 2,000,000 ₪

      חבות מעבידים
      גבול אחריות לתקופה: 20,000,000 ₪
      גבול אחריות למקרה: 10,000,000 ₪
    `;
    const result = ocr.parseOcrText(text);
    const gl = result.policies.find(p => p.policyType === 'GENERAL_LIABILITY');
    const el = result.policies.find(p => p.policyType === 'EMPLOYER_LIABILITY');

    expect(gl).toBeDefined();
    expect(gl!.coverageLimitPerPeriod).toBe(5_000_000);
    expect(gl!.coverageLimitPerOccurrence).toBe(2_000_000);

    expect(el).toBeDefined();
    expect(el!.coverageLimitPerPeriod).toBe(20_000_000);
    expect(el!.coverageLimitPerOccurrence).toBe(10_000_000);
  });
});

describe('OcrService.parseOcrText — endorsement codes', () => {
  it('extracts endorsement codes from section text', () => {
    const text = `
      צד שלישי
      גבול אחריות: 5,000,000 ₪
      הרחבות: 302, 309, 321, 328
    `;
    const result = ocr.parseOcrText(text);
    const policy = result.policies.find(p => p.policyType === 'GENERAL_LIABILITY');
    expect(policy).toBeDefined();
    expect(policy!.endorsementCodes).toContain('302');
    expect(policy!.endorsementCodes).toContain('309');
    expect(policy!.endorsementCodes).toContain('321');
    expect(policy!.endorsementCodes).toContain('328');
  });

  it('does not assign endorsements from other policy sections', () => {
    const text = `
      צד שלישי
      גבול אחריות: 5,000,000 ₪
      הרחבות: 302, 309

      חבות מעבידים
      גבול אחריות: 10,000,000 ₪
      הרחבות: 319, 350
    `;
    const result = ocr.parseOcrText(text);
    const gl = result.policies.find(p => p.policyType === 'GENERAL_LIABILITY');
    const el = result.policies.find(p => p.policyType === 'EMPLOYER_LIABILITY');

    expect(gl).toBeDefined();
    expect(gl!.endorsementCodes).toContain('302');
    expect(gl!.endorsementCodes).toContain('309');
    expect(gl!.endorsementCodes).not.toContain('319');
    expect(gl!.endorsementCodes).not.toContain('350');

    expect(el).toBeDefined();
    expect(el!.endorsementCodes).toContain('319');
    expect(el!.endorsementCodes).toContain('350');
    expect(el!.endorsementCodes).not.toContain('302');
  });
});

describe('OcrService.parseOcrText — metadata', () => {
  it('extracts insurer name', () => {
    const text = `
      הפניקס חברה לביטוח בע"מ
      צד שלישי
      גבול אחריות: 2,000,000 ₪
    `;
    const result = ocr.parseOcrText(text);
    expect(result.insurerName).toBe('הפניקס');
  });

  it('extracts certificate number', () => {
    const text = `
      אסמכתא: 000050229
      צד שלישי
      גבול אחריות: 2,000,000 ₪
    `;
    const result = ocr.parseOcrText(text);
    expect(result.certificateNumber).toBe('000050229');
  });

  it('detects additional insured from endorsement codes', () => {
    const text = `
      צד שלישי
      גבול אחריות: 2,000,000 ₪
      הרחבות: 318, 309
    `;
    const result = ocr.parseOcrText(text);
    expect(result.additionalInsured?.isNamedAsAdditional).toBe(true);
    expect(result.additionalInsured?.waiverOfSubrogation).toBe(true);
  });
});

describe('normalizePolicyType', () => {
  it('returns exact enum match as-is', () => {
    expect(normalizePolicyType('GENERAL_LIABILITY')).toBe('GENERAL_LIABILITY');
    expect(normalizePolicyType('EMPLOYER_LIABILITY')).toBe('EMPLOYER_LIABILITY');
    expect(normalizePolicyType('PROFESSIONAL_INDEMNITY')).toBe('PROFESSIONAL_INDEMNITY');
  });

  it('normalizes Hebrew names to enum values', () => {
    expect(normalizePolicyType('צד שלישי')).toBe('GENERAL_LIABILITY');
    expect(normalizePolicyType('חבות מעבידים')).toBe('EMPLOYER_LIABILITY');
    expect(normalizePolicyType('אחריות מקצועית')).toBe('PROFESSIONAL_INDEMNITY');
  });

  it('normalizes Hebrew aliases', () => {
    expect(normalizePolicyType('צד ג\'')).toBe('GENERAL_LIABILITY');
    expect(normalizePolicyType('ביטוח קבלנים')).toBe('CONTRACTOR_ALL_RISKS');
  });

  it('normalizes spaced English to underscored uppercase', () => {
    expect(normalizePolicyType('General Liability')).toBe('GENERAL_LIABILITY');
    expect(normalizePolicyType('Employer Liability')).toBe('EMPLOYER_LIABILITY');
  });

  it('normalizes partial English keywords', () => {
    expect(normalizePolicyType('Third Party Liability')).toBe('GENERAL_LIABILITY');
    expect(normalizePolicyType('employer insurance')).toBe('EMPLOYER_LIABILITY');
    expect(normalizePolicyType('professional liability')).toBe('PROFESSIONAL_INDEMNITY');
    expect(normalizePolicyType('cyber risk')).toBe('CYBER_LIABILITY');
  });

  it('handles undefined/empty input', () => {
    expect(normalizePolicyType(undefined)).toBe('UNKNOWN');
    expect(normalizePolicyType('')).toBe('UNKNOWN');
  });
});
