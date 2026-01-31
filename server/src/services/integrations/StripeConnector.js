/**
 * StripeConnector - Import billing data from Stripe
 * Connects to Stripe API to auto-import subscription costs
 */
const BaseConnector = require('./BaseConnector');
const logger = require('../../utils/logger');

// SaaS vendor detection patterns for categorizing subscriptions
const VENDOR_PATTERNS = {
  // Development & DevOps
  'github': { category: 'development', vendor: 'GitHub' },
  'gitlab': { category: 'development', vendor: 'GitLab' },
  'bitbucket': { category: 'development', vendor: 'Bitbucket' },
  'vercel': { category: 'infrastructure', vendor: 'Vercel' },
  'netlify': { category: 'infrastructure', vendor: 'Netlify' },
  'heroku': { category: 'infrastructure', vendor: 'Heroku' },
  'digitalocean': { category: 'infrastructure', vendor: 'DigitalOcean' },
  'aws': { category: 'infrastructure', vendor: 'AWS' },
  'datadog': { category: 'monitoring', vendor: 'Datadog' },
  'sentry': { category: 'monitoring', vendor: 'Sentry' },
  
  // Productivity
  'slack': { category: 'communication', vendor: 'Slack' },
  'notion': { category: 'productivity', vendor: 'Notion' },
  'asana': { category: 'productivity', vendor: 'Asana' },
  'monday': { category: 'productivity', vendor: 'Monday.com' },
  'jira': { category: 'productivity', vendor: 'Atlassian' },
  'confluence': { category: 'productivity', vendor: 'Atlassian' },
  'trello': { category: 'productivity', vendor: 'Atlassian' },
  'airtable': { category: 'productivity', vendor: 'Airtable' },
  'clickup': { category: 'productivity', vendor: 'ClickUp' },
  
  // Design
  'figma': { category: 'design', vendor: 'Figma' },
  'canva': { category: 'design', vendor: 'Canva' },
  'adobe': { category: 'design', vendor: 'Adobe' },
  'sketch': { category: 'design', vendor: 'Sketch' },
  'invision': { category: 'design', vendor: 'InVision' },
  
  // Marketing & Sales
  'hubspot': { category: 'marketing', vendor: 'HubSpot' },
  'mailchimp': { category: 'marketing', vendor: 'Mailchimp' },
  'intercom': { category: 'support', vendor: 'Intercom' },
  'zendesk': { category: 'support', vendor: 'Zendesk' },
  'salesforce': { category: 'crm', vendor: 'Salesforce' },
  
  // Analytics
  'mixpanel': { category: 'analytics', vendor: 'Mixpanel' },
  'amplitude': { category: 'analytics', vendor: 'Amplitude' },
  'segment': { category: 'analytics', vendor: 'Segment' },
  'heap': { category: 'analytics', vendor: 'Heap' },
  
  // Security
  '1password': { category: 'security', vendor: '1Password' },
  'okta': { category: 'security', vendor: 'Okta' },
  'auth0': { category: 'security', vendor: 'Auth0' }
};

class StripeConnector extends BaseConnector {
  constructor(config = {}) {
    super(config);
    this.name = 'stripe';
    this.displayName = 'Stripe';
    this.stripe = null;
    this.customerId = config.customerId || null;
  }

