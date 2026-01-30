import Stripe from 'stripe';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
});

export interface CheckoutSessionParams {
  auditId: string;
  userEmail: string;
  tier: 'pro' | 'team';
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

const PRICING = {
  pro: {
    price: 4900, // $49.00 in cents
    name: 'StackAudit Pro',
    description: 'Full AI tool audit with detailed recommendations and PDF report'
  },
  team: {
    price: 14900, // $149.00 in cents
    name: 'StackAudit Team',
    description: 'Pro features + shareable report and benchmark comparisons'
  }
};

export class PaymentService {
  /**
   * Create a Stripe Checkout session for audit payment
   */
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const { auditId, userEmail, tier } = params;
    const pricing = PRICING[tier];

    if (!pricing) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    logger.info('Creating checkout session', { auditId, tier, email: userEmail });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pricing.name,
              description: pricing.description,
              metadata: {
                auditId
              }
            },
            unit_amount: pricing.price
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      customer_email: userEmail,
      success_url: `${process.env.FRONTEND_URL}/audit/${auditId}/report?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/audit/${auditId}?payment=cancelled`,
      metadata: {
        auditId,
        tier
      }
    });

    logger.info('Checkout session created', { sessionId: session.id, auditId });

    return {
      sessionId: session.id,
      url: session.url || ''
    };
  }

  /**
   * Handle Stripe webhook event
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<{ auditId: string; tier: string } | null> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const auditId = session.metadata?.auditId;
        const tier = session.metadata?.tier;

        if (auditId && tier) {
          logger.info('Payment completed', { auditId, tier, sessionId: session.id });
          return { auditId, tier };
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.warn('Payment failed', { paymentIntentId: paymentIntent.id });
        break;
      }
    }

    return null;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
