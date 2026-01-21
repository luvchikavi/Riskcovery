# Riscovery - Technical Specification Document
## Insurance Advisory Management System

**Version:** 1.0
**Document Type:** Technical Specification
**Classification:** Internal

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Architecture Overview](#3-architecture-overview)
4. [Technology Stack](#4-technology-stack)
5. [Repository Structure](#5-repository-structure)
6. [Backend Architecture](#6-backend-architecture)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Database Design](#8-database-design)
9. [Security Architecture](#9-security-architecture)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Internationalization (i18n)](#11-internationalization-i18n)
12. [UX/UI Design Guidelines](#12-uxui-design-guidelines)
13. [User Roles & Permissions](#13-user-roles--permissions)
14. [Algorithms & Business Logic](#14-algorithms--business-logic)
15. [AI/OCR Processing Pipeline](#15-aiocr-processing-pipeline)
16. [Development Workflow](#16-development-workflow)
17. [Git Strategy](#17-git-strategy)
18. [CI/CD Pipeline](#18-cicd-pipeline)
19. [Deployment Strategy](#19-deployment-strategy)
20. [Environment Configuration](#20-environment-configuration)
21. [Monitoring & Logging](#21-monitoring--logging)
22. [Testing Strategy](#22-testing-strategy)
23. [Scalability & Module Extension](#23-scalability--module-extension)
24. [Performance Optimization](#24-performance-optimization)
25. [API Documentation](#25-api-documentation)
26. [Error Handling](#26-error-handling)
27. [Backup & Recovery](#27-backup--recovery)
28. [Compliance & Regulations](#28-compliance--regulations)
29. [Future Roadmap](#29-future-roadmap)

---

## 1. Executive Summary

### 1.1 Purpose
This document provides comprehensive technical specifications for building the Riscovery system - an Insurance Advisory Management System for LHD Insurance Consulting. The system consists of two main modules:

1. **Smart RFQ Generator** - Automated insurance Request for Quotation creation
2. **Insurance Certificate Comparison System** - Contractor insurance compliance verification

### 1.2 Scope
The system will serve LHD Insurance Consulting and their clients including major Israeli corporations (El-Al, Teva, Shikun & Binui) and local authorities (municipalities).

### 1.3 Target Users
- LHD Staff (primary operators)
- Corporate clients (RFQ module users)
- Local authority clients (Comparison module users)
- Third-party contractors/vendors (certificate submitters)
- Document reviewers (verification tasks)

---

## 2. System Overview

### 2.1 Module 1: Smart RFQ Generator

**Purpose:** Generate professional insurance RFQ documents through intelligent questionnaires

**Key Features:**
- Client management with sector classification
- Insurance Knowledge Base per industry
- Dynamic questionnaire engine
- Rule-based coverage recommendations
- Multi-format document generation (PDF, Word, Excel)
- Claims tracking integration
- Alerts and reminders system
- Visual dashboard with risk mapping

**User Flow:**
```
Client Registration → Sector Selection → Dynamic Questionnaire →
Rule Engine Processing → Coverage Recommendations → RFQ Document Generation
```

### 2.2 Module 2: Insurance Certificate Comparison (Riscovery)

**Purpose:** Automate insurance certificate verification against published requirements

**Key Features:**
- Multi-portal architecture (Admin, Vendor, Reviewer)
- AI/OCR document processing (Hebrew support)
- Human verification workflow
- Compliance gap detection
- Automated notifications and alerts
- Expiration tracking and reminders

**User Flow:**
```
Vendor Registration → Requirements Definition → Certificate Upload →
AI/OCR Processing → Human Verification → Compliance Check → Status Report
```

---

## 3. Architecture Overview

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOAD BALANCER                                   │
│                              (Vercel Edge)                                   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
         ┌──────────▼──────────┐     ┌──────────▼──────────┐
         │   FRONTEND (Next.js) │     │   API GATEWAY       │
         │   - Admin Portal      │     │   (Fastify)         │
         │   - Vendor Portal     │     │                     │
         │   - Reviewer Portal   │     │                     │
         │   - RFQ Portal        │     │                     │
         └──────────┬──────────┘     └──────────┬──────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
┌────────▼────────┐    ┌──────────▼──────────┐    ┌───────▼────────┐
│  AUTH SERVICE   │    │   CORE SERVICES     │    │  FILE SERVICE  │
│  (NextAuth.js)  │    │   - RFQ Engine      │    │  (AWS S3)      │
│                 │    │   - Compliance      │    │                │
│                 │    │   - Notifications   │    │                │
└────────┬────────┘    └──────────┬──────────┘    └───────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
    ┌─────────▼─────────┐ ┌───────▼───────┐ ┌────────▼────────┐
    │   PostgreSQL      │ │    Redis      │ │   OCR Service   │
    │   (Supabase)      │ │   (Upstash)   │ │   (Docupipe)    │
    └───────────────────┘ └───────────────┘ └─────────────────┘
```

### 3.2 Microservices Architecture

| Service | Responsibility | Technology |
|---------|---------------|------------|
| **API Gateway** | Request routing, rate limiting, validation | Fastify |
| **Auth Service** | Authentication, session management | NextAuth.js |
| **RFQ Service** | Questionnaire logic, document generation | Node.js |
| **Compliance Service** | Certificate comparison, gap detection | Node.js |
| **OCR Service** | Document text extraction | Docupipe API |
| **AI Service** | Field extraction, confidence scoring | OpenAI/Custom |
| **Notification Service** | Email, SMS, in-app alerts | SendGrid |
| **File Service** | Document storage, retrieval | AWS S3 |

### 3.3 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
└─────────────────────────────────────────────────────────────────┘

[User Input] → [API Gateway] → [Validation Layer] → [Business Logic]
                                                           │
                                                           ▼
                                                    [Data Layer]
                                                           │
                    ┌──────────────────────────────────────┼──────┐
                    │                                      │      │
                    ▼                                      ▼      ▼
             [PostgreSQL]                            [Redis]  [S3]
             - Structured Data                       - Cache   - Files
             - Relationships                         - Sessions
             - Audit Logs                            - Queues
```

---

## 4. Technology Stack

### 4.1 Core Technologies

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Frontend** | Next.js | 14.x | SSR, App Router, excellent DX |
| **UI Framework** | React | 18.x | Component-based, large ecosystem |
| **UI Library** | Material UI (Materio) | 5.x | Pre-built components, RTL support |
| **Language** | TypeScript | 5.x | Type safety, better maintainability |
| **Backend** | Node.js + Fastify | 20.x / 4.x | Fast, lightweight, good ecosystem |
| **Database** | PostgreSQL | 15.x | Reliable, JSONB support, full-text search |
| **ORM** | Prisma | 5.x | Type-safe queries, migrations |
| **Cache** | Redis | 7.x | Session store, job queues |
| **Storage** | AWS S3 | - | Reliable, cost-effective |
| **OCR** | Docupipe.ai | - | Best Hebrew support |
| **Auth** | NextAuth.js | 4.x | Flexible, secure |
| **Email** | SendGrid | - | Reliable delivery |

### 4.2 Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Husky** | Git hooks |
| **Jest** | Unit testing |
| **Playwright** | E2E testing |
| **Storybook** | Component documentation |
| **Docker** | Containerization |
| **GitHub Actions** | CI/CD |

### 4.3 Infrastructure Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **Hosting** | Vercel | Frontend + API hosting |
| **Database** | Supabase | Managed PostgreSQL |
| **Cache** | Upstash | Serverless Redis |
| **Storage** | AWS S3 | Document storage |
| **CDN** | Vercel Edge | Static assets |
| **Monitoring** | Vercel Analytics + Sentry | Performance & errors |

---

## 5. Repository Structure

### 5.1 Monorepo Structure

```
riskcovery/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd-staging.yml
│   │   └── cd-production.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│
├── apps/
│   ├── web/                      # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (admin)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── vendors/
│   │   │   │   ├── requirements/
│   │   │   │   ├── compliance/
│   │   │   │   └── settings/
│   │   │   ├── (vendor)/
│   │   │   │   ├── upload/
│   │   │   │   └── status/
│   │   │   ├── (reviewer)/
│   │   │   │   ├── queue/
│   │   │   │   └── verify/
│   │   │   ├── (rfq)/
│   │   │   │   ├── clients/
│   │   │   │   ├── questionnaire/
│   │   │   │   └── generate/
│   │   │   ├── api/
│   │   │   │   └── [...routes]/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── forms/
│   │   │   ├── tables/
│   │   │   ├── charts/
│   │   │   └── layouts/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── validations/
│   │   ├── locales/
│   │   │   ├── en/
│   │   │   └── he/
│   │   ├── styles/
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── api/                      # Fastify Backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── vendors/
│       │   │   ├── documents/
│       │   │   ├── compliance/
│       │   │   ├── rfq/
│       │   │   ├── notifications/
│       │   │   └── reports/
│       │   ├── services/
│       │   │   ├── ocr/
│       │   │   ├── ai/
│       │   │   ├── storage/
│       │   │   └── email/
│       │   ├── middleware/
│       │   ├── plugins/
│       │   ├── utils/
│       │   └── index.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── package.json
│
├── packages/
│   ├── ui/                       # Shared UI components
│   │   ├── components/
│   │   ├── hooks/
│   │   └── package.json
│   │
│   ├── types/                    # Shared TypeScript types
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── package.json
│   │
│   ├── utils/                    # Shared utilities
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── package.json
│   │
│   └── config/                   # Shared configurations
│       ├── eslint/
│       ├── typescript/
│       └── package.json
│
├── docs/
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── USER_GUIDE.md
│
├── scripts/
│   ├── setup.sh
│   ├── seed-db.ts
│   └── generate-types.ts
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
│
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── turbo.json
├── package.json
└── README.md
```

### 5.2 Package Management

**Tool:** pnpm with Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

---

## 6. Backend Architecture

### 6.1 API Design Principles

- **RESTful API** with consistent naming conventions
- **Versioned endpoints** (v1, v2)
- **JSON:API** specification for responses
- **OpenAPI 3.0** documentation
- **Rate limiting** per user/IP
- **Request validation** with Zod schemas

### 6.2 API Endpoint Structure

```
/api/v1/
├── /auth
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh
│   ├── POST   /magic-link
│   └── GET    /me
│
├── /organizations
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PUT    /:id
│   └── DELETE /:id
│
├── /users
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PUT    /:id
│   └── DELETE /:id
│
├── /vendors
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PUT    /:id
│   ├── DELETE /:id
│   ├── POST   /:id/invite
│   └── GET    /:id/compliance
│
├── /documents
│   ├── GET    /
│   ├── POST   /upload
│   ├── GET    /:id
│   ├── DELETE /:id
│   ├── GET    /:id/download
│   └── POST   /:id/process
│
├── /requirements
│   ├── GET    /templates
│   ├── POST   /templates
│   ├── GET    /templates/:id
│   ├── PUT    /templates/:id
│   └── DELETE /templates/:id
│
├── /compliance
│   ├── GET    /
│   ├── GET    /:vendorId
│   ├── POST   /check/:vendorId
│   └── GET    /report/:vendorId
│
├── /verification
│   ├── GET    /queue
│   ├── GET    /task/:id
│   ├── POST   /task/:id/approve
│   ├── POST   /task/:id/correct
│   └── POST   /task/:id/escalate
│
├── /rfq
│   ├── GET    /clients
│   ├── POST   /clients
│   ├── GET    /questionnaire/:sectorId
│   ├── POST   /generate
│   └── GET    /documents/:id
│
├── /notifications
│   ├── GET    /
│   ├── PUT    /:id/read
│   └── POST   /send
│
└── /reports
    ├── GET    /dashboard
    ├── GET    /compliance-summary
    └── GET    /export/:type
```

### 6.3 Service Layer Architecture

```typescript
// Example: Compliance Service Structure

// src/modules/compliance/compliance.service.ts
export class ComplianceService {
  constructor(
    private vendorRepository: VendorRepository,
    private requirementRepository: RequirementRepository,
    private coverageRepository: CoverageRepository,
    private notificationService: NotificationService
  ) {}

  async checkCompliance(vendorId: string): Promise<ComplianceResult> {
    const vendor = await this.vendorRepository.findById(vendorId);
    const requirements = await this.requirementRepository.findByVendor(vendorId);
    const coverages = await this.coverageRepository.findByVendor(vendorId);

    const results = this.compareRequirementsVsCoverages(requirements, coverages);

    await this.saveComplianceResults(vendorId, results);
    await this.notifyIfGaps(vendor, results);

    return results;
  }
}
```

### 6.4 Middleware Stack

```typescript
// Middleware execution order
const middlewareStack = [
  requestId(),           // Add unique request ID
  cors(),                // CORS handling
  helmet(),              // Security headers
  rateLimit(),           // Rate limiting
  authenticate(),        // JWT verification
  authorize(),           // Role-based access
  validateRequest(),     // Schema validation
  auditLog(),           // Audit logging
];
```

---

## 7. Frontend Architecture

### 7.1 Next.js App Router Structure

```typescript
// app/layout.tsx - Root Layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <Providers>
          <ThemeProvider>
            <AuthProvider>
              <LocaleProvider>
                {children}
              </LocaleProvider>
            </AuthProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
```

### 7.2 Component Architecture

```
components/
├── ui/                          # Base UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Select/
│   ├── Modal/
│   ├── Table/
│   ├── Card/
│   └── ...
│
├── forms/                       # Form components
│   ├── VendorForm/
│   ├── RequirementForm/
│   ├── QuestionnaireForm/
│   └── ...
│
├── layouts/                     # Layout components
│   ├── AdminLayout/
│   ├── VendorLayout/
│   ├── ReviewerLayout/
│   └── AuthLayout/
│
├── features/                    # Feature-specific components
│   ├── compliance/
│   │   ├── ComplianceStatus/
│   │   ├── GapReport/
│   │   └── ComplianceChart/
│   ├── documents/
│   │   ├── DocumentUpload/
│   │   ├── DocumentViewer/
│   │   └── DocumentList/
│   └── verification/
│       ├── VerificationTask/
│       ├── FieldEditor/
│       └── TaskQueue/
│
└── shared/                      # Shared components
    ├── Header/
    ├── Sidebar/
    ├── Footer/
    └── LoadingSpinner/
```

### 7.3 State Management

**Strategy:** React Query + Zustand

```typescript
// React Query for server state
export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.vendors.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Zustand for client state
interface UIStore {
  sidebarOpen: boolean;
  locale: 'he' | 'en';
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setLocale: (locale: 'he' | 'en') => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  locale: 'he',
  theme: 'light',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setLocale: (locale) => set({ locale }),
}));
```

### 7.4 API Client

```typescript
// lib/api/client.ts
import { createClient } from '@/lib/api/base';

export const api = {
  vendors: {
    list: () => client.get('/vendors'),
    get: (id: string) => client.get(`/vendors/${id}`),
    create: (data: CreateVendorInput) => client.post('/vendors', data),
    update: (id: string, data: UpdateVendorInput) => client.put(`/vendors/${id}`, data),
    delete: (id: string) => client.delete(`/vendors/${id}`),
    invite: (id: string) => client.post(`/vendors/${id}/invite`),
  },
  documents: {
    upload: (file: File, vendorId: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendorId', vendorId);
      return client.post('/documents/upload', formData);
    },
    // ...
  },
  // ...
};
```

---

## 8. Database Design

### 8.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  organizations  │       │     users       │       │    vendors      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──┐   │ id (PK)         │   ┌──▶│ id (PK)         │
│ name            │   │   │ organization_id │───┘   │ organization_id │
│ settings        │   │   │ email           │       │ name            │
│ created_at      │   └───│ role            │       │ email           │
└─────────────────┘       │ created_at      │       │ status          │
                          └─────────────────┘       │ created_at      │
                                                    └────────┬────────┘
                                                             │
                    ┌────────────────────────────────────────┼───────────┐
                    │                                        │           │
                    ▼                                        ▼           ▼
         ┌─────────────────┐                      ┌─────────────────┐  ┌──────────────┐
         │    contracts    │                      │   documents     │  │vendor_require│
         ├─────────────────┤                      ├─────────────────┤  ├──────────────┤
         │ id (PK)         │                      │ id (PK)         │  │ id (PK)      │
         │ vendor_id (FK)  │                      │ vendor_id (FK)  │  │ vendor_id    │
         │ contract_number │                      │ file_name       │  │ policy_type  │
         │ start_date      │                      │ s3_key          │  │ min_limit    │
         │ end_date        │                      │ status          │  │ endorsements │
         └─────────────────┘                      │ ai_confidence   │  └──────────────┘
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                               ┌─────────────────────┐
                                               │ extracted_coverages │
                                               ├─────────────────────┤
                                               │ id (PK)             │
                                               │ document_id (FK)    │
                                               │ policy_type         │
                                               │ limit_amount        │
                                               │ expiration_date     │
                                               │ ai_confidence       │
                                               │ is_verified         │
                                               └──────────┬──────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────────┐
                                               │ compliance_results  │
                                               ├─────────────────────┤
                                               │ id (PK)             │
                                               │ vendor_id (FK)      │
                                               │ requirement_id (FK) │
                                               │ coverage_id (FK)    │
                                               │ status              │
                                               │ gap_details         │
                                               └─────────────────────┘
```

### 8.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== CORE ENTITIES ====================

model Organization {
  id        String   @id @default(uuid())
  name      String
  settings  Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users                User[]
  vendors              Vendor[]
  requirementTemplates RequirementTemplate[]

  @@map("organizations")
}

model User {
  id             String       @id @default(uuid())
  organizationId String       @map("organization_id")
  email          String       @unique
  name           String?
  role           UserRole
  phone          String?
  isActive       Boolean      @default(true) @map("is_active")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  organization   Organization @relation(fields: [organizationId], references: [id])
  verifiedDocs   Document[]   @relation("VerifiedBy")
  tasks          VerificationTask[]
  auditLogs      AuditLog[]

  @@map("users")
}

enum UserRole {
  ADMIN
  COMPLIANCE_MANAGER
  CONTRACT_MANAGER
  REVIEWER
  EXPERT_REVIEWER
}

model Vendor {
  id              String       @id @default(uuid())
  organizationId  String       @map("organization_id")
  name            String
  email           String?
  phone           String?
  vendorType      String?      @map("vendor_type")
  companyId       String?      @map("company_id")
  status          VendorStatus @default(PENDING)
  magicLinkToken  String?      @map("magic_link_token")
  tokenExpiresAt  DateTime?    @map("token_expires_at")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  organization    Organization @relation(fields: [organizationId], references: [id])
  contracts       Contract[]
  documents       Document[]
  requirements    VendorRequirement[]
  complianceResults ComplianceResult[]

  @@map("vendors")
}

enum VendorStatus {
  PENDING
  ACTIVE
  INACTIVE
  SUSPENDED
}

// ==================== DOCUMENTS & OCR ====================

model Document {
  id            String         @id @default(uuid())
  vendorId      String         @map("vendor_id")
  fileName      String         @map("file_name")
  originalName  String         @map("original_name")
  s3Key         String         @map("s3_key")
  fileSize      Int            @map("file_size")
  mimeType      String         @map("mime_type")
  status        DocumentStatus @default(UPLOADED)
  aiConfidence  Float?         @map("ai_confidence")
  ocrProvider   String?        @map("ocr_provider")
  ocrRawText    String?        @map("ocr_raw_text")
  verifiedBy    String?        @map("verified_by")
  verifiedAt    DateTime?      @map("verified_at")
  createdAt     DateTime       @default(now()) @map("created_at")

  vendor        Vendor         @relation(fields: [vendorId], references: [id])
  verifier      User?          @relation("VerifiedBy", fields: [verifiedBy], references: [id])
  coverages     ExtractedCoverage[]
  tasks         VerificationTask[]

  @@map("documents")
}

enum DocumentStatus {
  UPLOADED
  PROCESSING
  AI_COMPLETE
  REVIEW_NEEDED
  VERIFIED
  REJECTED
}

model ExtractedCoverage {
  id                  String    @id @default(uuid())
  documentId          String    @map("document_id")
  policyType          String    @map("policy_type")
  policyNumber        String?   @map("policy_number")
  insurerName         String?   @map("insurer_name")
  insuredName         String?   @map("insured_name")
  effectiveDate       DateTime? @map("effective_date")
  expirationDate      DateTime? @map("expiration_date")
  limitAmount         Decimal?  @map("limit_amount")
  currency            String    @default("ILS")
  deductible          Decimal?
  endorsements        Json      @default("[]")
  additionalInsured   Boolean   @default(false) @map("additional_insured")
  waiverOfSubrogation Boolean   @default(false) @map("waiver_of_subrogation")
  aiConfidence        Float?    @map("ai_confidence")
  fieldConfidences    Json?     @map("field_confidences")
  isVerified          Boolean   @default(false) @map("is_verified")
  verifiedAt          DateTime? @map("verified_at")
  createdAt           DateTime  @default(now()) @map("created_at")

  document            Document  @relation(fields: [documentId], references: [id])
  complianceResults   ComplianceResult[]

  @@map("extracted_coverages")
}

// ==================== REQUIREMENTS & COMPLIANCE ====================

model RequirementTemplate {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  name           String
  description    String?
  vendorType     String?  @map("vendor_type")
  isDefault      Boolean  @default(false) @map("is_default")
  createdAt      DateTime @default(now()) @map("created_at")

  organization   Organization @relation(fields: [organizationId], references: [id])
  requirements   TemplateRequirement[]

  @@map("requirement_templates")
}

model TemplateRequirement {
  id                   String   @id @default(uuid())
  templateId           String   @map("template_id")
  policyType           String   @map("policy_type")
  minLimit             Decimal? @map("min_limit")
  currency             String   @default("ILS")
  requiredEndorsements Json     @default("[]") @map("required_endorsements")
  isMandatory          Boolean  @default(true) @map("is_mandatory")
  notes                String?

  template             RequirementTemplate @relation(fields: [templateId], references: [id])

  @@map("template_requirements")
}

model VendorRequirement {
  id                   String   @id @default(uuid())
  vendorId             String   @map("vendor_id")
  contractId           String?  @map("contract_id")
  policyType           String   @map("policy_type")
  minLimit             Decimal? @map("min_limit")
  currency             String   @default("ILS")
  requiredEndorsements Json     @default("[]") @map("required_endorsements")
  isMandatory          Boolean  @default(true) @map("is_mandatory")
  notes                String?
  createdAt            DateTime @default(now()) @map("created_at")

  vendor               Vendor   @relation(fields: [vendorId], references: [id])
  contract             Contract? @relation(fields: [contractId], references: [id])
  complianceResults    ComplianceResult[]

  @@map("vendor_requirements")
}

model ComplianceResult {
  id            String           @id @default(uuid())
  vendorId      String           @map("vendor_id")
  requirementId String           @map("requirement_id")
  coverageId    String?          @map("coverage_id")
  status        ComplianceStatus
  gapDetails    Json?            @map("gap_details")
  checkedAt     DateTime         @default(now()) @map("checked_at")

  vendor        Vendor           @relation(fields: [vendorId], references: [id])
  requirement   VendorRequirement @relation(fields: [requirementId], references: [id])
  coverage      ExtractedCoverage? @relation(fields: [coverageId], references: [id])

  @@map("compliance_results")
}

enum ComplianceStatus {
  COMPLIANT
  WARNING
  NON_COMPLIANT
  PENDING
}

// ==================== CONTRACTS ====================

model Contract {
  id             String    @id @default(uuid())
  vendorId       String    @map("vendor_id")
  contractNumber String?   @map("contract_number")
  title          String?
  startDate      DateTime? @map("start_date")
  endDate        DateTime? @map("end_date")
  insuranceTerms Json?     @map("insurance_terms")
  documentUrl    String?   @map("document_url")
  status         String    @default("active")
  createdAt      DateTime  @default(now()) @map("created_at")

  vendor         Vendor    @relation(fields: [vendorId], references: [id])
  requirements   VendorRequirement[]

  @@map("contracts")
}

// ==================== VERIFICATION ====================

model VerificationTask {
  id          String             @id @default(uuid())
  documentId  String             @map("document_id")
  assignedTo  String?            @map("assigned_to")
  priority    TaskPriority       @default(MEDIUM)
  status      TaskStatus         @default(PENDING)
  slaDeadline DateTime?          @map("sla_deadline")
  startedAt   DateTime?          @map("started_at")
  completedAt DateTime?          @map("completed_at")
  notes       String?
  createdAt   DateTime           @default(now()) @map("created_at")

  document    Document           @relation(fields: [documentId], references: [id])
  assignee    User?              @relation(fields: [assignedTo], references: [id])

  @@map("verification_tasks")
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  ESCALATED
}

// ==================== RFQ MODULE ====================

model RfqClient {
  id              String   @id @default(uuid())
  organizationId  String   @map("organization_id")
  name            String
  companyId       String?  @map("company_id")
  sector          String
  subSector       String?  @map("sub_sector")
  employeeCount   Int?     @map("employee_count")
  annualRevenue   Decimal? @map("annual_revenue")
  riskProfile     Json?    @map("risk_profile")
  contactName     String?  @map("contact_name")
  contactEmail    String?  @map("contact_email")
  contactPhone    String?  @map("contact_phone")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  questionnaires  RfqQuestionnaire[]
  documents       RfqDocument[]

  @@map("rfq_clients")
}

model RfqQuestionnaire {
  id         String   @id @default(uuid())
  clientId   String   @map("client_id")
  answers    Json
  status     String   @default("draft")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  client     RfqClient @relation(fields: [clientId], references: [id])

  @@map("rfq_questionnaires")
}

model RfqDocument {
  id         String   @id @default(uuid())
  clientId   String   @map("client_id")
  fileName   String   @map("file_name")
  s3Key      String   @map("s3_key")
  format     String
  createdAt  DateTime @default(now()) @map("created_at")

  client     RfqClient @relation(fields: [clientId], references: [id])

  @@map("rfq_documents")
}

model InsuranceKnowledgeBase {
  id                   String   @id @default(uuid())
  sector               String
  policyType           String   @map("policy_type")
  policyTypeHe         String   @map("policy_type_he")
  recommendedLimit     Decimal? @map("recommended_limit")
  isMandatory          Boolean  @default(false) @map("is_mandatory")
  commonEndorsements   Json     @default("[]") @map("common_endorsements")
  riskFactors          Json     @default("[]") @map("risk_factors")
  description          String?
  descriptionHe        String?  @map("description_he")
  createdAt            DateTime @default(now()) @map("created_at")

  @@unique([sector, policyType])
  @@map("insurance_knowledge_base")
}

// ==================== NOTIFICATIONS ====================

model Notification {
  id            String   @id @default(uuid())
  recipientId   String   @map("recipient_id")
  recipientType String   @map("recipient_type")
  type          String
  title         String
  message       String
  data          Json?
  isRead        Boolean  @default(false) @map("is_read")
  sentVia       String[]  @map("sent_via")
  createdAt     DateTime @default(now()) @map("created_at")

  @@map("notifications")
}

// ==================== AUDIT ====================

model AuditLog {
  id          String   @id @default(uuid())
  entityType  String   @map("entity_type")
  entityId    String   @map("entity_id")
  action      String
  actorId     String?  @map("actor_id")
  actorType   String   @map("actor_type")
  oldValue    Json?    @map("old_value")
  newValue    Json?    @map("new_value")
  ipAddress   String?  @map("ip_address")
  createdAt   DateTime @default(now()) @map("created_at")

  actor       User?    @relation(fields: [actorId], references: [id])

  @@map("audit_log")
}
```

### 8.3 Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_vendors_org_status ON vendors(organization_id, status);
CREATE INDEX idx_documents_vendor_status ON documents(vendor_id, status);
CREATE INDEX idx_coverages_expiration ON extracted_coverages(expiration_date);
CREATE INDEX idx_compliance_vendor_status ON compliance_results(vendor_id, status);
CREATE INDEX idx_tasks_assignee_status ON verification_tasks(assigned_to, status);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- Full-text search
CREATE INDEX idx_vendors_name_gin ON vendors USING gin(to_tsvector('hebrew', name));
CREATE INDEX idx_rfq_clients_name_gin ON rfq_clients USING gin(to_tsvector('hebrew', name));
```

---

## 9. Security Architecture

### 9.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
├── WAF (Web Application Firewall)
├── DDoS Protection (Vercel/Cloudflare)
├── TLS 1.3 Encryption
└── IP Whitelisting (Admin endpoints)

Layer 2: Application Security
├── Input Validation (Zod schemas)
├── Output Encoding
├── CSRF Protection
├── XSS Prevention (CSP headers)
└── SQL Injection Prevention (Prisma ORM)

Layer 3: Authentication
├── JWT with short expiry (15 min)
├── Refresh tokens (7 days, rotated)
├── Magic link authentication
├── Session management (Redis)
└── Password hashing (bcrypt)

Layer 4: Authorization
├── Role-based access control (RBAC)
├── Resource-level permissions
├── Multi-tenant isolation
└── API key management

Layer 5: Data Security
├── Encryption at rest (AES-256)
├── Encryption in transit (TLS)
├── PII handling compliance
└── Audit logging
```

### 9.2 Security Headers

```typescript
// Security headers configuration
const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://api.docupipe.ai;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
```

### 9.3 Data Protection

```typescript
// PII field encryption
const sensitiveFields = [
  'email',
  'phone',
  'companyId',
  'bankDetails',
];

// Encryption utility
class DataEncryption {
  private algorithm = 'aes-256-gcm';

  encrypt(plaintext: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    // ... encryption logic
  }

  decrypt(encrypted: EncryptedData): string {
    // ... decryption logic
  }
}
```

---

## 10. Authentication & Authorization

### 10.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOWS                          │
└─────────────────────────────────────────────────────────────────┘

Flow 1: Email/Password Login (Staff)
────────────────────────────────────
[User] → [Login Form] → [API] → [Validate Credentials] → [Generate JWT]
                                                                  │
                                                                  ▼
                                              [Set Access Token (15min)]
                                              [Set Refresh Token (7 days)]

Flow 2: Magic Link Login (Vendors)
──────────────────────────────────
[Vendor] → [Request Magic Link] → [API] → [Generate Token] → [Send Email]
                                                                    │
[Vendor] → [Click Link] → [API] → [Validate Token] → [Generate JWT] ◄─┘

Flow 3: Token Refresh
─────────────────────
[Client] → [Access Token Expired] → [Send Refresh Token] → [Validate]
                                                                │
                                                                ▼
                                              [Rotate Refresh Token]
                                              [Issue New Access Token]
```

### 10.2 JWT Structure

```typescript
// Access Token Payload
interface AccessTokenPayload {
  sub: string;          // User ID
  org: string;          // Organization ID
  role: UserRole;       // User role
  type: 'access';
  iat: number;          // Issued at
  exp: number;          // Expires (15 min)
}

// Refresh Token Payload
interface RefreshTokenPayload {
  sub: string;          // User ID
  type: 'refresh';
  jti: string;          // Token ID (for rotation)
  iat: number;
  exp: number;          // Expires (7 days)
}
```

### 10.3 Role-Based Access Control (RBAC)

```typescript
// Permission definitions
const permissions = {
  ADMIN: [
    'users:*',
    'vendors:*',
    'documents:*',
    'compliance:*',
    'settings:*',
    'reports:*',
  ],
  COMPLIANCE_MANAGER: [
    'vendors:read',
    'vendors:write',
    'documents:read',
    'compliance:*',
    'reports:read',
  ],
  CONTRACT_MANAGER: [
    'vendors:read',
    'vendors:write',
    'requirements:*',
    'documents:read',
  ],
  REVIEWER: [
    'documents:read',
    'verification:*',
  ],
  EXPERT_REVIEWER: [
    'documents:read',
    'verification:*',
    'escalation:handle',
  ],
};

// Authorization middleware
const authorize = (requiredPermission: string) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const userPermissions = permissions[req.user.role];
    const hasPermission = checkPermission(userPermissions, requiredPermission);

    if (!hasPermission) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
  };
};
```

---

## 11. Internationalization (i18n)

### 11.1 Language Support

| Feature | Hebrew (he) | English (en) |
|---------|-------------|--------------|
| **UI Direction** | RTL | LTR |
| **Date Format** | DD/MM/YYYY | MM/DD/YYYY |
| **Number Format** | 1,234.56 | 1,234.56 |
| **Currency** | ₪ (ILS) | ₪ (ILS) |
| **Default** | Yes | No |

### 11.2 i18n Implementation

```typescript
// next-i18next configuration
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'he',
    locales: ['he', 'en'],
    localeDetection: true,
  },
  localePath: './locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

// Locale files structure
locales/
├── he/
│   ├── common.json
│   ├── dashboard.json
│   ├── vendors.json
│   ├── compliance.json
│   ├── documents.json
│   └── errors.json
└── en/
    ├── common.json
    ├── dashboard.json
    ├── vendors.json
    ├── compliance.json
    ├── documents.json
    └── errors.json
```

### 11.3 Translation Examples

```json
// locales/he/common.json
{
  "navigation": {
    "dashboard": "לוח בקרה",
    "vendors": "ספקים",
    "documents": "מסמכים",
    "compliance": "ציות",
    "settings": "הגדרות"
  },
  "actions": {
    "save": "שמור",
    "cancel": "ביטול",
    "delete": "מחק",
    "edit": "עריכה",
    "add": "הוסף",
    "upload": "העלאה",
    "download": "הורדה",
    "export": "ייצוא"
  },
  "status": {
    "compliant": "תקין",
    "warning": "אזהרה",
    "non_compliant": "לא תקין",
    "pending": "ממתין"
  },
  "insurance": {
    "general_liability": "ביטוח צד ג'",
    "professional_indemnity": "ביטוח אחריות מקצועית",
    "workers_comp": "ביטוח עובדים",
    "employer_liability": "ביטוח חבות מעבידים"
  }
}
```

### 11.4 RTL Support

```typescript
// RTL-aware component wrapper
import { useRouter } from 'next/router';

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useRouter();
  const direction = locale === 'he' ? 'rtl' : 'ltr';

  return (
    <div dir={direction} className={direction === 'rtl' ? 'font-hebrew' : 'font-english'}>
      {children}
    </div>
  );
}

// Tailwind RTL utilities
// tailwind.config.js
module.exports = {
  plugins: [
    require('tailwindcss-rtl'),
  ],
};

// Usage in components
<div className="ps-4 pe-2 ms-auto me-0">
  {/* ps = padding-start, pe = padding-end */}
  {/* ms = margin-start, me = margin-end */}
</div>
```

---

## 12. UX/UI Design Guidelines

### 12.1 Design System

```
┌─────────────────────────────────────────────────────────────────┐
│                      DESIGN SYSTEM                               │
└─────────────────────────────────────────────────────────────────┘

Colors (Brand)
──────────────
Primary:    #2563EB (Blue 600)
Secondary:  #7C3AED (Purple 600)
Success:    #059669 (Green 600)
Warning:    #D97706 (Amber 600)
Error:      #DC2626 (Red 600)
Neutral:    #6B7280 (Gray 500)

Typography
──────────
Hebrew Font:  'Heebo', sans-serif
English Font: 'Inter', sans-serif
Headings:     Bold, tracking-tight
Body:         Regular, leading-relaxed

Spacing Scale
─────────────
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

Border Radius
─────────────
Small:  4px
Medium: 8px
Large:  12px
Full:   9999px

Shadows
───────
sm:  0 1px 2px rgba(0,0,0,0.05)
md:  0 4px 6px rgba(0,0,0,0.1)
lg:  0 10px 15px rgba(0,0,0,0.1)
xl:  0 20px 25px rgba(0,0,0,0.15)
```

### 12.2 Component Library (Materio MUI)

```typescript
// Theme customization
// theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#7C3AED',
    },
  },
  typography: {
    fontFamily: '"Heebo", "Inter", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
```

### 12.3 Responsive Breakpoints

```typescript
// Breakpoints
const breakpoints = {
  xs: '0px',      // Mobile
  sm: '640px',    // Tablet
  md: '768px',    // Small laptop
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large
};

// Layout grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Responsive card grid */}
</div>
```

### 12.4 Accessibility Standards

```typescript
// WCAG 2.1 AA Compliance
const accessibilityChecklist = [
  'Color contrast ratio >= 4.5:1',
  'Focus indicators visible',
  'Keyboard navigation support',
  'Screen reader compatibility',
  'Alt text for images',
  'Form labels and error messages',
  'Skip navigation links',
  'Consistent navigation',
];

// Accessible button example
<Button
  aria-label="Upload insurance certificate"
  aria-describedby="upload-help"
  disabled={isUploading}
>
  {isUploading ? <Spinner aria-hidden /> : <UploadIcon aria-hidden />}
  <span>Upload</span>
</Button>
<span id="upload-help" className="sr-only">
  Supported formats: PDF, JPG, PNG. Max size: 10MB
</span>
```

---

## 13. User Roles & Permissions

### 13.1 Role Matrix

| Role | Hebrew | Portal Access | Capabilities |
|------|--------|---------------|--------------|
| **System Admin** | מנהל מערכת | Admin | Full system access, user management |
| **Compliance Manager** | מנהל ציות | Admin | Vendor management, compliance review |
| **Contract Manager** | מנהל חוזים | Admin | Requirements, contracts |
| **Reviewer** | בודק | Reviewer | Document verification |
| **Expert Reviewer** | מומחה ביטוח | Reviewer | Complex cases, escalations |
| **Vendor** | ספק | Vendor | Upload documents, view status |
| **RFQ User** | משתמש RFQ | RFQ | Questionnaire, generate RFQ |

### 13.2 Permission Granularity

```typescript
// Permission structure
type Permission = {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | '*';
  scope?: 'own' | 'organization' | 'all';
  conditions?: Record<string, any>;
};

// Example permissions
const complianceManagerPermissions: Permission[] = [
  { resource: 'vendors', action: 'read', scope: 'organization' },
  { resource: 'vendors', action: 'create', scope: 'organization' },
  { resource: 'vendors', action: 'update', scope: 'organization' },
  { resource: 'documents', action: 'read', scope: 'organization' },
  { resource: 'compliance', action: '*', scope: 'organization' },
  { resource: 'reports', action: 'read', scope: 'organization' },
];
```

### 13.3 Multi-Tenancy

```typescript
// Organization isolation middleware
const organizationScope = async (req: FastifyRequest) => {
  const orgId = req.user.organizationId;

  // Add organization filter to all queries
  req.queryFilter = {
    ...req.queryFilter,
    organizationId: orgId,
  };
};

// Prisma middleware for multi-tenancy
prisma.$use(async (params, next) => {
  if (params.model && multiTenantModels.includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        organizationId: currentOrgId,
      };
    }
  }
  return next(params);
});
```

---

## 14. Algorithms & Business Logic

### 14.1 RFQ Generation Algorithm

```typescript
// RFQ Generation Flow
async function generateRFQ(clientId: string, answers: QuestionnaireAnswers): Promise<RFQDocument> {
  // Step 1: Load client profile
  const client = await getClient(clientId);

  // Step 2: Get sector-specific requirements from Knowledge Base
  const baseRequirements = await getKnowledgeBase(client.sector);

  // Step 3: Apply rule engine based on questionnaire answers
  const adjustedRequirements = applyRules(baseRequirements, answers);

  // Step 4: Calculate recommended limits based on risk factors
  const finalRequirements = calculateLimits(adjustedRequirements, client);

  // Step 5: Generate document
  const document = await renderRFQDocument(client, finalRequirements);

  return document;
}

// Rule Engine Example
function applyRules(requirements: Requirement[], answers: Answers): Requirement[] {
  const rules: Rule[] = [
    {
      condition: (a) => a.hasInternationalOperations === true,
      action: (reqs) => reqs.push({ type: 'FOREIGN_LIABILITY', mandatory: true }),
    },
    {
      condition: (a) => a.employeeCount > 100,
      action: (reqs) => {
        const wc = reqs.find(r => r.type === 'WORKERS_COMP');
        if (wc) wc.minLimit *= 1.5;
      },
    },
    {
      condition: (a) => a.sector === 'CONSTRUCTION' && a.projectValue > 10000000,
      action: (reqs) => reqs.push({ type: 'CAR_INSURANCE', mandatory: true }),
    },
  ];

  let result = [...requirements];
  for (const rule of rules) {
    if (rule.condition(answers)) {
      rule.action(result);
    }
  }
  return result;
}
```

### 14.2 Compliance Matching Algorithm

```typescript
// Compliance Check Algorithm
async function checkCompliance(vendorId: string): Promise<ComplianceResult[]> {
  const requirements = await getVendorRequirements(vendorId);
  const coverages = await getVerifiedCoverages(vendorId);

  const results: ComplianceResult[] = [];

  for (const requirement of requirements) {
    const matchingCoverage = findMatchingCoverage(requirement, coverages);

    if (!matchingCoverage) {
      results.push({
        requirementId: requirement.id,
        status: 'NON_COMPLIANT',
        gapDetails: { reason: 'MISSING_POLICY', policyType: requirement.policyType },
      });
      continue;
    }

    const gaps = analyzeGaps(requirement, matchingCoverage);

    if (gaps.length === 0) {
      results.push({
        requirementId: requirement.id,
        coverageId: matchingCoverage.id,
        status: 'COMPLIANT',
      });
    } else if (gaps.some(g => g.severity === 'HIGH')) {
      results.push({
        requirementId: requirement.id,
        coverageId: matchingCoverage.id,
        status: 'NON_COMPLIANT',
        gapDetails: gaps,
      });
    } else {
      results.push({
        requirementId: requirement.id,
        coverageId: matchingCoverage.id,
        status: 'WARNING',
        gapDetails: gaps,
      });
    }
  }

  return results;
}

// Gap Analysis
function analyzeGaps(requirement: Requirement, coverage: Coverage): Gap[] {
  const gaps: Gap[] = [];

  // Check limit
  if (coverage.limitAmount < requirement.minLimit) {
    gaps.push({
      type: 'INSUFFICIENT_LIMIT',
      severity: 'HIGH',
      required: requirement.minLimit,
      actual: coverage.limitAmount,
      shortfall: requirement.minLimit - coverage.limitAmount,
    });
  }

  // Check expiration
  const daysUntilExpiry = differenceInDays(coverage.expirationDate, new Date());
  if (daysUntilExpiry < 0) {
    gaps.push({ type: 'EXPIRED', severity: 'HIGH', daysExpired: Math.abs(daysUntilExpiry) });
  } else if (daysUntilExpiry < 30) {
    gaps.push({ type: 'EXPIRING_SOON', severity: 'MEDIUM', daysRemaining: daysUntilExpiry });
  }

  // Check endorsements
  for (const required of requirement.requiredEndorsements) {
    if (!coverage.endorsements.includes(required)) {
      gaps.push({ type: 'MISSING_ENDORSEMENT', severity: 'MEDIUM', endorsement: required });
    }
  }

  return gaps;
}
```

### 14.3 Confidence Scoring Algorithm

```typescript
// AI Confidence Scoring
function calculateConfidence(extraction: AIExtraction): number {
  const fieldWeights = {
    policyType: 0.20,
    insurerName: 0.15,
    policyNumber: 0.10,
    limitAmount: 0.20,
    effectiveDate: 0.10,
    expirationDate: 0.15,
    insuredName: 0.10,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [field, weight] of Object.entries(fieldWeights)) {
    const fieldConfidence = extraction.fieldConfidences[field] || 0;
    weightedSum += fieldConfidence * weight;
    totalWeight += weight;
  }

  const baseConfidence = weightedSum / totalWeight;

  // Apply penalties
  let penalties = 0;
  if (extraction.ocrQuality < 0.8) penalties += 0.1;
  if (extraction.documentType !== 'INSURANCE_CERTIFICATE') penalties += 0.15;
  if (extraction.language !== 'he' && extraction.language !== 'en') penalties += 0.1;

  return Math.max(0, baseConfidence - penalties);
}

// Verification Routing based on confidence
function routeForVerification(confidence: number): VerificationRoute {
  if (confidence >= 0.95) {
    return { type: 'AUTO_APPROVE', reviewers: 0 };
  } else if (confidence >= 0.70) {
    return { type: 'SINGLE_REVIEW', reviewers: 1, priority: 'MEDIUM' };
  } else {
    return { type: 'DUAL_REVIEW', reviewers: 2, priority: 'HIGH' };
  }
}
```

---

## 15. AI/OCR Processing Pipeline

### 15.1 Document Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  DOCUMENT PROCESSING PIPELINE                    │
└─────────────────────────────────────────────────────────────────┘

Stage 1: Upload & Validation
────────────────────────────
[File Upload] → [Virus Scan] → [Format Validation] → [Size Check]
                                                          │
                                                          ▼
                                                   [Store in S3]
                                                   [Create DB Record]

Stage 2: OCR Processing (Docupipe)
──────────────────────────────────
[Send to Docupipe API] → [Hebrew OCR] → [Text Extraction]
                                              │
                                              ▼
                                       [Store Raw Text]

Stage 3: AI Field Extraction
────────────────────────────
[Structured Extraction Prompt] → [GPT-4 / Claude] → [JSON Output]
                                                          │
                                                          ▼
                                               [Field Validation]
                                               [Confidence Scoring]

Stage 4: Post-Processing
────────────────────────
[Normalize Values] → [Date Parsing] → [Currency Conversion]
                                            │
                                            ▼
                                     [Save Extracted Data]
                                     [Route for Verification]
```

### 15.2 OCR Integration (Docupipe)

```typescript
// Docupipe OCR Service
class DocupipeService {
  private baseUrl = 'https://api.docupipe.ai/v1';

  async extractText(fileBuffer: Buffer, options: OCROptions): Promise<OCRResult> {
    const formData = new FormData();
    formData.append('file', fileBuffer);
    formData.append('language', 'heb+eng');
    formData.append('output_format', 'text');

    const response = await fetch(`${this.baseUrl}/ocr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    const result = await response.json();

    return {
      text: result.text,
      confidence: result.confidence,
      pages: result.pages,
      processingTime: result.processing_time_ms,
    };
  }
}
```

### 15.3 AI Field Extraction

```typescript
// AI Extraction Service
class AIExtractionService {
  private prompt = `
    You are an expert in Israeli insurance documents.
    Extract the following fields from the insurance certificate text:

    - policy_type: Type of insurance (GL, PI, WC, EL, etc.)
    - policy_number: Policy number
    - insurer_name: Insurance company name
    - insured_name: Name of the insured party
    - effective_date: Policy start date (format: YYYY-MM-DD)
    - expiration_date: Policy end date (format: YYYY-MM-DD)
    - limit_amount: Coverage limit amount (number only)
    - currency: Currency (ILS, USD, EUR)
    - deductible: Deductible amount
    - additional_insured: Is there an additional insured? (true/false)
    - waiver_of_subrogation: Is there waiver of subrogation? (true/false)
    - endorsements: List of endorsements/extensions

    For each field, also provide a confidence score (0-1).

    Return as JSON.
  `;

  async extractFields(ocrText: string): Promise<ExtractionResult> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: this.prompt },
        { role: 'user', content: ocrText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    return JSON.parse(response.choices[0].message.content);
  }
}
```

### 15.4 Insurance Type Mapping

```typescript
// Hebrew to English policy type mapping
const policyTypeMapping = {
  // Hebrew terms
  'ביטוח צד ג\'': 'GENERAL_LIABILITY',
  'צד שלישי': 'GENERAL_LIABILITY',
  'אחריות מקצועית': 'PROFESSIONAL_INDEMNITY',
  'ביטוח עובדים': 'WORKERS_COMPENSATION',
  'חבות מעבידים': 'EMPLOYER_LIABILITY',
  'רכוש': 'PROPERTY',
  'אחריות המוצר': 'PRODUCT_LIABILITY',
  'סייבר': 'CYBER_LIABILITY',
  'דירקטורים ונושאי משרה': 'D_AND_O',

  // English terms
  'General Liability': 'GENERAL_LIABILITY',
  'Professional Indemnity': 'PROFESSIONAL_INDEMNITY',
  'Workers Compensation': 'WORKERS_COMPENSATION',
  'Employer Liability': 'EMPLOYER_LIABILITY',
};

function normalizePolicyType(rawType: string): string {
  const normalized = rawType.trim().toLowerCase();

  for (const [pattern, type] of Object.entries(policyTypeMapping)) {
    if (normalized.includes(pattern.toLowerCase())) {
      return type;
    }
  }

  return 'UNKNOWN';
}
```

---

## 16. Development Workflow

### 16.1 Development Phases

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────┘

Phase 1: Planning
─────────────────
[Requirements] → [Technical Design] → [Task Breakdown] → [Sprint Planning]

Phase 2: Development
────────────────────
[Feature Branch] → [Code] → [Unit Tests] → [Local Testing] → [PR]

Phase 3: Review
───────────────
[Code Review] → [QA Review] → [Approval] → [Merge to Develop]

Phase 4: Testing
────────────────
[Integration Tests] → [E2E Tests] → [UAT] → [Bug Fixes]

Phase 5: Release
────────────────
[Staging Deploy] → [Smoke Tests] → [Production Deploy] → [Monitoring]
```

### 16.2 Sprint Structure

```
Sprint Duration: 2 weeks

Day 1:     Sprint Planning
Days 2-9:  Development
Day 10:    Code Freeze
Day 11:    QA & Bug Fixes
Day 12:    Release to Staging
Day 13:    UAT
Day 14:    Release to Production + Retrospective
```

### 16.3 Code Review Checklist

```markdown
## Code Review Checklist

### Functionality
- [ ] Code implements the requirements correctly
- [ ] Edge cases are handled
- [ ] Error handling is appropriate

### Code Quality
- [ ] Code is readable and well-organized
- [ ] Functions are small and focused
- [ ] No code duplication
- [ ] Proper naming conventions

### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevention
- [ ] XSS prevention

### Testing
- [ ] Unit tests added/updated
- [ ] Tests pass locally
- [ ] Edge cases tested

### Documentation
- [ ] Code comments where needed
- [ ] API documentation updated
- [ ] README updated if needed

### Performance
- [ ] No N+1 queries
- [ ] Proper indexing
- [ ] No memory leaks
```

---

## 17. Git Strategy

### 17.1 Branch Model (GitFlow)

```
┌─────────────────────────────────────────────────────────────────┐
│                      BRANCH MODEL                                │
└─────────────────────────────────────────────────────────────────┘

main (production)
  │
  ├── release/v1.0.0  ─────────────────────────────────┐
  │                                                     │
  │   develop                                           │
  │     │                                               │
  │     ├── feature/RIS-123-vendor-upload              │
  │     │     └── (merge to develop)                   │
  │     │                                               │
  │     ├── feature/RIS-124-compliance-check           │
  │     │     └── (merge to develop)                   │
  │     │                                               │
  │     └── (merge to release)  ────────────────────────┘
  │                                                     │
  └── (merge release to main) ──────────────────────────┘

hotfix/v1.0.1
  └── (branch from main, merge to main AND develop)
```

### 17.2 Branch Naming Convention

```
feature/RIS-{ticket}-{short-description}
bugfix/RIS-{ticket}-{short-description}
hotfix/RIS-{ticket}-{short-description}
release/v{major}.{minor}.{patch}

Examples:
- feature/RIS-123-vendor-portal-upload
- bugfix/RIS-456-fix-compliance-calculation
- hotfix/RIS-789-security-patch
- release/v1.2.0
```

### 17.3 Commit Convention

```
<type>(<scope>): <subject>

<body>

<footer>

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation
- style:    Formatting
- refactor: Code restructuring
- test:     Adding tests
- chore:    Maintenance

Examples:
feat(vendors): add bulk import functionality

- Added CSV/Excel import support
- Implemented validation for imported data
- Added progress indicator

Closes RIS-123

---

fix(compliance): correct limit comparison logic

The comparison was using > instead of >= causing
false non-compliance reports.

Fixes RIS-456
```

### 17.4 Pull Request Template

```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Feature
- [ ] Bug Fix
- [ ] Refactoring
- [ ] Documentation
- [ ] Other

## Related Issues
Closes #

## Testing
<!-- How was this tested? -->

## Screenshots
<!-- If applicable -->

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings
```

---

## 18. CI/CD Pipeline

### 18.1 Pipeline Overview

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: riskcovery_test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/riskcovery_test

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: |
            apps/web/.next
            apps/api/dist
```

### 18.2 Deployment Pipeline

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Run Database Migrations
        run: |
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🚀 Riskcovery deployed to production: ${{ github.ref_name }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 18.3 Environment Promotion

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT PROMOTION                         │
└─────────────────────────────────────────────────────────────────┘

Development → Staging → Production

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  DEVELOPMENT │     │   STAGING    │     │  PRODUCTION  │
│              │     │              │     │              │
│ Branch:      │     │ Branch:      │     │ Branch:      │
│ develop      │────▶│ release/*    │────▶│ main         │
│              │     │              │     │              │
│ Auto-deploy  │     │ Auto-deploy  │     │ Manual/Tag   │
│ on push      │     │ on merge     │     │ deployment   │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 19. Deployment Strategy

### 19.1 Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION INFRASTRUCTURE                     │
└─────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   Cloudflare    │
                         │   DNS + WAF     │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │  Vercel Edge    │
                         │  (CDN + SSL)    │
                         └────────┬────────┘
                                  │
              ┌───────────────────┴───────────────────┐
              │                                       │
     ┌────────▼────────┐                    ┌────────▼────────┐
     │  Vercel         │                    │  Vercel         │
     │  Serverless     │                    │  Serverless     │
     │  (Next.js)      │                    │  (API Routes)   │
     └────────┬────────┘                    └────────┬────────┘
              │                                       │
              └───────────────────┬───────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
┌────────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
│   Supabase      │     │    Upstash      │     │    AWS S3       │
│   PostgreSQL    │     │    Redis        │     │    (Files)      │
│   (Database)    │     │    (Cache)      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 19.2 Environment Configuration

```bash
# .env.example

# Application
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/riskcovery

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-1
AWS_S3_BUCKET=riskcovery-documents

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=

# OCR Service (Docupipe)
DOCUPIPE_API_KEY=
DOCUPIPE_API_URL=https://api.docupipe.ai/v1

# AI Service (OpenAI)
OPENAI_API_KEY=

# Email (SendGrid)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@riskcovery.co.il

# Monitoring
SENTRY_DSN=
```

### 19.3 Deployment Checklist

```markdown
## Pre-Deployment Checklist

### Code
- [ ] All tests passing
- [ ] Code review approved
- [ ] No console.log statements
- [ ] Environment variables documented

### Database
- [ ] Migrations tested on staging
- [ ] Backup created
- [ ] Rollback plan ready

### Infrastructure
- [ ] SSL certificates valid
- [ ] DNS configured
- [ ] CDN cache cleared

### Monitoring
- [ ] Alerts configured
- [ ] Logging enabled
- [ ] Error tracking active

### Communication
- [ ] Team notified
- [ ] Users notified (if downtime)
- [ ] Support team briefed
```

---

## 20. Environment Configuration

### 20.1 Environment Matrix

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | development | staging | production |
| `DATABASE_URL` | Local PG | Supabase Staging | Supabase Prod |
| `REDIS_URL` | Local Redis | Upstash Staging | Upstash Prod |
| `LOG_LEVEL` | debug | info | warn |
| `RATE_LIMIT` | disabled | 100/min | 60/min |

### 20.2 Secret Management

```typescript
// Using Vercel Environment Variables
// Secrets are encrypted and injected at runtime

// Never commit secrets to git
// Use .env.local for local development (gitignored)

// Access in code
const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  redis: {
    url: process.env.REDIS_URL!,
  },
  auth: {
    secret: process.env.JWT_SECRET!,
  },
  ocr: {
    apiKey: process.env.DOCUPIPE_API_KEY!,
  },
};
```

---

## 21. Monitoring & Logging

### 21.1 Monitoring Stack

| Tool | Purpose | Metrics |
|------|---------|---------|
| **Vercel Analytics** | Performance | Core Web Vitals, page load |
| **Sentry** | Error tracking | Exceptions, stack traces |
| **Upstash** | Redis metrics | Memory, connections |
| **Supabase** | Database metrics | Queries, connections |

### 21.2 Logging Strategy

```typescript
// Structured logging with Pino
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

// Log levels
logger.trace('Detailed tracing');
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning conditions');
logger.error('Error conditions');
logger.fatal('Critical errors');

// Structured log example
logger.info({
  event: 'document_processed',
  documentId: '123',
  vendorId: '456',
  processingTime: 1234,
  confidence: 0.95,
}, 'Document processed successfully');
```

### 21.3 Alert Configuration

```typescript
// Alert rules
const alertRules = [
  {
    name: 'High Error Rate',
    condition: 'error_rate > 5%',
    window: '5 minutes',
    severity: 'critical',
    channels: ['slack', 'email'],
  },
  {
    name: 'Slow Response Time',
    condition: 'p95_latency > 2000ms',
    window: '10 minutes',
    severity: 'warning',
    channels: ['slack'],
  },
  {
    name: 'Database Connection Issues',
    condition: 'db_connections > 80%',
    window: '5 minutes',
    severity: 'warning',
    channels: ['slack'],
  },
  {
    name: 'Certificate Expiring',
    condition: 'certificates_expiring_7_days > 0',
    window: '1 day',
    severity: 'info',
    channels: ['email'],
  },
];
```

---

## 22. Testing Strategy

### 22.1 Testing Pyramid

```
                    ┌───────────┐
                    │    E2E    │  10%
                    │  Tests    │
                    ├───────────┤
                    │Integration│  20%
                    │   Tests   │
              ┌─────┴───────────┴─────┐
              │      Unit Tests       │  70%
              └───────────────────────┘
```

### 22.2 Test Types & Tools

| Type | Tool | Coverage Target |
|------|------|-----------------|
| **Unit Tests** | Jest + React Testing Library | 80% |
| **Integration Tests** | Jest + Supertest | Critical paths |
| **E2E Tests** | Playwright | Core user flows |
| **Visual Tests** | Storybook + Chromatic | UI components |

### 22.3 Test Examples

```typescript
// Unit Test Example
describe('ComplianceService', () => {
  describe('checkCompliance', () => {
    it('should return COMPLIANT when all requirements met', async () => {
      const requirement = createMockRequirement({ minLimit: 5000000 });
      const coverage = createMockCoverage({ limitAmount: 6000000 });

      const result = await service.checkCompliance(requirement, coverage);

      expect(result.status).toBe('COMPLIANT');
      expect(result.gapDetails).toBeNull();
    });

    it('should return NON_COMPLIANT when limit insufficient', async () => {
      const requirement = createMockRequirement({ minLimit: 5000000 });
      const coverage = createMockCoverage({ limitAmount: 3000000 });

      const result = await service.checkCompliance(requirement, coverage);

      expect(result.status).toBe('NON_COMPLIANT');
      expect(result.gapDetails.type).toBe('INSUFFICIENT_LIMIT');
      expect(result.gapDetails.shortfall).toBe(2000000);
    });
  });
});

// E2E Test Example
test('vendor can upload certificate and view compliance status', async ({ page }) => {
  // Login as vendor via magic link
  await page.goto('/vendor/login?token=test-token');

  // Upload certificate
  await page.getByRole('button', { name: 'Upload Certificate' }).click();
  await page.setInputFiles('input[type="file"]', 'test-certificate.pdf');
  await page.getByRole('button', { name: 'Submit' }).click();

  // Wait for processing
  await expect(page.getByText('Processing...')).toBeVisible();
  await expect(page.getByText('Certificate uploaded')).toBeVisible({ timeout: 30000 });

  // Check compliance status
  await page.goto('/vendor/status');
  await expect(page.getByText('Compliance Status')).toBeVisible();
});
```

---

## 23. Scalability & Module Extension

### 23.1 Scalability Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALABILITY APPROACH                          │
└─────────────────────────────────────────────────────────────────┘

Horizontal Scaling
──────────────────
• Vercel auto-scales serverless functions
• Supabase connection pooling (PgBouncer)
• Redis cluster for cache scaling
• S3 for unlimited file storage

Vertical Scaling
────────────────
• Database: Upgrade Supabase plan
• Redis: Upgrade Upstash plan
• OCR: Multiple API keys for rate limits

Caching Strategy
────────────────
• Redis for session data
• CDN for static assets
• Query result caching
• Document metadata caching
```

### 23.2 Module Extension Architecture

```typescript
// Plugin-based module system
interface Module {
  name: string;
  version: string;
  routes: Route[];
  services: Service[];
  migrations: Migration[];
  hooks: ModuleHooks;
}

// Module registration
class ModuleRegistry {
  private modules: Map<string, Module> = new Map();

  register(module: Module) {
    // Validate module
    this.validateModule(module);

    // Register routes
    module.routes.forEach(route => this.router.register(route));

    // Register services
    module.services.forEach(service => this.container.register(service));

    // Run migrations
    this.runMigrations(module.migrations);

    this.modules.set(module.name, module);
  }
}

// Example: Adding a new "Claims" module
const claimsModule: Module = {
  name: 'claims',
  version: '1.0.0',
  routes: [
    { path: '/claims', handler: claimsHandler },
    { path: '/claims/:id', handler: claimDetailHandler },
  ],
  services: [
    { name: 'ClaimsService', class: ClaimsService },
  ],
  migrations: [
    { version: '001', up: createClaimsTable },
  ],
  hooks: {
    onVendorCreated: async (vendor) => {
      // Initialize claims tracking for vendor
    },
  },
};
```

### 23.3 Future Modules Roadmap

| Module | Priority | Estimated Effort |
|--------|----------|------------------|
| Claims Management | High | 4 weeks |
| Policy Renewals | High | 3 weeks |
| Broker Integration | Medium | 6 weeks |
| Advanced Analytics | Medium | 4 weeks |
| Mobile App | Low | 8 weeks |
| WhatsApp Bot | Low | 3 weeks |

---

## 24. Performance Optimization

### 24.1 Frontend Optimization

```typescript
// Next.js optimizations

// 1. Image optimization
import Image from 'next/image';
<Image src="/logo.png" width={200} height={50} priority />

// 2. Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// 3. Route prefetching
<Link href="/vendors" prefetch={true}>Vendors</Link>

// 4. Data fetching with caching
async function getVendors() {
  const res = await fetch('/api/vendors', {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  return res.json();
}
```

### 24.2 Backend Optimization

```typescript
// Database query optimization

// 1. Use indexes
// CREATE INDEX idx_vendors_org_status ON vendors(organization_id, status);

// 2. Pagination
const vendors = await prisma.vendor.findMany({
  where: { organizationId },
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});

// 3. Select only needed fields
const vendorNames = await prisma.vendor.findMany({
  select: { id: true, name: true },
});

// 4. Batch queries
const [vendors, totalCount] = await prisma.$transaction([
  prisma.vendor.findMany({ where, skip, take }),
  prisma.vendor.count({ where }),
]);

// 5. Redis caching
async function getVendorCached(id: string) {
  const cached = await redis.get(`vendor:${id}`);
  if (cached) return JSON.parse(cached);

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  await redis.set(`vendor:${id}`, JSON.stringify(vendor), 'EX', 300);
  return vendor;
}
```

### 24.3 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **TTFB** | < 200ms | Time to first byte |
| **LCP** | < 2.5s | Largest contentful paint |
| **FID** | < 100ms | First input delay |
| **CLS** | < 0.1 | Cumulative layout shift |
| **API Response** | < 500ms | p95 latency |
| **OCR Processing** | < 30s | Document to extracted data |

---

## 25. API Documentation

### 25.1 OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Riskcovery API
  version: 1.0.0
  description: Insurance Compliance Management API

servers:
  - url: https://api.riskcovery.co.il/v1
    description: Production
  - url: https://staging-api.riskcovery.co.il/v1
    description: Staging

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Vendor:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
        status:
          type: string
          enum: [PENDING, ACTIVE, INACTIVE]

    ComplianceResult:
      type: object
      properties:
        vendorId:
          type: string
        status:
          type: string
          enum: [COMPLIANT, WARNING, NON_COMPLIANT, PENDING]
        gapDetails:
          type: object

paths:
  /vendors:
    get:
      summary: List vendors
      security:
        - BearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Vendor'
                  pagination:
                    type: object
```

### 25.2 API Response Format

```typescript
// Standard success response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-21T10:00:00Z",
    "requestId": "req_abc123"
  }
}

// Paginated response
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 156,
    "totalPages": 8
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": {
    "timestamp": "2026-01-21T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## 26. Error Handling

### 26.1 Error Classification

```typescript
// Error types
enum ErrorCode {
  // Client errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  OCR_PROCESSING_ERROR = 'OCR_PROCESSING_ERROR',
}

// Custom error class
class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
  }
}

// Error handler middleware
const errorHandler = (error: Error, req: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Log unexpected errors
  logger.error({ error, requestId: req.id }, 'Unexpected error');

  // Send generic error to client
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
```

### 26.2 Error Recovery

```typescript
// Retry logic for external services
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; delay: number }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn({ attempt, error }, 'Operation failed, retrying...');
      await sleep(options.delay * attempt); // Exponential backoff
    }
  }

  throw lastError;
}

// Usage
const ocrResult = await withRetry(
  () => docupipeService.extractText(document),
  { maxRetries: 3, delay: 1000 }
);
```

---

## 27. Backup & Recovery

### 27.1 Backup Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      BACKUP STRATEGY                             │
└─────────────────────────────────────────────────────────────────┘

Database (PostgreSQL via Supabase)
──────────────────────────────────
• Point-in-time recovery (PITR) - 7 days
• Daily automated backups - 30 days retention
• Weekly full backups to S3 - 90 days retention

File Storage (S3)
─────────────────
• Versioning enabled
• Cross-region replication
• Lifecycle policies for old versions

Configuration
─────────────
• Environment variables in Vercel (encrypted)
• Infrastructure as code (Terraform/Pulumi)
• Git repository backups
```

### 27.2 Disaster Recovery Plan

```markdown
## Disaster Recovery Procedures

### Database Failure
1. Supabase auto-failover (< 30 seconds)
2. Manual recovery from PITR if needed
3. Verify data integrity
4. Resume operations

### Application Failure
1. Vercel auto-rollback to last working deployment
2. If persistent, manually deploy previous version
3. Investigate root cause
4. Fix and redeploy

### Data Corruption
1. Identify affected records
2. Restore from point-in-time backup
3. Reconcile any lost transactions
4. Audit and document

### RTO/RPO Targets
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 5 minutes
```

---

## 28. Compliance & Regulations

### 28.1 Privacy Compliance

```
┌─────────────────────────────────────────────────────────────────┐
│                   PRIVACY COMPLIANCE                             │
└─────────────────────────────────────────────────────────────────┘

Israeli Privacy Protection Law (PPPA)
─────────────────────────────────────
• Data minimization
• Purpose limitation
• Secure storage
• Access controls
• Audit logging

GDPR (for EU data subjects)
───────────────────────────
• Consent management
• Right to erasure
• Data portability
• Privacy by design
```

### 28.2 Data Retention Policy

| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| Active vendor data | While active + 7 years | Legal requirement |
| Documents | 7 years | Insurance regulations |
| Audit logs | 7 years | Compliance |
| Session data | 30 days | Security |
| Analytics data | 2 years | Business need |

### 28.3 Security Compliance

```markdown
## Security Standards

### OWASP Top 10 Mitigation
- [x] Injection: Parameterized queries (Prisma)
- [x] Broken Auth: JWT + refresh tokens
- [x] Sensitive Data: Encryption at rest/transit
- [x] XXE: Input validation
- [x] Broken Access: RBAC
- [x] Misconfiguration: Security headers
- [x] XSS: CSP + output encoding
- [x] Deserialization: JSON schema validation
- [x] Components: Automated vulnerability scanning
- [x] Logging: Comprehensive audit trail
```

---

## 29. Future Roadmap

### 29.1 Phase 2 Features (Q2 2026)

| Feature | Description | Priority |
|---------|-------------|----------|
| Claims Module | Full claims tracking and management | High |
| Policy Renewals | Automated renewal workflow | High |
| Advanced Reports | BI dashboard with analytics | Medium |
| Bulk Operations | Mass upload and processing | Medium |

### 29.2 Phase 3 Features (Q3-Q4 2026)

| Feature | Description | Priority |
|---------|-------------|----------|
| Broker Integration | API connections to major brokers | High |
| Mobile App | iOS/Android apps for vendors | Medium |
| WhatsApp Bot | Certificate submission via WhatsApp | Medium |
| AI Improvements | Custom ML model for Hebrew docs | Low |

### 29.3 Long-term Vision

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT VISION 2027                           │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   Riskcovery SaaS   │
                    │   Platform          │
                    └─────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼───────┐    ┌───────▼───────┐    ┌───────▼───────┐
│   Insurance   │    │   Corporate   │    │   Municipal   │
│   Advisors    │    │   Clients     │    │   Clients     │
│   Portal      │    │   Portal      │    │   Portal      │
└───────────────┘    └───────────────┘    └───────────────┘

Features:
• Multi-tenant SaaS
• White-label options
• API marketplace
• Insurance data analytics
• Regulatory compliance automation
```

---

## Appendix A: Glossary

| Term | Hebrew | Definition |
|------|--------|------------|
| RFQ | בקשה להצעת מחיר | Request for Quotation |
| GL | צד ג' | General Liability |
| PI | אחריות מקצועית | Professional Indemnity |
| WC | ביטוח עובדים | Workers Compensation |
| EL | חבות מעבידים | Employer Liability |
| OCR | זיהוי תווים אופטי | Optical Character Recognition |
| COI | אישור קיום ביטוח | Certificate of Insurance |

---

## Appendix B: Contact Information

**Development Team:** Drishti Consulting
**Project Lead:** Dr. Avi Luvchik
**Email:** avi@drishti.com

---

**Developed by:** Drishti Consulting @ Avi Luvchik **Date:** January 21, 2026
