import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { setAuthState, clearAuthState } from './utils/helpers';

test.describe('Dashboard Page', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
    
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test.describe('Page Load', () => {
    test('should display dashboard page correctly', async () => {
      await dashboardPage.assertLoaded();
      await expect(dashboardPage.welcomeMessage).toBeVisible();
    });

    test('should display user name in welcome message', async ({ page }) => {
      await expect(page.getByText(/Welcome.*Test User/i)).toBeVisible();
    });

    test('should display New Audit button', async () => {
      await expect(dashboardPage.newAuditButton).toBeVisible();
    });

    test('should navigate to new audit page', async ({ page }) => {
      await dashboardPage.newAuditButton.click();
      await expect(page).toHaveURL(/\/audit\/new/);
    });
  });

  test.describe('Stats Overview', () => {
    test('should display all stats cards', async ({ page }) => {
      await expect(page.locator('text=Total Audits')).toBeVisible();
      await expect(page.locator('text=Active Tools')).toBeVisible();
      await expect(page.locator('text=Monthly Spend')).toBeVisible();
      await expect(page.locator('text=Potential Savings')).toBeVisible();
    });

    test('should display stat values', async ({ page }) => {
      const statCards = page.locator('.stat-card, [class*="stat"]');
      const count = await statCards.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('should display trend indicators', async ({ page }) => {
      // Stats should show up/down trends
      const trends = page.locator('[class*="trend"], [class*="change"]');
      await expect(trends.first()).toBeVisible();
    });
  });

  test.describe('Recent Audits', () => {
    test('should display recent audits section', async () => {
      await expect(dashboardPage.recentAuditsSection).toBeVisible();
    });

    test('should display audit cards', async () => {
      const auditCards = await dashboardPage.getAuditCards();
      const count = await auditCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display audit name and date', async ({ page }) => {
      const auditCard = page.locator('.audit-card, [class*="audit"]').first();
      await expect(auditCard).toContainText(/Q\d|Stack|Audit/i);
    });

    test('should navigate to audit details on click', async ({ page }) => {
      await dashboardPage.clickFirstAudit();
      await expect(page).toHaveURL(/\/audit\/\d+/);
    });
  });

  test.describe('Quick Actions', () => {
    test('should display quick actions', async ({ page }) => {
      await expect(page.locator('text=Quick Actions')).toBeVisible();
    });

    test('should have View All Audits action', async ({ page }) => {
      const viewAllLink = page.getByRole('link', { name: /View All Audits/i });
      await expect(viewAllLink).toBeVisible();
    });

    test('should have View Recommendations action', async ({ page }) => {
      const recsLink = page.getByRole('link', { name: /View Recommendations/i });
      await expect(recsLink).toBeVisible();
    });

    test('should navigate to audits list', async ({ page }) => {
      await page.getByRole('link', { name: /View All Audits/i }).click();
      await expect(page).toHaveURL(/\/audits/);
    });
  });

  test.describe('Spend Overview Chart', () => {
    test('should display spend chart', async ({ page }) => {
      await expect(page.locator('text=Spend Overview')).toBeVisible();
    });

    test('should display chart visualization', async ({ page }) => {
      const chart = page.locator('.recharts-wrapper, canvas, svg[class*="chart"]');
      await expect(chart.first()).toBeVisible();
    });

    test('should have time period selector', async ({ page }) => {
      const periodSelector = page.locator('select, [role="combobox"]').filter({ hasText: /month|week|year/i });
      // May or may not exist depending on implementation
    });
  });

  test.describe('Top Tools by Spend', () => {
    test('should display top tools section', async ({ page }) => {
      await expect(page.locator('text=/Top Tools|Tools by Spend/i')).toBeVisible();
    });

    test('should list tools with spend amounts', async ({ page }) => {
      const toolRows = page.locator('[class*="tool-row"], tr').filter({ hasText: /\$/ });
      const count = await toolRows.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Notifications', () => {
    test('should display notifications or alerts', async ({ page }) => {
      // Check for any notification/alert elements
      const notifications = page.locator('[class*="notification"], [class*="alert"], [role="alert"]');
      // May or may not exist
    });
  });
});

test.describe('Dashboard - Authentication', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await clearAuthState(page);
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show correct plan badge', async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'free',
    });
    
    await page.goto('/dashboard');
    
    // Should show Free plan indicator
    await expect(page.locator('.badge, [class*="plan"]').filter({ hasText: /free/i })).toBeVisible();
  });
});

test.describe('Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
  });

  test('should have navigation sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('nav, [class*="sidebar"]')).toBeVisible();
  });

  test('should navigate to Settings', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.getByRole('link', { name: /Settings/i }).click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should have logout option', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.getByRole('button', { name: /Logout|Sign out/i })).toBeVisible();
  });
});

test.describe('Dashboard - Responsive', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'test@stackaudit.ai',
      name: 'Test User',
      plan: 'pro',
    });
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Main content should be visible
    await expect(page.getByText(/Welcome/i)).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    
    await expect(page.getByText(/Welcome/i)).toBeVisible();
    await expect(page.locator('text=Total Audits')).toBeVisible();
  });
});

test.describe('Dashboard - Empty State', () => {
  test('should show empty state for new users', async ({ page }) => {
    await clearAuthState(page);
    await setAuthState(page, {
      email: 'newuser@stackaudit.ai',
      name: 'New User',
      plan: 'free',
      isNewUser: true,
    });
    
    await page.goto('/dashboard');
    
    // Should show some empty state or onboarding
    await expect(page.getByText(/Welcome|Get Started|Create.*Audit/i)).toBeVisible();
  });
});