  /**
   * Initialize Stripe client with API key
   * @param {string} apiKey - Stripe secret key
   */
  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('Stripe API key is required');
    }
    this.stripe = require('stripe')(apiKey);
    logger.info('Stripe connector initialized');
  }

  /**
   * Test connection to Stripe
   */
  async testConnection() {
    try {
      if (!this.stripe) {
        return { success: false, message: 'Stripe not initialized' };
      }

      // Test with a simple API call
      await this.stripe.balance.retrieve();
      this.isConnected = true;
      
      return { success: true, message: 'Connected to Stripe' };
    } catch (error) {
      logger.error('Stripe connection test failed:', error);
      this.isConnected = false;
      return { success: false, message: error.message };
    }
  }

  /**
   * Authenticate using API key (Stripe uses API keys, not OAuth)
   */
  async authenticate(credentials) {
    try {
      const { apiKey } = credentials;
      this.initialize(apiKey);
      
      const result = await this.testConnection();
      if (result.success) {
        return { success: true, tokens: { apiKey } };
      }
      return result;
    } catch (error) {
      logger.error('Stripe authentication failed:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Stripe uses API keys, so no token refresh needed
   */
  async refreshAuth() {
    return { success: true, message: 'Stripe uses API keys, no refresh needed' };
  }

  /**
   * Get all customers (for connected accounts)
   */
  async getAccounts() {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const customers = await this.stripe.customers.list({ limit: 100 });
      
      return customers.data.map(customer => ({
        id: customer.id,
        name: customer.name || customer.email,
        email: customer.email,
        created: new Date(customer.created * 1000).toISOString()
      }));
    } catch (error) {
      logger.error('Failed to get Stripe accounts:', error);
      throw error;
    }
  }

  /**
   * Import all subscriptions as tool costs
   * @param {Object} options - Import options
   */
  async importToolCosts(options = {}) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const {
        customerId = this.customerId,
        status = 'active',
        limit = 100,
        startDate,
        endDate
      } = options;

      const toolCosts = [];
      
      // Fetch subscriptions
      const params = { limit, status };
      if (customerId) {
        params.customer = customerId;
      }

      const subscriptions = await this.stripe.subscriptions.list(params);
      
      for (const subscription of subscriptions.data) {
        const toolCost = await this._parseSubscription(subscription);
        if (toolCost) {
          toolCosts.push(toolCost);
        }
      }

      // Also fetch one-time charges (invoices) for non-subscription tools
      const invoiceParams = { limit, status: 'paid' };
      if (customerId) {
        invoiceParams.customer = customerId;
      }
      if (startDate) {
        invoiceParams.created = { gte: Math.floor(new Date(startDate).getTime() / 1000) };
      }

      const invoices = await this.stripe.invoices.list(invoiceParams);
      
      for (const invoice of invoices.data) {
        // Skip subscription invoices (already captured above)
        if (invoice.subscription) continue;
        
        const toolCost = this._parseInvoice(invoice);
        if (toolCost) {
          toolCosts.push(toolCost);
        }
      }

      logger.info(`Imported ${toolCosts.length} tool costs from Stripe`);
      return toolCosts;
    } catch (error) {
      logger.error('Failed to import tool costs from Stripe:', error);
      throw error;
    }
  }

  /**
   * Parse a Stripe subscription into tool cost format
   */
  async _parseSubscription(subscription) {
    try {
      const item = subscription.items.data[0];
      if (!item) return null;

      const price = item.price;
      const product = await this.stripe.products.retrieve(price.product);
      
      const vendorInfo = this._detectVendor(product.name, product.description);
      
      return this.normalizeToolCost({
        externalId: subscription.id,
        toolName: product.name,
        vendor: vendorInfo.vendor || product.name,
        category: vendorInfo.category,
        amount: (price.unit_amount / 100) * (item.quantity || 1),
        currency: price.currency.toUpperCase(),
        billingPeriod: price.recurring?.interval || 'monthly',
        billingDate: new Date(subscription.current_period_start * 1000).toISOString(),
        renewalDate: new Date(subscription.current_period_end * 1000).toISOString(),
        status: subscription.status,
        seats: item.quantity,
        metadata: {
          stripeSubscriptionId: subscription.id,
          stripeProductId: product.id,
          stripePriceId: price.id,
          stripeCustomerId: subscription.customer,
          interval: price.recurring?.interval,
          intervalCount: price.recurring?.interval_count,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          productDescription: product.description
        }
      });
    } catch (error) {
      logger.error('Failed to parse subscription:', error);
      return null;
    }
  }

  /**
   * Parse a Stripe invoice into tool cost format
   */
  _parseInvoice(invoice) {
    try {
      if (!invoice.lines?.data?.length) return null;

      const lineItem = invoice.lines.data[0];
      const description = lineItem.description || invoice.description || 'Unknown';
      const vendorInfo = this._detectVendor(description);

      return this.normalizeToolCost({
        externalId: invoice.id,
        toolName: description,
        vendor: vendorInfo.vendor || 'Unknown',
        category: vendorInfo.category,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        billingPeriod: 'one-time',
        billingDate: new Date(invoice.created * 1000).toISOString(),
        status: invoice.status,
        metadata: {
          stripeInvoiceId: invoice.id,
          stripeCustomerId: invoice.customer,
          invoiceNumber: invoice.number,
          invoicePdf: invoice.invoice_pdf
        }
      });
    } catch (error) {
      logger.error('Failed to parse invoice:', error);
      return null;
    }
  }

  /**
   * Detect vendor and category from product name/description
   */
  _detectVendor(name, description = '') {
    const searchText = `${name} ${description}`.toLowerCase();
    
    for (const [pattern, info] of Object.entries(VENDOR_PATTERNS)) {
      if (searchText.includes(pattern)) {
        return info;
      }
    }
    
    return { category: 'other', vendor: null };
  }

  /**
   * Sync all data from Stripe
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
      logger.error('Stripe sync failed:', error);
      return {
        success: false,
        source: this.name,
        error: error.message,
        syncedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Get upcoming invoices for cost forecasting
   */
  async getUpcomingCharges(customerId = this.customerId) {
    try {
      if (!this.stripe || !customerId) {
        return [];
      }

      const upcoming = await this.stripe.invoices.retrieveUpcoming({
        customer: customerId
      });

      return {
        amount: upcoming.amount_due / 100,
        currency: upcoming.currency.toUpperCase(),
        dueDate: new Date(upcoming.next_payment_attempt * 1000).toISOString(),
        lineItems: upcoming.lines.data.map(line => ({
          description: line.description,
          amount: line.amount / 100
        }))
      };
    } catch (error) {
      logger.error('Failed to get upcoming charges:', error);
      return null;
    }
  }

  /**
   * Get billing history for trend analysis
   */
  async getBillingHistory(options = {}) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const { customerId = this.customerId, months = 12 } = options;
      
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const params = {
        limit: 100,
        created: { gte: Math.floor(startDate.getTime() / 1000) }
      };
      if (customerId) {
        params.customer = customerId;
      }

      const invoices = await this.stripe.invoices.list(params);

      // Group by month
      const monthlyTotals = {};
      for (const invoice of invoices.data) {
        if (invoice.status !== 'paid') continue;
        
        const date = new Date(invoice.created * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = 0;
        }
        monthlyTotals[monthKey] += invoice.amount_paid / 100;
      }

      return Object.entries(monthlyTotals)
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      logger.error('Failed to get billing history:', error);
      throw error;
    }
  }
}

module.exports = StripeConnector;
