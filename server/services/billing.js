/**
 * StackAudit.ai - Billing Service
 * Stripe integration for subscriptions, checkout, webhooks, usage tracking
 */

const Stripe = require('stripe');
const crypto = require('crypto');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Plan Configuration
const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null, // No Stripe price for free tier
    features: {
      auditsPerMonth: 5,
      stacksLimit: 2,
      teamMembers: 1,
      historyDays: 7,
      apiAccess: false,
      prioritySupport: false,
      customRules: false,
      cicdIntegration: false,
      exportReports: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4900, // $49.00 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    features: {
      auditsPerMonth: 100,
      stacksLimit: 20,
      teamMembers: 5,
      historyDays: 90,
      apiAccess: true,
      prioritySupport: false,
      customRules: true,
      cicdIntegration: true,
      exportReports: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 19900, // $199.00 in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    features: {
      auditsPerMonth: -1, // Unlimited
      stacksLimit: -1, // Unlimited
      teamMembers: -1, // Unlimited
      historyDays: 365,
      apiAccess: true,
      prioritySupport: true,
      customRules: true,
      cicdIntegration: true,
      exportReports: true,
      sso: true,
      customIntegrations: true,
      dedicatedSupport: true,
    },
  },
};

// In-memory usage tracking (replace with database in production)
const usageStore = new Map();
const subscriptionCache = new Map();

/**
 * Custom Billing Error
 */
class BillingError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'BillingError';
    this.code = code;
    this.details = details;
    this.statusCode = this.getStatusCode(code);
  }

  getStatusCode(code) {
    const statusCodes = {
      'INVALID_PLAN': 400,
      'ALREADY_SUBSCRIBED': 400,
      'NO_SUBSCRIPTION': 404,
      'USAGE_LIMIT_EXCEEDED': 429,
      'PAYMENT_FAILED': 402,
      'INVALID_WEBHOOK': 400,
      'CUSTOMER_NOT_FOUND': 404,
      'SUBSCRIPTION_NOT_FOUND': 404,
    };
    return statusCodes[code] || 500;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...this.details,
    };
  }
}

/**
 * Customer Management
 */
const customers = {
  /**
   * Create or get a Stripe customer
   * @param {Object} user - User object with id, email, name
   * @returns {Promise<Object>} - Stripe customer
   */
  async getOrCreate(user) {
    if (!user?.id || !user?.email) {
      throw new BillingError('Invalid user data', 'INVALID_USER');
    }

    // Check if customer exists (would check database in production)
    try {
      // Search for existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
          source: 'stackaudit',
        },
      });

      return customer;
    } catch (error) {
      throw new BillingError(
        'Failed to create customer',
        'CUSTOMER_CREATE_FAILED',
        { originalError: error.message }
      );
    }
  },

  /**
   * Get customer by ID
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object>} - Stripe customer
   */
  async get(customerId) {
    try {
      return await stripe.customers.retrieve(customerId);
    } catch (error) {
      throw new BillingError('Customer not found', 'CUSTOMER_NOT_FOUND');
    }
  },

  /**
   * Update customer
   * @param {string} customerId - Stripe customer ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated customer
   */
  async update(customerId, updates) {
    try {
      return await stripe.customers.update(customerId, updates);
    } catch (error) {
      throw new BillingError(
        'Failed to update customer',
        'CUSTOMER_UPDATE_FAILED',
        { originalError: error.message }
      );
    }
  },

  /**
   * Get customer's payment methods
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Array>} - Payment methods
   */
  async getPaymentMethods(customerId) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  },

  /**
   * Delete a payment method
   * @param {string} paymentMethodId - Payment method ID
   */
  async deletePaymentMethod(paymentMethodId) {
    await stripe.paymentMethods.detach(paymentMethodId);
  },
};

/**
 * Subscription Management
 */
