// Insurance Certificate types - data extracted from PDF
export interface ExtractedCertificateData {
  // Certificate metadata
  certificateNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  insurerName?: string;
  insurerNameHe?: string;
  agentName?: string;
  agentLicense?: string;

  // Insured party
  insuredName?: string;
  insuredId?: string; // Company ID (ח.פ)
  insuredAddress?: string;

  // Policies
  policies: ExtractedPolicy[];

  // Additional insured / certificate holder
  additionalInsured?: {
    name?: string;
    isNamedAsAdditional?: boolean;
    waiverOfSubrogation?: boolean;
  };

  // Raw extracted text for reference
  rawText?: string;
  confidence?: number;
}

export interface ExtractedPolicy {
  policyType: string;
  policyTypeHe?: string;
  policyNumber?: string;
  insurerName?: string;

  // Coverage details
  coverageLimit?: number;
  deductible?: number;

  // Dates
  effectiveDate?: string;
  expirationDate?: string;

  // Endorsements
  endorsements?: string[];

  // Special conditions
  conditions?: string[];

  // Confidence score for this extraction
  confidence?: number;
}

// Requirement Template types
export interface RequirementTemplate {
  id: string;
  name: string;
  nameHe: string;
  description?: string;
  descriptionHe?: string;

  // Context
  sector?: string;
  contractType?: string; // tender, service agreement, etc.

  // Required policies
  requirements: PolicyRequirement[];

  // Template metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyRequirement {
  id: string;
  policyType: string;
  policyTypeHe: string;

  // Required coverage
  minimumLimit: number;
  maximumDeductible?: number;

  // Required endorsements
  requiredEndorsements?: string[];

  // Additional insured requirements
  requireAdditionalInsured?: boolean;
  requireWaiverOfSubrogation?: boolean;

  // Validity requirements
  minimumValidityDays?: number;

  // Is this mandatory or recommended?
  isMandatory: boolean;

  // Notes
  notes?: string;
  notesHe?: string;
}

// Comparison Result types
export interface ComparisonResult {
  id: string;
  certificateId: string;
  requirementTemplateId: string;

  // Overall status
  overallStatus: ComplianceStatus;
  complianceScore: number; // 0-100

  // Per-policy results
  policyResults: PolicyComparisonResult[];

  // Summary
  totalRequirements: number;
  compliantCount: number;
  partialCount: number;
  nonCompliantCount: number;
  missingCount: number;

  // Timestamps
  analyzedAt: Date;
}

export interface PolicyComparisonResult {
  requirementId: string;
  policyType: string;
  policyTypeHe: string;

  // Status
  status: ComplianceStatus;

  // Found policy (if any)
  foundPolicy?: ExtractedPolicy;

  // Gaps identified
  gaps: ComplianceGap[];

  // Compliance details
  limitCompliant?: boolean;
  deductibleCompliant?: boolean;
  endorsementsCompliant?: boolean;
  validityCompliant?: boolean;
  additionalInsuredCompliant?: boolean;
}

export interface ComplianceGap {
  type: GapType;
  severity: 'critical' | 'major' | 'minor';

  // Description
  description: string;
  descriptionHe: string;

  // Values
  required?: string | number;
  found?: string | number;

  // Recommendation
  recommendation?: string;
  recommendationHe?: string;
}

export type ComplianceStatus =
  | 'compliant'      // Fully meets requirements
  | 'partial'        // Partially meets requirements
  | 'non_compliant'  // Does not meet requirements
  | 'missing'        // Required policy not found
  | 'expired'        // Policy expired
  | 'pending';       // Awaiting analysis

export type GapType =
  | 'missing_policy'
  | 'insufficient_limit'
  | 'excessive_deductible'
  | 'missing_endorsement'
  | 'missing_additional_insured'
  | 'missing_waiver_of_subrogation'
  | 'expired'
  | 'expiring_soon'
  | 'invalid_dates';

// Document upload types
export interface UploadedDocument {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;

  // Processing status
  status: DocumentStatus;

  // Extracted data (after OCR)
  extractedData?: ExtractedCertificateData;

  // Metadata
  uploadedAt: Date;
  processedAt?: Date;

  // Relations
  vendorId?: string;
  clientId?: string;
}

export type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'processed'
  | 'failed';

// API Request/Response types
export interface AnalyzeRequest {
  documentId: string;
  requirementTemplateId: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: ComparisonResult;
  error?: string;
}
