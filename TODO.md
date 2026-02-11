# Riscovery — TODO (2026-02-12)

## Morning — UX

### 1. Single App Navigation Bar
Currently each module (RFQ, Comparison, Insurers) has its own isolated sidebar with its own nav items. Once you enter a module, you can't reach the others without going back to the home page.

**Change:** Replace the three separate `ModuleLayout` sidebars with ONE app-wide sidebar under the name "Riscovery". All pages from all three modules appear in a single navigation list — no module separation needed. The home page stays as-is (module selector), but once you're inside the app, you see everything in one nav bar.

Current structure (3 separate sidebars):
- RFQ sidebar: Dashboard, Clients, Product Catalog, Templates Admin
- Comparison sidebar: Dashboard, Documents, Templates, Analyze
- Insurers sidebar: Dashboard, Browse Insurers, Compare Policies

Target structure (1 sidebar):
- RFQ: Dashboard, Clients, Product Catalog, Templates Admin
- Comparison: Dashboard, Documents, Templates, Analyze
- Insurers: Dashboard, Browse, Compare
All in one sidebar, grouped by section.

### 2. Fix DOCX Coverage Amount Parsing
Some local authority templates (מחשוב, שירותי גרירה, מפעיל חוג ספורט, מפעיל מוסדות חינוך) had coverage amounts that didn't parse correctly from the DOCX text — they fell back to defaults. Improve the regex parsing to handle these edge cases.

---

## Afternoon — Deployment (Get It Live)

### 3. Provision Production Database
Set up Railway Postgres or Supabase for production. Get the DATABASE_URL connection string.

### 4. Set Up Railway Project
- Connect Railway to the GitHub repo
- Set environment variables: DATABASE_URL, JWT_SECRET, NODE_ENV=production, PORT=3001, CORS_ORIGINS
- Verify the Dockerfile builds and deploys correctly
- Run `prisma migrate deploy` on production DB

### 5. Set Up Vercel Project
- Connect Vercel to the GitHub repo (apps/web)
- Set environment variables: NEXT_PUBLIC_API_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- Verify build and deployment

### 6. Deploy & Verify
- Push a version tag (e.g., v0.1.0) to trigger the CI/CD pipeline
- Verify both frontend and API are reachable
- Run seeds against production DB

---

## Stretch / Next Day

### 7. Real S3 File Uploads
Replace base64-in-DB storage with actual S3 uploads. Provision AWS S3 bucket, set credentials.

### 8. OCR Service for Scanned PDFs
Integrate OpenAI Vision or Docupipe for scanned PDF processing (currently only text-based PDFs work via pdf-parse).

### 9. Production Google OAuth
Set up production OAuth client ID/secret in Google Cloud Console. Update Vercel env vars.

### 10. Custom Domain
Configure custom domain for both Vercel (frontend) and Railway (API).