const subscriptions = {
  /**
   * Create a checkout session for a subscription
   * @param {Object} params - Checkout params
   * @returns {Promise<Object>} - Checkout session
   */
  async createCheckoutSession({ user, planId, successUrl, cancelUrl }) {
    const plan = PLANS[planId];
    
    if (!plan || planId === 'free') {
      throw new BillingError('Invalid plan for checkout', 'INVALID_PLAN');
    }

    const customer = await customers.getOrCreate(user);

    // Check if already subscribed to this plan
    const currentSub = await this.getActive(customer.id);
    if (currentSub?.plan === planId) {
      throw new BillingError('Already subscribed to this plan', 'ALREADY_SUBSCRIBED');
    }

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl || `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.APP_URL}/billing/cancel`,
        metadata: {
          userId: user.id,
          planId: planId,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            planId: planId,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: { enabled: true },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      throw new BillingError(
        'Failed to create checkout session',
        'CHECKOUT_FAILED',
        { originalError: error.message }
      );
    }
  },

  /**
   * Create a portal session for managing subscription
   * @param {string} customerId - Stripe customer ID
   * @param {string} returnUrl - URL to return to
   * @returns {Promise<Object>} - Portal session
   */
  async createPortalSession(customerId, returnUrl) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || `${process.env.APP_URL}/dashboard`,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      throw new BillingError(
        'Failed to create portal session',
        'PORTAL_FAILED',
        { originalError: error.message }
      );
    }
  },

  /**
   * Get active subscription for a customer
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object|null>} - Subscription or null
   */
  async getActive(customerId) {
    // Check cache first
    const cached = subscriptionCache.get(customerId);
    if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
      return cached.data;
    }

    try {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subs.data.length === 0) {
        subscriptionCache.set(customerId, { data: null, timestamp: Date.now() });
        return null;
      }

      const sub = subs.data[0];
      const planId = sub.metadata.planId || this.getPlanFromPriceId(sub.items.data[0].price.id);
      
      const result = {
        id: sub.id,
        status: sub.status,
        plan: planId,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
      };

      subscriptionCache.set(customerId, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get plan ID from Stripe price ID
   * @param {string} priceId - Stripe price ID
   * @returns {string} - Plan ID
   */
  getPlanFromPriceId(priceId) {
    for (const [id, plan] of Object.entries(PLANS)) {
      if (plan.priceId === priceId) {
        return id;
      }
    }
    return 'free';
  },

  /**
   * Cancel subscription at period end
   * @param {string} subscriptionId - Stripe subscription ID
   * @returns {Promise<Object>} - Updated subscription
   */
  async cancel(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Clear cache
      subscriptionCache.delete(subscription.customer);

      return {
        id: subscription.id,
        status: subscription.status,
        cancelAt: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: true,
      };
    } catch (error) {
      throw new BillingError(
        'Failed to cancel subscription',
        'CANCEL_FAILED',
        { originalError: error.message }
      );
    }
  },

  /**
   * Reactivate a cancelled subscription
   * @param {string} subscriptionId - Stripe subscription ID
   * @returns {Promise<Object>} - Updated subscription
   */
  async reactivate(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      // Clear cache
      subscriptionCache.delete(subscription.customer);

      return {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: false,
      };
    } catch (error) {
      throw new BillingError(
        'Failed to reactivate subscription',
        'REACTIVATE_FAILED',
        { originalError: error.message }
      );
    }
  },

  /**
   * Change subscription plan
   * @param {string} subscriptionId - Stripe subscription ID
   * @param {string} newPlanId - New plan ID
   * @returns {Promise<Object>} - Updated subscription
   */
  async changePlan(subscriptionId, newPlanId) {
    const plan = PLANS[newPlanId];
    
    if (!plan || newPlanId === 'free') {
      throw new BillingError('Invalid plan', 'INVALID_PLAN');
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: plan.priceId,
          },
        ],
        metadata: {
          ...subscription.metadata,
          planId: newPlanId,
        },
        proration_behavior: 'create_prorations',
      });

      // Clear cache
      subscriptionCache.delete(updatedSubscription.customer);

      return {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        plan: newPlanId,
      };
    } catch (error) {
      throw new BillingError(
        'Failed to change plan',
        'PLAN_CHANGE_FAILED',
        { originalError: error.message }
      );
    }
  },

  /**
   * Get all invoices for a customer
   * @param {string} customerId - Stripe customer ID
   * @param {number} limit - Number of invoices to return
   * @returns {Promise<Array>} - Invoices
   */
  async getInvoices(customerId, limit = 10) {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit,
      });

      return invoices.data.map(inv => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amount: inv.amount_due,
        currency: inv.currency,
        created: new Date(inv.created * 1000),
        hostedUrl: inv.hosted_invoice_url,
        pdfUrl: inv.invoice_pdf,
      }));
    } catch (error) {
      return [];
    }
  },
};

