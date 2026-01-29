const express = require('express');
const { body } = require('express-validator');
const { organizations, users, audits } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/organizations/current
 * Get current user's organization
 */
router.get('/current', (req, res, next) => {
  const org = organizations.get(req.user.organizationId);

  if (!org) {
    return next(ApiError.notFound('Organization not found'));
  }

  // Get member count
  const memberCount = Array.from(users.values())
    .filter(u => u.organizationId === org.id).length;

  // Get audit stats
  const orgAudits = Array.from(audits.values())
    .filter(a => a.organizationId === org.id);
  
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const auditsThisMonth = orgAudits.filter(a => 
    new Date(a.createdAt) >= thisMonth
  ).length;

  res.json({
    organization: {
      id: org.id,
      name: org.name,
      plan: org.plan,
      createdAt: org.createdAt,
      settings: org.settings
    },
    stats: {
      memberCount,
      totalAudits: orgAudits.length,
      auditsThisMonth,
      auditLimit: org.settings.maxAuditsPerMonth
    }
  });
});

/**
 * PATCH /api/organizations/current
 * Update organization settings
 */
router.patch('/current', authorize('admin', 'owner'), [
  body('name').optional().trim().notEmpty(),
  body('settings.allowedDomains').optional().isArray(),
  body('settings.auditRetentionDays').optional().isInt({ min: 7, max: 365 })
], validate, (req, res, next) => {
  const org = organizations.get(req.user.organizationId);

  if (!org) {
    return next(ApiError.notFound('Organization not found'));
  }

  const { name, settings } = req.body;

  if (name) org.name = name;
  if (settings) {
    if (settings.allowedDomains !== undefined) {
      org.settings.allowedDomains = settings.allowedDomains;
    }
    if (settings.auditRetentionDays !== undefined) {
      // Check if plan allows extended retention
      const maxRetention = { free: 7, pro: 90, enterprise: 365 };
      if (settings.auditRetentionDays > maxRetention[org.plan]) {
        return next(ApiError.forbidden(`${org.plan} plan allows max ${maxRetention[org.plan]} days retention`));
      }
      org.settings.auditRetentionDays = settings.auditRetentionDays;
    }
  }

  logger.info(`Organization updated: ${org.id} by ${req.user.email}`);

  res.json({
    message: 'Organization updated',
    organization: {
      id: org.id,
      name: org.name,
      plan: org.plan,
      settings: org.settings
    }
  });
});

/**
 * GET /api/organizations/usage
 * Get organization usage statistics
 */
router.get('/usage', (req, res, next) => {
  const org = organizations.get(req.user.organizationId);

  if (!org) {
    return next(ApiError.notFound('Organization not found'));
  }

  const orgAudits = Array.from(audits.values())
    .filter(a => a.organizationId === org.id);

  // Calculate monthly usage
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const auditsLast30Days = orgAudits.filter(a => new Date(a.createdAt) >= last30Days);
  const auditsLast7Days = orgAudits.filter(a => new Date(a.createdAt) >= last7Days);

  // Calculate average scores
  const completedAudits = orgAudits.filter(a => a.status === 'completed' && a.score);
  const averageScore = completedAudits.length > 0
    ? Math.round(completedAudits.reduce((sum, a) => sum + a.score, 0) / completedAudits.length)
    : null;

  // Member count
  const memberCount = Array.from(users.values())
    .filter(u => u.organizationId === org.id).length;

  const planLimits = {
    free: { auditsPerMonth: 3, users: 1, retentionDays: 7 },
    pro: { auditsPerMonth: 50, users: 10, retentionDays: 90 },
    enterprise: { auditsPerMonth: 500, users: 100, retentionDays: 365 }
  };

  res.json({
    usage: {
      audits: {
        total: orgAudits.length,
        last30Days: auditsLast30Days.length,
        last7Days: auditsLast7Days.length,
        limit: planLimits[org.plan].auditsPerMonth,
        percentUsed: Math.round((auditsLast30Days.length / planLimits[org.plan].auditsPerMonth) * 100)
      },
      users: {
        total: memberCount,
        limit: planLimits[org.plan].users
      },
      storage: {
        retentionDays: org.settings.auditRetentionDays,
        maxRetentionDays: planLimits[org.plan].retentionDays
      }
    },
    performance: {
      averageScore,
      completedAudits: completedAudits.length,
      pendingAudits: orgAudits.filter(a => a.status === 'pending').length
    },
    plan: org.plan
  });
});

/**
 * GET /api/organizations/api-keys
 * Get organization API keys (enterprise only)
 */
router.get('/api-keys', authorize('admin', 'owner'), (req, res, next) => {
  const org = organizations.get(req.user.organizationId);

  if (org.plan !== 'enterprise') {
    return next(ApiError.forbidden('API keys require Enterprise plan'));
  }

  // In production, fetch actual API keys from database
  res.json({
    apiKeys: [
      {
        id: 'key_1',
        name: 'Production',
        prefix: 'sk_live_xxxx',
        createdAt: new Date().toISOString(),
        lastUsed: null
      }
    ]
  });
});

/**
 * POST /api/organizations/api-keys
 * Create new API key (enterprise only)
 */
router.post('/api-keys', authorize('admin', 'owner'), [
  body('name').trim().notEmpty()
], validate, (req, res, next) => {
  const org = organizations.get(req.user.organizationId);

  if (org.plan !== 'enterprise') {
    return next(ApiError.forbidden('API keys require Enterprise plan'));
  }

  const { name } = req.body;

  // In production, generate actual API key
  const apiKey = `sk_live_${Math.random().toString(36).slice(2)}`;

  logger.info(`API key created: ${name} for org ${org.id}`);

  res.status(201).json({
    message: 'API key created',
    apiKey: {
      id: 'key_new',
      name,
      key: apiKey, // Only shown once
      createdAt: new Date().toISOString()
    }
  });
});

module.exports = router;
