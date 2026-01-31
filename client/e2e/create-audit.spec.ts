import { test, expect } from '@playwright/test';
import { NewAuditPage } from './pages/new-audit.page';
import { DashboardPage } from './pages/dashboard.page';
import { setAuthState, clearAuthState } from './utils/helpers';

test.describe('Create Audit Flow', () => {
  let newAuditPage: NewAuditPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
    
    newAuditPage = new NewAuditPage(page);
    await newAuditPage.goto();
  });

  test.describe('Page Load', () => {
    test('should display create audit page correctly', async () => {
      await expect(newAuditPage.pageTitle).toBeVisible();
      await expect(newAuditPage.auditNameInput).toBeVisible();
      await expect(newAuditPage.toolSearchInput).toBeVisible();
      await expect(newAuditPage.toolCards.first()).toBeVisible();
    });

    test('should show all 4 step indicators', async () => {
      await expect(newAuditPage.step1Indicator).toBeVisible();
      await expect(newAuditPage.step2Indicator).toBeVisible();
      await expect(newAuditPage.step3Indicator).toBeVisible();
      await expect(newAuditPage.step4Indicator).toBeVisible();
    });

    test('should start on step 1', async () => {
      await newAuditPage.assertCurrentStep(1);
    });

    test('should have back to dashboard button', async () => {
      await expect(newAuditPage.backButton).toBeVisible();
    });
  });

  test.describe('Step 1: Select Tools', () => {
    test('should disable continue button when no tools selected', async () => {
      await newAuditPage.assertContinueDisabled();
    });

    test('should enable continue button after selecting a tool', async () => {
      await newAuditPage.selectTool('Slack');
      await newAuditPage.assertContinueEnabled();
    });

    test('should allow entering audit name', async () => {
      await newAuditPage.setAuditName('Q1 2025 Stack Review');
      await expect(newAuditPage.auditNameInput).toHaveValue('Q1 2025 Stack Review');
    });

    test('should filter tools when searching', async ({ page }) => {
      await newAuditPage.searchTool('Slack');
      
      // Should show Slack
      await expect(page.locator('button').filter({ hasText: 'Slack' })).toBeVisible();
      
      // Should not show unrelated tools
      await expect(page.locator('button').filter({ hasText: 'Figma' })).not.toBeVisible();
    });

    test('should show selected tools as badges', async ({ page }) => {
      await newAuditPage.selectTool('Slack');
      await newAuditPage.selectTool('Jira');
      
      await newAuditPage.assertToolsSelected(2);
      await expect(page.locator('text=Selected (2)')).toBeVisible();
    });

    test('should allow deselecting tools', async ({ page }) => {
      await newAuditPage.selectTool('Slack');
      await newAuditPage.assertToolsSelected(1);
      
      // Click on the tool again to deselect
      await newAuditPage.selectTool('Slack');
      
      // Should no longer show "Selected (1)"
      await expect(page.locator('text=Selected (1)')).not.toBeVisible();
    });

    test('should show add custom tool option', async () => {
      await expect(newAuditPage.addCustomToolButton).toBeVisible();
    });
  });

  test.describe('Step 2: Add Costs', () => {
    test.beforeEach(async () => {
      // Complete step 1
      await newAuditPage.setAuditName('Test Audit');
      await newAuditPage.selectTool('Slack');
      await newAuditPage.selectTool('Jira');
      await newAuditPage.nextStep();
    });

    test('should navigate to step 2', async () => {
      await newAuditPage.assertCurrentStep(2);
    });

    test('should show cost inputs for each selected tool', async () => {
      // Should have 2 cost inputs (one for each tool)
      await expect(newAuditPage.costInputs).toHaveCount(2);
    });

    test('should update total cost as values are entered', async ({ page }) => {
      await newAuditPage.setToolCost(0, '2400');
      await newAuditPage.setToolCost(1, '1800');
      
      // Total should be $4,200
      await expect(page.locator('text=$4,200')).toBeVisible();
    });

    test('should disable continue if costs are not entered', async () => {
      await newAuditPage.assertContinueDisabled();
    });

    test('should enable continue when all costs are entered', async () => {
      await newAuditPage.setToolCost(0, '2400');
      await newAuditPage.setToolCost(1, '1800');
      
      await newAuditPage.assertContinueEnabled();
    });

    test('should allow going back to step 1', async () => {
      await newAuditPage.previousStep();
      await newAuditPage.assertCurrentStep(1);
    });
  });

  test.describe('Step 3: Usage Data', () => {
    test.beforeEach(async () => {
      // Complete steps 1 and 2
      await newAuditPage.setAuditName('Test Audit');
      await newAuditPage.selectTool('Slack');
      await newAuditPage.selectTool('Jira');
      await newAuditPage.nextStep();
      
      await newAuditPage.setToolCost(0, '2400');
      await newAuditPage.setToolCost(1, '1800');
      await newAuditPage.nextStep();
    });

    test('should navigate to step 3', async () => {
      await newAuditPage.assertCurrentStep(3);
    });

    test('should show usage inputs for each tool', async ({ page }) => {
      // Each tool should have users and utilization inputs
      await expect(page.locator('text=Licensed Users')).toBeVisible();
      await expect(page.locator('text=Utilization (%)')).toBeVisible();
    });

    test('should update totals as usage data is entered', async ({ page }) => {
      await newAuditPage.setToolUsage(0, '50', '80');
      await newAuditPage.setToolUsage(1, '30', '90');
      
      // Total users should be 80
      await expect(page.locator('.text-2xl').filter({ hasText: '80' })).toBeVisible();
    });

    test('should calculate average utilization', async ({ page }) => {
      await newAuditPage.setToolUsage(0, '50', '80');
      await newAuditPage.setToolUsage(1, '30', '60');
      
      // Average should be 70%
      await expect(page.locator('.text-2xl').filter({ hasText: '70%' })).toBeVisible();
    });
  });

  test.describe('Step 4: Review', () => {
    test.beforeEach(async () => {
      // Complete all previous steps
      await newAuditPage.setAuditName('Q1 2025 Stack Review');
      await newAuditPage.selectTool('Slack');
      await newAuditPage.selectTool('Jira');
      await newAuditPage.nextStep();
      
      await newAuditPage.setToolCost(0, '2400');
      await newAuditPage.setToolCost(1, '1800');
      await newAuditPage.nextStep();
      
      await newAuditPage.setToolUsage(0, '50', '80');
      await newAuditPage.setToolUsage(1, '30', '90');
      await newAuditPage.nextStep();
    });

    test('should navigate to step 4', async () => {
      await newAuditPage.assertCurrentStep(4);
    });

    test('should show audit summary', async ({ page }) => {
      await expect(page.locator('text=Q1 2025 Stack Review')).toBeVisible();
      await expect(page.locator('text=2 tools')).toBeVisible();
    });

    test('should show all selected tools in review', async ({ page }) => {
      await expect(page.locator('text=Slack')).toBeVisible();
      await expect(page.locator('text=Jira')).toBeVisible();
    });

    test('should show Run Analysis button', async () => {
      await expect(newAuditPage.submitButton).toBeVisible();
    });

    test('should show "What happens next" info', async ({ page }) => {
      await expect(page.locator('text=What happens next?')).toBeVisible();
    });
  });

  test.describe('Complete Audit Creation', () => {
    test('should create audit and redirect to results', async () => {
      await newAuditPage.createAudit({
        name: 'Complete E2E Test Audit',
        tools: ['Slack', 'Jira', 'AWS'],
        costs: ['2400', '1800', '12500'],
        usage: [
          { users: '100', utilization: '95' },
          { users: '65', utilization: '88' },
          { users: '30', utilization: '72' },
        ],
      });
      
      await newAuditPage.assertAuditCreated();
    });

    test('should show loading state during submission', async ({ page }) => {
      // Complete the wizard
      await newAuditPage.setAuditName('Loading Test');
      await newAuditPage.selectTool('Slack');
      await newAuditPage.nextStep();
      await newAuditPage.setToolCost(0, '1000');
      await newAuditPage.nextStep();
      await newAuditPage.setToolUsage(0, '50', '80');
      await newAuditPage.nextStep();
      
      // Submit and check for loading state
      await newAuditPage.submitButton.click();
      
      // Button should show loading state
      await expect(page.locator('svg.animate-spin')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to dashboard', async ({ page }) => {
      await newAuditPage.backButton.click();
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should preserve data when going back and forward', async () => {
      // Select tools
      await newAuditPage.setAuditName('Preserved Audit');
      await newAuditPage.selectTool('Slack');
      await newAuditPage.nextStep();
      
      // Enter cost
      await newAuditPage.setToolCost(0, '2500');
      
      // Go back
      await newAuditPage.previousStep();
      
      // Audit name should be preserved
      await expect(newAuditPage.auditNameInput).toHaveValue('Preserved Audit');
      
      // Go forward
      await newAuditPage.nextStep();
      
      // Cost should be preserved
      await expect(newAuditPage.costInputs.first()).toHaveValue('2500');
    });
  });
});

test.describe('Create Audit - Authentication', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await clearAuthState(page);
    await page.goto('/audit/new');
    
    await expect(page).toHaveURL(/\/login/);
  });
});
