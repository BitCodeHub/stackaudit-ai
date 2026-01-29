const express = require('express');
const { body } = require('express-validator');
const { organizations, users, subscriptions } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize Stripe (only if key is available)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/billing/subscription
 * Get current subscription
 */
router.get('/subscription', (req, res, next) => {
  const org = organizations.get(req.user.organizationId);

  if (!org) {
    return next(ApiError.notFound('Organization not found'));
  }

  const subscription = subscriptions.get(org.stripeSubscriptionId);

  res.json({
    plan: org.plan,
    subscription: subscription ? {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    } : null,
    features: getPlanFeatures(org.plan)
  });
});

/**
 * GET /api/billing/plans
 * Get available plans
 */
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: getPlanFeatures('free')
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 49,
        yearlyPrice: 470,
        interval: 'month',
        stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
        stripeYearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY,
        features: getPlanFeatures('pro')
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        yearlyPrice: 1910,
        interval: 'month',
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
        stripeYearlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
        features: getPlanFeatures('enterprise')
      }
    ]
  });
});

/**
 * POST /api/billing/checkout
 * Create Stripe checkout session
 */
router.post('/checkout', authorize('admin', 'owner'), [
  body('priceId').notEmpty(),
  body('successUrl').isURL(),
  body('cancelUrl').isURL()
], validate, async (req, res, next) => {
  try {
    if (!stripe) {
      return next(ApiError.internal('Billing not configured'));
    }

    const { priceId, successUrl, cancelUrl } = req.body;
    const org = organizations.get(req.user.organizationId);
    const user = users.get(req.user.id);

    // Create or get Stripe customer
    let customerId = org.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: {
          organizationId: org.id
        }
      });
      customerId = customer.id;
      org.stripeCustomerId = customerId;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        organizationId: org.id
      }
    });

    logger.info(`Checkout session created for org ${org.id}`);

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    logger.error('Checkout error:', error);
    next(ApiError.internal('Failed to create checkout session'));
  }
});

/**
 * POST /api/billing/portal
 * Create Stripe customer portal session
 */
router.post('/portal', authorize('admin', 'owner'), [
  body('returnUrl').isURL()
], validate, async (req, res, next) => {
  try {
    if (!stripe) {
      return next(ApiError.internal('Billing not configured'));
    }

    const org = organizations.get(req.user.organizationId);

    if (!org.stripeCustomerId) {
      return next(ApiError.badRequest('No billing account found'));
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: req.body.returnUrl
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error('Portal error:', error);
    next(ApiError.internal('Failed to create portal session'));
  }
});

/**
 * POST /api/billing/cancel
 * Cancel subscription
 */
router.post('/cancel', authorize('admin', 'owner'), async (req, res, next) => {
  try {
    if (!stripe) {
      return next(ApiError.internal('Billing not configured'));
    }

    const org = organizations.get(req.user.organizationId);

    if (!org.stripeSubscriptionId) {
      return next(ApiError.badRequest('No active subscription'));
    }

    // Cancel at period end
    await stripe.subscriptions.update(org.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    logger.info(`Subscription cancelled for org ${org.id}`);

    res.json({ message: 'Subscription will be cancelled at the end of the billing period' });
  } catch (error) {
    logger.error('Cancel error:', error);
    next(ApiError.internal('Failed to cancel subscription'));
  }
});

/**
 * POST /api/billing/resume
 * Resume cancelled subscription
 */
router.post('/resume', authorize('admin', 'owner'), async (req, res, next) => {
  try {
    if (!stripe) {
      return next(ApiError.internal('Billing not configured'));
    }

    const org = organizations.get(req.user.organizationId);

    if (!org.stripeSubscriptionId) {
      return next(ApiError.badRequest('No subscription to resume'));
    }

    await stripe.subscriptions.update(org.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    logger.info(`Subscription resumed for org ${org.id}`);

    res.json({ message: 'Subscription resumed' });
  } catch (error) {
    logger.error('Resume error:', error);
    next(ApiError.internal('Failed to resume subscription'));
  }
});

/**
 * GET /api/billing/invoices
 * Get invoice history
 */
router.get('/invoices', authorize('admin', 'owner'), async (req, res, next) => {
  try {
    if (!stripe) {
      return res.json({ invoices: [] });
    }

    const org = organizations.get(req.user.organizationId);

    if (!org.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: org.stripeCustomerId,
      limit: 12
    });

    res.json({
      invoices: invoices.data.map(inv => ({
        id: inv.id,
        number: inv.number,
        amount: inv.amount_paid / 100,
        currency: inv.currency,
        status: inv.status,
        date: new Date(inv.created * 1000).toISOString(),
        pdfUrl: inv.invoice_pdf
      }))
    });
  } catch (error) {
    logger.error('Invoices error:', error);
    next(ApiError.internal('Failed to fetch invoices'));
  }
});

/**
 * Get plan features
 */
function getPlanFeatures(plan) {
  const features = {
    free: {
      auditsPerMonth: 3,
      users: 1,
      retentionDays: 7,
      deepAnalysis: false,
      apiAccess: false,
      prioritySupport: false,
      customIntegrations: false,
      ssoSaml: false,
      whiteLabel: false
    },
    pro: {
      auditsPerMonth: 50,
      users: 10,
      retentionDays: 90,
      deepAnalysis: true,
      apiAccess: false,
      prioritySupport: true,
      customIntegrations: false,
      ssoSaml: false,
      whiteLabel: false
    },
    enterprise: {
      auditsPerMonth: 500,
      users: 100,
      retentionDays: 365,
      deepAnalysis: true,
      apiAccess: true,
      prioritySupport: true,
      customIntegrations: true,
      ssoSaml: true,
      whiteLabel: true
    }
  };

  return features[plan] || features.free;
}

module.exports = router;
