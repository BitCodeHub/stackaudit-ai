/**
 * Jest Setup File
 * Runs before all tests to configure the test environment
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.JWT_EXPIRES_IN = '1h';

// Silence console.log in tests (comment out for debugging)
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error
};

// Reset data stores before each test
beforeEach(() => {
  const store = require('../src/data/store');
  
  // Clear all stores
  store.users.clear();
  store.organizations.clear();
  store.audits.clear();
  store.analysisResults.clear();
  store.subscriptions.clear();
  store.teamInvites.clear();
  store.auditComments.clear();
  store.auditShares.clear();
  store.auditUserShares.clear();
  store.commentReactions.clear();
  store.collaborationActivity.clear();
  store.notificationPreferences.clear();
  store.integrationCredentials.clear();
  store.toolCosts.clear();
});
