/**
 * Integrations API Routes
 * Manage billing integrations (Stripe, QuickBooks) for auto-importing tool costs
 */
const express = require('express');
const { body, param, query } = require('express-validator');
const { integrationManager } = require('../services/integrations');
const { integrationCredentials, toolCosts, organizations } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/integrations
 * List available integrations and their connection status
 */
router.get('/', (req, res) => {
  const available = integrationManager.getAvailableIntegrations();
  const orgCredentials = integrationCredentials.get(req.user.organizationId) || {};
  
  // Add organization-specific connection status
  const integrations = available.map(integration => ({
    ...integration,
    isConnected: !!orgCredentials[integration.name],
    lastSync: orgCredentials[integration.name]?.lastSync || null
  }));

  res.json({ integrations });
});

/**
 * GET /api/integrations/:name/status
 * Get detailed status for a specific integration
 */
router.get('/:name/status', [
  param('name').isIn(['stripe', 'quickbooks'])
], validate, async (req, res, next) => {
  try {
    const { name } = req.params;
    const orgId = req.user.organizationId;
    const credentials = integrationCredentials.get(orgId)?.[name];

    if (!credentials) {
      return res.json({
        name,
        isConnected: false,
        status: 'not_connected'
      });
    }

    // Reconnect if we have stored credentials
    const connector = integrationManager.getConnector(name);
    if (!connector) {
      await integrationManager.reconnect(name, credentials.tokens, credentials.config);
    }

    const testResult = await integrationManager.testConnection(name);

    res.json({
      name,
      isConnected: testResult.success,
      status: testResult.success ? 'connected' : 'error',
      message: testResult.message,
      lastSync: credentials.lastSync
    });
  } catch (error) {
    logger.error('Status check failed:', error);
    next(ApiError.internal('Failed to check integration status'));
  }
});

/**
 * POST /api/integrations/stripe/connect
 * Connect Stripe using API key
 */
