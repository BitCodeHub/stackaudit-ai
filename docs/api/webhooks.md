# Webhooks

Receive real-time notifications from StackAudit.ai and connected services.

---

## Overview

StackAudit.ai uses webhooks for:

1. **Stripe Webhooks** — Receive billing events (subscription changes, payments)
2. **Application Webhooks** (Coming Soon) — Receive audit completion, alerts, etc.

---

## Stripe Webhooks

StackAudit processes Stripe webhook events to keep subscription status in sync.

### Endpoint

```
POST /api/webhooks/stripe
```

### Configuration

1. In your Stripe Dashboard, go to **Developers → Webhooks**
2. Add endpoint: `https://api.stackaudit.ai/v1/webhooks/stripe`
3. Select events to listen for
4. Copy the webhook signing secret

### Environment Variables

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Supported Stripe Events

| Event | Description | Action Taken |
|-------|-------------|--------------|
| `checkout.session.completed` | Checkout completed | Activate subscription, update plan |
| `customer.subscription.created` | New subscription | Store subscription, set plan |
| `customer.subscription.updated` | Subscription changed | Update plan limits |
| `customer.subscription.deleted` | Subscription cancelled | Downgrade to free |
| `invoice.paid` | Payment successful | Log payment |
| `invoice.payment_failed` | Payment failed | Log failure, notify |

---

## Event Payloads

### checkout.session.completed

Triggered when a customer completes checkout.

```json
{
  "id": "evt_abc123",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_xyz789",
      "customer": "cus_abc123",
      "subscription": "sub_def456",
      "metadata": {
        "organizationId": "org_xyz789"
      }
    }
  }
}
```

**What happens:**
- Organization's plan is updated based on the subscription
- Plan limits (audits, retention, users) are applied
- All organization users get the new plan

---

### customer.subscription.updated

Triggered when a subscription changes (upgrade, downgrade, renewal).

```json
{
  "id": "evt_abc123",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_def456",
      "status": "active",
      "items": {
        "data": [
          {
            "price": {
              "id": "price_pro_monthly"
            }
          }
        ]
      },
      "current_period_end": 1705312800,
      "cancel_at_period_end": false
    }
  }
}
```

**What happens:**
- Subscription status is updated
- If price changed, plan is updated
- Plan limits are recalculated

---

### customer.subscription.deleted

Triggered when a subscription is fully cancelled.

```json
{
  "id": "evt_abc123",
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_def456",
      "customer": "cus_abc123"
    }
  }
}
```

**What happens:**
- Organization is downgraded to free plan
- Plan limits are reduced
- Subscription record is removed

---

### invoice.payment_failed

Triggered when a payment attempt fails.

```json
{
  "id": "evt_abc123",
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_abc123",
      "customer_email": "billing@example.com",
      "amount_due": 4900
    }
  }
}
```

**What happens:**
- Failure is logged
- (Future) Email notification sent to admins

---

## Signature Verification

All Stripe webhooks include a signature for verification.

### Header

```
Stripe-Signature: t=1705312800,v1=abc123...
```

### Verification Code

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/webhooks/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,  // Raw body
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle event
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle checkout
      break;
    // ... other events
  }

  res.json({ received: true });
});
```

### Important Notes

1. **Use raw body** — Don't parse JSON before verification
2. **Configure Express correctly:**

```javascript
// For webhook route, use raw body
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// For other routes, use JSON
app.use(express.json());
```

---

## Plan Mapping

Stripe price IDs map to plans:

| Price ID | Plan |
|----------|------|
| `STRIPE_PRICE_PRO_MONTHLY` | pro |
| `STRIPE_PRICE_PRO_YEARLY` | pro |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | enterprise |
| `STRIPE_PRICE_ENTERPRISE_YEARLY` | enterprise |

Configure in environment:

```bash
STRIPE_PRICE_PRO_MONTHLY=price_abc123
STRIPE_PRICE_PRO_YEARLY=price_def456
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_ghi789
STRIPE_PRICE_ENTERPRISE_YEARLY=price_jkl012
```

---

## Testing Webhooks

### Stripe CLI

Use Stripe CLI for local testing:

```bash
# Install
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

The CLI gives you a webhook signing secret for testing:
```
Ready! Your webhook signing secret is whsec_test_abc123...
```

### Trigger Test Events

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

---

## Application Webhooks (Coming Soon)

Future webhook events for application-specific notifications:

| Event | Description |
|-------|-------------|
| `audit.completed` | Analysis finished |
| `audit.failed` | Analysis failed |
| `alert.triggered` | Threshold exceeded |
| `recommendation.generated` | New recommendations ready |
| `team.member_joined` | New team member |

### Planned Configuration

```bash
curl -X POST https://api.stackaudit.ai/v1/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://yourapp.com/webhooks/stackaudit",
    "events": ["audit.completed", "alert.triggered"],
    "secret": "your_webhook_secret"
  }'
```

---

## Error Handling

### Webhook Failures

If your webhook endpoint fails:
- Stripe retries with exponential backoff
- After multiple failures, webhook may be disabled

### Retry Policy (Stripe)

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5+ | Hourly for 3 days |

### Best Practices

1. **Return 200 quickly** — Process asynchronously
2. **Handle duplicates** — Events may be sent multiple times
3. **Log events** — For debugging
4. **Monitor failures** — Set up alerts

---

## Troubleshooting

### Signature Verification Failed

1. Check `STRIPE_WEBHOOK_SECRET` is correct
2. Ensure raw body is passed (not parsed JSON)
3. Verify endpoint URL matches Stripe dashboard

### Events Not Received

1. Check endpoint URL is publicly accessible
2. Verify firewall allows Stripe IPs
3. Check Stripe dashboard for delivery failures

### Plan Not Updating

1. Verify `metadata.organizationId` is set in checkout
2. Check price IDs match environment variables
3. Look at server logs for errors

---

## Security

### Recommendations

1. **Always verify signatures** — Never trust unverified webhooks
2. **Use HTTPS** — Stripe requires HTTPS in production
3. **Rotate secrets** — Periodically regenerate webhook secrets
4. **IP allowlisting** — Optional, allow Stripe IPs only

### Stripe Webhook IPs

For extra security, allowlist Stripe's webhook IPs:
- See [Stripe's IP addresses](https://stripe.com/docs/ips)

---

## Next Steps

- [API Endpoints →](./endpoints.md)
- [Authentication →](./authentication.md)
- [Billing Endpoints →](./endpoints.md#billing)
