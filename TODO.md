# Riscovery — TODO (Updated 2026-02-12)

## Session Progress (2026-02-12)

### Completed
- [x] Compact table layout for product catalog (`/rfq/knowledge` Tab 0) — replaced Grid+Card with Table rows
- [x] Compact table layout for requirement templates (`/comparison/templates`) — same treatment
- [x] Railway API deployed and online (`riscoveryapi-production.up.railway.app`)
- [x] Railway PostgreSQL provisioned and connected
- [x] Vercel project created, root directory set to `apps/web`
- [x] Environment variables configured on both Railway and Vercel
- [x] Dockerfile fixed (TypeScript build, Prisma client generation)
- [x] Fixed Zod-to-interface type mismatches in admin.routes.ts and comparison.routes.ts
- [x] Added `@ts-nocheck` to ocr.service.ts for OpenAI/pdf-parse types

### In Progress
- [ ] **Fix Vercel build** — Turbo overrides buildCommand and runs secondary TS check on API files. Current fix: renamed API `build` → `compile` so Turbo has nothing to build. Needs deploy verification.

---

## Deployment — Remaining Steps

- [ ] Verify Vercel deployment succeeds after API build script rename
- [ ] Update `CORS_ORIGINS` on Railway with actual Vercel domain
- [ ] Update `NEXTAUTH_URL` on Vercel with actual deployed URL
- [ ] Add Vercel URL to Google OAuth authorized redirect URIs (Google Cloud Console)
- [ ] Seed Railway PostgreSQL with initial data (templates, products, sample clients)
- [ ] End-to-end smoke test: login → navigate → upload → compare

---

## UX & Features — Next Up

### Navigation & Layout
- [ ] Fix DOCX coverage amount parsing for edge-case templates (מחשוב, שירותי גרירה, etc.)
- [ ] Dashboard / landing page with summary metrics
- [ ] Hebrew RTL layout polish and consistency

### Core Features
- [ ] Upload wizard flow improvements (multi-step with progress)
- [ ] Comparison results export (PDF report generation)
- [ ] Client management CRUD UI
- [ ] Template builder UI for insurance requirements
- [ ] Notification system for compliance gaps

### Admin & Security
- [ ] User roles and permissions (admin vs viewer)
- [ ] Audit log for document processing history

---

## Technical Debt

- [ ] Fix Zod-to-interface type mismatches properly (remove `as any` casts in admin.routes.ts, comparison.routes.ts)
- [ ] Remove `@ts-nocheck` from ocr.service.ts after fixing OpenAI/pdf-parse types
- [ ] Remove root `tsconfig.json` workaround once Vercel build is stable
- [ ] Clean up `.npmrc` `frozen-lockfile=false` — regenerate lockfile properly
- [ ] Restore API `build` script (rename `compile` back to `build`) once Vercel Turbo issue resolved
- [ ] Add proper error boundaries in Next.js pages
- [ ] Add API request retry/timeout handling in the web frontend
- [ ] Set up CI/CD pipeline (GitHub Actions for lint + typecheck + test)

---

## Infrastructure

- [ ] Set up S3 bucket for document storage (currently using base64 in DB)
- [ ] Configure Redis for API rate limiting and caching
- [ ] Set up monitoring/alerting (Vercel analytics, Railway metrics)
- [ ] Database backup strategy for Railway PostgreSQL
- [ ] Custom domain setup (riskcovery.co.il or similar)

---

## Future — Product Vision

### Client Analytics & Decision Support System (Design Phase)
**Status:** Idea — needs design & architecture, not implementation yet.

- **Risk appetite profiling** — Classify clients on a spectrum (risk-averse ↔ risk-tolerant) based on questionnaire answers, sector, business size, and coverage choices
- **Common benchmarks** — Show how similar clients typically insure: coverage limits, endorsements, average premiums
- **Statistical dashboards** — Industry statistics: claim frequency by sector, average claim size, loss ratios
- **Decision support tools** — Help the advisor recommend coverage based on peer data
- **Visual risk maps** — Heat maps or scoring cards showing under/over-insured relative to peers
- **Historical trends** — Track how a client's risk profile and coverage evolve over time
