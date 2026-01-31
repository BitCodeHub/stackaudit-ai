/**
 * QuickBooksConnector - Import accounting data from QuickBooks Online
 * Uses OAuth 2.0 for authentication and imports vendor expenses
 */
const BaseConnector = require('./BaseConnector');
const logger = require('../../utils/logger');

// QuickBooks API endpoints
const QB_ENDPOINTS = {
  production: {
    auth: 'https://appcenter.intuit.com/connect/oauth2',
    token: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    api: 'https://quickbooks.api.intuit.com/v3/company'
  },
  sandbox: {
    auth: 'https://appcenter.intuit.com/connect/oauth2',
    token: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    api: 'https://sandbox-quickbooks.api.intuit.com/v3/company'
  }
};

// SaaS vendor categories for expense mapping
const EXPENSE_CATEGORIES = {
  'Software': ['software', 'saas', 'subscription', 'cloud'],
  'Development': ['github', 'aws', 'azure', 'google cloud', 'heroku', 'vercel'],
  'Marketing': ['hubspot', 'mailchimp', 'sendgrid', 'intercom', 'facebook', 'google ads'],
  'Productivity': ['slack', 'notion', 'asana', 'monday', 'zoom', 'microsoft 365'],
  'Design': ['figma', 'adobe', 'canva', 'sketch'],
  'Analytics': ['mixpanel', 'amplitude', 'segment', 'datadog', 'new relic'],
  'Security': ['1password', 'okta', 'auth0', 'crowdstrike']
};

class QuickBooksConnector extends BaseConnector {
  constructor(config = {}) {
    super(config);
    this.name = 'quickbooks';
    this.displayName = 'QuickBooks Online';
    this.environment = config.environment || 'production';
    this.endpoints = QB_ENDPOINTS[this.environment];
    
    // OAuth credentials
    this.clientId = config.clientId || process.env.QUICKBOOKS_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.QUICKBOOKS_CLIENT_SECRET;
    this.redirectUri = config.redirectUri || process.env.QUICKBOOKS_REDIRECT_URI;
    
    // Tokens
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.realmId = null; // QuickBooks company ID
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state = '') {
    const scopes = 'com.intuit.quickbooks.accounting';
    const url = new URL(this.endpoints.auth);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scopes);
    url.searchParams.set('state', state);
    
