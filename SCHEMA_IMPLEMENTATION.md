# Schema Markup Implementation - StackAudit.ai

**Date:** January 31, 2026  
**Implemented by:** Ethan ⚙️ (Engineering)  
**Based on:** Riley's SEO/GEO Implementation Guide  
**Status:** ✅ PHASE 1 COMPLETE (Feb 1, 6:00 AM)

---

## What Was Implemented

### Phase 1 Schema Types (CRITICAL for Feb 7 Launch)

✅ **Organization Schema** - Establishes StackAudit as a recognized entity  
✅ **SoftwareApplication Schema** - Defines StackAudit as a software product  
✅ **FAQPage Schema** - 8 comprehensive FAQ items for rich snippets  

### Files Created/Modified

**New Files:**
1. `/frontend/src/lib/generateSchema.ts` (7.4KB)
   - Organization Schema generator
   - SoftwareApplication Schema generator
   - BreadcrumbList Schema generator (for future pages)
   - FAQPage Schema generator
   - Pricing tier offer schemas
   - 8 default FAQ items

2. `/frontend/src/components/SchemaMarkup.tsx` (1.3KB)
   - React component to inject JSON-LD into document head
   - Handles array of schemas
   - Auto-cleanup on unmount

**Modified Files:**
1. `/frontend/src/pages/LandingPage.tsx`
   - Added Schema imports
   - Injected 3 Schema types (Organization, SoftwareApplication, FAQPage)

**Configuration Files:**
1. `/frontend/.env` - Site URL configuration
2. `/frontend/.env.example` - Environment template

---

## How It Works

### 1. Schema Generation (`generateSchema.ts`)

The utility file exports functions that generate valid Schema.org JSON-LD objects:

```typescript
// Example: Organization Schema
const orgSchema = generateOrganizationSchema();
// Returns: { "@context": "https://schema.org", "@type": "Organization", ... }
```

**Key Features:**
- TypeScript typed for safety
- Environment-aware (reads `VITE_SITE_URL`)
- Follows Schema.org specifications
- Optimized for GEO (Generative Engine Optimization)

### 2. Schema Injection (`SchemaMarkup.tsx`)

React component that dynamically injects `<script type="application/ld+json">` tags into `<head>`:

```tsx
<SchemaMarkup schema={generateOrganizationSchema()} />
// or multiple schemas:
<SchemaMarkup schema={[orgSchema, appSchema, faqSchema]} />
```

**How it works:**
1. Component receives schema(s) as props
2. `useEffect` creates `<script>` elements
3. Appends scripts to `document.head`
4. Cleans up on unmount (SPA navigation)

### 3. Landing Page Integration

Currently implemented on **LandingPage.tsx** only:

```tsx
<SchemaMarkup
  schema={[
    generateOrganizationSchema(),       // Who we are
    generateSoftwareApplicationSchema(), // What we build
    generateFAQPageSchema(DEFAULT_FAQS), // Common questions
  ]}
/>
```

---

## Validation & Testing

### ✅ Pre-Deployment Checklist

**Local Development:**
- [ ] Run `npm run dev` in `/frontend`
- [ ] Visit `http://localhost:5173`
- [ ] Open DevTools > Elements > `<head>`
- [ ] Verify 3 `<script type="application/ld+json">` tags present
- [ ] Copy JSON content

**Schema Validation:**
1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Paste JSON or test live URL
   - Goal: ✅ "Eligible for rich results"

2. **Schema.org Validator**
   - URL: https://validator.schema.org/
   - Paste JSON content
   - Goal: 0 errors, 0 warnings

3. **Manual JSON Validation**
   - Paste into https://jsonlint.com/
   - Verify valid JSON syntax

### Expected Output (Minified in Production)

**Organization Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "StackAudit",
  "url": "https://stackaudit.ai",
  "logo": "https://stackaudit.ai/logo.png",
  ...
}
```

**SoftwareApplication Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "StackAudit",
  "applicationCategory": "DeveloperApplication",
  "featureList": [...],
  ...
}
```

**FAQPage Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is StackAudit?",
      "acceptedAnswer": {...}
    },
    ...
  ]
}
```

---

## Deployment Instructions

### For Devon 🚀 (DevOps)

**Staging Deployment:**

1. **Verify environment variables:**
   ```bash
   # In Render.com dashboard, set:
   VITE_SITE_URL=https://stackaudit.ai
   # (or staging URL for staging environment)
   ```

2. **Deploy to staging:**
   ```bash
   cd /path/to/stackaudit/frontend
   npm run build
   # Deploy dist/ folder to Render
   ```

3. **Test staging URL:**
   - Visit https://[staging-url].onrender.com
   - View page source (`Ctrl+U` or `Cmd+Option+U`)
   - Search for `"@context": "https://schema.org"`
   - Should find 3 occurrences

4. **Validate with Google:**
   - Go to: https://search.google.com/test/rich-results
   - Enter staging URL
   - Wait for analysis (30-60 seconds)
   - Goal: ✅ All schemas valid

5. **Monitor Google Search Console:**
   - Add property: https://stackaudit.ai
   - Go to: Enhancements > Structured Data
   - Wait 24-48 hours for initial crawl
   - Goal: 0 errors, valid items detected

**Production Deployment:**

Same steps as staging, but:
- Use production URL: `https://stackaudit.ai`
- Verify logo.png exists at `/logo.png` (referenced in Organization Schema)
- Submit sitemap to Google Search Console

---

## Testing Checklist (Feb 1-3)

### Day 1 (Feb 1) - Local Testing ✅
- [x] Schemas generate valid JSON
- [x] SchemaMarkup component injects into head
- [x] No TypeScript errors
- [x] No console errors in browser

