# Riscovery — TODO & Roadmap (Updated 2026-02-15)

## Session Progress (2026-02-15) — Template Transparency & UX

### Completed
- [x] **Template detail page** (`/comparison/templates/[id]`) — Full read-only view with per-policy requirement cards, endorsement Hebrew names, limits, flags
- [x] **Enhanced template selection** — Collapsible "מה ייבדק?" preview in Step 2 of analyze flow showing policy types, limits, endorsement counts
- [x] **Template context banners** — Info banner in analysis results and detail pages showing which template was used + link to view requirements
- [x] **Template list view link** — Replaced non-functional edit icon with view icon linking to template detail page
- [x] **API type update** — Added `template?` field to `ComparisonAnalysis` interface

---

## Session Progress (2026-02-13) — Production Deployment

### Completed
- [x] Vercel deployment fixed, Google OAuth working, database seeded
- [x] CORS eliminated via Next.js proxy, auth guards added
- [x] Session timing, org race condition, infinite redirect — all fixed

### Live URLs
- **Frontend**: https://riskcovery-api.vercel.app
- **API**: https://riscoveryapi-production.up.railway.app
- **Test Users**: `luvchik.avi@gmail.com` (admin), `matangvili5@gmail.com`

---

# ROADMAP — Implementation Stages

## Stage 1: Core Comparison Polish (Priority: P0)

The comparison module is the flagship feature. These items make it production-ready.

### 1.1 Export & Reporting
- [ ] **PDF report generation** — Generate a branded Hebrew PDF of comparison results (use `@react-pdf/renderer` or `puppeteer`)
  - Include: score card, template info, per-policy table, gaps with recommendations
  - Add download button to `/comparison/[id]` and analysis results
- [ ] **Excel export** — Export comparison table to `.xlsx` (use `exceljs`)
  - Color-coded rows (green/red/yellow), Hebrew headers
- [ ] **API endpoint** — `POST /comparison/analyses/:id/export` returning PDF/XLSX blob

### 1.2 Comparison UX Improvements
- [ ] **Comparison history page** — `/comparison/history` listing all past analyses with status, score, date, template used
- [ ] **Re-run analysis** — Button on `/comparison/[id]` to re-run with same doc + template
- [ ] **Side-by-side view** — Compare two certificates against same template
- [ ] **Bulk upload** — Upload multiple certificates, auto-match to templates, batch analysis
- [ ] **Document preview** — Show uploaded certificate image/PDF inline alongside results

### 1.3 OCR Improvements
- [ ] **Fix DOCX coverage parsing** for edge-case templates (מחשוב, שירותי גרירה, etc.)
- [ ] **Confidence indicators** — Show OCR confidence per field in results UI
- [ ] **Manual override** — Allow user to correct OCR-extracted values before analysis
- [ ] **Multi-page PDF support** — Handle certificates that span multiple pages

---

## Stage 2: RFQ Document Generation (Priority: P0)

The RFQ module has a complete questionnaire engine but NO actual document output.

### 2.1 PDF/DOCX Generation
- [ ] **Integrate PDF library** — Replace placeholder in `document.service.ts` with actual generation
  - Option A: `@react-pdf/renderer` (React-based, Hebrew support)
  - Option B: `puppeteer` + HTML template (more flexible styling)
  - Option C: `docx` npm package for Word output
- [ ] **RFQ document template** — Design the output document layout
  - Client info header, coverage requirements table, endorsements list, risk assessment summary
- [ ] **Preview page** — `/rfq/documents/[clientId]` should show live preview before download
- [ ] **Format selection** — PDF / DOCX / XLSX download options

### 2.2 Coverage Rule Engine
- [ ] **Execute coverage rules** — Wire up the `CoverageRule` model to actually modify recommendations
  - Rules already have conditions + actions in DB, need execution logic
- [ ] **Rule testing UI** — In admin, test a rule against sample answers to verify behavior
- [ ] **Rule priority & conflict resolution** — Handle overlapping rules

---

## Stage 3: Notifications & Alerts (Priority: P1)

### 3.1 Email Notifications
- [ ] **SendGrid integration** — Configure and test (env vars already exist)
- [ ] **Compliance gap alert** — Email when analysis finds critical gaps
- [ ] **Certificate expiration reminders** — Scheduled job checking `expirationDate` fields
- [ ] **New analysis notification** — Email to assigned reviewer when analysis completes

### 3.2 In-App Notifications
- [ ] **Notification bell** — Header component showing unread count
- [ ] **Notification list page** — `/notifications` with mark-as-read
- [ ] **Real-time updates** — WebSocket or SSE for live notifications (optional)

---

## Stage 4: Type Safety & Testing (Priority: P1)

### 4.1 Remove @ts-nocheck (37 files!)
- [ ] **Fix OpenAI types** in `ocr.service.ts`
- [ ] **Fix Zod-to-interface mismatches** — Remove `as any` casts in routes
- [ ] **Fix Prisma JSON field types** — Proper typing for `structure`, `showIf`, etc.
- [ ] **Audit all 37 files** — Remove `@ts-nocheck` one by one, fix underlying issues

### 4.2 Test Coverage (target: 60%)
- [ ] **API integration tests** — Test each route with real DB (use test containers)
  - Comparison: upload → process → analyze → get results
  - RFQ: create client → fill questionnaire → generate document
  - Templates: CRUD + DOCX import
