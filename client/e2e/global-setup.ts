import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for StackAudit E2E tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  // Optional: Pre-warm the dev server by making a request
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the app to ensure it's ready
    const baseURL = config.projects[0].use?.baseURL || 'http://localhost:5173';
    await page.goto(baseURL, { timeout: 30000 });
    console.log('✅ Application is ready');
  } catch (error) {
    console.error('⚠️ Warning: Could not reach application:', error);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
