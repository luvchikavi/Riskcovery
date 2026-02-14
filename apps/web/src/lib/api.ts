// In production, route through same-origin proxy to avoid CORS.
// In development, call the local API directly.
const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api/proxy'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1');

interface ApiError {
  code: string;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    // Only set Content-Type for requests with a body
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    // Add auth token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: response.statusText },
      }));
      throw new Error(error.error?.message || 'Request failed');
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    // Return blob for file downloads
    return response.blob() as Promise<T>;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, { method: 'GET' });
  }

  async post<T, D = unknown>(endpoint: string, data?: D): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T, D = unknown>(endpoint: string, data: D): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T, D = unknown>(endpoint: string, data: D): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, { method: 'DELETE' });
  }

  async downloadFile(endpoint: string, data: unknown): Promise<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('File download failed');
    }

    return response.blob();
  }
}

export const api = new ApiClient(API_BASE_URL);

// RFQ-specific API functions
export const rfqApi = {
  // Clients
  clients: {
    list: (params?: { page?: number; pageSize?: number; sector?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.sector) searchParams.set('sector', params.sector);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Client>>(`/rfq/clients${query ? `?${query}` : ''}`);
    },
    get: (id: string) => api.get<Client>(`/rfq/clients/${id}`),
    create: (data: CreateClientData) => api.post<Client>('/rfq/clients', data),
    update: (id: string, data: Partial<CreateClientData>) => api.put<Client>(`/rfq/clients/${id}`, data),
    delete: (id: string) => api.delete(`/rfq/clients/${id}`),
  },

  // Questionnaire
  questionnaire: {
    getTemplate: (sector: string) => api.get<Questionnaire>(`/rfq/questionnaire/template/${sector}`),
    getSectors: () => api.get<string[]>('/rfq/questionnaire/sectors'),
    save: (clientId: string, answers: QuestionnaireAnswers) =>
      api.post<QuestionnaireResponse>('/rfq/questionnaire', { clientId, answers }),
    submit: (clientId: string, answers: QuestionnaireAnswers) =>
      api.post<QuestionnaireResponse>('/rfq/questionnaire', { clientId, answers, status: 'completed' }),
    getRecommendations: (sector: string, answers: QuestionnaireAnswers) =>
      api.post<CoverageRecommendation[]>('/rfq/questionnaire/recommendations', { sector, answers }),
    getByClient: (clientId: string) =>
      api.get<QuestionnaireResponse[]>(`/rfq/questionnaire/client?clientId=${clientId}`),
  },

  // Documents
  documents: {
    generate: async (clientId: string, answers: QuestionnaireAnswers, format: 'pdf' | 'docx' | 'xlsx') => {
      return api.downloadFile('/rfq/documents/generate', { clientId, answers, format });
    },
    preview: (clientId: string, answers: QuestionnaireAnswers) =>
      api.post<DocumentPreview>('/rfq/documents/preview', { clientId, answers }),
    list: (clientId: string) => api.get<DocumentMeta[]>(`/rfq/documents?clientId=${clientId}`),
  },

  // Knowledge Base
  knowledgeBase: {
    getBySector: (sector: string) => api.get<InsuranceRequirement[]>(`/rfq/knowledge-base/sector/${sector}`),
    getAll: () => api.get<InsuranceRequirement[]>('/rfq/knowledge-base'),
  },

  // Products (Insurance Product Catalog)
  products: {
    list: () => api.get<InsuranceProduct[]>('/rfq/products'),
    getByCode: (code: string) => api.get<InsuranceProduct>(`/rfq/products/${code}`),
    getBySector: (sector: string) => api.get<InsuranceProduct[]>(`/rfq/products/sector/${sector}`),
    getExtensions: (code: string) => api.get<PolicyExtension[]>(`/rfq/products/${code}/extensions`),
    getExclusions: (code: string) => api.get<PolicyExclusion[]>(`/rfq/products/${code}/exclusions`),
    getRelations: (code: string) => api.get<CrossPolicyRelation[]>(`/rfq/products/${code}/relations`),
    getSectorMatrix: () => api.get<SectorMatrix>('/rfq/products/sector-matrix'),
    getAllRelations: () => api.get<CrossPolicyRelation[]>('/rfq/products/relations'),
    getEnrichedRecommendations: (sector: string, answers: QuestionnaireAnswers) =>
      api.post<EnrichedRecommendationsResponse>(`/rfq/questionnaire/recommendations/${sector}/with-insurers`, answers),
  },
};

