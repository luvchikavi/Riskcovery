# Riscovery - Master Development Plan
## Insurance Advisory Management System

**Version:** 1.0
**Document Type:** Working Plan with Gantt Chart
**Date:** January 21, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Development Phases](#2-development-phases)
3. [Phase 1: Foundation & Core Infrastructure](#3-phase-1-foundation--core-infrastructure)
4. [Phase 2: Module Development - Certificate Comparison](#4-phase-2-module-development---certificate-comparison)
5. [Phase 3: Module Development - Smart RFQ Generator](#5-phase-3-module-development---smart-rfq-generator)
6. [Phase 4: Integration & Testing](#6-phase-4-integration--testing)
7. [Phase 5: Deployment & Launch](#7-phase-5-deployment--launch)
8. [Phase 6: Post-Launch Enhancements (Q2 2026)](#8-phase-6-post-launch-enhancements-q2-2026)
9. [Gantt Chart](#9-gantt-chart)
10. [Milestones & Deliverables](#10-milestones--deliverables)
11. [Risk Management](#11-risk-management)
12. [Resource Allocation](#12-resource-allocation)
13. [Dependencies Matrix](#13-dependencies-matrix)

---

## 1. Project Overview

### 1.1 Vision
Build a comprehensive Insurance Advisory Management System consisting of two main modules:
- **Smart RFQ Generator** - Automated insurance Request for Quotation creation
- **Insurance Certificate Comparison System** - Contractor insurance compliance verification

### 1.2 Target Timeline
- **Phase 1 (MVP):** January - March 2026
- **Phase 2 (Enhancements):** Q2 2026
- **Phase 3 (Advanced Features):** Q3-Q4 2026

### 1.3 Technology Stack Summary
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14.x + React 18.x + Material UI |
| Backend | Node.js + Fastify |
| Database | PostgreSQL (Supabase) + Redis (Upstash) |
| OCR | Docupipe.ai |
| Storage | AWS S3 |
| Hosting | Vercel |

---

## 2. Development Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT PHASES OVERVIEW                          │
└─────────────────────────────────────────────────────────────────────────────┘

Week 1-2    │ Phase 1: Foundation & Core Infrastructure
Week 3-5    │ Phase 2: Certificate Comparison Module
Week 6-8    │ Phase 3: Smart RFQ Generator Module
Week 9-10   │ Phase 4: Integration & Testing
Week 11-12  │ Phase 5: Deployment & Launch
Week 13+    │ Phase 6: Post-Launch Enhancements
```

---

## 3. Phase 1: Foundation & Core Infrastructure

**Duration:** Weeks 1-2 (January 21 - February 3, 2026)

### 3.1 Tasks

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 1.1 | Project setup (monorepo, pnpm, Turborepo) | 1 day | - |
| 1.2 | Configure ESLint, Prettier, Husky | 0.5 day | 1.1 |
| 1.3 | Setup Next.js frontend with App Router | 1 day | 1.1 |
| 1.4 | Configure Material UI + RTL support | 1 day | 1.3 |
| 1.5 | Setup Fastify backend structure | 1 day | 1.1 |
| 1.6 | Database schema design (Prisma) | 2 days | 1.5 |
| 1.7 | Implement database migrations | 1 day | 1.6 |
| 1.8 | Setup Supabase PostgreSQL | 0.5 day | 1.6 |
| 1.9 | Setup Redis (Upstash) | 0.5 day | 1.5 |
| 1.10 | Setup AWS S3 for file storage | 0.5 day | 1.5 |
| 1.11 | Implement authentication (NextAuth.js) | 2 days | 1.3, 1.5 |
| 1.12 | Implement RBAC authorization | 1.5 days | 1.11 |
| 1.13 | Setup i18n (Hebrew + English) | 1 day | 1.3 |
| 1.14 | Create shared UI component library | 2 days | 1.4 |
| 1.15 | Setup CI/CD pipeline (GitHub Actions) | 1 day | 1.1 |
| 1.16 | Configure Vercel deployment | 0.5 day | 1.15 |

### 3.2 Deliverables
- [ ] Monorepo structure with apps/web and apps/api
- [ ] Database schema and migrations
- [ ] Authentication system with JWT
- [ ] Base UI component library
- [ ] CI/CD pipeline operational

---

## 4. Phase 2: Module Development - Certificate Comparison

**Duration:** Weeks 3-5 (February 4 - February 24, 2026)

### 4.1 Tasks - Admin Portal

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 2.1 | Admin layout & navigation | 1 day | 1.14 |
| 2.2 | Dashboard overview page | 2 days | 2.1 |
| 2.3 | Organization management | 1.5 days | 1.12 |
| 2.4 | User management CRUD | 1.5 days | 1.12 |
| 2.5 | Vendor management CRUD | 2 days | 1.12 |
| 2.6 | Contract management | 2 days | 2.5 |
| 2.7 | Requirement templates | 2 days | 2.6 |
| 2.8 | Compliance dashboard | 2 days | 2.7 |
| 2.9 | Reports & exports | 1.5 days | 2.8 |

### 4.2 Tasks - Vendor Portal

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 2.10 | Vendor layout & navigation | 0.5 day | 1.14 |
| 2.11 | Magic link authentication | 1 day | 1.11 |
| 2.12 | Document upload interface | 2 days | 1.10 |
| 2.13 | Upload status tracking | 1 day | 2.12 |
| 2.14 | Compliance status view | 1 day | 2.8 |

### 4.3 Tasks - Reviewer Portal

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 2.15 | Reviewer layout & navigation | 0.5 day | 1.14 |
| 2.16 | Verification task queue | 1.5 days | 1.12 |
| 2.17 | Document viewer component | 1.5 days | 2.12 |
| 2.18 | Field editing interface | 2 days | 2.17 |
| 2.19 | Approval workflow | 1 day | 2.18 |

### 4.4 Tasks - AI/OCR Pipeline

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 2.20 | Docupipe API integration | 2 days | 1.10 |
| 2.21 | AI field extraction service | 2 days | 2.20 |
| 2.22 | Confidence scoring algorithm | 1 day | 2.21 |
| 2.23 | Verification routing logic | 1 day | 2.22 |

### 4.5 Tasks - Compliance Engine

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 2.24 | Compliance matching algorithm | 2 days | 2.7 |
| 2.25 | Gap detection & reporting | 1.5 days | 2.24 |
| 2.26 | Expiration tracking service | 1 day | 2.24 |

### 4.6 Tasks - Notifications

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 2.27 | SendGrid integration | 1 day | 1.5 |
| 2.28 | Email templates (Hebrew) | 1 day | 2.27 |
| 2.29 | In-app notification system | 1 day | 1.9 |
| 2.30 | Alert scheduling service | 1 day | 2.26 |

### 4.7 Deliverables
- [ ] Functional Admin Portal
- [ ] Functional Vendor Portal
- [ ] Functional Reviewer Portal
- [ ] AI/OCR processing pipeline
- [ ] Compliance checking engine
- [ ] Email notification system

---

## 5. Phase 3: Module Development - Smart RFQ Generator

**Duration:** Weeks 6-8 (February 25 - March 17, 2026)

### 5.1 Tasks - Client Management

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 3.1 | Client registration form | 1.5 days | 1.14 |
| 3.2 | Sector classification | 1 day | 3.1 |
| 3.3 | Client profile management | 1.5 days | 3.2 |
| 3.4 | Risk profile builder | 2 days | 3.3 |

### 5.2 Tasks - Knowledge Base

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 3.5 | Insurance knowledge base schema | 1 day | 1.6 |
| 3.6 | Seed data for sectors | 1 day | 3.5 |
| 3.7 | Knowledge base admin UI | 1.5 days | 3.6 |

### 5.3 Tasks - Questionnaire Engine

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 3.8 | Dynamic questionnaire builder | 3 days | 3.7 |
| 3.9 | Conditional logic engine | 2 days | 3.8 |
| 3.10 | Question templates by sector | 1.5 days | 3.9 |
| 3.11 | Questionnaire UI components | 2 days | 3.8 |

### 5.4 Tasks - Rule Engine

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 3.12 | Rule definition system | 2 days | 3.9 |
| 3.13 | Coverage recommendation engine | 2 days | 3.12 |
| 3.14 | Limit calculation algorithm | 1.5 days | 3.13 |

### 5.5 Tasks - Document Generation

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 3.15 | RFQ document template design | 2 days | 3.14 |
| 3.16 | PDF generation service | 2 days | 3.15 |
| 3.17 | Word document generation | 1.5 days | 3.15 |
| 3.18 | Excel export functionality | 1 day | 3.15 |
| 3.19 | Document storage & versioning | 1 day | 1.10 |

### 5.6 Deliverables
- [ ] Client management system
- [ ] Insurance knowledge base
- [ ] Dynamic questionnaire engine
- [ ] Rule-based recommendation engine
- [ ] Multi-format document generation

---

## 6. Phase 4: Integration & Testing

**Duration:** Weeks 9-10 (March 18 - March 31, 2026)

### 6.1 Tasks

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 4.1 | Unit tests for services | 3 days | Phase 2, 3 |
| 4.2 | Integration tests for APIs | 2 days | 4.1 |
| 4.3 | E2E tests with Playwright | 3 days | 4.2 |
| 4.4 | Performance testing | 1 day | 4.3 |
| 4.5 | Security audit (OWASP) | 2 days | 4.3 |
| 4.6 | UAT with stakeholders | 3 days | 4.5 |
| 4.7 | Bug fixes from UAT | 3 days | 4.6 |
| 4.8 | Documentation completion | 2 days | 4.7 |

### 6.2 Deliverables
- [ ] 80%+ unit test coverage
- [ ] All E2E tests passing
- [ ] Security audit report
- [ ] UAT sign-off
- [ ] Complete documentation

---

## 7. Phase 5: Deployment & Launch

**Duration:** Weeks 11-12 (April 1 - April 14, 2026)

### 7.1 Tasks

| ID | Task | Duration | Depends On |
|----|------|----------|------------|
| 5.1 | Staging environment setup | 1 day | 4.8 |
| 5.2 | Production environment setup | 1 day | 5.1 |
| 5.3 | Database migration (production) | 0.5 day | 5.2 |
| 5.4 | SSL & DNS configuration | 0.5 day | 5.2 |
| 5.5 | Monitoring & alerting setup | 1 day | 5.4 |
| 5.6 | Final smoke testing | 1 day | 5.5 |
| 5.7 | User training materials | 2 days | 4.8 |
| 5.8 | Admin training sessions | 1 day | 5.7 |
| 5.9 | Soft launch (pilot users) | 3 days | 5.6 |
| 5.10 | Issue resolution | 2 days | 5.9 |
| 5.11 | Production launch | 1 day | 5.10 |
| 5.12 | Post-launch monitoring | 3 days | 5.11 |

### 7.2 Deliverables
- [ ] Production environment live
- [ ] User training completed
- [ ] Support documentation ready
- [ ] System monitoring active

---

## 8. Phase 6: Post-Launch Enhancements (Q2 2026)

**Duration:** Weeks 13+ (April 15 onwards)

### 8.1 Priority Features

| Feature | Priority | Estimated Effort |
|---------|----------|------------------|
| Claims Module | High | 4 weeks |
| Policy Renewals | High | 3 weeks |
| Advanced Reports | Medium | 4 weeks |
| Bulk Operations | Medium | 2 weeks |
| Broker Integration | Medium | 6 weeks |

---

## 9. Gantt Chart

```
RISCOVERY DEVELOPMENT GANTT CHART - January 2026 - April 2026
═══════════════════════════════════════════════════════════════════════════════════════════════════

                            │ Jan  │     Feb      │      Mar       │     Apr      │
Phase / Task                │W1│W2 │W3│W4│W5│W6│W7│W8│W9│W10│W11│W12│W13│
────────────────────────────┼──┼───┼──┼──┼──┼──┼──┼──┼──┼───┼───┼───┼───┤
                            │21│28 │4 │11│18│25│4 │11│18│25 │1  │8  │15 │

PHASE 1: FOUNDATION         │▓▓│▓▓▓│  │  │  │  │  │  │  │   │   │   │   │
─────────────────────────────────────────────────────────────────────────
1.1 Project Setup           │▓▓│   │  │  │  │  │  │  │  │   │   │   │   │
1.2 Linting/Formatting      │▓ │   │  │  │  │  │  │  │  │   │   │   │   │
1.3 Next.js Frontend Setup  │▓▓│   │  │  │  │  │  │  │  │   │   │   │   │
1.4 Material UI + RTL       │  │▓▓ │  │  │  │  │  │  │  │   │   │   │   │
1.5 Fastify Backend Setup   │▓▓│   │  │  │  │  │  │  │  │   │   │   │   │
1.6 Database Schema         │  │▓▓▓│  │  │  │  │  │  │  │   │   │   │   │
1.7 Database Migrations     │  │▓▓ │  │  │  │  │  │  │  │   │   │   │   │
1.8 Supabase Setup          │  │▓  │  │  │  │  │  │  │  │   │   │   │   │
1.9 Redis Setup             │  │▓  │  │  │  │  │  │  │  │   │   │   │   │
1.10 AWS S3 Setup           │  │▓  │  │  │  │  │  │  │  │   │   │   │   │
1.11 Authentication         │  │▓▓▓│  │  │  │  │  │  │  │   │   │   │   │
1.12 RBAC Authorization     │  │▓▓ │  │  │  │  │  │  │  │   │   │   │   │
1.13 i18n Setup             │  │▓▓ │  │  │  │  │  │  │  │   │   │   │   │
1.14 UI Component Library   │  │▓▓▓│  │  │  │  │  │  │  │   │   │   │   │
1.15 CI/CD Pipeline         │  │▓▓ │  │  │  │  │  │  │  │   │   │   │   │
1.16 Vercel Config          │  │▓  │  │  │  │  │  │  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
  ★ Milestone: Foundation   │  │  ★│  │  │  │  │  │  │  │   │   │   │   │

PHASE 2: CERTIFICATE MODULE │  │   │▓▓│▓▓│▓▓│  │  │  │  │   │   │   │   │
─────────────────────────────────────────────────────────────────────────
Admin Portal                │  │   │▓▓│▓▓│▓ │  │  │  │  │   │   │   │   │
2.1 Admin Layout            │  │   │▓ │  │  │  │  │  │  │   │   │   │   │
2.2 Dashboard               │  │   │▓▓│  │  │  │  │  │  │   │   │   │   │
2.3 Organization Mgmt       │  │   │▓▓│  │  │  │  │  │  │   │   │   │   │
2.4 User Management         │  │   │▓▓│  │  │  │  │  │  │   │   │   │   │
2.5 Vendor Management       │  │   │  │▓▓│  │  │  │  │  │   │   │   │   │
2.6 Contract Management     │  │   │  │▓▓│  │  │  │  │  │   │   │   │   │
2.7 Requirement Templates   │  │   │  │▓▓│  │  │  │  │  │   │   │   │   │
2.8 Compliance Dashboard    │  │   │  │  │▓▓│  │  │  │  │   │   │   │   │
2.9 Reports & Exports       │  │   │  │  │▓ │  │  │  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
Vendor Portal               │  │   │▓▓│▓ │  │  │  │  │  │   │   │   │   │
2.10 Vendor Layout          │  │   │▓ │  │  │  │  │  │  │   │   │   │   │
2.11 Magic Link Auth        │  │   │▓▓│  │  │  │  │  │  │   │   │   │   │
2.12 Document Upload        │  │   │▓▓│▓ │  │  │  │  │  │   │   │   │   │
2.13 Status Tracking        │  │   │  │▓ │  │  │  │  │  │   │   │   │   │
2.14 Compliance View        │  │   │  │▓ │  │  │  │  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
Reviewer Portal             │  │   │  │▓▓│▓ │  │  │  │  │   │   │   │   │
2.15 Reviewer Layout        │  │   │  │▓ │  │  │  │  │  │   │   │   │   │
2.16 Task Queue             │  │   │  │▓▓│  │  │  │  │  │   │   │   │   │
2.17 Document Viewer        │  │   │  │▓▓│  │  │  │  │  │   │   │   │   │
2.18 Field Editing          │  │   │  │  │▓▓│  │  │  │  │   │   │   │   │
2.19 Approval Workflow      │  │   │  │  │▓ │  │  │  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
AI/OCR Pipeline             │  │   │▓▓│▓▓│  │  │  │  │  │   │   │   │   │
2.20 Docupipe Integration   │  │   │▓▓│  │  │  │  │  │  │   │   │   │   │
2.21 AI Field Extraction    │  │   │▓▓│▓ │  │  │  │  │  │   │   │   │   │
2.22 Confidence Scoring     │  │   │  │▓ │  │  │  │  │  │   │   │   │   │
2.23 Verification Routing   │  │   │  │▓ │  │  │  │  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
Compliance Engine           │  │   │  │▓▓│▓ │  │  │  │  │   │   │   │   │
2.24 Matching Algorithm     │  │   │  │▓▓│  │  │  │  │  │   │   │   │   │
2.25 Gap Detection          │  │   │  │▓▓│  │  │  │  │  │   │   │   │   │
2.26 Expiration Tracking    │  │   │  │  │▓ │  │  │  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
Notifications               │  │   │  │  │▓▓│  │  │  │  │   │   │   │   │
2.27-2.30 Email/Alerts      │  │   │  │  │▓▓│  │  │  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
  ★ Milestone: Cert Module  │  │   │  │  │ ★│  │  │  │  │   │   │   │   │

PHASE 3: RFQ MODULE         │  │   │  │  │  │▓▓│▓▓│▓▓│  │   │   │   │   │
─────────────────────────────────────────────────────────────────────────
Client Management           │  │   │  │  │  │▓▓│▓ │  │  │   │   │   │   │
3.1 Registration Form       │  │   │  │  │  │▓▓│  │  │  │   │   │   │   │
3.2 Sector Classification   │  │   │  │  │  │▓ │  │  │  │   │   │   │   │
3.3 Profile Management      │  │   │  │  │  │▓▓│  │  │  │   │   │   │   │
3.4 Risk Profile Builder    │  │   │  │  │  │  │▓▓│  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
Knowledge Base              │  │   │  │  │  │▓▓│  │  │  │   │   │   │   │
3.5 Schema Design           │  │   │  │  │  │▓ │  │  │  │   │   │   │   │
3.6 Seed Data               │  │   │  │  │  │▓ │  │  │  │   │   │   │   │
3.7 Admin UI                │  │   │  │  │  │▓▓│  │  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
Questionnaire Engine        │  │   │  │  │  │  │▓▓│▓▓│  │   │   │   │   │
3.8 Dynamic Builder         │  │   │  │  │  │  │▓▓│▓ │  │   │   │   │   │
3.9 Conditional Logic       │  │   │  │  │  │  │▓▓│  │  │   │   │   │   │
3.10 Question Templates     │  │   │  │  │  │  │  │▓▓│  │   │   │   │   │
3.11 UI Components          │  │   │  │  │  │  │▓▓│  │  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
Rule Engine                 │  │   │  │  │  │  │  │▓▓│  │   │   │   │   │
3.12 Rule Definitions       │  │   │  │  │  │  │  │▓▓│  │   │   │   │   │
3.13 Coverage Engine        │  │   │  │  │  │  │  │▓▓│  │   │   │   │   │
3.14 Limit Calculation      │  │   │  │  │  │  │  │▓▓│  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
Document Generation         │  │   │  │  │  │  │  │▓▓│  │   │   │   │   │
3.15-3.19 PDF/Word/Excel    │  │   │  │  │  │  │  │▓▓│  │   │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
  ★ Milestone: RFQ Module   │  │   │  │  │  │  │  │ ★│  │   │   │   │   │

PHASE 4: TESTING            │  │   │  │  │  │  │  │  │▓▓│▓▓▓│   │   │   │
─────────────────────────────────────────────────────────────────────────
4.1 Unit Tests              │  │   │  │  │  │  │  │  │▓▓│▓  │   │   │   │
4.2 Integration Tests       │  │   │  │  │  │  │  │  │▓▓│   │   │   │   │
4.3 E2E Tests               │  │   │  │  │  │  │  │  │▓▓│▓  │   │   │   │
4.4 Performance Testing     │  │   │  │  │  │  │  │  │  │▓  │   │   │   │
4.5 Security Audit          │  │   │  │  │  │  │  │  │  │▓▓ │   │   │   │
4.6 UAT                     │  │   │  │  │  │  │  │  │  │▓▓▓│   │   │   │
4.7 Bug Fixes               │  │   │  │  │  │  │  │  │  │▓▓▓│   │   │   │
4.8 Documentation           │  │   │  │  │  │  │  │  │  │▓▓ │   │   │   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
  ★ Milestone: UAT Complete │  │   │  │  │  │  │  │  │  │  ★│   │   │   │

PHASE 5: DEPLOYMENT         │  │   │  │  │  │  │  │  │  │   │▓▓▓│▓▓▓│   │
─────────────────────────────────────────────────────────────────────────
5.1-5.2 Environment Setup   │  │   │  │  │  │  │  │  │  │   │▓▓ │   │   │
5.3-5.4 DB/SSL Config       │  │   │  │  │  │  │  │  │  │   │▓  │   │   │
5.5-5.6 Monitoring/Testing  │  │   │  │  │  │  │  │  │  │   │▓▓ │   │   │
5.7-5.8 Training            │  │   │  │  │  │  │  │  │  │   │▓▓▓│   │   │
5.9-5.10 Soft Launch        │  │   │  │  │  │  │  │  │  │   │   │▓▓▓│   │
5.11 Production Launch      │  │   │  │  │  │  │  │  │  │   │   │▓  │   │
5.12 Post-Launch Monitor    │  │   │  │  │  │  │  │  │  │   │   │▓▓▓│   │
                            │  │   │  │  │  │  │  │  │  │   │   │   │   │
  ★ Milestone: GO LIVE!     │  │   │  │  │  │  │  │  │  │   │   │  ★│   │

PHASE 6: ENHANCEMENTS       │  │   │  │  │  │  │  │  │  │   │   │   │▓▓▓│
─────────────────────────────────────────────────────────────────────────
Claims Module               │  │   │  │  │  │  │  │  │  │   │   │   │→→→│
Policy Renewals             │  │   │  │  │  │  │  │  │  │   │   │   │→→→│
Advanced Reports            │  │   │  │  │  │  │  │  │  │   │   │   │→→→│

═══════════════════════════════════════════════════════════════════════════════════════════════════

LEGEND:
▓ = Active development
★ = Milestone
→ = Continuation

KEY MILESTONES:
• Feb 3:   Foundation Complete
• Feb 24:  Certificate Comparison Module Complete
• Mar 17:  RFQ Module Complete
• Mar 31:  UAT Complete
• Apr 14:  PRODUCTION LAUNCH
```

---

## 10. Milestones & Deliverables

### 10.1 Key Milestones

| # | Milestone | Target Date | Success Criteria |
|---|-----------|-------------|------------------|
| M1 | Foundation Complete | Feb 3, 2026 | Auth, DB, CI/CD working |
| M2 | Certificate Module MVP | Feb 24, 2026 | End-to-end certificate processing |
| M3 | RFQ Module MVP | Mar 17, 2026 | RFQ document generation working |
| M4 | UAT Sign-off | Mar 31, 2026 | Stakeholder approval |
| M5 | Production Launch | Apr 14, 2026 | System live with real users |

### 10.2 Sprint Breakdown

| Sprint | Weeks | Focus Area | Deliverables |
|--------|-------|------------|--------------|
| Sprint 1 | W1-2 | Foundation | Infrastructure, Auth, DB |
| Sprint 2 | W3-4 | Admin Portal + OCR | Admin CRUD, Docupipe integration |
| Sprint 3 | W5 | Vendor/Reviewer + Compliance | Portals, Compliance engine |
| Sprint 4 | W6-7 | RFQ Core | Knowledge base, Questionnaire |
| Sprint 5 | W8 | RFQ Complete | Rule engine, Doc generation |
| Sprint 6 | W9-10 | Testing | Unit, Integration, E2E, UAT |
| Sprint 7 | W11-12 | Launch | Deploy, Train, Go Live |

---

## 11. Risk Management

### 11.1 Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OCR accuracy with Hebrew | Medium | High | Use Docupipe + human review layer |
| Scope creep | High | Medium | Strict change control, MVP focus |
| Integration delays | Low | Medium | Early integration, proven APIs |
| AI extraction errors | Medium | Medium | Confidence scoring + verification |
| Resource availability | Medium | High | Cross-training, documentation |
| User adoption | Medium | Medium | Simple UX, training, magic links |

### 11.2 Contingency Buffer
- 5% time buffer built into each phase
- Prioritized feature list for scope reduction if needed
- Parallel workstreams where possible

---

## 12. Resource Allocation

### 12.1 Team Structure

| Role | Allocation | Phase Focus |
|------|------------|-------------|
| Tech Lead | 100% | All phases |
| Full-Stack Developer | 100% | Phase 1-5 |
| Frontend Developer | 80% | Phase 2-5 |
| Backend Developer | 80% | Phase 2-4 |
| QA Engineer | 50% | Phase 4-5 |
| DevOps | 30% | Phase 1, 5 |

### 12.2 External Services

| Service | Purpose | Setup Phase |
|---------|---------|-------------|
| Supabase | PostgreSQL hosting | Phase 1 |
| Upstash | Redis cache | Phase 1 |
| Docupipe | OCR service | Phase 2 |
| OpenAI | AI extraction | Phase 2 |
| SendGrid | Email delivery | Phase 2 |
| AWS S3 | File storage | Phase 1 |
| Vercel | Hosting | Phase 1, 5 |

---

## 13. Dependencies Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRITICAL PATH DEPENDENCIES                    │
└─────────────────────────────────────────────────────────────────┘

Phase 1 (Foundation)
        │
        ├──────────────────────┬────────────────────┐
        │                      │                    │
        ▼                      ▼                    ▼
   Database (1.6)        Auth (1.11)         UI Library (1.14)
        │                      │                    │
        │                      ├────────────────────┤
        │                      │                    │
        ▼                      ▼                    ▼
Phase 2 (Certificate)    Phase 2              Phase 2/3
   - Compliance Engine   - Admin Portal       - All UI Components
   - OCR Pipeline        - Vendor Portal
        │                      │
        └──────────┬───────────┘
                   │
                   ▼
            Phase 4 (Testing)
                   │
                   ▼
            Phase 5 (Deploy)
```

### 13.1 Blocking Dependencies

| Dependency | Blocks | Risk Level |
|------------|--------|------------|
| Database Schema (1.6) | All data operations | High |
| Authentication (1.11) | All portals | High |
| UI Library (1.14) | All frontend features | Medium |
| Docupipe Setup (2.20) | OCR processing | Medium |
| Compliance Engine (2.24) | Status reporting | High |

---

## Summary

This working plan outlines a 12-week development cycle to deliver the Riscovery Insurance Advisory Management System. The plan is structured to:

1. **Build strong foundations first** (Weeks 1-2)
2. **Deliver the Certificate Comparison module** (Weeks 3-5)
3. **Deliver the Smart RFQ Generator** (Weeks 6-8)
4. **Ensure quality through comprehensive testing** (Weeks 9-10)
5. **Launch safely with proper training** (Weeks 11-12)

Key success factors:
- Adherence to the timeline
- Strict scope management
- Regular stakeholder communication
- Continuous integration and testing
- Early user feedback through UAT

---

**Developed by:** Drishti Consulting @ Avi Luvchik
**Date:** January 21, 2026
**Version:** 1.0
