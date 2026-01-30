import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();
const paymentService = new PaymentService();

/**
 * POST /api/checkout
 * Create a Stripe Checkout session
 */
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { auditId, tier } = req.body;

    if (!auditId || !tier) {
      return res.status(400).json({ error: 'auditId and tier are required' });
    }

    if (!['pro', 'team'].includes(tier)) {
      return res.status(400).json({ error: 'tier must be "pro" or "team"' });
    }

    // Get the audit and user
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { user: true }
    });

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    // Create checkout session
    const session = await paymentService.createCheckoutSession({
      auditId,
      userEmail: audit.user.email,
      tier
    });

    res.json(session);
  } catch (error) {
    logger.error('Checkout error', { error });
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/webhook/stripe
 * Handle Stripe webhook events
 */
router.post('/webhook/stripe', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    // Verify and parse the webhook event
    const event = paymentService.verifyWebhookSignature(req.body, signature);

    // Handle the event
    const result = await paymentService.handleWebhookEvent(event);

    if (result) {
      // Update audit tier in database
      await prisma.audit.update({
        where: { id: result.auditId },
        data: { tier: result.tier }
      });

      logger.info('Audit upgraded', { auditId: result.auditId, tier: result.tier });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error', { error });
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

/**
 * GET /api/pricing
 * Get pricing information
 */
router.get('/pricing', (_req: Request, res: Response) => {
  res.json({
    tiers: {
      free: {
        price: 0,
        name: 'Free',
        description: 'Basic audit for up to 5 tools',
        features: [
          'Audit up to 5 AI tools',
          'Basic overlap detection',
          'Summary recommendations'
        ]
      },
      pro: {
        price: 49,
        name: 'Pro',
        description: 'Full audit with detailed analysis',
        features: [
          'Unlimited AI tools',
          'Detailed PDF report',
          'Consolidation roadmap',
          'ROI calculations',
          'Priority support'
        ]
      },
      team: {
        price: 149,
        name: 'Team',
        description: 'Pro features + team collaboration',
        features: [
          'Everything in Pro',
          'Shareable reports',
          'Industry benchmarks',
          'Team access',
          'Custom branding'
        ]
      }
    }
  });
});

export default router;