// Admin API functions for questionnaire management
export const adminApi = {
  // Templates
  templates: {
    list: (includeInactive = false) =>
      api.get<QuestionnaireTemplateAdmin[]>(
        `/rfq/admin/templates${includeInactive ? '?includeInactive=true' : ''}`
      ),
    get: (id: string) => api.get<QuestionnaireTemplateAdmin>(`/rfq/admin/templates/${id}`),
    create: (data: CreateTemplateData) =>
      api.post<QuestionnaireTemplateAdmin>('/rfq/admin/templates', data),
    update: (id: string, data: UpdateTemplateData) =>
      api.put<QuestionnaireTemplateAdmin>(`/rfq/admin/templates/${id}`, data),
    delete: (id: string) => api.delete(`/rfq/admin/templates/${id}`),
    duplicate: (id: string, newSector: string, newSectorHe: string) =>
      api.post<QuestionnaireTemplateAdmin>(`/rfq/admin/templates/${id}/duplicate`, {
        newSector,
        newSectorHe,
      }),
  },

  // Sections
  sections: {
    get: (id: string) => api.get<QuestionnaireSectionAdmin>(`/rfq/admin/sections/${id}`),
    create: (templateId: string, data: CreateSectionData) =>
      api.post<QuestionnaireSectionAdmin>(`/rfq/admin/templates/${templateId}/sections`, data),
    update: (id: string, data: UpdateSectionData) =>
      api.put<QuestionnaireSectionAdmin>(`/rfq/admin/sections/${id}`, data),
    delete: (id: string) => api.delete(`/rfq/admin/sections/${id}`),
    reorder: (templateId: string, sectionIds: string[]) =>
      api.patch<QuestionnaireSectionAdmin[]>(
        `/rfq/admin/templates/${templateId}/sections/reorder`,
        { sectionIds }
      ),
  },

  // Questions
  questions: {
    get: (id: string) => api.get<QuestionAdmin>(`/rfq/admin/questions/${id}`),
    create: (sectionId: string, data: CreateQuestionData) =>
      api.post<QuestionAdmin>(`/rfq/admin/sections/${sectionId}/questions`, data),
    update: (id: string, data: UpdateQuestionData) =>
      api.put<QuestionAdmin>(`/rfq/admin/questions/${id}`, data),
    delete: (id: string) => api.delete(`/rfq/admin/questions/${id}`),
    reorder: (sectionId: string, questionIds: string[]) =>
      api.patch<QuestionAdmin[]>(`/rfq/admin/questions/reorder`, { sectionId, questionIds }),
    move: (id: string, newSectionId: string, newOrder?: number) =>
      api.patch<QuestionAdmin>(`/rfq/admin/questions/${id}/move`, { newSectionId, newOrder }),
    duplicate: (id: string, newQuestionId?: string) =>
      api.post<QuestionAdmin>(`/rfq/admin/questions/${id}/duplicate`, { newQuestionId }),
  },

  // Rules
  rules: {
    get: (id: string) => api.get<CoverageRuleAdmin>(`/rfq/admin/rules/${id}`),
    list: (templateId: string, includeInactive = false) =>
      api.get<CoverageRuleAdmin[]>(
        `/rfq/admin/templates/${templateId}/rules${includeInactive ? '?includeInactive=true' : ''}`
      ),
    create: (templateId: string, data: CreateRuleData) =>
      api.post<CoverageRuleAdmin>(`/rfq/admin/templates/${templateId}/rules`, data),
    update: (id: string, data: UpdateRuleData) =>
      api.put<CoverageRuleAdmin>(`/rfq/admin/rules/${id}`, data),
    delete: (id: string) => api.delete(`/rfq/admin/rules/${id}`),
    toggle: (id: string) => api.patch<CoverageRuleAdmin>(`/rfq/admin/rules/${id}/toggle`, {}),
    duplicate: (id: string) => api.post<CoverageRuleAdmin>(`/rfq/admin/rules/${id}/duplicate`),
    reorder: (templateId: string, ruleIds: string[]) =>
      api.patch<CoverageRuleAdmin[]>(`/rfq/admin/templates/${templateId}/rules/reorder`, {
        ruleIds,
      }),
  },
};

