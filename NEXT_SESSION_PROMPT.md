# Next Session Prompt

Copy this into Claude Code to continue where we left off:

---

```
I'm continuing work on Riscovery — an Israeli insurance compliance SaaS (Hebrew RTL, Next.js 14 + Fastify + Prisma + PostgreSQL monorepo).

## What was done last session (2026-02-15)
- Added template transparency to the comparison module: template detail page, collapsible "מה ייבדק?" preview, template context banners in results, view links from template list
- All pushed to main, deployed on Vercel (frontend) + Railway (API)

## Current state
- Comparison module: 90% done — OCR, analysis, templates all working. Missing: PDF/Excel export
- RFQ module: 85% done — questionnaire engine works. Missing: actual document generation (placeholder in document.service.ts)
- 37 API files have @ts-nocheck, only 4 test files exist
- Documents stored as base64 in DB (no S3 yet)
- Redis URL configured but unused

## What to work on today
Read TODO.md for the full prioritized roadmap. Pick up from Stage 1.1 (Export & Reporting):

1. **PDF report generation** for comparison results — branded Hebrew PDF with score card, template info, per-policy comparison table, gaps + recommendations. Add download button to /comparison/[id] page.
2. **Excel export** — comparison table as .xlsx with color-coded rows.
3. **API endpoint** — POST /comparison/analyses/:id/export?format=pdf|xlsx

After export is done, move to Stage 1.2 (Comparison history page) or Stage 2 (RFQ document generation) based on priority.

Key files to know:
- apps/web/src/app/comparison/[id]/page.tsx — analysis detail page (add export buttons here)
- apps/web/src/app/comparison/analyze/page.tsx — analysis wizard
- apps/api/src/modules/comparison/comparison.routes.ts — API routes
- apps/api/src/modules/comparison/analysis/analysis.service.ts — analysis engine
- apps/web/src/lib/api.ts — frontend API client + types
- TODO.md — full roadmap with 8 stages
```
