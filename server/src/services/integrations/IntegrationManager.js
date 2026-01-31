/**
 * IntegrationManager - Orchestrates all billing/accounting integrations
 * Central hub for managing connectors and syncing tool costs
 */
const logger = require('../../utils/logger');
const StripeConnector = require('./StripeConnector');
const QuickBooksConnector = require('./QuickBooksConnector');

class IntegrationManager {
  constructor() {
    this.connectors = new Map();
    this.syncHistory = [];
    this.maxHistorySize = 100;
    
    // Register available connectors
    this.availableConnectors = {
      stripe: {
        name: 'stripe',
        displayName: 'Stripe',
        description: 'Import subscriptions and billing data from Stripe',
        icon: 'stripe',
        authType: 'api_key',
        features: ['subscriptions', 'invoices', 'upcoming_charges', 'billing_history'],
        ConnectorClass: StripeConnector
      },
      quickbooks: {
        name: 'quickbooks',
        displayName: 'QuickBooks Online',
        description: 'Import vendor expenses and bills from QuickBooks',
        icon: 'quickbooks',
        authType: 'oauth2',
        features: ['bills', 'purchases', 'recurring', 'expense_reports'],
        ConnectorClass: QuickBooksConnector
      }
    };
  }

  /**
   * Get list of available integrations
   */
  getAvailableIntegrations() {
    return Object.values(this.availableConnectors).map(({ ConnectorClass, ...info }) => ({
      ...info,
      isConnected: this.connectors.has(info.name),
      status: this.connectors.get(info.name)?.getStatus() || null
    }));
  }

  /**
   * Get specific connector by name
   */
  getConnector(name) {
    return this.connectors.get(name);
  }

  /**
   * Initialize and connect an integration
   */
  async connect(name, credentials) {
    const connectorInfo = this.availableConnectors[name];
    
    if (!connectorInfo) {
      throw new Error(`Unknown integration: ${name}`);
    }

    try {
      const connector = new connectorInfo.ConnectorClass(credentials.config || {});
      const result = await connector.authenticate(credentials);
      
      if (result.success) {
        this.connectors.set(name, connector);
        logger.info(`Integration connected: ${name}`);
        
        return {
          success: true,
          integration: name,
          status: connector.getStatus(),
          tokens: result.tokens
        };
      }
      
      return result;
    } catch (error) {
      logger.error(`Failed to connect integration ${name}:`, error);
      return {
        success: false,
        integration: name,
        error: error.message
      };
    }
  }

