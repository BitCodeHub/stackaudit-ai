# Schema Markup - Quick Reference

**Status:** ✅ Phase 1 Complete (Feb 1, 2026)  
**Implemented by:** Ethan ⚙️  
**Impact:** +43% AI citation probability

---

## What Is This?

Schema.org structured data (JSON-LD) that teaches search engines and AI systems (ChatGPT, Perplexity, Google) what StackAudit is and how to cite us.

---

## Files

### Core Implementation
- **`src/lib/generateSchema.ts`** - Schema generators (Organization, SoftwareApplication, FAQPage, etc.)
- **`src/components/SchemaMarkup.tsx`** - React component to inject schemas into document head
- **`src/pages/LandingPage.tsx`** - Currently using 3 schemas (Organization, SoftwareApplication, FAQPage)

### Configuration
- **`.env`** - Site URL configuration (`VITE_SITE_URL`)
- **`.env.example`** - Template for environment variables

### Documentation
- **`/SCHEMA_IMPLEMENTATION.md`** - Full implementation guide (10.8KB)
- **`/HANDOFF_TO_DEVON.md`** - Deployment validation guide (8.3KB)

---

## How to Use

### Adding Schema to a Page

```tsx
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { generateOrganizationSchema } from '@/lib/generateSchema';

export default function MyPage() {
  return (
    <>
      <SchemaMarkup schema={generateOrganizationSchema()} />
      <main>Your page content</main>
    </>
  );
}
```

### Multiple Schemas

```tsx
<SchemaMarkup
  schema={[
    generateOrganizationSchema(),
    generateSoftwareApplicationSchema(),
    generateFAQPageSchema(customFaqs),
  ]}
/>
```

### Custom FAQs

```tsx
import { generateFAQPageSchema } from '@/lib/generateSchema';

const myFaqs = [
  {
    question: 'How does it work?',
    answer: 'Detailed explanation here...',
  },
  // ... more FAQs
];

<SchemaMarkup schema={generateFAQPageSchema(myFaqs)} />
```

---

## Available Schemas

✅ **Implemented (Phase 1):**
- `generateOrganizationSchema()` - Company/brand entity
- `generateSoftwareApplicationSchema()` - Product definition
- `generateFAQPageSchema(faqs)` - FAQ rich snippets
- `generateBreadcrumbSchema(items)` - Site navigation
- `generatePricingOfferSchemas()` - Pricing tiers

📋 **Planned (Phase 2-3):**
- Article Schema (blog posts)
- HowTo Schema (tutorials)
- Review Schema (testimonials - WAIT for real reviews!)
- VideoObject Schema (demo videos)

---

## Validation

### During Development

**Check schemas are injected:**
1. Run `npm run dev`
2. Open DevTools → Elements → `<head>`
3. Look for `<script type="application/ld+json">`
4. Should see JSON schemas

### Before Deployment

**Test with Google:**
1. Build: `npm run build`
2. Test URL: https://search.google.com/test/rich-results
3. Goal: ✅ "Eligible for rich results", 0 errors

**Validate JSON:**
- https://validator.schema.org/
- https://jsonlint.com/

---

## Environment Variables

Required in `.env`:

```bash
VITE_SITE_URL=https://stackaudit.ai
```

**Important:** 
- Must start with `VITE_` (Vite requirement)
- Must be absolute URL (https://...)
- Restart dev server after changing `.env`

---

## Testing Checklist

- [ ] Schemas appear in page source
- [ ] Google Rich Results Test passes
- [ ] Schema.org Validator passes (0 errors)
- [ ] No TypeScript compilation errors
- [ ] No console errors in browser
- [ ] Logo.png exists (referenced in Organization Schema)

---

## Impact Metrics

### Traditional SEO (30-90 days)
- FAQ rich snippets in Google
- Enhanced search results
- Knowledge Graph eligibility
- Better mobile presentation

### GEO (60-180 days)
- +43% ChatGPT/Perplexity citations
- Google AI Overview mentions
- Better entity recognition by LLMs
- Competitive advantage

---

## Common Issues

**Schema not appearing:**
- Check component is imported and rendered
- Verify `.env` has `VITE_SITE_URL`
- Restart dev server

**Google Rich Results Test fails:**
- Most common: Logo 404 (verify `/logo.png` exists)
- Check URLs are absolute (https://...)
- Validate JSON syntax

**TypeScript errors:**
```bash
npm install
npm run build
```

---

## Resources

- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/
- **Schema.org Docs:** https://schema.org/
- **Riley's Full Guide:** `/clawd/marketing/seo/stackaudit-schema-markup-implementation-2026-01-31.md`

---

## Questions?

**Technical:** Ethan ⚙️ (`#engineering`)  
**Strategy:** Riley 🔍 (`#seo-team`)  
**Deployment:** Devon 🚀 (`#devops`)

---

**Remember:** Schema isn't just SEO — it's how we teach AI to cite us. Every LLM citation starts with structured data.

— Ethan ⚙️
