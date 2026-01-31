# StackAudit.ai E2E Tests

End-to-end tests for the StackAudit.ai React frontend using Playwright.

## Test Coverage

### 1. Login Flow (`login.spec.ts`)
- ✅ Page load and form display
- ✅ Form validation (email/password required)
- ✅ Password visibility toggle
- ✅ Successful login with valid credentials
- ✅ Auth token storage in localStorage
- ✅ Remember me functionality
- ✅ Navigation to signup page
- ✅ Redirect for authenticated users
- ✅ Sign up flow

### 2. Create Audit Flow (`create-audit.spec.ts`)
- ✅ Multi-step wizard navigation
- ✅ Step 1: Tool selection and search
- ✅ Step 2: Cost input and validation
- ✅ Step 3: Usage data entry
- ✅ Step 4: Review and submission
- ✅ Form validation between steps
- ✅ Data persistence when navigating back
- ✅ Successful audit creation

### 3. View Results Flow (`view-results.spec.ts`)
- ✅ Audit results page display
- ✅ Summary statistics
- ✅ Tab navigation (Overview, Tools, Savings)
- ✅ ROI gauge and charts
- ✅ Tools analysis table
- ✅ Savings breakdown and timeline
- ✅ Share and export functionality
- ✅ Responsive design

### 4. Billing Flow (`billing.spec.ts`)
- ✅ Current plan display
- ✅ Usage statistics
- ✅ Available plans comparison
- ✅ Plan features
- ✅ Upgrade/downgrade actions
- ✅ Payment method management
- ✅ Profile settings
- ✅ Company settings
- ✅ Notification preferences
- ✅ Security settings (password, 2FA)

## Setup

### Install Dependencies

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
```

### Add to package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
```

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run specific test file
npx playwright test login.spec.ts

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Test Structure

```
e2e/
├── playwright.config.ts    # Playwright configuration
├── fixtures/
│   └── auth.fixture.ts     # Authentication fixtures
├── pages/
│   ├── index.ts            # Page exports
│   ├── login.page.ts       # Login page object
│   ├── signup.page.ts      # Signup page object
│   ├── dashboard.page.ts   # Dashboard page object
│   ├── new-audit.page.ts   # New audit wizard page object
│   ├── audit-results.page.ts # Audit results page object
│   └── settings.page.ts    # Settings page object
├── utils/
│   └── helpers.ts          # Test utilities
├── login.spec.ts           # Login flow tests
├── create-audit.spec.ts    # Create audit flow tests
├── view-results.spec.ts    # View results flow tests
└── billing.spec.ts         # Billing flow tests
```

## Page Object Model

Each page has a dedicated Page Object Model (POM) that encapsulates:
- Element locators
- Page actions
- Assertions

Example usage:
```typescript
import { LoginPage } from './pages/login.page';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await loginPage.assertLoginSuccess();
});
```

## Test Data

### Mock Users
```typescript
const testUsers = {
  valid: {
    email: 'test@stackaudit.ai',
    password: 'password123',
  },
  proPlan: {
    email: 'pro@stackaudit.ai',
    password: 'password123',
    plan: 'pro',
  },
};
```

### Mock Audit Data
The app uses mock data for demo purposes, which is ideal for e2e testing without requiring a backend.

## CI Integration

The tests are configured to run in CI with:
- Single worker for stability
- 2 retries on failure
- Video and trace on first retry
- GitHub Actions reporter

Example GitHub Actions workflow:
```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    BASE_URL: http://localhost:5173
```

## Debugging

### View Test Report
```bash
npx playwright show-report
```

### View Trace
```bash
npx playwright show-trace trace.zip
```

### Screenshots
Failed test screenshots are saved to `e2e/screenshots/`

## Best Practices

1. **Use Page Objects** - Keep selectors and actions in page classes
2. **Use data-testid** - For critical elements, add `data-testid` attributes
3. **Avoid hard waits** - Use Playwright's auto-waiting
4. **Isolate tests** - Each test should be independent
5. **Use fixtures** - For common setup/teardown
6. **Clear state** - Always clear auth state before tests

## Contributing

1. Add new tests to appropriate spec file
2. Create/update page objects as needed
3. Run tests locally before committing
4. Ensure tests pass in all browsers