/**
 * Usage Tracking
 */
const usage = {
  /**
   * Initialize usage for a user
   * @param {string} userId - User ID
   * @param {string} planId - Plan ID
   */
  initialize(userId, planId = 'free') {
    const plan = PLANS[planId];
    usageStore.set(userId, {
      planId,
      period: this.getCurrentPeriod(),
      audits: 0,
      stacks: 0,
      apiCalls: 0,
      lastReset: new Date(),
    });
  },

  /**
   * Get current billing period (YYYY-MM)
   * @returns {string}
   */
  getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  /**
   * Get usage for a user
   * @param {string} userId - User ID
   * @returns {Object} - Usage data
   */
  get(userId) {
    let data = usageStore.get(userId);
    
    if (!data) {
      this.initialize(userId);
      data = usageStore.get(userId);
    }

    // Reset if new period
    const currentPeriod = this.getCurrentPeriod();
    if (data.period !== currentPeriod) {
      data.period = currentPeriod;
      data.audits = 0;
      data.apiCalls = 0;
      data.lastReset = new Date();
      usageStore.set(userId, data);
    }

    const plan = PLANS[data.planId];
    
    return {
      ...data,
      limits: plan.features,
      remaining: {
        audits: plan.features.auditsPerMonth === -1 
          ? 'unlimited' 
          : Math.max(0, plan.features.auditsPerMonth - data.audits),
        stacks: plan.features.stacksLimit === -1
          ? 'unlimited'
          : Math.max(0, plan.features.stacksLimit - data.stacks),
      },
    };
  },

  /**
   * Record an audit
   * @param {string} userId - User ID
   * @returns {Object} - Updated usage
   */
  recordAudit(userId) {
    const data = this.get(userId);
    const plan = PLANS[data.planId];

    if (plan.features.auditsPerMonth !== -1 && data.audits >= plan.features.auditsPerMonth) {
      throw new BillingError(
        'Monthly audit limit exceeded',
        'USAGE_LIMIT_EXCEEDED',
        {
          limit: plan.features.auditsPerMonth,
          used: data.audits,
          upgradeUrl: '/pricing',
        }
      );
    }

    data.audits++;
    usageStore.set(userId, data);
    
    return this.get(userId);
  },

  /**
   * Record a stack creation
   * @param {string} userId - User ID
   * @returns {Object} - Updated usage
   */
  recordStack(userId) {
    const data = this.get(userId);
    const plan = PLANS[data.planId];

    if (plan.features.stacksLimit !== -1 && data.stacks >= plan.features.stacksLimit) {
      throw new BillingError(
        'Stack limit exceeded',
        'USAGE_LIMIT_EXCEEDED',
        {
          limit: plan.features.stacksLimit,
          used: data.stacks,
          upgradeUrl: '/pricing',
        }
      );
    }

    data.stacks++;
    usageStore.set(userId, data);
    
    return this.get(userId);
  },

  /**
   * Record an API call
   * @param {string} userId - User ID
   * @returns {Object} - Updated usage
   */
  recordApiCall(userId) {
    const data = this.get(userId);
    data.apiCalls++;
    usageStore.set(userId, data);
    return this.get(userId);
  },

  /**
   * Update user's plan
   * @param {string} userId - User ID
   * @param {string} planId - New plan ID
   */
  updatePlan(userId, planId) {
    const data = usageStore.get(userId) || {};
    data.planId = planId;
    usageStore.set(userId, data);
  },

  /**
   * Check if user can perform action
   * @param {string} userId - User ID
   * @param {string} action - Action type (audit, stack, api)
   * @returns {Object} - Can perform and details
   */
  canPerform(userId, action) {
    const data = this.get(userId);
    const plan = PLANS[data.planId];

    switch (action) {
      case 'audit':
        if (plan.features.auditsPerMonth === -1) {
          return { allowed: true, remaining: 'unlimited' };
        }
        const auditsRemaining = plan.features.auditsPerMonth - data.audits;
        return { 
          allowed: auditsRemaining > 0, 
          remaining: auditsRemaining,
          limit: plan.features.auditsPerMonth,
        };
      
      case 'stack':
        if (plan.features.stacksLimit === -1) {
          return { allowed: true, remaining: 'unlimited' };
        }
        const stacksRemaining = plan.features.stacksLimit - data.stacks;
        return { 
          allowed: stacksRemaining > 0, 
          remaining: stacksRemaining,
          limit: plan.features.stacksLimit,
        };

      case 'api':
        return { allowed: plan.features.apiAccess };

      default:
        return { allowed: false, reason: 'Unknown action' };
    }
  },
};

