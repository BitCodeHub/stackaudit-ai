const express = require('express');
const { organizations, subscriptions, users, generateId } = require('../data/store');
const logger = require('../utils/logger');

const router = express.Router();

// Initialize Stripe (only if key is available)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhooks
 */
router.post('/stripe', async (req, res) => {
  if (!stripe) {
    logger.warn('Stripe webhook received but Stripe not configured');
    return res.status(400).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // In development, parse directly
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  logger.info(`Stripe webhook received: ${event.type}`);

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.updated':
        // Handle customer updates if needed
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error(`Webhook handler error: ${error.message}`);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutCompleted(session) {
  const organizationId = session.metadata?.organizationId;
  
  if (!organizationId) {
    logger.warn('Checkout completed without organizationId');
    return;
  }

  const org = organizations.get(organizationId);
  if (!org) {
    logger.warn(`Organization not found: ${organizationId}`);
    return;
  }

  // Update organization with subscription info
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    org.stripeSubscriptionId = subscription.id;
    
    // Determine plan from price
    const priceId = subscription.items.data[0]?.price.id;
    org.plan = getPlanFromPriceId(priceId);
    
    // Update plan settings
    updateOrgPlanSettings(org);
    
    // Update all org users' plan
    Array.from(users.values())
      .filter(u => u.organizationId === organizationId)
      .forEach(u => { u.plan = org.plan; });

    logger.info(`Checkout completed for org ${organizationId}: ${org.plan} plan`);
  }
}

/**
 * Handle customer.subscription.created
 */
async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;
  
  // Find org by customer ID
  const org = Array.from(organizations.values())
    .find(o => o.stripeCustomerId === customerId);

  if (!org) {
    logger.warn(`Org not found for customer: ${customerId}`);
    return;
  }

  // Store subscription
  subscriptions.set(subscription.id, {
    id: subscription.id,
    customerId,
    organizationId: org.id,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price.id,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    createdAt: new Date().toISOString()
  });

  org.stripeSubscriptionId = subscription.id;
  org.plan = getPlanFromPriceId(subscription.items.data[0]?.price.id);
  updateOrgPlanSettings(org);

  logger.info(`Subscription created for org ${org.id}: ${subscription.id}`);
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription) {
  const sub = subscriptions.get(subscription.id);
  
  if (sub) {
    sub.status = subscription.status;
    sub.priceId = subscription.items.data[0]?.price.id;
    sub.currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    sub.cancelAtPeriodEnd = subscription.cancel_at_period_end;

    // Update org plan if price changed
    const org = organizations.get(sub.organizationId);
    if (org) {
      const newPlan = getPlanFromPriceId(sub.priceId);
      if (org.plan !== newPlan) {
        org.plan = newPlan;
        updateOrgPlanSettings(org);
        
        Array.from(users.values())
          .filter(u => u.organizationId === org.id)
          .forEach(u => { u.plan = org.plan; });

        logger.info(`Plan updated for org ${org.id}: ${newPlan}`);
      }
    }
  }

  logger.info(`Subscription updated: ${subscription.id}`);
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription) {
  const sub = subscriptions.get(subscription.id);
  
  if (sub) {
    const org = organizations.get(sub.organizationId);
    
    if (org) {
      // Downgrade to free
      org.plan = 'free';
      org.stripeSubscriptionId = null;
      updateOrgPlanSettings(org);

      Array.from(users.values())
        .filter(u => u.organizationId === org.id)
        .forEach(u => { u.plan = 'free'; });

      logger.info(`Subscription deleted, org ${org.id} downgraded to free`);
    }

    subscriptions.delete(subscription.id);
  }

  logger.info(`Subscription deleted: ${subscription.id}`);
}

/**
 * Handle invoice.paid
 */
async function handleInvoicePaid(invoice) {
  logger.info(`Invoice paid: ${invoice.id} for ${invoice.customer_email}`);
  
  // Could trigger email notification, update analytics, etc.
}

/**
 * Handle invoice.payment_failed
 */
async function handleInvoicePaymentFailed(invoice) {
  logger.warn(`Payment failed: ${invoice.id} for ${invoice.customer_email}`);
  
  // Could trigger email notification, update subscription status, etc.
}

/**
 * Get plan from Stripe price ID
 */
function getPlanFromPriceId(priceId) {
  const proPrices = [
    process.env.STRIPE_PRICE_PRO_MONTHLY,
    process.env.STRIPE_PRICE_PRO_YEARLY
  ];
  const enterprisePrices = [
    process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
  ];

  if (enterprisePrices.includes(priceId)) return 'enterprise';
  if (proPrices.includes(priceId)) return 'pro';
  return 'free';
}

/**
 * Update org settings based on plan
 */
function updateOrgPlanSettings(org) {
  const settings = {
    free: { maxAuditsPerMonth: 3, auditRetentionDays: 7 },
    pro: { maxAuditsPerMonth: 50, auditRetentionDays: 90 },
    enterprise: { maxAuditsPerMonth: 500, auditRetentionDays: 365 }
  };

  const planSettings = settings[org.plan] || settings.free;
  org.settings.maxAuditsPerMonth = planSettings.maxAuditsPerMonth;
  org.settings.auditRetentionDays = planSettings.auditRetentionDays;
}

module.exports = router;
