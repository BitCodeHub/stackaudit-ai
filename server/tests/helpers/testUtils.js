/**
 * Test Utilities and Helpers
 * Common functions for creating test data and making authenticated requests
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  users, 
  organizations, 
  audits, 
  analysisResults,
  auditShares,
  subscriptions,
  generateId 
} = require('../../src/data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';

/**
 * Create a test user with organization
 */
const createTestUser = (overrides = {}) => {
  const orgId = generateId('org');
  const userId = generateId('user');
  
  const org = {
    id: orgId,
    name: overrides.orgName || 'Test Organization',
    plan: overrides.plan || 'free',
    stripeCustomerId: overrides.stripeCustomerId || null,
    stripeSubscriptionId: overrides.stripeSubscriptionId || null,
    createdAt: new Date().toISOString(),
    settings: {
      allowedDomains: [],
      maxAuditsPerMonth: overrides.maxAuditsPerMonth || 3,
      auditRetentionDays: 7
    }
  };
  organizations.set(orgId, org);
  
  const user = {
    id: userId,
    email: overrides.email || `test-${Date.now()}@example.com`,
    passwordHash: bcrypt.hashSync(overrides.password || 'testpassword123', 10),
    name: overrides.name || 'Test User',
    organizationId: orgId,
    role: overrides.role || 'admin',
    plan: overrides.plan || 'free',
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  };
  users.set(userId, user);
  
  return { user, org };
};

/**
 * Generate a valid JWT token for a user
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Create a test audit
 */
const createTestAudit = (organizationId, createdBy, overrides = {}) => {
  const auditId = generateId('audit');
  
  const audit = {
    id: auditId,
    name: overrides.name || 'Test Audit',
    url: overrides.url || 'https://example.com',
    repositoryUrl: overrides.repositoryUrl || null,
    description: overrides.description || 'Test audit description',
    tags: overrides.tags || ['test'],
    status: overrides.status || 'pending',
    organizationId,
    createdBy,
    createdAt: overrides.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: overrides.completedAt || null,
    results: overrides.results || null,
    score: overrides.score || null
  };
  audits.set(auditId, audit);
  
  // Create default share settings
  auditShares.set(auditId, {
    id: generateId('share'),
    auditId,
    visibility: 'team',
    publicToken: null,
    publicTokenExpiresAt: null,
    allowPublicComments: false,
    allowDownloads: true,
    allowComments: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  return audit;
};

/**
 * Create analysis results for an audit
 */
const createTestAnalysisResults = (auditId, overrides = {}) => {
  const analysisId = generateId('analysis');
  
  const results = {
    id: analysisId,
    auditId,
    createdAt: new Date().toISOString(),
    depth: overrides.depth || 'standard',
    overallScore: overrides.overallScore || 75,
    categories: overrides.categories || {
      security: { score: 80, grade: 'B', findings: [] },
      performance: { score: 75, grade: 'C', findings: [] },
      cost: { score: 70, grade: 'C', findings: [] },
      compliance: { score: 85, grade: 'B', findings: [] }
    },
    techStack: overrides.techStack || {
      frontend: ['React'],
      backend: ['Node.js'],
      database: ['PostgreSQL']
    },
    recommendations: overrides.recommendations || []
  };
  analysisResults.set(analysisId, results);
  
  return results;
};

/**
 * Create a test subscription
 */
const createTestSubscription = (orgId, overrides = {}) => {
  const subscriptionId = generateId('sub');
  
  const subscription = {
    id: subscriptionId,
    organizationId: orgId,
    status: overrides.status || 'active',
    currentPeriodEnd: overrides.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: overrides.cancelAtPeriodEnd || false,
    priceId: overrides.priceId || 'price_test',
    createdAt: new Date().toISOString()
  };
  subscriptions.set(subscriptionId, subscription);
  
  // Update organization
  const org = organizations.get(orgId);
  if (org) {
    org.stripeSubscriptionId = subscriptionId;
    org.stripeCustomerId = overrides.customerId || `cus_test_${Date.now()}`;
  }
  
  return subscription;
};

/**
 * Create expired JWT token
 */
const createExpiredToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId
    },
    JWT_SECRET,
    { expiresIn: '-1h' } // Already expired
  );
};

/**
 * Create invalid JWT token
 */
const createInvalidToken = () => {
  return 'invalid.jwt.token';
};

/**
 * Wait for a specified time (for async operations)
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  createTestUser,
  generateAuthToken,
  createTestAudit,
  createTestAnalysisResults,
  createTestSubscription,
  createExpiredToken,
  createInvalidToken,
  wait
};