  /**
   * Reconnect with stored tokens
   */
  async reconnect(name, tokens, config = {}) {
    const connectorInfo = this.availableConnectors[name];
    
    if (!connectorInfo) {
      throw new Error(`Unknown integration: ${name}`);
    }

    try {
      const connector = new connectorInfo.ConnectorClass(config);
      
      // For Stripe, re-authenticate with API key
      if (name === 'stripe' && tokens.apiKey) {
        connector.initialize(tokens.apiKey);
        const result = await connector.testConnection();
        if (result.success) {
          this.connectors.set(name, connector);
          return { success: true, status: connector.getStatus() };
        }
        return result;
      }
      
      // For OAuth-based connectors (QuickBooks)
      if (tokens.accessToken) {
        connector.setTokens(tokens);
        const result = await connector.testConnection();
        if (result.success) {
          this.connectors.set(name, connector);
          return { success: true, status: connector.getStatus() };
        }
        return result;
      }

      return { success: false, message: 'Invalid tokens' };
    } catch (error) {
      logger.error(`Failed to reconnect integration ${name}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect an integration
   */
  async disconnect(name) {
    const connector = this.connectors.get(name);
    
    if (!connector) {
      return { success: false, message: 'Integration not connected' };
    }

    try {
      await connector.disconnect();
      this.connectors.delete(name);
      logger.info(`Integration disconnected: ${name}`);
      
      return { success: true, integration: name };
    } catch (error) {
      logger.error(`Failed to disconnect integration ${name}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test connection for an integration
   */
  async testConnection(name) {
    const connector = this.connectors.get(name);
    
    if (!connector) {
      return { success: false, message: 'Integration not connected' };
    }

    return connector.testConnection();
  }

  /**
   * Import tool costs from a specific integration
   */
  async importFromIntegration(name, options = {}) {
    const connector = this.connectors.get(name);
    
    if (!connector) {
      throw new Error(`Integration not connected: ${name}`);
    }

    const result = await connector.sync(options);
    
    // Store in sync history
    this._addToHistory({
      integration: name,
      ...result
    });

    return result;
  }

  /**
   * Sync all connected integrations
   */
  async syncAll(options = {}) {
    const results = {
      success: true,
      totalImported: 0,
      integrations: [],
      allToolCosts: [],
      syncedAt: new Date().toISOString()
    };

    for (const [name, connector] of this.connectors) {
      try {
        const result = await connector.sync(options);
        results.integrations.push({
          name,
          ...result
        });
        
        if (result.success) {
          results.totalImported += result.itemsImported || 0;
          results.allToolCosts.push(...(result.toolCosts || []));
        } else {
          results.success = false;
        }

        this._addToHistory({
          integration: name,
          ...result
        });
      } catch (error) {
        logger.error(`Sync failed for ${name}:`, error);
        results.integrations.push({
          name,
          success: false,
          error: error.message
        });
        results.success = false;
      }
    }

    // Deduplicate tool costs by external ID
    results.allToolCosts = this._deduplicateToolCosts(results.allToolCosts);
    
    logger.info(`Sync complete: ${results.totalImported} items from ${results.integrations.length} integrations`);
    
    return results;
  }

  /**
   * Get OAuth authorization URL for an integration
   */
  getAuthorizationUrl(name, state = '') {
    const connectorInfo = this.availableConnectors[name];
    
    if (!connectorInfo) {
      throw new Error(`Unknown integration: ${name}`);
    }

    if (connectorInfo.authType !== 'oauth2') {
      throw new Error(`Integration ${name} does not use OAuth`);
    }

    const connector = new connectorInfo.ConnectorClass();
    return connector.getAuthorizationUrl(state);
  }

  /**
   * Get sync history
   */
  getSyncHistory(limit = 20) {
    return this.syncHistory.slice(-limit).reverse();
  }

  /**
   * Get all connected integration statuses
   */
  getStatuses() {
    const statuses = {};
    
    for (const [name, connector] of this.connectors) {
      statuses[name] = connector.getStatus();
    }
    
    return statuses;
  }

  /**
   * Get combined billing analytics from all integrations
   */
  async getAnalytics(options = {}) {
    const analytics = {
      totalMonthlySpend: 0,
      byCategory: {},
      byVendor: {},
      byIntegration: {},
      recentCosts: [],
      upcomingCharges: []
    };

    for (const [name, connector] of this.connectors) {
      try {
        const result = await connector.importToolCosts(options);
        
        analytics.byIntegration[name] = {
          count: result.length,
          total: 0
        };

        for (const cost of result) {
          // Calculate monthly equivalent
          const monthlyAmount = this._toMonthlyAmount(cost.amount, cost.billingPeriod);
          analytics.totalMonthlySpend += monthlyAmount;
          
          analytics.byIntegration[name].total += monthlyAmount;

          // By category
          if (!analytics.byCategory[cost.category]) {
            analytics.byCategory[cost.category] = { count: 0, total: 0 };
          }
          analytics.byCategory[cost.category].count++;
          analytics.byCategory[cost.category].total += monthlyAmount;

          // By vendor
          if (!analytics.byVendor[cost.vendor]) {
            analytics.byVendor[cost.vendor] = { count: 0, total: 0 };
          }
          analytics.byVendor[cost.vendor].count++;
          analytics.byVendor[cost.vendor].total += monthlyAmount;

          analytics.recentCosts.push(cost);
        }

        // Get upcoming charges from Stripe
        if (name === 'stripe' && connector.getUpcomingCharges) {
          const upcoming = await connector.getUpcomingCharges();
          if (upcoming) {
            analytics.upcomingCharges.push({
              source: 'stripe',
              ...upcoming
            });
          }
        }
      } catch (error) {
        logger.error(`Analytics failed for ${name}:`, error);
      }
    }

    // Sort recent costs by date
    analytics.recentCosts.sort((a, b) => 
      new Date(b.billingDate) - new Date(a.billingDate)
    );
    analytics.recentCosts = analytics.recentCosts.slice(0, 50);

    return analytics;
  }

  /**
   * Convert amount to monthly equivalent
   */
  _toMonthlyAmount(amount, period) {
    switch (period) {
      case 'weekly':
        return amount * 4.33;
      case 'yearly':
        return amount / 12;
      case 'quarterly':
        return amount / 3;
      case 'one-time':
        return 0; // Don't include in monthly spend
      default:
        return amount;
    }
  }

  /**
   * Deduplicate tool costs by external ID
   */
  _deduplicateToolCosts(costs) {
    const seen = new Set();
    return costs.filter(cost => {
      const key = `${cost.source}-${cost.externalId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Add entry to sync history
   */
  _addToHistory(entry) {
    this.syncHistory.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
    
    // Trim history if needed
    if (this.syncHistory.length > this.maxHistorySize) {
      this.syncHistory = this.syncHistory.slice(-this.maxHistorySize);
    }
  }
}

// Export singleton instance
module.exports = new IntegrationManager();
