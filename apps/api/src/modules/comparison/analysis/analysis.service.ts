import { prisma } from '../../../lib/prisma.js';
import type {
  ExtractedCertificateData,
  ExtractedPolicy,
  ComparisonResult,
  PolicyComparisonResult,
  ComplianceGap,
  ComplianceStatus,
  GapType,
  ComparisonRow,
  ComparisonFieldStatus,
} from '../comparison.types.js';
import { ENDORSEMENT_CODES } from '../documents/ocr.service.js';

export class AnalysisService {
  // Run comparison analysis
  async analyze(
    documentId: string,
    templateId: string
  ): Promise<ComparisonResult> {
    // Get document with extracted data
    const document = await prisma.comparisonDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.extractedData) {
      throw new Error('Document has not been processed yet');
    }

    // Get template with requirements
    const template = await prisma.comparisonTemplate.findUnique({
      where: { id: templateId },
      include: { requirements: true },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const extractedData = document.extractedData as unknown as ExtractedCertificateData;

    // Compare each requirement against extracted policies
    const policyResults: PolicyComparisonResult[] = [];
    let compliantCount = 0;
    let partialCount = 0;
    let nonCompliantCount = 0;
    let missingCount = 0;

    for (const requirement of template.requirements) {
      const result = this.comparePolicy(
        requirement as {
          id: string;
          policyType: string;
          policyTypeHe: string;
          minimumLimit: { toNumber(): number };
          minimumLimitPerPeriod?: { toNumber(): number } | null;
          minimumLimitPerOccurrence?: { toNumber(): number } | null;
          maximumDeductible: { toNumber(): number } | null;
          requiredEndorsements: unknown;
          requireAdditionalInsured: boolean;
          requireWaiverSubrogation: boolean;
          minimumValidityDays: number | null;
          isMandatory: boolean;
          policyWording?: string | null;
          currency?: string | null;
        },
        extractedData
      );

      policyResults.push(result);

      switch (result.status) {
        case 'compliant':
          compliantCount++;
          break;
        case 'partial':
          partialCount++;
          break;
        case 'non_compliant':
          nonCompliantCount++;
          break;
        case 'missing':
          missingCount++;
          break;
      }
    }

    // Calculate overall status and score
    const totalRequirements = template.requirements.length;
    const complianceScore = Math.round(
      ((compliantCount + partialCount * 0.5) / totalRequirements) * 100
    );

    let overallStatus: ComplianceStatus = 'compliant';
    if (missingCount > 0 || nonCompliantCount > 0) {
      overallStatus = 'non_compliant';
    } else if (partialCount > 0) {
      overallStatus = 'partial';
    }

    // Save analysis result
    const analysis = await prisma.comparisonAnalysis.create({
      data: {
        documentId,
        templateId,
        overallStatus,
        complianceScore,
        results: policyResults as unknown as object,
      },
    });

    return {
      id: analysis.id,
      certificateId: documentId,
      requirementTemplateId: templateId,
      overallStatus,
      complianceScore,
      policyResults,
      totalRequirements,
      compliantCount,
      partialCount,
      nonCompliantCount,
      missingCount,
      analyzedAt: analysis.analyzedAt,
    };
  }

  // Compare a single policy requirement — builds field-by-field ComparisonRow[]
  private comparePolicy(
    requirement: {
      id: string;
      policyType: string;
      policyTypeHe: string;
      minimumLimit: { toNumber(): number };
      minimumLimitPerPeriod?: { toNumber(): number } | null;
      minimumLimitPerOccurrence?: { toNumber(): number } | null;
      maximumDeductible: { toNumber(): number } | null;
      requiredEndorsements: unknown;
      requireAdditionalInsured: boolean;
      requireWaiverSubrogation: boolean;
      minimumValidityDays: number | null;
      isMandatory: boolean;
      policyWording?: string | null;
      currency?: string | null;
    },
    extractedData: ExtractedCertificateData
  ): PolicyComparisonResult {
    const rows: ComparisonRow[] = [];
    const gaps: ComplianceGap[] = [];

    // Find matching policy in extracted data
    const foundPolicy = extractedData.policies.find(
      (p) => p.policyType === requirement.policyType
    );

    // Row 1: Policy Type (found?)
    const policyFound = !!foundPolicy;
    rows.push({
      fieldName: 'policyType',
      fieldNameHe: 'סוג ביטוח',
      policyType: requirement.policyType,
      policyTypeHe: requirement.policyTypeHe,
      required: requirement.policyTypeHe,
      submitted: foundPolicy ? foundPolicy.policyTypeHe || foundPolicy.policyType : null,
      status: policyFound ? 'PASS' : 'MISSING',
      severity: requirement.isMandatory ? 'critical' : 'major',
    });

    if (!policyFound) {
      gaps.push({
        type: 'missing_policy',
        severity: requirement.isMandatory ? 'critical' : 'major',
        description: `Required policy "${requirement.policyType}" not found in certificate`,
        descriptionHe: `פוליסת "${requirement.policyTypeHe}" הנדרשת לא נמצאה באישור`,
        recommendation: `Obtain ${requirement.policyType} coverage`,
        recommendationHe: `יש להשיג כיסוי ${requirement.policyTypeHe}`,
      });

      return {
        requirementId: requirement.id,
        policyType: requirement.policyType,
        policyTypeHe: requirement.policyTypeHe,
        status: 'missing',
        rows,
        gaps,
        limitCompliant: false,
      };
    }

    // Row 2: Limit Per Period
    const reqLimitPerPeriod = requirement.minimumLimitPerPeriod?.toNumber() ?? requirement.minimumLimit.toNumber();
    const subLimitPerPeriod = foundPolicy.coverageLimitPerPeriod ?? foundPolicy.coverageLimit ?? 0;
    const limitPerPeriodOk = subLimitPerPeriod >= reqLimitPerPeriod;
    rows.push({
      fieldName: 'limitPerPeriod',
      fieldNameHe: 'גבול אחריות לתקופה',
      policyType: requirement.policyType,
      policyTypeHe: requirement.policyTypeHe,
      required: reqLimitPerPeriod,
      submitted: subLimitPerPeriod || null,
      status: subLimitPerPeriod === 0 ? 'MISSING' : limitPerPeriodOk ? 'PASS' : 'FAIL',
      severity: 'critical',
    });
    if (!limitPerPeriodOk) {
      gaps.push({
        type: 'insufficient_limit_per_period',
        severity: 'critical',
        description: `Coverage limit per period is insufficient`,
        descriptionHe: `גבול הכיסוי לתקופה אינו מספיק`,
        required: reqLimitPerPeriod,
        found: subLimitPerPeriod,
        recommendation: `Increase per-period coverage to at least ₪${reqLimitPerPeriod.toLocaleString()}`,
        recommendationHe: `יש להגדיל את גבול הכיסוי לתקופה לפחות ל-₪${reqLimitPerPeriod.toLocaleString()}`,
      });
    }

    // Row 3: Limit Per Occurrence
    const reqLimitPerOccurrence = requirement.minimumLimitPerOccurrence?.toNumber() ?? requirement.minimumLimit.toNumber();
    const subLimitPerOccurrence = foundPolicy.coverageLimitPerOccurrence ?? foundPolicy.coverageLimit ?? 0;
    const limitPerOccurrenceOk = subLimitPerOccurrence >= reqLimitPerOccurrence;
    rows.push({
      fieldName: 'limitPerOccurrence',
      fieldNameHe: 'גבול אחריות למקרה',
      policyType: requirement.policyType,
      policyTypeHe: requirement.policyTypeHe,
      required: reqLimitPerOccurrence,
      submitted: subLimitPerOccurrence || null,
      status: subLimitPerOccurrence === 0 ? 'MISSING' : limitPerOccurrenceOk ? 'PASS' : 'FAIL',
      severity: 'critical',
    });
    if (!limitPerOccurrenceOk) {
      gaps.push({
        type: 'insufficient_limit_per_occurrence',
        severity: 'critical',
        description: `Coverage limit per occurrence is insufficient`,
        descriptionHe: `גבול הכיסוי למקרה אינו מספיק`,
        required: reqLimitPerOccurrence,
        found: subLimitPerOccurrence,
        recommendation: `Increase per-occurrence coverage to at least ₪${reqLimitPerOccurrence.toLocaleString()}`,
        recommendationHe: `יש להגדיל את גבול הכיסוי למקרה לפחות ל-₪${reqLimitPerOccurrence.toLocaleString()}`,
      });
    }

    const limitCompliant = limitPerPeriodOk && limitPerOccurrenceOk;

    // Row 4: Policy Wording
    if (requirement.policyWording) {
      const subWording = foundPolicy.policyWording || null;
      const wordingOk = subWording ? subWording.includes(requirement.policyWording) || requirement.policyWording.includes(subWording) : false;
      rows.push({
        fieldName: 'policyWording',
        fieldNameHe: 'נוסח ומהדורת פוליסה',
        policyType: requirement.policyType,
        policyTypeHe: requirement.policyTypeHe,
        required: requirement.policyWording,
        submitted: subWording,
        status: !subWording ? 'MISSING' : wordingOk ? 'PASS' : 'FAIL',
        severity: 'major',
      });
      if (!wordingOk) {
        gaps.push({
          type: 'wrong_policy_wording',
          severity: 'major',
          description: `Policy wording mismatch`,
          descriptionHe: `אי התאמה בנוסח הפוליסה`,
          required: requirement.policyWording,
          found: subWording || '—',
          recommendation: `Use "${requirement.policyWording}" policy wording`,
          recommendationHe: `יש להשתמש בנוסח פוליסה "${requirement.policyWording}"`,
        });
      }
    }

    // Row 5: Currency
    const reqCurrency = requirement.currency || 'ILS';
    const subCurrency = foundPolicy.currency || 'ILS';
    const currencyOk = reqCurrency === subCurrency;
    rows.push({
      fieldName: 'currency',
      fieldNameHe: 'מטבע',
      policyType: requirement.policyType,
      policyTypeHe: requirement.policyTypeHe,
      required: reqCurrency,
      submitted: subCurrency,
      status: currencyOk ? 'PASS' : 'FAIL',
      severity: 'major',
    });
    if (!currencyOk) {
      gaps.push({
        type: 'wrong_currency',
        severity: 'major',
        description: `Currency mismatch`,
        descriptionHe: `אי התאמה במטבע`,
        required: reqCurrency,
        found: subCurrency,
        recommendation: `Policy must be in ${reqCurrency}`,
        recommendationHe: `הפוליסה חייבת להיות במטבע ${reqCurrency}`,
      });
    }

    // Row 6: Deductible
    let deductibleCompliant = true;
    if (requirement.maximumDeductible) {
      const maxDeductible = requirement.maximumDeductible.toNumber();
      const subDeductible = foundPolicy.deductible ?? 0;
      deductibleCompliant = subDeductible <= maxDeductible;
      rows.push({
        fieldName: 'deductible',
        fieldNameHe: 'השתתפות עצמית',
        policyType: requirement.policyType,
        policyTypeHe: requirement.policyTypeHe,
        required: maxDeductible,
        submitted: subDeductible,
        status: deductibleCompliant ? 'PASS' : 'FAIL',
        severity: 'major',
      });
      if (!deductibleCompliant) {
        gaps.push({
          type: 'excessive_deductible',
          severity: 'major',
          description: `Deductible exceeds maximum allowed`,
          descriptionHe: `ההשתתפות העצמית עולה על המותר`,
          required: maxDeductible,
          found: subDeductible,
          recommendation: `Reduce deductible to maximum ₪${maxDeductible.toLocaleString()}`,
          recommendationHe: `יש להפחית את ההשתתפות העצמית למקסימום ₪${maxDeductible.toLocaleString()}`,
        });
      }
    }

    // Row 7: Effective Date
    rows.push({
      fieldName: 'effectiveDate',
      fieldNameHe: 'תאריך תחילה',
      policyType: requirement.policyType,
      policyTypeHe: requirement.policyTypeHe,
      required: null,
      submitted: foundPolicy.effectiveDate || null,
      status: foundPolicy.effectiveDate ? 'PASS' : 'MISSING',
      severity: 'minor',
    });

    // Row 8: Expiration Date
    let validityCompliant = true;
    let expirationStatus: ComparisonFieldStatus = 'PASS';
    if (foundPolicy.expirationDate) {
      const expiry = new Date(foundPolicy.expirationDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        validityCompliant = false;
        expirationStatus = 'FAIL';
        gaps.push({
          type: 'expired',
          severity: 'critical',
          description: `Policy has expired`,
          descriptionHe: `הפוליסה פגה`,
          found: foundPolicy.expirationDate,
          recommendation: `Renew policy immediately`,
          recommendationHe: `יש לחדש את הפוליסה באופן מיידי`,
        });
      } else if (requirement.minimumValidityDays && daysUntilExpiry < requirement.minimumValidityDays) {
        expirationStatus = 'PARTIAL';
        gaps.push({
          type: 'expiring_soon',
          severity: 'minor',
          description: `Policy expires in ${daysUntilExpiry} days`,
          descriptionHe: `הפוליסה פגה בעוד ${daysUntilExpiry} ימים`,
          required: requirement.minimumValidityDays,
          found: daysUntilExpiry,
          recommendation: `Renew policy before expiration`,
          recommendationHe: `יש לחדש את הפוליסה לפני פקיעתה`,
        });
      }
    } else {
      expirationStatus = 'MISSING';
    }
    rows.push({
      fieldName: 'expirationDate',
      fieldNameHe: 'תאריך סיום',
      policyType: requirement.policyType,
      policyTypeHe: requirement.policyTypeHe,
      required: requirement.minimumValidityDays ? `${requirement.minimumValidityDays} ימים לפחות` : null,
      submitted: foundPolicy.expirationDate || null,
      status: expirationStatus,
      severity: expirationStatus === 'FAIL' ? 'critical' : 'minor',
    });

    // Row 9: Retroactive Date (for claims-made policies like PROFESSIONAL_INDEMNITY)
    const claimsMadePolicies = ['PROFESSIONAL_INDEMNITY', 'D_AND_O', 'CYBER_LIABILITY'];
    if (claimsMadePolicies.includes(requirement.policyType)) {
      const hasRetro = !!foundPolicy.retroactiveDate;
      rows.push({
        fieldName: 'retroactiveDate',
        fieldNameHe: 'תאריך רטרואקטיבי',
        policyType: requirement.policyType,
        policyTypeHe: requirement.policyTypeHe,
        required: 'נדרש',
        submitted: foundPolicy.retroactiveDate || null,
        status: hasRetro ? 'PASS' : 'MISSING',
        severity: 'major',
      });
      if (!hasRetro) {
        gaps.push({
          type: 'missing_retroactive_date',
          severity: 'major',
          description: `Retroactive date missing for claims-made policy`,
          descriptionHe: `תאריך רטרואקטיבי חסר לפוליסת תביעות`,
          recommendation: `Add retroactive date to policy`,
          recommendationHe: `יש להוסיף תאריך רטרואקטיבי לפוליסה`,
        });
      }
    }

    // Rows 10+: Required endorsements — compare by code
    const requiredEndorsements = (requirement.requiredEndorsements as string[]) || [];
    const foundCodes = foundPolicy.endorsementCodes || [];
    let endorsementsCompliant = true;

    for (const reqCode of requiredEndorsements) {
      // Check if this is a 3-digit code or a text description
      const isCode = /^\d{3}$/.test(reqCode);
      let hasIt = false;

      if (isCode) {
        hasIt = foundCodes.includes(reqCode);
      } else {
        // Fall back to text matching on endorsements[]
        const foundEndorsements = foundPolicy.endorsements || [];
        hasIt = foundEndorsements.some((e) => e.toLowerCase().includes(reqCode.toLowerCase()));
        // Also try code lookup
        if (!hasIt) {
          hasIt = foundCodes.includes(reqCode);
        }
      }

      const desc = isCode ? (ENDORSEMENT_CODES[reqCode]?.he || reqCode) : reqCode;

      rows.push({
        fieldName: `endorsement_${reqCode}`,
        fieldNameHe: `הרחבה ${reqCode} - ${desc}`,
        policyType: requirement.policyType,
        policyTypeHe: requirement.policyTypeHe,
        required: desc,
        submitted: hasIt ? desc : null,
        status: hasIt ? 'PASS' : 'FAIL',
        severity: 'major',
      });

      if (!hasIt) {
        endorsementsCompliant = false;
        gaps.push({
          type: 'missing_endorsement',
          severity: 'major',
          description: `Required endorsement "${reqCode}" not found`,
          descriptionHe: `הרחבה נדרשת "${desc}" לא נמצאה`,
          required: reqCode,
          recommendation: `Add endorsement "${desc}" to policy`,
          recommendationHe: `יש להוסיף את ההרחבה "${desc}" לפוליסה`,
        });
      }
    }

    // Row N: Additional Insured
    let additionalInsuredCompliant = true;
    if (requirement.requireAdditionalInsured) {
      additionalInsuredCompliant = extractedData.additionalInsured?.isNamedAsAdditional || false;
      rows.push({
        fieldName: 'additionalInsured',
        fieldNameHe: 'מבוטח נוסף',
        policyType: requirement.policyType,
        policyTypeHe: requirement.policyTypeHe,
        required: 'נדרש',
        submitted: additionalInsuredCompliant ? 'קיים' : null,
        status: additionalInsuredCompliant ? 'PASS' : 'FAIL',
        severity: 'major',
      });
      if (!additionalInsuredCompliant) {
        gaps.push({
          type: 'missing_additional_insured',
          severity: 'major',
          description: `Certificate holder not named as additional insured`,
          descriptionHe: `מזמין העבודה לא רשום כמבוטח נוסף`,
          recommendation: `Request to be added as additional insured`,
          recommendationHe: `יש לבקש להירשם כמבוטח נוסף`,
        });
      }
    }

    // Row N+1: Waiver of Subrogation
    if (requirement.requireWaiverSubrogation) {
      const waiverOk = extractedData.additionalInsured?.waiverOfSubrogation || false;
      rows.push({
        fieldName: 'waiverOfSubrogation',
        fieldNameHe: 'ויתור על זכות תחלוף',
        policyType: requirement.policyType,
        policyTypeHe: requirement.policyTypeHe,
        required: 'נדרש',
        submitted: waiverOk ? 'קיים' : null,
        status: waiverOk ? 'PASS' : 'FAIL',
        severity: 'major',
      });
      if (!waiverOk) {
        gaps.push({
          type: 'missing_waiver_of_subrogation',
          severity: 'major',
          description: `Waiver of subrogation not included`,
          descriptionHe: `ויתור על זכות התחלוף לא כלול`,
          recommendation: `Request waiver of subrogation clause`,
          recommendationHe: `יש לבקש סעיף ויתור על זכות התחלוף`,
        });
      }
    }

    // Derive overall status from rows
    let status: ComplianceStatus = 'compliant';
    const hasFail = rows.some((r) => r.status === 'FAIL' && r.severity === 'critical');
    const hasNonCriticalFail = rows.some((r) => r.status === 'FAIL' && r.severity !== 'critical');
    const hasPartial = rows.some((r) => r.status === 'PARTIAL');
    const hasMissing = rows.some((r) => r.status === 'MISSING' && r.severity === 'critical');

    if (hasFail || hasMissing) {
      status = 'non_compliant';
    } else if (hasNonCriticalFail || hasPartial) {
      status = 'partial';
    }

    // Check if expired overrides
    if (gaps.some((g) => g.type === 'expired')) {
      status = 'expired';
    }

    return {
      requirementId: requirement.id,
      policyType: requirement.policyType,
      policyTypeHe: requirement.policyTypeHe,
      status,
      foundPolicy,
      rows,
      gaps,
      limitCompliant,
      deductibleCompliant,
      endorsementsCompliant,
      validityCompliant,
      additionalInsuredCompliant,
    };
  }

  // Get analysis by ID
  async getAnalysis(id: string) {
    return prisma.comparisonAnalysis.findUnique({
      where: { id },
      include: {
        document: true,
        template: {
          include: { requirements: true },
        },
      },
    });
  }

  // Get analyses for a document
  async getDocumentAnalyses(documentId: string) {
    return prisma.comparisonAnalysis.findMany({
      where: { documentId },
      include: {
        template: true,
      },
      orderBy: { analyzedAt: 'desc' },
    });
  }

  // Delete analysis
  async deleteAnalysis(id: string) {
    try {
      await prisma.comparisonAnalysis.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const analysisService = new AnalysisService();