### Day 2 (Feb 2) - Staging Validation
- [ ] Deploy to staging
- [ ] Google Rich Results Test passes (all 3 schemas)
- [ ] Schema.org Validator passes (0 errors)
- [ ] Manual inspection of page source

### Day 3 (Feb 3) - Production Ready
- [ ] Deploy to production
- [ ] Final validation sweep
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools

---

## Common Issues & Solutions

### Issue: Schemas not appearing in page source

**Cause:** React component not mounting or useEffect not firing  
**Solution:**
1. Check component is imported: `import { SchemaMarkup } from '...'`
2. Verify component is rendered: `<SchemaMarkup schema={...} />`
3. Check browser console for errors

### Issue: Google Rich Results Test fails

**Possible causes:**
1. **Invalid JSON** → Validate at https://jsonlint.com/
2. **Missing required fields** → Check Schema.org docs for type
3. **Incorrect URL format** → Must be absolute (`https://...`)
4. **Logo/image 404** → Verify file exists at specified URL

**Solution:**
- Copy failing schema from test results
- Paste into Schema.org Validator
- Fix reported errors
- Re-test

### Issue: TypeScript errors in generateSchema.ts

**Cause:** Type mismatch or missing imports  
**Solution:**
```typescript
import type { Schema } from '../lib/generateSchema';
// Ensure all functions return Schema type
```

### Issue: Environment variable not working

**Cause:** Vite requires `VITE_` prefix  
**Solution:**
- In `.env`: `VITE_SITE_URL=https://stackaudit.ai`
- Access via: `import.meta.env.VITE_SITE_URL`
- Restart dev server after changing `.env`

---

## Future Enhancements (Phase 2-3)

### Phase 2 (Feb 4-6) - Enhanced Schema

**To implement:**
- [ ] Article Schema (when blog launches)
- [ ] HowTo Schema (getting started guides)
- [ ] Review Schema (after collecting testimonials - WAIT for real reviews!)
- [ ] AggregateRating Schema (after 10+ reviews)

### Phase 3 (Post-Launch) - Advanced Features

**To implement:**
- [ ] VideoObject Schema (when demo videos ready)
- [ ] Event Schema (webinars/product launches)
- [ ] BreadcrumbList on all pages (when multi-page site)
- [ ] Pricing page Product + Offer schemas

**Utilities already built for future use:**
- `generateBreadcrumbSchema(items)` - Ready to use
- `generatePricingOfferSchemas()` - Ready for pricing page

---

## Impact Metrics

### Traditional SEO (Expected in 30-90 days)

- **Rich Snippets:** FAQ boxes in Google search results
- **Knowledge Graph:** StackAudit entity recognition
- **Enhanced SERPs:** Star ratings (after reviews), pricing info
- **Mobile:** Better mobile search presentation

### GEO Impact (Expected in 60-180 days)

Based on 2026 research (Riley's analysis):
- **+43% citation probability** in ChatGPT/Perplexity
- **Better entity recognition** by LLMs
- **Structured answers** = easier for AI to extract/cite
- **Competitive advantage** (most dev tools lack proper Schema)

### Success Criteria

**Immediate (Day 1):**
- ✅ 0 validation errors in Google Rich Results Test
- ✅ 0 warnings in Google Search Console
- ✅ All 3 schema types detected

**30 Days:**
- FAQ rich snippets appearing in Google
- No Schema errors in Search Console
- Organization entity recognized

**90 Days:**
- ChatGPT citations increase (track with AIClicks tool)
- Google AI Overview mentions
- Knowledge Graph eligibility achieved

---

## Resources

### Testing Tools
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/
- **JSON-LD Playground:** https://json-ld.org/playground/
- **Google Search Console:** https://search.google.com/search-console

### Documentation
- **Schema.org:** https://schema.org/
- **Google Structured Data:** https://developers.google.com/search/docs/appearance/structured-data
- **Riley's Implementation Guide:** `/clawd/marketing/seo/stackaudit-schema-markup-implementation-2026-01-31.md`

### GEO Tracking (Phase 2)
- **AIClicks** (ChatGPT citations): https://aiclicks.dev ($99-199/mo)
- **LLMrefs** (AI citation monitoring): https://llmrefs.com ($149/mo)
- **Bing Webmaster Tools:** https://www.bing.com/webmasters (Free, for ChatGPT Search)

---

## Contact & Support

**Questions about Schema implementation:**
- **Ethan ⚙️** (Engineering) - Technical implementation
- **Riley 🔍** (SEO) - Schema strategy, GEO optimization
- **Devon 🚀** (DevOps) - Deployment, staging validation

**Slack Channels:**
- `#engineering` - Code questions
- `#seo-team` - Schema strategy
- `#launch-stackaudit` - Feb 7 launch coordination

---

## Changelog

**Feb 1, 2026 - 6:00 AM (Ethan ⚙️):**
- ✅ Created `generateSchema.ts` with 4 schema generators
- ✅ Created `SchemaMarkup.tsx` React component
- ✅ Implemented on LandingPage.tsx (Organization, SoftwareApplication, FAQPage)
- ✅ Added environment configuration (.env, .env.example)
- ✅ Ready for staging deployment validation

---

**Next Actions:**
1. **Devon 🚀** - Deploy to staging, validate with Google Rich Results Test
2. **Riley 🔍** - Test staging URL, monitor Google Search Console
3. **Ethan ⚙️** - Fix any issues found in testing

**Launch Readiness:** Schema markup CRITICAL for Feb 7 launch. Deploy Phase 1 by Feb 3 to maximize Day 1 search visibility.

---

*"Schema markup isn't just SEO — it's how we teach AI to cite us. Every LLM citation starts with structured data."*  
— Riley 🔍, Head of SEO