// Admin Types
export interface QuestionnaireTemplateAdmin {
  id: string;
  sector: string;
  sectorHe: string;
  description?: string;
  descriptionHe?: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: QuestionnaireSectionAdmin[];
  rules?: CoverageRuleAdmin[];
  _count?: {
    sections: number;
    rules: number;
  };
}

export interface QuestionnaireSectionAdmin {
  id: string;
  templateId: string;
  title: string;
  titleHe: string;
  description?: string;
  descriptionHe?: string;
  order: number;
  showIf?: QuestionCondition[];
  createdAt: string;
  updatedAt: string;
  questions?: QuestionAdmin[];
}

export interface QuestionAdmin {
  id: string;
  sectionId: string;
  questionId: string;
  label: string;
  labelHe: string;
  description?: string;
  descriptionHe?: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'currency';
  options?: QuestionOption[];
  placeholder?: string;
  placeholderHe?: string;
  required: boolean;
  order: number;
  min?: number;
  max?: number;
  showIf?: QuestionCondition[];
  riskWeight?: number;
  policyAffinity: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  value: string;
  label: string;
  labelHe: string;
}

export interface QuestionCondition {
  questionId: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'in';
  value: string | number | boolean | string[];
}

export interface CoverageRuleAdmin {
  id: string;
  templateId: string;
  name: string;
  nameHe: string;
  description?: string;
  descriptionHe?: string;
  priority: number;
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'in' | 'contains';
  value: unknown;
}

export interface RuleAction {
  type: 'addPolicy' | 'removePolicy' | 'adjustLimit' | 'addEndorsement' | 'setMandatory'
    | 'addExtension' | 'removeExtension' | 'flagCoverageGap';
  policyType?: string;
  endorsement?: string;
  multiplier?: number;
  amount?: number;
  mandatory?: boolean;
  extensionCode?: string;
  extensionName?: string;
  gapType?: string;
  gapDescription?: string;
}

export interface CreateTemplateData {
  sector: string;
  sectorHe: string;
  description?: string;
  descriptionHe?: string;
  version?: string;
  isActive?: boolean;
}

export interface UpdateTemplateData {
  sectorHe?: string;
  description?: string;
  descriptionHe?: string;
  version?: string;
  isActive?: boolean;
}

export interface CreateSectionData {
  title: string;
  titleHe: string;
  description?: string;
  descriptionHe?: string;
  order?: number;
  showIf?: QuestionCondition[];
}

export interface UpdateSectionData {
  title?: string;
  titleHe?: string;
  description?: string;
  descriptionHe?: string;
  order?: number;
  showIf?: QuestionCondition[] | null;
}

export interface CreateQuestionData {
  questionId: string;
  label: string;
  labelHe: string;
  description?: string;
  descriptionHe?: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'currency';
  options?: QuestionOption[];
  placeholder?: string;
  placeholderHe?: string;
  required?: boolean;
  order?: number;
  min?: number;
  max?: number;
  showIf?: QuestionCondition[];
  riskWeight?: number;
  policyAffinity?: string[];
}

export interface UpdateQuestionData {
  questionId?: string;
  label?: string;
  labelHe?: string;
  description?: string;
  descriptionHe?: string;
  type?: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'currency';
  options?: QuestionOption[] | null;
  placeholder?: string;
  placeholderHe?: string;
  required?: boolean;
  order?: number;
  min?: number | null;
  max?: number | null;
  showIf?: QuestionCondition[] | null;
  riskWeight?: number | null;
  policyAffinity?: string[];
}

