import { Page, expect } from '@playwright/test';

/**
 * Helper utilities for e2e tests
 */

/**
 * Wait for network to be idle (no pending requests)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Clear localStorage auth state
 */
export async function clearAuthState(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('stackaudit_token');
    localStorage.removeItem('stackaudit_user');
  });
}

/**
 * Set mock auth state directly in localStorage
 */
export async function setAuthState(page: Page, user: {
  id?: string;
  email: string;
  name: string;
  company?: string;
  plan?: string;
}) {
  await page.evaluate((userData) => {
    const userObj = {
      id: userData.id || '1',
      email: userData.email,
      name: userData.name,
      company: userData.company || 'Test Company',
      plan: userData.plan || 'pro',
    };
    localStorage.setItem('stackaudit_token', 'test_token');
    localStorage.setItem('stackaudit_user', JSON.stringify(userObj));
  }, user);
}

/**
 * Wait for toast/notification to appear
 */
export async function waitForToast(page: Page, message?: string) {
  const toast = page.locator('[role="alert"], .toast, [data-testid="toast"]');
  await expect(toast).toBeVisible({ timeout: 5000 });
  if (message) {
    await expect(toast).toContainText(message);
  }
}

/**
 * Fill form fields by label
 */
export async function fillFormField(page: Page, label: string, value: string) {
  await page.getByLabel(label).fill(value);
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, text: string) {
  await page.getByRole('button', { name: text }).click();
}

/**
 * Assert page URL contains path
 */
export async function assertUrlContains(page: Page, path: string) {
  await expect(page).toHaveURL(new RegExp(path));
}

/**
 * Generate random email for test isolation
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test+${timestamp}${random}@stackaudit.ai`;
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  url: string | RegExp,
  response: object,
  status = 200
) {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Wait for element to be clickable
 */
export async function waitForClickable(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  await expect(element).toBeEnabled();
  return element;
}

/**
 * Take named screenshot for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `e2e/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}
