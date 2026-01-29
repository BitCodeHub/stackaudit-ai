/**
 * In-memory data store
 * Replace with database (PostgreSQL, MongoDB, etc.) in production
 */

const { v4: uuidv4 } = require('uuid');

// Users store
const users = new Map();

// Organizations store
const organizations = new Map();

// Audits store
const audits = new Map();

// Analysis results store
const analysisResults = new Map();

// Subscriptions store
const subscriptions = new Map();

// Initialize with demo data
const initDemoData = () => {
  // Demo organization
  const demoOrgId = 'org_demo_123';
  organizations.set(demoOrgId, {
    id: demoOrgId,
    name: 'Demo Company',
    plan: 'pro',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    createdAt: new Date().toISOString(),
    settings: {
      allowedDomains: [],
      maxAuditsPerMonth: 50,
      auditRetentionDays: 90
    }
  });

  // Demo user
  const demoUserId = 'user_demo_123';
  users.set(demoUserId, {
    id: demoUserId,
    email: 'demo@stackaudit.ai',
    // Password: "demo123" - hashed with bcrypt
    passwordHash: '$2a$10$XpWtVZ2CQHfRiRrHE7sKIOG//P0Z5dlL4G1OVN6Vil1IrDt3aNOyC',
    name: 'Demo User',
    organizationId: demoOrgId,
    role: 'admin',
    plan: 'pro',
    createdAt: new Date().toISOString(),
    lastLoginAt: null
  });
};

// Initialize demo data
initDemoData();

module.exports = {
  users,
  organizations,
  audits,
  analysisResults,
  subscriptions,
  generateId: (prefix = '') => prefix ? `${prefix}_${uuidv4()}` : uuidv4()
};
