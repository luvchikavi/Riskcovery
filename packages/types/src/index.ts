// ==================== API Response Types ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ==================== User Types ====================

export type UserRole =
  | 'ADMIN'
  | 'COMPLIANCE_MANAGER'
  | 'CONTRACT_MANAGER'
  | 'REVIEWER'
  | 'EXPERT_REVIEWER';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string | null;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Vendor Types ====================

export type VendorStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Vendor {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  vendorType: string | null;
  companyId: string | null;
  status: VendorStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Document Types ====================

export type DocumentStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'AI_COMPLETE'
  | 'REVIEW_NEEDED'
  | 'VERIFIED'
  | 'REJECTED';

export interface Document {
  id: string;
  vendorId: string;
  fileName: string;
  originalName: string;
  s3Key: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  aiConfidence: number | null;
  createdAt: Date;
}

// ==================== Compliance Types ====================

export type ComplianceStatus = 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' | 'PENDING';

export interface ComplianceResult {
  id: string;
  vendorId: string;
  requirementId: string;
  coverageId: string | null;
  status: ComplianceStatus;
  gapDetails: GapDetail[] | null;
  checkedAt: Date;
}

export interface GapDetail {
  type: 'INSUFFICIENT_LIMIT' | 'EXPIRED' | 'EXPIRING_SOON' | 'MISSING_ENDORSEMENT' | 'MISSING_POLICY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  required?: number;
  actual?: number;
  shortfall?: number;
  daysExpired?: number;
  daysRemaining?: number;
  endorsement?: string;
  policyType?: string;
  reason?: string;
}

// ==================== Insurance Types ====================

export type PolicyType =
  | 'GENERAL_LIABILITY'
  | 'PROFESSIONAL_INDEMNITY'
  | 'WORKERS_COMPENSATION'
  | 'EMPLOYER_LIABILITY'
  | 'PROPERTY'
  | 'PRODUCT_LIABILITY'
  | 'CYBER_LIABILITY'
  | 'D_AND_O'
  | 'CAR_INSURANCE'
  | 'FOREIGN_LIABILITY'
  | 'UNKNOWN';

export interface ExtractedCoverage {
  id: string;
  documentId: string;
  policyType: PolicyType;
  policyNumber: string | null;
  insurerName: string | null;
  insuredName: string | null;
  effectiveDate: Date | null;
  expirationDate: Date | null;
  limitAmount: number | null;
  currency: string;
  deductible: number | null;
  endorsements: string[];
  additionalInsured: boolean;
  waiverOfSubrogation: boolean;
  aiConfidence: number | null;
  isVerified: boolean;
}

// ==================== RFQ Types ====================

export interface RfqClient {
  id: string;
  organizationId: string;
  name: string;
  companyId: string | null;
  sector: string;
  subSector: string | null;
  employeeCount: number | null;
  annualRevenue: number | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Notification Types ====================

export type NotificationType =
  | 'DOCUMENT_UPLOADED'
  | 'VERIFICATION_NEEDED'
  | 'COMPLIANCE_WARNING'
  | 'CERTIFICATE_EXPIRING'
  | 'CERTIFICATE_EXPIRED'
  | 'STATUS_CHANGE';

export interface Notification {
  id: string;
  recipientId: string;
  recipientType: 'user' | 'vendor';
  type: NotificationType;
  title: string;
  message: string;
  data: unknown | null;
  isRead: boolean;
  sentVia: ('email' | 'in_app' | 'sms')[];
  createdAt: Date;
}