/**
 * Webhook Handling
 */
const webhooks = {
  /**
   * Verify webhook signature
   * @param {string} payload - Raw request body
   * @param {string} signature - Stripe signature header
   * @returns {Object} - Parsed event
   */
  verifySignature(payload, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new BillingError('Webhook secret not configured', 'WEBHOOK_CONFIG_ERROR');
    }

    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      throw new BillingError('Invalid webhook signature', 'INVALID_WEBHOOK');
    }
  },

  /**
   * Handle webhook event
   * @param {Object} event - Stripe event
   * @returns {Object} - Result
   */
  async handle(event) {
    const handlers = {
      'checkout.session.completed': this.handleCheckoutCompleted,
      'customer.subscription.created': this.handleSubscriptionCreated,
      'customer.subscription.updated': this.handleSubscriptionUpdated,
      'customer.subscription.deleted': this.handleSubscriptionDeleted,
      'invoice.payment_succeeded': this.handlePaymentSucceeded,
      'invoice.payment_failed': this.handlePaymentFailed,
    };

    const handler = handlers[event.type];
    
    if (handler) {
      return await handler.call(this, event.data.object);
    }

    return { handled: false, event: event.type };
  },

  /**
   * Handle checkout.session.completed
   */
  async handleCheckoutCompleted(session) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (userId && planId) {
      usage.updatePlan(userId, planId);
      // Clear subscription cache for customer
      subscriptionCache.delete(session.customer);
    }

    return {
      handled: true,
      event: 'checkout.session.completed',
      userId,
      planId,
    };
  },

  /**
   * Handle customer.subscription.created
   */
  async handleSubscriptionCreated(subscription) {
    const userId = subscription.metadata?.userId;
    const planId = subscription.metadata?.planId || 
      subscriptions.getPlanFromPriceId(subscription.items.data[0].price.id);

    if (userId) {
      usage.updatePlan(userId, planId);
    }

    // Clear cache
    subscriptionCache.delete(subscription.customer);

    return {
      handled: true,
      event: 'customer.subscription.created',
      subscriptionId: subscription.id,
      planId,
    };
  },

  /**
   * Handle customer.subscription.updated
   */
  async handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata?.userId;
    const planId = subscription.metadata?.planId || 
      subscriptions.getPlanFromPriceId(subscription.items.data[0].price.id);

    if (userId) {
      usage.updatePlan(userId, planId);
    }

    // Clear cache
    subscriptionCache.delete(subscription.customer);

    return {
      handled: true,
      event: 'customer.subscription.updated',
      subscriptionId: subscription.id,
      status: subscription.status,
      planId,
    };
  },

  /**
   * Handle customer.subscription.deleted
   */
  async handleSubscriptionDeleted(subscription) {
    const userId = subscription.metadata?.userId;

    if (userId) {
      // Downgrade to free
      usage.updatePlan(userId, 'free');
    }

    // Clear cache
    subscriptionCache.delete(subscription.customer);

    return {
      handled: true,
      event: 'customer.subscription.deleted',
      subscriptionId: subscription.id,
      userId,
    };
  },

  /**
   * Handle invoice.payment_succeeded
   */
  async handlePaymentSucceeded(invoice) {
    return {
      handled: true,
      event: 'invoice.payment_succeeded',
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      customerId: invoice.customer,
    };
  },

  /**
   * Handle invoice.payment_failed
   */
  async handlePaymentFailed(invoice) {
    // Could send notification to user about failed payment
    return {
      handled: true,
      event: 'invoice.payment_failed',
      invoiceId: invoice.id,
      customerId: invoice.customer,
      attemptCount: invoice.attempt_count,
    };
  },
};

