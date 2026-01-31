# Testing Guide — StackAudit

**Last Updated:** January 31, 2026 — 7:03 AM PST  
**Test Framework:** Vitest + Testing Library  
**Coverage:** 23 tests (all passing ✅)

---

## Quick Start

```bash
cd frontend/

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## Test Structure

```
frontend/
  src/
    lib/
      __tests__/
        generateSchema.test.ts     # Schema markup tests (23 tests)
    components/
      __tests__/                   # Component tests (coming soon)
    test/
      setup.ts                     # Global test configuration
  vitest.config.ts                 # Vitest configuration
```

---

## Current Test Coverage

### Schema Markup Tests (`generateSchema.test.ts`)

**23 tests — all passing ✅**

#### Organization Schema (4 tests)
- ✅ Generates valid Schema.org structure
- ✅ Includes logo URL
- ✅ Includes social media links
- ✅ Includes contact point

#### Software Application Schema (5 tests)
- ✅ Generates valid SoftwareApplication structure
- ✅ Includes description and feature list
- ✅ Includes pricing with free tier
- ✅ Specifies operating system
- ✅ Includes author organization

#### FAQ Page Schema (5 tests)
- ✅ Generates valid FAQPage structure
- ✅ Includes main entity with questions
- ✅ Properly structured Question entities
- ✅ Properly structured Answer entities
- ✅ Handles empty FAQ array

#### Breadcrumb Schema (4 tests)
- ✅ Generates valid BreadcrumbList structure
- ✅ Creates ListItem entries with correct positions
- ✅ Handles single breadcrumb
- ✅ Handles empty breadcrumbs

#### DEFAULT_FAQS Validation (3 tests)
- ✅ Includes key product questions
- ✅ Has exactly 8 FAQ items
- ✅ All FAQs have question and answer

#### JSON Validity (2 tests)
- ✅ All schemas serialize to valid JSON
- ✅ Schemas don't contain undefined values

---

## Running Tests

### Local Development

```bash
# Run tests once
npm test

# Watch mode (re-run on file changes)
npm test -- --watch

# Run specific test file
npm test -- generateSchema.test.ts

# Run tests matching pattern
npm test -- --grep "Organization"
```

### CI/CD

Tests run automatically on:
- Every commit (GitHub Actions)
- Pull requests
- Pre-deployment validation

### Coverage Report

```bash
npm run test:coverage

# Opens HTML report
open coverage/index.html
```

**Target:** >80% coverage before Feb 7 launch

---

## Writing New Tests

### Component Tests (Coming Soon)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SchemaMarkup } from '../SchemaMarkup';

describe('SchemaMarkup', () => {
  it('should inject schema into document head', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'Test' };
    render(<SchemaMarkup schemas={[schema]} />);
    
    const scriptTag = document.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).toBeDefined();
  });
});
```

### Integration Tests (Coming Soon)

Test full user workflows:
- Repository analysis flow
- Dashboard data loading
- PDF report generation

---

## Test Configuration

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### `src/test/setup.ts`

Global test utilities and cleanup:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad (tests implementation details)
expect(schema.contactPoint.contactType).toBe('Customer Support');

// ✅ Good (tests observable behavior)
expect(schema.contactPoint).toBeDefined();
expect(schema.contactPoint.email).toBe('support@stackaudit.ai');
```

### 2. Use Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should generate valid Organization schema', () => { ... });
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should create breadcrumbs with correct positions', () => {
  // Arrange
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Docs', url: '/docs' },
  ];
  
  // Act
  const schema = generateBreadcrumbSchema(breadcrumbs);
  
  // Assert
  expect(schema.itemListElement[0].position).toBe(1);
  expect(schema.itemListElement[1].position).toBe(2);
});
```

### 4. Test Edge Cases

```typescript
it('should handle empty breadcrumbs gracefully', () => {
  const schema = generateBreadcrumbSchema([]);
  expect(schema.itemListElement).toEqual([]);
});
```

---

## Debugging Failed Tests

### 1. Use `--reporter=verbose`

```bash
npm test -- --reporter=verbose
```

### 2. Use `console.log` in Tests

```typescript
it('should debug schema', () => {
  const schema = generateOrganizationSchema();
  console.log(JSON.stringify(schema, null, 2));
  expect(schema).toBeDefined();
});
```

### 3. Run Single Test

```bash
npm test -- --grep "should generate valid Organization"
```

### 4. Use Vitest UI

```bash
npm run test:ui
# Opens interactive test UI at http://localhost:51204/__vitest__/
```

---

## Roadmap

### Phase 1: Foundation (COMPLETE ✅)
- [x] Vitest configuration
- [x] Schema markup tests (23 tests)
- [x] Test setup and utilities

### Phase 2: Component Tests (Feb 1-3)
- [ ] SchemaMarkup component tests
- [ ] Dashboard component tests
- [ ] Form validation tests

### Phase 3: Integration Tests (Feb 4-6)
- [ ] Repository analysis workflow
- [ ] Authentication flows
- [ ] API integration tests

### Phase 4: E2E Tests (Post-Launch)
- [ ] Playwright setup
- [ ] Critical user journeys
- [ ] Cross-browser testing

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
npm test -- --run
```

---

## Metrics

**Current Status:**
- ✅ 23 tests passing
- ✅ 0 tests failing
- ✅ 100% pass rate
- 📊 Schema markup: 100% coverage
- 📊 Components: 0% coverage (Phase 2)
- 📊 Overall: ~15% coverage (target: 80%)

**Target for Feb 7 Launch:**
- 100+ tests
- 80%+ code coverage
- <100ms average test duration
- CI/CD pipeline passing

---

## Questions?

**Technical issues:**
- Slack: `@ethan` in `#engineering`

**Testing strategy:**
- Slack: `@maven` in `#product`

**CI/CD pipeline:**
- Slack: `@devon` in `#devops`

---

*Tests are documentation that runs. Good tests = good code.*

— Ethan ⚙️  
Head of Engineering, Lumen AI Solutions
