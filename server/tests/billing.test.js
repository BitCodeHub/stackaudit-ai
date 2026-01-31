/**
 * Billing API Tests
 * Tests for /api/billing endpoints
 * 
 * Note: Stripe integration tests are limited because the stripe module
 * is initialized at require time. These tests focus on the non-Stripe
 * functionality and basic validation.
 */

const request = require('supertest');
const app = require('../src/index');
const { organizations, subscriptions } = require('../src/data/store');
const { 
  createTestUser, 
  generateAuthToken,
  createTestSubscription
} = require('./helpers/testUtils');

describe('Billing API', () => {
  describe('GET /api/billing/subscription', () => {
    it('should return subscription info for user with subscription', async () => {
      const { user, org } = createTestUser({ plan: 'pro' });
      const token = generateAuthToken(user);
      const subscription = createTestSubscription(org.id);

      const res = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('plan', 'pro');
      expect(res.body.subscription).toHaveProperty('id');
      expect(res.body.subscription).toHaveProperty('status', 'active');
      expect(res.body).toHaveProperty('features');
    });

    it('should return free plan info when no subscription', async () => {
      const { user } = createTestUser({ plan: 'free' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('plan', 'free');
      expect(res.body.subscription).toBeNull();
      expect(res.body.features).toHaveProperty('auditsPerMonth', 3);
      expect(res.body.features).toHaveProperty('deepAnalysis', false);
    });

    it('should return correct features for each plan', async () => {
      // Test Pro plan features
      const { user: proUser } = createTestUser({ plan: 'pro', email: 'pro@test.com' });
      const proToken = generateAuthToken(proUser);

      const proRes = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${proToken}`)
        .expect(200);

      expect(proRes.body.features).toHaveProperty('auditsPerMonth', 50);
      expect(proRes.body.features).toHaveProperty('deepAnalysis', true);
      expect(proRes.body.features).toHaveProperty('prioritySupport', true);

      // Test Enterprise plan features
      const { user: entUser } = createTestUser({ plan: 'enterprise', email: 'ent@test.com' });
      const entToken = generateAuthToken(entUser);

      const entRes = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${entToken}`)
        .expect(200);

      expect(entRes.body.features).toHaveProperty('auditsPerMonth', 500);
      expect(entRes.body.features).toHaveProperty('apiAccess', true);
      expect(entRes.body.features).toHaveProperty('ssoSaml', true);
      expect(entRes.body.features).toHaveProperty('whiteLabel', true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/billing/subscription')
        .expect(401);
    });

    it('should return 404 if organization not found', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      
      // Delete the organization
      organizations.delete(org.id);

      const res = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Organization not found');
    });
  });

  describe('GET /api/billing/plans', () => {
    it('should return all available plans', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/billing/plans')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.plans).toHaveLength(3);
      
      const freePlan = res.body.plans.find(p => p.id === 'free');
      expect(freePlan).toHaveProperty('price', 0);
      expect(freePlan.features).toHaveProperty('auditsPerMonth', 3);

      const proPlan = res.body.plans.find(p => p.id === 'pro');
      expect(proPlan).toHaveProperty('price', 49);
      expect(proPlan).toHaveProperty('yearlyPrice', 470);

      const entPlan = res.body.plans.find(p => p.id === 'enterprise');
      expect(entPlan).toHaveProperty('price', 199);
    });
  });

  describe('POST /api/billing/checkout', () => {
    it('should return 500 when Stripe is not configured', async () => {
      const { user } = createTestUser({ role: 'admin' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          priceId: 'price_pro_monthly',
          successUrl: 'https://app.example.com/success',
          cancelUrl: 'https://app.example.com/cancel'
        })
        .expect(500);

      expect(res.body).toHaveProperty('error', 'Billing not configured');
    });

    it('should return 403 for non-admin users', async () => {
      const { user } = createTestUser({ role: 'member' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          priceId: 'price_pro_monthly',
          successUrl: 'https://app.example.com/success',
          cancelUrl: 'https://app.example.com/cancel'
        })
        .expect(403);

      expect(res.body).toHaveProperty('error', 'Insufficient permissions');
    });

    it('should return 400 for missing priceId', async () => {
      const { user } = createTestUser({ role: 'admin' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          successUrl: 'https://app.example.com/success',
          cancelUrl: 'https://app.example.com/cancel'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 for invalid successUrl', async () => {
      const { user } = createTestUser({ role: 'admin' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/billing/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          priceId: 'price_pro_monthly',
          successUrl: 'not-a-url',
          cancelUrl: 'https://app.example.com/cancel'
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/billing/portal', () => {
    it('should return 500 when Stripe is not configured', async () => {
      const { user, org } = createTestUser({ role: 'admin' });
      org.stripeCustomerId = 'cus_existing_123';
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/billing/portal')
        .set('Authorization', `Bearer ${token}`)
        .send({ returnUrl: 'https://app.example.com/billing' })
        .expect(500);

      expect(res.body).toHaveProperty('error', 'Billing not configured');
    });

    it('should return 403 for non-admin users', async () => {
      const { user, org } = createTestUser({ role: 'member' });
      org.stripeCustomerId = 'cus_test';
      const token = generateAuthToken(user);

      await request(app)
        .post('/api/billing/portal')
        .set('Authorization', `Bearer ${token}`)
        .send({ returnUrl: 'https://app.example.com/billing' })
        .expect(403);
    });
  });

  describe('POST /api/billing/cancel', () => {
    it('should return 500 when Stripe is not configured', async () => {
      const { user, org } = createTestUser({ role: 'admin' });
      const token = generateAuthToken(user);
      createTestSubscription(org.id);

      const res = await request(app)
        .post('/api/billing/cancel')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(res.body).toHaveProperty('error', 'Billing not configured');
    });

    it('should return 403 for non-admin users', async () => {
      const { user, org } = createTestUser({ role: 'member' });
      createTestSubscription(org.id);
      const token = generateAuthToken(user);

      await request(app)
        .post('/api/billing/cancel')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('POST /api/billing/resume', () => {
    it('should return 500 when Stripe is not configured', async () => {
      const { user, org } = createTestUser({ role: 'admin' });
      const token = generateAuthToken(user);
      createTestSubscription(org.id, { cancelAtPeriodEnd: true });

      const res = await request(app)
        .post('/api/billing/resume')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(res.body).toHaveProperty('error', 'Billing not configured');
    });
  });

  describe('GET /api/billing/invoices', () => {
    it('should return empty array when no billing account', async () => {
      const { user } = createTestUser({ role: 'admin' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.invoices).toEqual([]);
    });

    it('should return empty array when Stripe not configured', async () => {
      const { user, org } = createTestUser({ role: 'admin' });
      org.stripeCustomerId = 'cus_test_123';
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // When Stripe isn't configured, returns empty array
      expect(res.body.invoices).toEqual([]);
    });

    it('should return 403 for non-admin users', async () => {
      const { user, org } = createTestUser({ role: 'member' });
      org.stripeCustomerId = 'cus_test';
      const token = generateAuthToken(user);

      await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});

describe('Plan Features', () => {
  it('should return correct features for free plan', async () => {
    const { user } = createTestUser({ plan: 'free' });
    const token = generateAuthToken(user);

    const res = await request(app)
      .get('/api/billing/subscription')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const features = res.body.features;
    expect(features.auditsPerMonth).toBe(3);
    expect(features.users).toBe(1);
    expect(features.retentionDays).toBe(7);
    expect(features.deepAnalysis).toBe(false);
    expect(features.apiAccess).toBe(false);
    expect(features.prioritySupport).toBe(false);
    expect(features.customIntegrations).toBe(false);
    expect(features.ssoSaml).toBe(false);
    expect(features.whiteLabel).toBe(false);
  });

  it('should return correct features for pro plan', async () => {
    const { user } = createTestUser({ plan: 'pro' });
    const token = generateAuthToken(user);

    const res = await request(app)
      .get('/api/billing/subscription')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const features = res.body.features;
    expect(features.auditsPerMonth).toBe(50);
    expect(features.users).toBe(10);
    expect(features.retentionDays).toBe(90);
    expect(features.deepAnalysis).toBe(true);
    expect(features.apiAccess).toBe(false);
    expect(features.prioritySupport).toBe(true);
  });

  it('should return correct features for enterprise plan', async () => {
    const { user } = createTestUser({ plan: 'enterprise' });
    const token = generateAuthToken(user);

    const res = await request(app)
      .get('/api/billing/subscription')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const features = res.body.features;
    expect(features.auditsPerMonth).toBe(500);
    expect(features.users).toBe(100);
    expect(features.retentionDays).toBe(365);
    expect(features.deepAnalysis).toBe(true);
    expect(features.apiAccess).toBe(true);
    expect(features.prioritySupport).toBe(true);
    expect(features.customIntegrations).toBe(true);
    expect(features.ssoSaml).toBe(true);
    expect(features.whiteLabel).toBe(true);
  });
});