router.post('/stripe/connect', authorize('admin', 'owner'), [
  body('apiKey').notEmpty().withMessage('Stripe API key is required')
], validate, async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    const orgId = req.user.organizationId;

    const result = await integrationManager.connect('stripe', { 
      apiKey,
      config: { customerId: req.body.customerId }
    });

    if (result.success) {
      // Store credentials (encrypted in production)
      const orgCreds = integrationCredentials.get(orgId) || {};
      orgCreds.stripe = {
        tokens: { apiKey },
        config: { customerId: req.body.customerId },
        connectedAt: new Date().toISOString(),
        connectedBy: req.user.id
      };
      integrationCredentials.set(orgId, orgCreds);

      logger.info(`Stripe connected for org ${orgId}`);

      res.json({
        success: true,
        integration: 'stripe',
        message: 'Stripe connected successfully'
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Stripe connection failed:', error);
    next(ApiError.internal('Failed to connect Stripe'));
  }
});

/**
 * GET /api/integrations/quickbooks/auth-url
 * Get QuickBooks OAuth authorization URL
 */
router.get('/quickbooks/auth-url', authorize('admin', 'owner'), (req, res, next) => {
  try {
    const state = Buffer.from(JSON.stringify({
      orgId: req.user.organizationId,
      userId: req.user.id,
      timestamp: Date.now()
    })).toString('base64');

    const authUrl = integrationManager.getAuthorizationUrl('quickbooks', state);
    
    res.json({ authUrl, state });
  } catch (error) {
    logger.error('Failed to get QuickBooks auth URL:', error);
    next(ApiError.internal('Failed to generate authorization URL'));
  }
});

/**
 * POST /api/integrations/quickbooks/callback
 * Handle QuickBooks OAuth callback
 */
router.post('/quickbooks/callback', authorize('admin', 'owner'), [
  body('code').notEmpty().withMessage('Authorization code is required'),
  body('realmId').notEmpty().withMessage('Realm ID is required'),
  body('state').optional()
], validate, async (req, res, next) => {
  try {
    const { code, realmId, state } = req.body;
    const orgId = req.user.organizationId;

    // Verify state if provided
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        if (stateData.orgId !== orgId) {
          return next(ApiError.forbidden('State mismatch'));
        }
      } catch (e) {
        logger.warn('Invalid state parameter');
      }
    }

    const result = await integrationManager.connect('quickbooks', {
      code,
      realmId
    });

    if (result.success) {
      // Store credentials
      const orgCreds = integrationCredentials.get(orgId) || {};
      orgCreds.quickbooks = {
        tokens: result.tokens,
        config: { realmId },
        connectedAt: new Date().toISOString(),
        connectedBy: req.user.id
      };
      integrationCredentials.set(orgId, orgCreds);

      logger.info(`QuickBooks connected for org ${orgId}`);

      res.json({
        success: true,
        integration: 'quickbooks',
        message: 'QuickBooks connected successfully'
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('QuickBooks callback failed:', error);
    next(ApiError.internal('Failed to complete QuickBooks authorization'));
  }
});

/**
 * DELETE /api/integrations/:name
 * Disconnect an integration
 */
router.delete('/:name', authorize('admin', 'owner'), [
  param('name').isIn(['stripe', 'quickbooks'])
], validate, async (req, res, next) => {
  try {
    const { name } = req.params;
    const orgId = req.user.organizationId;

    await integrationManager.disconnect(name);

    // Remove stored credentials
    const orgCreds = integrationCredentials.get(orgId) || {};
    delete orgCreds[name];
    integrationCredentials.set(orgId, orgCreds);

    logger.info(`Integration ${name} disconnected for org ${orgId}`);

    res.json({
      success: true,
      integration: name,
      message: `${name} disconnected successfully`
    });
  } catch (error) {
    logger.error('Disconnect failed:', error);
    next(ApiError.internal('Failed to disconnect integration'));
  }
});

/**
 * POST /api/integrations/:name/sync
 * Sync data from a specific integration
 */
router.post('/:name/sync', authorize('admin', 'owner'), [
  param('name').isIn(['stripe', 'quickbooks']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], validate, async (req, res, next) => {
  try {
    const { name } = req.params;
    const { startDate, endDate } = req.body;
    const orgId = req.user.organizationId;

    // Ensure integration is connected
    const credentials = integrationCredentials.get(orgId)?.[name];
    if (!credentials) {
      return next(ApiError.badRequest(`${name} is not connected`));
    }

    // Reconnect if needed
    if (!integrationManager.getConnector(name)) {
      const reconnectResult = await integrationManager.reconnect(
        name, 
        credentials.tokens, 
        credentials.config
      );
      if (!reconnectResult.success) {
        return next(ApiError.badRequest(`Failed to reconnect ${name}: ${reconnectResult.message}`));
      }
    }

    // Perform sync
    const result = await integrationManager.importFromIntegration(name, {
      startDate,
      endDate
    });

    if (result.success) {
      // Store imported tool costs
      const orgToolCosts = toolCosts.get(orgId) || [];
      
      for (const cost of result.toolCosts) {
        // Check for duplicates
        const existingIndex = orgToolCosts.findIndex(
          c => c.source === cost.source && c.externalId === cost.externalId
        );
        
        if (existingIndex >= 0) {
          // Update existing
          orgToolCosts[existingIndex] = { ...orgToolCosts[existingIndex], ...cost };
        } else {
          // Add new with generated ID
          cost.id = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          orgToolCosts.push(cost);
        }
      }
      
      toolCosts.set(orgId, orgToolCosts);

      // Update last sync time
      const orgCreds = integrationCredentials.get(orgId) || {};
      if (orgCreds[name]) {
        orgCreds[name].lastSync = new Date().toISOString();
        integrationCredentials.set(orgId, orgCreds);
      }

      logger.info(`Synced ${result.itemsImported} items from ${name} for org ${orgId}`);
    }

    res.json(result);
  } catch (error) {
    logger.error('Sync failed:', error);
    next(ApiError.internal(`Failed to sync ${req.params.name}`));
  }
});

/**
 * POST /api/integrations/sync-all
 * Sync all connected integrations
 */
router.post('/sync-all', authorize('admin', 'owner'), [
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], validate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const orgId = req.user.organizationId;
    const orgCreds = integrationCredentials.get(orgId) || {};

    // Reconnect all integrations
    for (const [name, creds] of Object.entries(orgCreds)) {
      if (!integrationManager.getConnector(name)) {
        await integrationManager.reconnect(name, creds.tokens, creds.config);
      }
    }

    // Sync all
    const result = await integrationManager.syncAll({ startDate, endDate });

    if (result.success) {
      // Store all tool costs
      const orgToolCosts = toolCosts.get(orgId) || [];
      
      for (const cost of result.allToolCosts) {
        const existingIndex = orgToolCosts.findIndex(
          c => c.source === cost.source && c.externalId === cost.externalId
        );
        
        if (existingIndex >= 0) {
          orgToolCosts[existingIndex] = { ...orgToolCosts[existingIndex], ...cost };
        } else {
          cost.id = `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          orgToolCosts.push(cost);
        }
      }
      
      toolCosts.set(orgId, orgToolCosts);

      // Update last sync for all integrations
      for (const integration of result.integrations) {
        if (orgCreds[integration.name]) {
          orgCreds[integration.name].lastSync = new Date().toISOString();
        }
      }
      integrationCredentials.set(orgId, orgCreds);

      logger.info(`Synced ${result.totalImported} total items for org ${orgId}`);
    }

    res.json(result);
  } catch (error) {
    logger.error('Sync all failed:', error);
    next(ApiError.internal('Failed to sync integrations'));
  }
});

/**
 * GET /api/integrations/tool-costs
 * Get all imported tool costs
 */
router.get('/tool-costs', [
  query('category').optional(),
  query('source').optional(),
  query('status').optional(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], validate, (req, res) => {
  const orgId = req.user.organizationId;
  let costs = toolCosts.get(orgId) || [];
  
  // Apply filters
  if (req.query.category) {
    costs = costs.filter(c => c.category === req.query.category);
  }
  if (req.query.source) {
    costs = costs.filter(c => c.source === req.query.source);
  }
  if (req.query.status) {
    costs = costs.filter(c => c.status === req.query.status);
  }

  // Sort by billing date (newest first)
  costs.sort((a, b) => new Date(b.billingDate) - new Date(a.billingDate));

  // Pagination
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const total = costs.length;
  costs = costs.slice(offset, offset + limit);

  res.json({
    toolCosts: costs,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + costs.length < total
    }
  });
});

/**
 * GET /api/integrations/analytics
 * Get billing analytics across all integrations
 */
router.get('/analytics', async (req, res, next) => {
  try {
    const orgId = req.user.organizationId;
    const costs = toolCosts.get(orgId) || [];
    
    // Calculate analytics from stored costs
    const analytics = {
      totalMonthlySpend: 0,
      totalTools: costs.length,
      byCategory: {},
      byVendor: {},
      bySource: {},
      topTools: []
    };

    for (const cost of costs) {
      // Monthly equivalent
      let monthly = cost.amount;
      if (cost.billingPeriod === 'yearly') monthly = cost.amount / 12;
      if (cost.billingPeriod === 'weekly') monthly = cost.amount * 4.33;
      if (cost.billingPeriod === 'one-time') monthly = 0;
      
      if (cost.status === 'active') {
        analytics.totalMonthlySpend += monthly;
      }

      // By category
      if (!analytics.byCategory[cost.category]) {
        analytics.byCategory[cost.category] = { count: 0, monthlyTotal: 0 };
      }
      analytics.byCategory[cost.category].count++;
      analytics.byCategory[cost.category].monthlyTotal += monthly;

      // By vendor
      if (!analytics.byVendor[cost.vendor]) {
        analytics.byVendor[cost.vendor] = { count: 0, monthlyTotal: 0 };
      }
      analytics.byVendor[cost.vendor].count++;
      analytics.byVendor[cost.vendor].monthlyTotal += monthly;

      // By source
      if (!analytics.bySource[cost.source]) {
        analytics.bySource[cost.source] = { count: 0, monthlyTotal: 0 };
      }
      analytics.bySource[cost.source].count++;
      analytics.bySource[cost.source].monthlyTotal += monthly;
    }

    // Top 10 most expensive tools
    analytics.topTools = [...costs]
      .filter(c => c.status === 'active')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(c => ({
        name: c.toolName,
        vendor: c.vendor,
        amount: c.amount,
        billingPeriod: c.billingPeriod
      }));

    res.json(analytics);
  } catch (error) {
    logger.error('Analytics failed:', error);
    next(ApiError.internal('Failed to generate analytics'));
  }
});

/**
 * GET /api/integrations/history
 * Get sync history
 */
router.get('/history', [
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate, (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const history = integrationManager.getSyncHistory(limit);
  
  res.json({ history });
});

module.exports = router;
