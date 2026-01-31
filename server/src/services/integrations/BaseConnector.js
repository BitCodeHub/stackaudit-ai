/**
 * BaseConnector - Abstract base class for billing/accounting integrations
 * All connectors must implement these methods
 */
class BaseConnector {
  constructor(config = {}) {
    if (this.constructor === BaseConnector) {
      throw new Error('BaseConnector is abstract and cannot be instantiated directly');
    }
    
    this.name = 'base';
    this.displayName = 'Base Connector';
    this.config = config;
    this.isConnected = false;
    this.lastSync = null;
    this.rateLimitRemaining = null;
  }

  /**
   * Test the connection to the external service
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async testConnection() {
    throw new Error('testConnection() must be implemented');
  }

  /**
   * Authenticate with the service (OAuth or API key)
   * @param {Object} credentials - Authentication credentials
   * @returns {Promise<{success: boolean, tokens?: Object}>}
   */
  async authenticate(credentials) {
    throw new Error('authenticate() must be implemented');
  }

  /**
   * Refresh authentication tokens
   * @returns {Promise<{success: boolean, tokens?: Object}>}
   */
  async refreshAuth() {
    throw new Error('refreshAuth() must be implemented');
  }

  /**
   * Import tool costs/subscriptions from the service
   * @param {Object} options - Import options (date range, filters)
   * @returns {Promise<Array<ToolCost>>}
   */
  async importToolCosts(options = {}) {
    throw new Error('importToolCosts() must be implemented');
  }

  /**
   * Get list of available accounts/profiles
   * @returns {Promise<Array>}
   */
  async getAccounts() {
    throw new Error('getAccounts() must be implemented');
  }

  /**
   * Sync all data from the service
   * @param {Object} options - Sync options
   * @returns {Promise<SyncResult>}
   */
  async sync(options = {}) {
    throw new Error('sync() must be implemented');
  }

  /**
   * Disconnect from the service
   * @returns {Promise<void>}
   */
  async disconnect() {
    this.isConnected = false;
  }

  /**
   * Get connection status
   * @returns {Object}
   */
  getStatus() {
    return {
      name: this.name,
      displayName: this.displayName,
      isConnected: this.isConnected,
      lastSync: this.lastSync,
      rateLimitRemaining: this.rateLimitRemaining
    };
  }

  /**
   * Normalize tool cost data to standard format
   * @param {Object} rawData - Raw data from external service
   * @returns {Object} Normalized tool cost
   */
  normalizeToolCost(rawData) {
    return {
      id: null,
      externalId: null,
      source: this.name,
      toolName: null,
      vendor: null,
      category: 'other',
      amount: 0,
      currency: 'USD',
      billingPeriod: 'monthly',
      billingDate: null,
      renewalDate: null,
      status: 'active',
      seats: null,
      metadata: {},
      importedAt: new Date().toISOString(),
      ...rawData
    };
  }
}

module.exports = BaseConnector;
