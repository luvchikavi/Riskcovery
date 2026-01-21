const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    update: (id: string, data: Partial<CreateClientData>) => api.patch<Client>(`/rfq/clients/${id}`, data),
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
};

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
