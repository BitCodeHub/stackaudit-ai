/**
 * Middleware Tests
 * Tests for authentication, authorization, validation, and error handling
 */

const request = require('supertest');
const app = require('../src/index');
const ApiError = require('../src/utils/ApiError');
const { 
  createTestUser, 
  generateAuthToken,
  createExpiredToken,
  createInvalidToken
} = require('./helpers/testUtils');

describe('Authentication Middleware', () => {
  describe('authenticate', () => {
    it('should allow request with valid token', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.user).toHaveProperty('id', user.id);
    });

    it('should reject request without Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'No token provided');
    });

    it('should reject request with malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(res.body).toHaveProperty('error', 'No token provided');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${createInvalidToken()}`)
        .expect(401);

      expect(res.body).toHaveProperty('error', 'Invalid token');
    });

    it('should reject request with expired token', async () => {
      const { user } = createTestUser();
      const expiredToken = createExpiredToken(user);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('should attach user to request on valid token', async () => {
      const { user } = createTestUser({ 
        email: 'attached@test.com',
        name: 'Attached User'
      });
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.user.email).toBe('attached@test.com');
      expect(res.body.user.name).toBe('Attached User');
    });
  });

  describe('authorize', () => {
    it('should allow admin access to admin-required routes', async () => {
      const { user } = createTestUser({ role: 'admin' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('invoices');
    });

    it('should allow owner access to admin-required routes', async () => {
      const { user } = createTestUser({ role: 'owner' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should reject member access to admin-required routes', async () => {
      const { user } = createTestUser({ role: 'member' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'Insufficient permissions');
    });
  });

  describe('requirePlan', () => {
    it('should allow pro users to access pro features', async () => {
      const { user, org } = createTestUser({ plan: 'pro' });
      const { createTestAudit } = require('./helpers/testUtils');
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'completed' });

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/rerun`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);
    });

    it('should allow enterprise users to access pro features', async () => {
      const { user, org } = createTestUser({ plan: 'enterprise' });
      const { createTestAudit } = require('./helpers/testUtils');
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'completed' });

      await request(app)
        .post(`/api/analysis/${audit.id}/rerun`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);
    });

    it('should reject free users from pro features', async () => {
      const { user, org } = createTestUser({ plan: 'free' });
      const { createTestAudit } = require('./helpers/testUtils');
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'completed' });

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/rerun`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(403);

      expect(res.body.error).toContain('requires');
    });
  });
});

describe('Validation Middleware', () => {
  it('should pass validation for valid request', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'valid@example.com',
        password: 'validpassword123',
        name: 'Valid User'
      })
      .expect(201);

    expect(res.body).toHaveProperty('token');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'not-an-email',
        password: 'validpassword123',
        name: 'Test User'
      })
      .expect(400);

    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' })
      ])
    );
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com'
        // Missing password and name
      })
      .expect(400);

    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body.details.length).toBeGreaterThanOrEqual(2);
  });

  it('should normalize email addresses', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'TEST@EXAMPLE.COM',
        password: 'validpassword123',
        name: 'Test User'
      })
      .expect(201);

    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should trim whitespace from name field', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'trimmed@example.com',
        password: 'validpassword123',
        name: '  Trimmed Name  '
      })
      .expect(201);

    expect(res.body.user.name).toBe('Trimmed Name');
  });

  it('should validate URL fields', async () => {
    const { user } = createTestUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .post('/api/audits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Audit',
        url: 'not-a-valid-url'
      })
      .expect(400);

    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('should validate array fields', async () => {
    const { user } = createTestUser();
    const token = generateAuthToken(user);

    const res = await request(app)
      .post('/api/audits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Audit',
        tags: 'not-an-array'
      })
      .expect(400);

    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('should validate enum values', async () => {
    const { user, org } = createTestUser();
    const { createTestAudit } = require('./helpers/testUtils');
    const token = generateAuthToken(user);
    const audit = createTestAudit(org.id, user.id);

    const res = await request(app)
      .post(`/api/analysis/${audit.id}/run`)
      .set('Authorization', `Bearer ${token}`)
      .send({ depth: 'invalid_depth' })
      .expect(400);

    expect(res.body).toHaveProperty('error', 'Validation failed');
  });
});

describe('Error Handler Middleware', () => {
  describe('ApiError handling', () => {
    it('should return 400 for bad request errors', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'invalid' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 for unauthorized errors', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    it('should return 403 for forbidden errors', async () => {
      const { user } = createTestUser({ role: 'member' });
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for not found errors', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/audits/nonexistent_id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });

    it('should return 409 for conflict errors', async () => {
      const { user } = createTestUser({ email: 'existing@example.com' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test'
        })
        .expect(409);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Not found');
    });

    it('should return 404 for unknown methods on existing routes', async () => {
      const res = await request(app)
        .patch('/api/auth/signup')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Not found');
    });
  });
});

describe('ApiError Class', () => {
  it('should create badRequest error', () => {
    const error = ApiError.badRequest('Invalid input', [{ field: 'email' }]);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid input');
    expect(error.details).toEqual([{ field: 'email' }]);
  });

  it('should create unauthorized error', () => {
    const error = ApiError.unauthorized('Not authenticated');
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Not authenticated');
  });

  it('should create unauthorized error with default message', () => {
    const error = ApiError.unauthorized();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('should create forbidden error', () => {
    const error = ApiError.forbidden('Access denied');
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Access denied');
  });

  it('should create notFound error', () => {
    const error = ApiError.notFound('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('should create conflict error', () => {
    const error = ApiError.conflict('Already exists');
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Already exists');
  });

  it('should create tooManyRequests error', () => {
    const error = ApiError.tooManyRequests('Rate limit exceeded');
    expect(error.statusCode).toBe(429);
    expect(error.message).toBe('Rate limit exceeded');
  });

  it('should create internal error', () => {
    const error = ApiError.internal('Server error');
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Server error');
  });

  it('should be an instance of Error', () => {
    const error = ApiError.badRequest('Test');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it('should have isOperational flag', () => {
    const error = ApiError.badRequest('Test');
    expect(error.isOperational).toBe(true);
  });

  it('should capture stack trace', () => {
    const error = ApiError.badRequest('Test');
    expect(error.stack).toBeDefined();
  });
});