    return url.toString();
  }

  /**
   * Test connection to QuickBooks
   */
  async testConnection() {
    try {
      if (!this.accessToken || !this.realmId) {
        return { success: false, message: 'Not authenticated with QuickBooks' };
      }

      // Check if token is expired
      if (this.tokenExpiry && new Date() >= new Date(this.tokenExpiry)) {
        const refreshResult = await this.refreshAuth();
        if (!refreshResult.success) {
          return refreshResult;
        }
      }

      // Test with company info query
      const response = await this._makeRequest('/companyinfo/' + this.realmId);
      
      if (response.CompanyInfo) {
        this.isConnected = true;
        return { 
          success: true, 
          message: `Connected to ${response.CompanyInfo.CompanyName}`,
          companyName: response.CompanyInfo.CompanyName
        };
      }

      return { success: false, message: 'Failed to verify connection' };
    } catch (error) {
      logger.error('QuickBooks connection test failed:', error);
      this.isConnected = false;
      return { success: false, message: error.message };
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  async authenticate(credentials) {
    try {
      const { code, realmId } = credentials;
      
      if (!code || !realmId) {
        return { success: false, message: 'Authorization code and realmId required' };
      }

      const tokenData = await this._exchangeCodeForTokens(code);
      
      if (tokenData.access_token) {
        this.accessToken = tokenData.access_token;
        this.refreshToken = tokenData.refresh_token;
        this.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
        this.realmId = realmId;
        this.isConnected = true;

        logger.info('QuickBooks authentication successful');
        
        return {
          success: true,
          tokens: {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            tokenExpiry: this.tokenExpiry,
            realmId: this.realmId
          }
        };
      }

      return { success: false, message: 'Failed to obtain tokens' };
    } catch (error) {
      logger.error('QuickBooks authentication failed:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Set tokens from stored credentials
   */
  setTokens(tokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenExpiry = tokens.tokenExpiry;
    this.realmId = tokens.realmId;
    this.isConnected = true;
  }

  /**
   * Refresh OAuth tokens
   */
  async refreshAuth() {
    try {
      if (!this.refreshToken) {
        return { success: false, message: 'No refresh token available' };
      }

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch(this.endpoints.token, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000).toISOString();
        
        logger.info('QuickBooks tokens refreshed');
        
        return {
          success: true,
          tokens: {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            tokenExpiry: this.tokenExpiry,
            realmId: this.realmId
          }
        };
      }

      return { success: false, message: data.error_description || 'Token refresh failed' };
    } catch (error) {
      logger.error('QuickBooks token refresh failed:', error);
      this.isConnected = false;
      return { success: false, message: error.message };
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  async _exchangeCodeForTokens(code) {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch(this.endpoints.token, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri
      })
    });

    return response.json();
  }

  /**
   * Make authenticated API request
   */
  async _makeRequest(endpoint, method = 'GET', body = null) {
    // Refresh token if expired
    if (this.tokenExpiry && new Date() >= new Date(this.tokenExpiry)) {
      await this.refreshAuth();
    }

    const url = `${this.endpoints.api}/${this.realmId}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`QuickBooks API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get all vendor accounts
   */
  async getAccounts() {
    try {
      const query = "SELECT * FROM Vendor WHERE Active = true MAXRESULTS 1000";
      const response = await this._makeRequest(`/query?query=${encodeURIComponent(query)}`);
      
      const vendors = response.QueryResponse?.Vendor || [];
      
      return vendors.map(vendor => ({
        id: vendor.Id,
        name: vendor.DisplayName,
        email: vendor.PrimaryEmailAddr?.Address,
        company: vendor.CompanyName,
        balance: vendor.Balance,
        active: vendor.Active
      }));
    } catch (error) {
      logger.error('Failed to get QuickBooks vendors:', error);
      throw error;
    }
  }

  /**
   * Import tool costs from vendor bills/expenses
   */
  async importToolCosts(options = {}) {
    try {
      if (!this.accessToken || !this.realmId) {
        throw new Error('Not authenticated with QuickBooks');
      }

      const {
        startDate = this._getDefaultStartDate(),
        endDate = new Date().toISOString().split('T')[0],
        vendorIds = null
      } = options;

      const toolCosts = [];

      // Fetch Bills (vendor invoices)
      const bills = await this._fetchBills(startDate, endDate, vendorIds);
      for (const bill of bills) {
        const cost = this._parseBill(bill);
        if (cost && this._isSaaSExpense(cost)) {
          toolCosts.push(cost);
        }
      }

      // Fetch Purchases (direct expenses)
      const purchases = await this._fetchPurchases(startDate, endDate);
      for (const purchase of purchases) {
        const cost = this._parsePurchase(purchase);
        if (cost && this._isSaaSExpense(cost)) {
          toolCosts.push(cost);
        }
      }

      // Fetch recurring transactions
      const recurring = await this._fetchRecurringTransactions();
      for (const transaction of recurring) {
        const cost = this._parseRecurringTransaction(transaction);
        if (cost && this._isSaaSExpense(cost)) {
          toolCosts.push(cost);
        }
      }

      logger.info(`Imported ${toolCosts.length} tool costs from QuickBooks`);
      return toolCosts;
    } catch (error) {
      logger.error('Failed to import tool costs from QuickBooks:', error);
      throw error;
    }
  }

  /**
   * Fetch bills from QuickBooks
   */
  async _fetchBills(startDate, endDate, vendorIds) {
    let query = `SELECT * FROM Bill WHERE TxnDate >= '${startDate}' AND TxnDate <= '${endDate}'`;
    
    if (vendorIds && vendorIds.length > 0) {
      query += ` AND VendorRef IN ('${vendorIds.join("','")}')`;
    }
    
    query += ' MAXRESULTS 1000';
    
    const response = await this._makeRequest(`/query?query=${encodeURIComponent(query)}`);
    return response.QueryResponse?.Bill || [];
  }

  /**
   * Fetch purchase transactions
   */
  async _fetchPurchases(startDate, endDate) {
    const query = `SELECT * FROM Purchase WHERE TxnDate >= '${startDate}' AND TxnDate <= '${endDate}' MAXRESULTS 1000`;
    const response = await this._makeRequest(`/query?query=${encodeURIComponent(query)}`);
    return response.QueryResponse?.Purchase || [];
  }

  /**
   * Fetch recurring transactions
   */
  async _fetchRecurringTransactions() {
    try {
      const query = "SELECT * FROM RecurringTransaction MAXRESULTS 100";
      const response = await this._makeRequest(`/query?query=${encodeURIComponent(query)}`);
      return response.QueryResponse?.RecurringTransaction || [];
    } catch (error) {
      // Recurring transactions might not be available in all QBO editions
      logger.warn('Could not fetch recurring transactions:', error.message);
      return [];
    }
  }

  /**
   * Parse a Bill into tool cost format
   */
  _parseBill(bill) {
    const vendorName = bill.VendorRef?.name || 'Unknown Vendor';
    const category = this._detectCategory(vendorName, bill.Line);
    
    let description = vendorName;
    if (bill.Line && bill.Line.length > 0) {
      const firstLine = bill.Line.find(l => l.DetailType === 'AccountBasedExpenseLineDetail');
      if (firstLine?.Description) {
        description = firstLine.Description;
      }
    }

    return this.normalizeToolCost({
      externalId: `qb-bill-${bill.Id}`,
      toolName: description,
      vendor: vendorName,
      category: category,
      amount: parseFloat(bill.TotalAmt) || 0,
      currency: bill.CurrencyRef?.value || 'USD',
      billingPeriod: 'monthly',
      billingDate: bill.TxnDate,
      renewalDate: bill.DueDate,
      status: bill.Balance > 0 ? 'pending' : 'paid',
      metadata: {
        quickbooksId: bill.Id,
        quickbooksType: 'Bill',
        vendorId: bill.VendorRef?.value,
        docNumber: bill.DocNumber,
        balance: bill.Balance
      }
    });
  }

  /**
   * Parse a Purchase into tool cost format
   */
  _parsePurchase(purchase) {
    const entityName = purchase.EntityRef?.name || 'Unknown';
    const category = this._detectCategory(entityName, purchase.Line);
    
    let description = entityName;
    if (purchase.Line && purchase.Line.length > 0) {
      const line = purchase.Line.find(l => l.Description);
      if (line?.Description) {
        description = line.Description;
      }
    }

    return this.normalizeToolCost({
      externalId: `qb-purchase-${purchase.Id}`,
      toolName: description,
      vendor: entityName,
      category: category,
      amount: parseFloat(purchase.TotalAmt) || 0,
      currency: purchase.CurrencyRef?.value || 'USD',
      billingPeriod: 'one-time',
      billingDate: purchase.TxnDate,
      status: 'paid',
      metadata: {
        quickbooksId: purchase.Id,
        quickbooksType: 'Purchase',
        paymentType: purchase.PaymentType,
        accountRef: purchase.AccountRef?.name
      }
    });
  }

  /**
   * Parse a recurring transaction
   */
  _parseRecurringTransaction(transaction) {
    const recurInfo = transaction.RecurringInfo;
    const txnData = transaction.Bill || transaction.Purchase || {};
    
    const vendorName = txnData.VendorRef?.name || txnData.EntityRef?.name || 'Unknown';
    const category = this._detectCategory(vendorName);
    
    // Map QBO schedule type to billing period
    const intervalMap = {
      'Weekly': 'weekly',
      'Monthly': 'monthly',
      'Yearly': 'yearly'
    };

    return this.normalizeToolCost({
      externalId: `qb-recurring-${transaction.Id}`,
      toolName: transaction.Name || vendorName,
      vendor: vendorName,
      category: category,
      amount: parseFloat(txnData.TotalAmt) || 0,
      currency: txnData.CurrencyRef?.value || 'USD',
      billingPeriod: intervalMap[recurInfo?.ScheduleInfo?.IntervalType] || 'monthly',
      billingDate: recurInfo?.ScheduleInfo?.StartDate,
      renewalDate: recurInfo?.ScheduleInfo?.NextDate,
      status: recurInfo?.Active ? 'active' : 'inactive',
      metadata: {
        quickbooksId: transaction.Id,
        quickbooksType: 'RecurringTransaction',
        scheduleName: transaction.Name,
        intervalType: recurInfo?.ScheduleInfo?.IntervalType,
        numInterval: recurInfo?.ScheduleInfo?.NumInterval
      }
    });
  }

  /**
   * Detect expense category from vendor name and line items
   */
  _detectCategory(vendorName, lineItems = []) {
    const searchText = vendorName.toLowerCase();
    
    // Check line item descriptions too
    let lineDescriptions = '';
    if (lineItems) {
      lineDescriptions = lineItems
        .map(l => l.Description || '')
        .join(' ')
        .toLowerCase();
    }
    
    const fullText = `${searchText} ${lineDescriptions}`;

    for (const [category, keywords] of Object.entries(EXPENSE_CATEGORIES)) {
      for (const keyword of keywords) {
        if (fullText.includes(keyword.toLowerCase())) {
          return category.toLowerCase();
        }
      }
    }

    return 'other';
  }

  /**
   * Check if expense is likely a SaaS/software expense
   */
  _isSaaSExpense(cost) {
    // Filter for software-related categories
    const saasCategories = ['software', 'development', 'productivity', 'design', 'analytics', 'security', 'marketing'];
    
    if (saasCategories.includes(cost.category)) {
      return true;
    }

    // Check vendor name for common SaaS patterns
    const saasKeywords = ['software', 'saas', 'cloud', 'subscription', 'pro', 'premium', 'enterprise', 'team', 'business'];
    const vendorLower = (cost.vendor || '').toLowerCase();
    const toolLower = (cost.toolName || '').toLowerCase();
    
    return saasKeywords.some(kw => vendorLower.includes(kw) || toolLower.includes(kw));
  }

  /**
   * Get default start date (6 months ago)
   */
  _getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split('T')[0];
  }

  /**
   * Sync all data from QuickBooks
   */
  async sync(options = {}) {
    try {
      const startTime = Date.now();
      
      const toolCosts = await this.importToolCosts(options);
      
      this.lastSync = new Date().toISOString();
      
      return {
        success: true,
        source: this.name,
        itemsImported: toolCosts.length,
        toolCosts,
        syncDuration: Date.now() - startTime,
        syncedAt: this.lastSync
      };
    } catch (error) {
      logger.error('QuickBooks sync failed:', error);
      return {
        success: false,
        source: this.name,
        error: error.message,
        syncedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Get expense reports for analysis
   */
  async getExpenseReport(options = {}) {
    try {
      const {
        startDate = this._getDefaultStartDate(),
        endDate = new Date().toISOString().split('T')[0]
      } = options;

      const response = await this._makeRequest(
        `/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`
      );

      return response;
    } catch (error) {
      logger.error('Failed to get expense report:', error);
      throw error;
    }
  }
}

module.exports = QuickBooksConnector;