/**
 * Billing Middleware
 */
const middleware = {
  /**
   * Require paid plan middleware
   * @param {string[]} plans - Allowed plans
   * @returns {Function} - Express middleware
   */
  requirePlan(plans = ['pro', 'enterprise']) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'NO_AUTH',
        });
      }

      const userPlan = req.user.plan || 'free';
      
      if (!plans.includes(userPlan)) {
        return res.status(403).json({
          error: 'Plan upgrade required',
          code: 'PLAN_REQUIRED',
          currentPlan: userPlan,
          requiredPlans: plans,
          upgradeUrl: '/pricing',
        });
      }

      next();
    };
  },

  /**
   * Track usage middleware
   * @param {string} action - Action to track
   * @returns {Function} - Express middleware
   */
  trackUsage(action) {
    return (req, res, next) => {
      if (!req.user?.userId) {
        return next();
      }

      try {
        const check = usage.canPerform(req.user.userId, action);
        
        if (!check.allowed) {
          return res.status(429).json({
            error: `${action} limit exceeded`,
            code: 'USAGE_LIMIT_EXCEEDED',
            limit: check.limit,
            remaining: 0,
            upgradeUrl: '/pricing',
          });
        }

        // Attach usage info to request
        req.usage = check;

        // Record usage after response
        res.on('finish', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            switch (action) {
              case 'audit':
                usage.recordAudit(req.user.userId);
                break;
              case 'stack':
                usage.recordStack(req.user.userId);
                break;
              case 'api':
                usage.recordApiCall(req.user.userId);
                break;
            }
          }
        });

        next();
      } catch (error) {
        if (error instanceof BillingError) {
          return res.status(error.statusCode).json(error.toJSON());
        }
        next(error);
      }
    };
  },

  /**
   * Check feature access middleware
   * @param {string} feature - Feature name
   * @returns {Function} - Express middleware
   */
  requireFeature(feature) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'NO_AUTH',
        });
      }

      const userPlan = req.user.plan || 'free';
      const plan = PLANS[userPlan];
      
      if (!plan?.features[feature]) {
        return res.status(403).json({
          error: `Feature "${feature}" requires plan upgrade`,
          code: 'FEATURE_REQUIRED',
          currentPlan: userPlan,
          upgradeUrl: '/pricing',
        });
      }

      next();
    };
  },
};

/**
 * Utility functions
 */
const utils = {
  /**
   * Format price for display
   * @param {number} cents - Price in cents
   * @param {string} currency - Currency code
   * @returns {string} - Formatted price
   */
  formatPrice(cents, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  },

  /**
   * Get all plans for pricing page
   * @returns {Array} - Plans array
   */
  getPlans() {
    return Object.entries(PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      price: plan.price,
      priceFormatted: utils.formatPrice(plan.price),
      features: plan.features,
      popular: id === 'pro',
    }));
  },

  /**
   * Compare plans
   * @param {string} currentPlan - Current plan ID
   * @param {string} targetPlan - Target plan ID
   * @returns {string} - 'upgrade', 'downgrade', or 'same'
   */
  comparePlans(currentPlan, targetPlan) {
    const planOrder = ['free', 'pro', 'enterprise'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(targetPlan);

    if (targetIndex > currentIndex) return 'upgrade';
    if (targetIndex < currentIndex) return 'downgrade';
    return 'same';
  },
};

module.exports = {
  stripe,
  PLANS,
  customers,
  subscriptions,
  usage,
  webhooks,
  middleware,
  utils,
  BillingError,
};
