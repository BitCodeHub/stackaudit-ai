import { FullConfig } from '@playwright/test';

/**
 * Global teardown for StackAudit E2E tests
 * Runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  // Cleanup tasks if needed
  console.log('✅ E2E tests completed');
}

export default globalTeardown;
