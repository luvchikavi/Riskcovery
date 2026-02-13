# Riscovery — TODO (Updated 2026-02-13)

## Session Progress (2026-02-13) — Production Deployment

### Completed
- [x] **Vercel deployment fixed** — Root cause: project was misconfigured as `framework: "fastify"` / `rootDirectory: "apps/api"` instead of `nextjs` / `apps/web`. Fixed via Vercel API.
- [x] **Google OAuth working** — Configured Google Cloud Console (client ID, secret, redirect URIs, test users). Sign-in flow works end-to-end.
- [x] **Database seeded on Railway PostgreSQL** — 12 insurance products, 139 extensions, 118 exclusions, 7 insurers with 84 policies, 8 questionnaire templates, 1,050 questions, 21 local authority templates, 6 demo clients
- [x] **CORS eliminated** — Created Next.js API proxy (`/api/proxy/[...path]`) that routes frontend requests through Vercel to Railway. No cross-origin requests needed.
- [x] **Auth guards added** — `requireAuth` preHandler on client and document API routes (returns 401 instead of crashing with 500)
- [x] **Session timing fixed** — `AuthSync` blocks rendering until session loads, ensuring JWT token is set before API calls
- [x] **Organization race condition fixed** — JWT callback now creates org inline if missing on first sign-in
- [x] **Infinite redirect loop fixed** — `/insurers/browse` had circular re-export from parent page. Replaced with proper insurer listing page.
- [x] **Auth redirect fixed** — Replaced `next-auth/middleware` (caused `replaceState` loop) with client-side redirect using `window.location.href` + ref guard

### Live URLs
- **Frontend**: https://riskcovery-api.vercel.app
- **API**: https://riscoveryapi-production.up.railway.app
- **Database**: Railway PostgreSQL (Railway project)

### Test Users
- `luvchik.avi@gmail.com` (admin)
- `matangvili5@gmail.com` (test user)

---

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

---

## Deployment — Done
- [x] Verify Vercel deployment succeeds
- [x] CORS between Vercel and Railway resolved (via proxy)
- [x] NEXTAUTH_URL set on Vercel
- [x] Google OAuth redirect URIs configured
- [x] Seed Railway PostgreSQL with all data
- [x] Health check all systems: frontend, API, DB, auth

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