- [ ] **Frontend component tests** — Key user flows with React Testing Library
  - Analysis wizard (upload → select template → run → view results)
  - Template detail page rendering
  - Client CRUD forms
- [ ] **E2E tests** — Playwright for critical paths
  - Sign in → upload certificate → run analysis → export PDF
  - Sign in → create client → fill questionnaire → download document
- [ ] **OCR accuracy tests** — Test with sample certificates, assert extracted values

---

## Stage 5: Infrastructure & Security (Priority: P1)

### 5.1 Document Storage
- [ ] **S3 integration** — Move document storage from base64-in-DB to S3
  - Upload to S3, store key in DB
  - Signed URLs for downloads
  - Cleanup orphaned files

### 5.2 Caching & Performance
- [ ] **Redis integration** — Use existing Redis URL for:
  - API response caching (template lists, product catalog)
  - Rate limiting per user/IP
  - Session store
- [ ] **Database indexing** — Add indexes for frequent queries
- [ ] **Query optimization** — Profile slow queries with Prisma logging

### 5.3 Monitoring
- [ ] **Sentry setup** — Initialize error tracking (DSN already in env)
- [ ] **Vercel Analytics** — Enable web vitals tracking
- [ ] **Health dashboard** — API uptime, error rates, response times
- [ ] **Database backups** — Automated daily backups on Railway

### 5.4 Security Hardening
- [ ] **Rate limiting per user** — Replace global limit with per-IP/per-user
- [ ] **Input sanitization** — Sanitize HTML/script in text fields
- [ ] **File upload validation** — Size limits, virus scanning
- [ ] **CSRF tokens** — For custom API endpoints
- [ ] **Audit logging** — Write to `AuditLog` table on all mutations

---

## Stage 6: Auth & Multi-Tenant (Priority: P2)

### 6.1 Role-Based Access Control
- [ ] **Permission middleware** — Enforce role checks on API routes
  - Admin: full access
  - Compliance Manager: manage templates, run analyses
  - Reviewer: view analyses, add comments
  - Viewer: read-only access
- [ ] **Role management UI** — Admin page to assign roles
- [ ] **UI conditional rendering** — Hide admin features from non-admin users

### 6.2 Multi-Tenant
- [ ] **Organization isolation** — Filter all queries by `organizationId`
- [ ] **Organization settings page** — Name, logo, contact info
- [ ] **User invitation flow** — Invite by email, assign role
- [ ] **Organization switcher** — If user belongs to multiple orgs

---

## Stage 7: Advanced Features (Priority: P2)

### 7.1 Insurer Comparison
- [ ] **Side-by-side comparison UI** — `/insurers/compare` with product selector
- [ ] **Extension matrix table** — Show which insurer covers what
- [ ] **Best coverage recommendation** — Suggest insurer based on requirements

### 7.2 Client Analytics
- [ ] **Risk profiling** — Score clients based on questionnaire + sector
- [ ] **Peer benchmarks** — How similar clients insure
- [ ] **Coverage gap trends** — Dashboard showing common gaps across clients
- [ ] **Historical tracking** — Client coverage evolution over time

### 7.3 Vendor Portal
- [ ] **Vendor self-service** — Vendors upload their own certificates
- [ ] **Status tracking** — Vendor sees their compliance status
- [ ] **Auto-reminder** — Email vendors when certificates expire

---

## Stage 8: Polish & Scale (Priority: P3)

### 8.1 UI/UX
- [ ] **Error boundaries** — Wrap all pages with error fallback UI
- [ ] **Skeleton loaders** — Replace `<LinearProgress>` with content skeletons
- [ ] **Pagination** — All list pages (clients, templates, analyses)
- [ ] **RTL consistency** — Audit all pages for proper Hebrew layout
- [ ] **Mobile responsiveness** — Test and fix all pages on mobile
- [ ] **Dark mode** — Theme switcher (Material UI supports it)
- [ ] **Accessibility** — ARIA labels, keyboard navigation, screen reader

### 8.2 Developer Experience
- [ ] **API documentation** — OpenAPI/Swagger auto-generated from routes
- [ ] **Storybook** — Component library documentation
- [ ] **Seed script improvements** — Faster, idempotent seeding
- [ ] **Dev environment** — Docker Compose for local DB + Redis

### 8.3 Production Scale
- [ ] **Custom domain** — riskcovery.co.il
- [ ] **CDN for assets** — CloudFront or Vercel Edge
- [ ] **Database read replicas** — For heavy read workloads
- [ ] **Queue system** — Bull/BullMQ for OCR processing (async)
- [ ] **PWA** — Installable web app with offline support

---

# Quick Reference — Current State

| Module | Status | Key Gap |
|--------|--------|---------|
| Comparison (OCR + Analysis) | **90%** | Export (PDF/Excel) |
| Comparison (Templates) | **95%** | Template editing UI |
| RFQ (Questionnaire) | **85%** | Document generation |
| RFQ (Knowledge Base) | **90%** | Rule engine execution |
| Insurer Comparison | **60%** | Side-by-side UI |
| Auth | **70%** | RBAC enforcement |
| Infrastructure | **65%** | S3, Redis, monitoring |
| Testing | **15%** | 4 test files total |
| Type Safety | **50%** | 37 @ts-nocheck files |
