import { test, expect } from '@playwright/test';
import { AuditResultsPage } from './pages/audit-results.page';
import { setAuthState, clearAuthState } from './utils/helpers';

test.describe('View Audit Results Flow', () => {
  let resultsPage: AuditResultsPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
    
    resultsPage = new AuditResultsPage(page);
    await resultsPage.goto('1');
  });

  test.describe('Page Load', () => {
    test('should display audit results page correctly', async () => {
      await resultsPage.assertAuditName('Q4 2024 Stack Audit');
      await resultsPage.assertCompleted();
    });

    test('should show all summary stats', async ({ page }) => {
      await expect(resultsPage.totalSpendStat).toBeVisible();
      await expect(resultsPage.potentialSavingsStat).toBeVisible();
      await expect(resultsPage.toolCountStat).toBeVisible();
      await expect(resultsPage.activeUsersStat).toBeVisible();
      await expect(resultsPage.wastePercentageStat).toBeVisible();
    });

    test('should show correct summary values', async () => {
      await resultsPage.assertTotalSpend('$45,230');
      await resultsPage.assertPotentialSavings('$12,400');
      await resultsPage.assertToolCount(23);
    });

    test('should show navigation buttons', async () => {
      await expect(resultsPage.backButton).toBeVisible();
      await expect(resultsPage.shareButton).toBeVisible();
      await expect(resultsPage.exportButton).toBeVisible();
      await expect(resultsPage.recommendationsButton).toBeVisible();
    });
  });

  test.describe('Tabs Navigation', () => {
    test('should display all tabs', async () => {
      await expect(resultsPage.overviewTab).toBeVisible();
      await expect(resultsPage.toolsTab).toBeVisible();
      await expect(resultsPage.savingsTab).toBeVisible();
    });

    test('should show overview tab by default', async () => {
      await resultsPage.assertOverviewTabContent();
    });

    test('should switch to tools tab', async () => {
      await resultsPage.goToToolsTab();
      await resultsPage.assertToolsTabContent();
    });

    test('should switch to savings tab', async () => {
      await resultsPage.goToSavingsTab();
      await resultsPage.assertSavingsTabContent();
    });

    test('should switch back to overview tab', async () => {
      await resultsPage.goToToolsTab();
      await resultsPage.goToOverviewTab();
      await resultsPage.assertOverviewTabContent();
    });
  });

  test.describe('Overview Tab', () => {
    test('should show ROI score gauge', async () => {
      await expect(resultsPage.roiGauge).toBeVisible();
    });

    test('should show spend trend chart', async () => {
      await expect(resultsPage.spendChart).toBeVisible();
    });

    test('should show category pie chart', async () => {
      await expect(resultsPage.categoryPieChart).toBeVisible();
    });

    test('should show top recommendations preview', async () => {
      await expect(resultsPage.recommendationsPreview).toBeVisible();
    });

    test('should show ROI metrics', async ({ page }) => {
      await expect(page.locator('text=Cost Efficiency')).toBeVisible();
      await expect(page.locator('text=Utilization Rate')).toBeVisible();
      await expect(page.locator('text=Redundancy Score')).toBeVisible();
    });
  });

  test.describe('Tools Analysis Tab', () => {
    test.beforeEach(async () => {
      await resultsPage.goToToolsTab();
    });

    test('should show tools table', async () => {
      await expect(resultsPage.toolsTable).toBeVisible();
    });

    test('should show table headers', async ({ page }) => {
      await expect(page.locator('th:text("Tool")')).toBeVisible();
      await expect(page.locator('th:text("Category")')).toBeVisible();
      await expect(page.locator('th:text("Monthly Cost")')).toBeVisible();
      await expect(page.locator('th:text("Users")')).toBeVisible();
      await expect(page.locator('th:text("Utilization")')).toBeVisible();
      await expect(page.locator('th:text("Status")')).toBeVisible();
    });

    test('should list all analyzed tools', async () => {
      const toolCount = await resultsPage.getToolCount();
      expect(toolCount).toBeGreaterThan(0);
    });

    test('should show tool status badges', async ({ page }) => {
      // Check for different status types
      await expect(page.locator('text=Healthy').first()).toBeVisible();
    });

    test('should show utilization bars', async ({ page }) => {
      // Utilization bars should be visible
      const utilizationBars = page.locator('[class*="bg-success"], [class*="bg-warning"], [class*="bg-danger"]');
      await expect(utilizationBars.first()).toBeVisible();
    });

    test('should display tool with warning status', async () => {
      await resultsPage.assertToolStatus('Salesforce', 'warning');
    });

    test('should display tool with danger status', async () => {
      await resultsPage.assertToolStatus('Zoom', 'danger');
    });
  });

  test.describe('Savings Breakdown Tab', () => {
    test.beforeEach(async () => {
      await resultsPage.goToSavingsTab();
    });

    test('should show savings breakdown', async () => {
      await expect(resultsPage.savingsBreakdown).toBeVisible();
    });

    test('should show savings categories', async ({ page }) => {
      await expect(page.locator('text=License Optimization')).toBeVisible();
      await expect(page.locator('text=Tool Consolidation')).toBeVisible();
      await expect(page.locator('text=Usage Rightsizing')).toBeVisible();
      await expect(page.locator('text=Contract Renegotiation')).toBeVisible();
    });

    test('should show total potential savings', async ({ page }) => {
      await expect(page.locator('text=Total Potential Savings')).toBeVisible();
      await expect(page.locator('text=$12,400')).toBeVisible();
    });

    test('should show annual savings', async ({ page }) => {
      await expect(page.locator('text=/year')).toBeVisible();
    });

    test('should show implementation timeline', async () => {
      await expect(resultsPage.implementationTimeline).toBeVisible();
    });

    test('should show implementation phases', async ({ page }) => {
      await expect(page.locator('text=Quick Wins')).toBeVisible();
      await expect(page.locator('text=Short Term')).toBeVisible();
      await expect(page.locator('text=Medium Term')).toBeVisible();
    });

    test('should show phase timeframes', async ({ page }) => {
      await expect(page.locator('text=1-2 weeks')).toBeVisible();
      await expect(page.locator('text=1 month')).toBeVisible();
      await expect(page.locator('text=2-3 months')).toBeVisible();
    });
  });

  test.describe('Actions', () => {
    test('should navigate back to dashboard', async () => {
      await resultsPage.goBack();
      await expect(resultsPage.page).toHaveURL(/\/dashboard/);
    });

    test('should navigate to recommendations', async () => {
      await resultsPage.goToRecommendations();
      await expect(resultsPage.page).toHaveURL(/\/recommendations/);
    });

    test('should have share button clickable', async () => {
      await expect(resultsPage.shareButton).toBeEnabled();
    });

    test('should have export button clickable', async () => {
      await expect(resultsPage.exportButton).toBeEnabled();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await resultsPage.goto('1');
      
      await resultsPage.assertAuditName('Q4 2024 Stack Audit');
      await expect(resultsPage.overviewTab).toBeVisible();
    });

    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await resultsPage.goto('1');
      
      await resultsPage.assertAuditName('Q4 2024 Stack Audit');
      // Summary stats should still be visible
      await expect(resultsPage.totalSpendStat).toBeVisible();
    });
  });
});

test.describe('View Results - Authentication', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await clearAuthState(page);
    await page.goto('/audit/1');
    
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('View Results - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
  });

  test('should handle non-existent audit gracefully', async ({ page }) => {
    // Navigate to a non-existent audit
    await page.goto('/audit/99999');
    
    // Should either show error or redirect
    // This depends on how the app handles 404s
    await page.waitForLoadState('networkidle');
    
    // Check that page loaded (doesn't crash)
    await expect(page.locator('body')).toBeVisible();
  });
});