export interface CreateRuleData {
  name: string;
  nameHe: string;
  description?: string;
  descriptionHe?: string;
  priority?: number;
  isActive?: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface UpdateRuleData {
  name?: string;
  nameHe?: string;
  description?: string;
  descriptionHe?: string;
  priority?: number;
  isActive?: boolean;
  conditions?: RuleCondition[];
  actions?: RuleAction[];
}

// Types
export interface Client {
  id: string;
  name: string;
  companyId?: string;
  sector: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  employeeCount?: number;
  annualRevenue?: number;
  riskProfile?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  _count?: {
    questionnaires: number;
    documents: number;
  };
}

export interface CreateClientData {
  name: string;
  companyId?: string;
  sector: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  employeeCount?: number;
  annualRevenue?: number;
}

export interface QuestionnaireAnswers {
  [questionId: string]: string | number | boolean | string[] | null;
}

export interface Questionnaire {
  id: string;
  sector: string;
  version: string;
  sections: QuestionnaireSection[];
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  titleHe: string;
  description?: string;
  descriptionHe?: string;
  questions: Question[];
  showIf?: Array<{ questionId: string; operator: string; value: unknown }>;
}

export interface Question {
  id: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'currency';
  label: string;
  labelHe: string;
  description?: string;
  descriptionHe?: string;
  required: boolean;
  options?: { value: string; label: string; labelHe: string }[];
  placeholder?: string;
  placeholderHe?: string;
  min?: number;
  max?: number;
  showIf?: Array<{
    questionId: string;
    operator: string;
    value: unknown;
  }>;
}

export interface QuestionnaireResponse {
  id: string;
  clientId: string;
  answers: QuestionnaireAnswers;
  status: string;
  createdAt: string;
}

export interface CoverageRecommendation {
  policyType: string;
  policyTypeHe: string;
  recommendedLimit: number;
  isMandatory: boolean;
  endorsements: string[];
  description?: string;
  descriptionHe?: string;
  adjustmentReason?: string;
}

export interface DocumentPreview {
  client: {
    name: string;
    sector: string;
    companyId?: string;
  };
  recommendations: CoverageRecommendation[];
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  generatedAt: string;
  validUntil: string;
}

export interface DocumentMeta {
  id: string;
  fileName: string;
  format: 'pdf' | 'docx' | 'xlsx';
  s3Key: string;
  createdAt: string;
}

export interface InsuranceRequirement {
  id: string;
  sector: string;
  policyType: string;
  policyTypeHe: string;
  isMandatory: boolean;
  recommendedLimit: number;
  description?: string;
  descriptionHe?: string;
  commonEndorsements: string[];
}

// Insurance Product Catalog Types
export interface InsuranceProduct {
  id: string;
  code: string;
  nameHe: string;
  nameEn: string;
  category: string;
  coverageTrigger: string;
  structure: Record<string, unknown>;
  insurer?: string;
  bitStandard?: string;
  description?: string;
  descriptionHe?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  extensions?: PolicyExtension[];
  exclusions?: PolicyExclusion[];
  necessity?: string; // when loaded via sector mapping
}

export interface PolicyExtension {
  id: string;
  productId: string;
  chapterCode?: string;
  code: string;
  nameHe: string;
  nameEn: string;
  description?: string;
  defaultLimit?: number;
  isFirstLoss: boolean;
}

export interface PolicyExclusion {
  id: string;
  productId: string;
  chapterCode?: string;
  nameHe: string;
  nameEn: string;
  description?: string;
  isGeneral: boolean;
}

export interface CrossPolicyRelation {
  product: InsuranceProduct;
  relationType: string;
  description?: string;
  direction: 'outgoing' | 'incoming';
}

export interface SectorMatrix {
  [sector: string]: Array<{
    product: InsuranceProduct;
    necessity: string;
  }>;
}

export interface EnrichedCoverageRecommendation {
  productCode: string;
  productNameHe: string;
  productNameEn: string;
  category: string;
  coverageTrigger: string;
  recommendedLimit: number;
  isMandatory: boolean;
  necessity: string;
  endorsements: string[];
  extensions: RecommendedExtension[];
  exclusionCount: number;
  relatedProducts: RelatedProductInfo[];
  adjustmentReason?: string;
  description?: string;
  descriptionHe?: string;
}

export interface RecommendedExtension {
  code: string;
  nameHe: string;
  nameEn: string;
  chapterCode?: string;
  defaultLimit?: number;
  isFirstLoss: boolean;
}

export interface RelatedProductInfo {
  productCode: string;
  productNameHe: string;
  productNameEn: string;
  relationType: string;
  description?: string;
}

export interface CoverageGap {
  type: string;
  nameHe: string;
  nameEn: string;
  description: string;
  descriptionHe: string;
  severity: 'advisory' | 'warning' | 'critical';
}

export interface InsurerSuggestion {
  insurerCode: string;
  insurerNameHe: string;
  insurerNameEn: string;
  bitStandard: string | null;
  extensionCount: number;
  strengths: string[];
  weaknesses: string[];
  score: number;
}

export interface EnrichedRecommendationsResponse {
  recommendations: EnrichedCoverageRecommendation[];
  coverageGaps: CoverageGap[];
  insurerSuggestions?: Record<string, InsurerSuggestion[]>;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Comparison Module Types
export interface ComparisonDocument {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  extractedData?: ExtractedCertificateData;
  uploadedAt: string;
  processedAt?: string;
  vendorId?: string;
  clientId?: string;
}

export interface ExtractedCertificateData {
  certificateNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  insurerName?: string;
  insurerNameHe?: string;
  agentName?: string;
  insuredName?: string;
  insuredId?: string;
  insuredAddress?: string;
  policies: ExtractedPolicy[];
  additionalInsured?: {
    name?: string;
    isNamedAsAdditional: boolean;
    waiverOfSubrogation: boolean;
  };
  rawText?: string;
  confidence?: number;
}

export interface ExtractedPolicy {
  policyType: string;
  policyTypeHe: string;
  policyNumber?: string;
  coverageLimit?: number;
  coverageLimitPerPeriod?: number;
  coverageLimitPerOccurrence?: number;
  deductible?: number;
  policyWording?: string;
  currency?: string;
  effectiveDate?: string;
  expirationDate?: string;
  retroactiveDate?: string;
  endorsementCodes?: string[];
  endorsements?: string[];
  confidence?: number;
}

export interface ComparisonTemplate {
  id: string;
  name: string;
  nameHe: string;
  description?: string;
  descriptionHe?: string;
  sector?: string;
  contractType?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  requirements: ComparisonRequirement[];
  _count?: {
    analyses: number;
  };
}

export interface ComparisonRequirement {
  id: string;
  templateId: string;
  policyType: string;
  policyTypeHe: string;
  minimumLimit: number;
  minimumLimitPerPeriod?: number;
  minimumLimitPerOccurrence?: number;
  maximumDeductible?: number;
  requiredEndorsements: string[];
  requireAdditionalInsured: boolean;
  requireWaiverSubrogation: boolean;
  minimumValidityDays?: number;
  isMandatory: boolean;
  policyWording?: string;
  currency?: string;
  cancellationNoticeDays?: number;
  serviceCodes?: string[];
  notes?: string;
  notesHe?: string;
}

export type ComparisonFieldStatus = 'PASS' | 'FAIL' | 'PARTIAL' | 'MISSING';

export interface ComparisonRow {
  fieldName: string;
  fieldNameHe: string;
  policyType?: string;
  policyTypeHe?: string;
  required: string | number | null;
  submitted: string | number | null;
  status: ComparisonFieldStatus;
  severity?: 'critical' | 'major' | 'minor';
}

export interface ComparisonAnalysis {
  id: string;
  certificateId: string;
  requirementTemplateId: string;
  overallStatus: 'compliant' | 'partial' | 'non_compliant' | 'missing' | 'expired';
  complianceScore: number;
  policyResults: PolicyComparisonResult[];
  totalRequirements: number;
  compliantCount: number;
  partialCount: number;
  nonCompliantCount: number;
  missingCount: number;
  analyzedAt: string;
}

export interface PolicyComparisonResult {
  requirementId: string;
  policyType: string;
  policyTypeHe: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'missing' | 'expired';
  foundPolicy?: ExtractedPolicy;
  rows?: ComparisonRow[];
  gaps: ComplianceGap[];
  limitCompliant: boolean;
  deductibleCompliant?: boolean;
  endorsementsCompliant?: boolean;
  validityCompliant?: boolean;
  additionalInsuredCompliant?: boolean;
}

export interface ComplianceGap {
  type: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  descriptionHe: string;
  required?: string | number;
  found?: string | number;
  recommendation?: string;
  recommendationHe?: string;
}

// ==================== INSURER COMPARISON TYPES ====================

export interface InsurerSummary {
  id: string;
  code: string;
  nameHe: string;
  nameEn: string;
  website?: string;
  phone?: string;
  isActive: boolean;
  policyCount: number;
}

export interface InsurerPolicySummary {
  id: string;
  productCode: string;
  policyFormCode?: string;
  bitStandard?: string;
  editionYear?: number;
  isMaster: boolean;
  strengths: unknown[];
  weaknesses: unknown[];
  notableTerms: unknown[];
}

export interface InsurerPolicyExtensionDetail {
  id: string;
  insurerPolicyId: string;
  code: string;
  nameHe: string;
  nameEn: string;
  description?: string;
  descriptionHe?: string;
  defaultLimit?: number;
  limitNotes?: string;
  isStandard: boolean;
}

export interface InsurerPolicyExclusionDetail {
  id: string;
  insurerPolicyId: string;
  code: string;
  nameHe: string;
  nameEn: string;
  description?: string;
  descriptionHe?: string;
  isStandard: boolean;
}

export interface InsurerPolicyDetail extends InsurerPolicySummary {
  extensions: InsurerPolicyExtensionDetail[];
  exclusions: InsurerPolicyExclusionDetail[];
}

export interface InsurerComparison {
  insurer: InsurerSummary;
  policy: InsurerPolicySummary;
  extensions: InsurerPolicyExtensionDetail[];
  exclusions: InsurerPolicyExclusionDetail[];
}

export interface ExtensionMatrixRow {
  code: string;
  nameHe: string;
  nameEn: string;
  insurers: Record<string, { has: boolean; limit?: number; limitNotes?: string }>;
}

// Insurer Comparison API functions
export const insurerApi = {
  /** List all active insurers with policy counts. */
  list: () => api.get<InsurerSummary[]>('/insurers'),

  /** Get a single insurer by code (e.g. "CLAL", "PHOENIX"). */
  get: (code: string) => api.get<InsurerSummary>(`/insurers/${code}`),

  /** Get all policies for a given insurer. */
  getPolicies: (code: string) =>
    api.get<{ insurer: InsurerSummary; policies: InsurerPolicySummary[] }>(
      `/insurers/${code}/policies`,
    ),

  /** Get a specific policy with extensions and exclusions. */
  getPolicy: (code: string, productCode: string) =>
    api.get<{ insurer: InsurerSummary; policy: InsurerPolicyDetail }>(
      `/insurers/${code}/policies/${productCode}`,
    ),

  /** Compare all insurers for a product type. */
  compareByProduct: (productCode: string) =>
    api.get<InsurerComparison[]>(`/insurers/compare/${productCode}`),

  /** Side-by-side extension comparison matrix for a product type. */
  getExtensionMatrix: (productCode: string) =>
    api.get<ExtensionMatrixRow[]>(
      `/insurers/compare/${productCode}/extensions`,
    ),
};

// Comparison API functions
export const comparisonApi = {
  // Documents
  documents: {
    list: (params?: { vendorId?: string; clientId?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.vendorId) searchParams.set('vendorId', params.vendorId);
      if (params?.clientId) searchParams.set('clientId', params.clientId);
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      return api.get<ComparisonDocument[]>(`/comparison/documents${query ? `?${query}` : ''}`);
    },
    get: (id: string) => api.get<ComparisonDocument>(`/comparison/documents/${id}`),
    upload: (data: {
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
      content: string;
      vendorId?: string;
      clientId?: string;
    }) => api.post<ComparisonDocument>('/comparison/documents', data),
    process: (id: string) => api.post<ComparisonDocument>(`/comparison/documents/${id}/process`),
    delete: (id: string) => api.delete(`/comparison/documents/${id}`),
  },

  // Templates
  templates: {
    list: (params?: { sector?: string; isActive?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.sector) searchParams.set('sector', params.sector);
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
      const query = searchParams.toString();
      return api.get<ComparisonTemplate[]>(`/comparison/templates${query ? `?${query}` : ''}`);
    },
    get: (id: string) => api.get<ComparisonTemplate>(`/comparison/templates/${id}`),
    create: (data: {
      name: string;
      nameHe: string;
      description?: string;
      descriptionHe?: string;
      sector?: string;
      contractType?: string;
      requirements: Omit<ComparisonRequirement, 'id' | 'templateId'>[];
    }) => api.post<ComparisonTemplate>('/comparison/templates', data),
    update: (id: string, data: Partial<ComparisonTemplate>) =>
      api.patch<ComparisonTemplate>(`/comparison/templates/${id}`, data),
    delete: (id: string) => api.delete(`/comparison/templates/${id}`),
    importDocx: (fileName: string, content: string) =>
      api.post<ComparisonTemplate>('/comparison/templates/import-docx', { fileName, content }),
  },

  // Analysis
  analysis: {
    run: (documentId: string, templateId: string) =>
      api.post<ComparisonAnalysis>('/comparison/analyze', { documentId, templateId }),
    get: (id: string) => api.get<ComparisonAnalysis>(`/comparison/analyses/${id}`),
    getForDocument: (documentId: string) =>
      api.get<ComparisonAnalysis[]>(`/comparison/documents/${documentId}/analyses`),
    delete: (id: string) => api.delete(`/comparison/analyses/${id}`),
  },
};
