import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

/**
 * Extended test fixtures with authentication
 */
export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: DashboardPage;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
  
  authenticatedPage: async ({ page }, use) => {
    // Perform login before test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test@stackaudit.ai', 'password123');
    
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForLoad();
    await use(dashboardPage);
  },
});

export { expect };

/**
 * Test user credentials
 */
export const testUsers = {
  valid: {
    email: 'test@stackaudit.ai',
    password: 'password123',
    name: 'Test User',
    company: 'Test Company',
  },
  proPlan: {
    email: 'pro@stackaudit.ai',
    password: 'password123',
    name: 'Pro User',
    plan: 'pro',
  },
  freePlan: {
    email: 'free@stackaudit.ai',
    password: 'password123',
    name: 'Free User',
    plan: 'free',
  },
};
