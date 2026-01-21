import { prisma } from '../../../lib/prisma.js';
import type {
  ExtractedCertificateData,
  ExtractedPolicy,
  ComparisonResult,
  PolicyComparisonResult,
  ComplianceGap,
  ComplianceStatus,
  GapType,
} from '../comparison.types.js';

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
          maximumDeductible: { toNumber(): number } | null;
          requiredEndorsements: unknown;
          requireAdditionalInsured: boolean;
          requireWaiverSubrogation: boolean;
          minimumValidityDays: number | null;
          isMandatory: boolean;
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

  // Compare a single policy requirement
  private comparePolicy(
    requirement: {
      id: string;
      policyType: string;
      policyTypeHe: string;
      minimumLimit: { toNumber(): number };
      maximumDeductible: { toNumber(): number } | null;
      requiredEndorsements: unknown;
      requireAdditionalInsured: boolean;
      requireWaiverSubrogation: boolean;
      minimumValidityDays: number | null;
      isMandatory: boolean;
    },
    extractedData: ExtractedCertificateData
  ): PolicyComparisonResult {
    // Find matching policy in extracted data
    const foundPolicy = extractedData.policies.find(
      (p) => p.policyType === requirement.policyType
    );

    const gaps: ComplianceGap[] = [];
    let status: ComplianceStatus = 'compliant';

    if (!foundPolicy) {
      // Policy not found
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
        gaps,
        limitCompliant: false,
      };
    }

    // Check coverage limit
    const requiredLimit = requirement.minimumLimit.toNumber();
    const limitCompliant = (foundPolicy.coverageLimit || 0) >= requiredLimit;

    if (!limitCompliant) {
      gaps.push({
        type: 'insufficient_limit',
        severity: 'critical',
        description: `Coverage limit is insufficient`,
        descriptionHe: `גבול הכיסוי אינו מספיק`,
        required: requiredLimit,
        found: foundPolicy.coverageLimit || 0,
        recommendation: `Increase coverage to at least ₪${requiredLimit.toLocaleString()}`,
        recommendationHe: `יש להגדיל את הכיסוי לפחות ל-₪${requiredLimit.toLocaleString()}`,
      });
      status = 'non_compliant';
    }

    // Check deductible
    let deductibleCompliant = true;
    if (requirement.maximumDeductible && foundPolicy.deductible) {
      const maxDeductible = requirement.maximumDeductible.toNumber();
      deductibleCompliant = foundPolicy.deductible <= maxDeductible;

      if (!deductibleCompliant) {
        gaps.push({
          type: 'excessive_deductible',
          severity: 'major',
          description: `Deductible exceeds maximum allowed`,
          descriptionHe: `ההשתתפות העצמית עולה על המותר`,
          required: maxDeductible,
          found: foundPolicy.deductible,
          recommendation: `Reduce deductible to maximum ₪${maxDeductible.toLocaleString()}`,
          recommendationHe: `יש להפחית את ההשתתפות העצמית למקסימום ₪${maxDeductible.toLocaleString()}`,
        });
        if (status === 'compliant') status = 'partial';
      }
    }

    // Check required endorsements
    const requiredEndorsements = (requirement.requiredEndorsements as string[]) || [];
    const foundEndorsements = foundPolicy.endorsements || [];
    let endorsementsCompliant = true;

    for (const reqEndorsement of requiredEndorsements) {
      const hasEndorsement = foundEndorsements.some(
        (e) => e.toLowerCase().includes(reqEndorsement.toLowerCase())
      );

      if (!hasEndorsement) {
        endorsementsCompliant = false;
        gaps.push({
          type: 'missing_endorsement',
          severity: 'major',
          description: `Required endorsement "${reqEndorsement}" not found`,
          descriptionHe: `הרחבה נדרשת "${reqEndorsement}" לא נמצאה`,
          required: reqEndorsement,
          recommendation: `Add "${reqEndorsement}" endorsement to policy`,
          recommendationHe: `יש להוסיף את ההרחבה "${reqEndorsement}" לפוליסה`,
        });
        if (status === 'compliant') status = 'partial';
      }
    }

    // Check additional insured
    let additionalInsuredCompliant = true;
    if (requirement.requireAdditionalInsured) {
      additionalInsuredCompliant = extractedData.additionalInsured?.isNamedAsAdditional || false;

      if (!additionalInsuredCompliant) {
        gaps.push({
          type: 'missing_additional_insured',
          severity: 'major',
          description: `Certificate holder not named as additional insured`,
          descriptionHe: `מזמין העבודה לא רשום כמבוטח נוסף`,
          recommendation: `Request to be added as additional insured`,
          recommendationHe: `יש לבקש להירשם כמבוטח נוסף`,
        });
        if (status === 'compliant') status = 'partial';
      }
    }

    // Check waiver of subrogation
    if (requirement.requireWaiverSubrogation) {
      const waiverCompliant = extractedData.additionalInsured?.waiverOfSubrogation || false;

      if (!waiverCompliant) {
        gaps.push({
          type: 'missing_waiver_of_subrogation',
          severity: 'major',
          description: `Waiver of subrogation not included`,
          descriptionHe: `ויתור על זכות התחלוף לא כלול`,
          recommendation: `Request waiver of subrogation clause`,
          recommendationHe: `יש לבקש סעיף ויתור על זכות התחלוף`,
        });
        if (status === 'compliant') status = 'partial';
      }
    }

    // Check validity dates
    let validityCompliant = true;
    if (foundPolicy.expirationDate) {
      const expiry = new Date(foundPolicy.expirationDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        validityCompliant = false;
        gaps.push({
          type: 'expired',
          severity: 'critical',
          description: `Policy has expired`,
          descriptionHe: `הפוליסה פגה`,
          found: foundPolicy.expirationDate,
          recommendation: `Renew policy immediately`,
          recommendationHe: `יש לחדש את הפוליסה באופן מיידי`,
        });
        status = 'expired';
      } else if (
        requirement.minimumValidityDays &&
        daysUntilExpiry < requirement.minimumValidityDays
      ) {
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
        if (status === 'compliant') status = 'partial';
      }
    }

    return {
      requirementId: requirement.id,
      policyType: requirement.policyType,
      policyTypeHe: requirement.policyTypeHe,
      status,
      foundPolicy,
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
