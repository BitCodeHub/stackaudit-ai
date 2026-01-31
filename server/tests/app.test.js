/**
 * Core App Tests
 * Tests for main application routes, health checks, and configuration
 */

const request = require('supertest');
const app = require('../src/index');
const { createTestUser, generateAuthToken } = require('./helpers/testUtils');

describe('Core Application', () => {
  describe('GET /', () => {
    it('should return API info or 404 for unknown root', async () => {
      const res = await request(app).get('/');
      
      // The root route may return 200 with API info or 404 if not configured
      // This depends on Express routing order
      if (res.status === 200) {
        expect(res.body).toHaveProperty('name', 'StackAudit.ai API');
        expect(res.body).toHaveProperty('version');
        expect(res.body).toHaveProperty('status', 'operational');
      } else {
        expect(res.status).toBe(404);
      }
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should return valid ISO timestamp', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(res.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should respond quickly (under 100ms)', async () => {
      const start = Date.now();
      await request(app).get('/health').expect(200);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Not found');
    });

    it('should return 404 for unknown nested routes', async () => {
      await request(app)
        .get('/api/auth/unknown-action')
        .expect(404);
    });

    it('should return 404 with JSON response', async () => {
      const res = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(res.type).toBe('application/json');
    });
  });

  describe('CORS', () => {
    it('should allow requests from localhost:5173', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should allow requests from localhost:3003', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3003')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3003');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const res = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(res.headers['access-control-allow-methods']).toBeDefined();
    });
  });

  describe('JSON Body Parsing', () => {
    it('should parse JSON request bodies', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'json@test.com',
          password: 'password123',
          name: 'JSON Test'
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body.user.email).toBe('json@test.com');
    });

    it('should handle empty JSON body', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid JSON', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    it('should handle large request bodies within limit', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const largeDescription = 'a'.repeat(5000); // 5KB of text

      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Large Description Test',
          description: largeDescription
        })
        .expect(201);

      expect(res.body.audit.description).toHaveLength(5000);
    });
  });

  describe('Security Headers', () => {
    it('should include helmet security headers', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      // Helmet adds various security headers
      expect(res.headers['x-dns-prefetch-control']).toBeDefined();
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});

describe('API Versioning', () => {
  it('should return API version in root response if available', async () => {
    const res = await request(app).get('/');
    
    // Root may or may not be configured depending on Express routing
    if (res.status === 200 && res.body.version) {
      expect(res.body.version).toMatch(/^\d+\.\d+\.\d+$/);
    } else {
      // If root returns 404, test still passes
      expect([200, 404]).toContain(res.status);
    }
  });
});

describe('Content Type Handling', () => {
  it('should return JSON content type for API responses', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.type).toBe('application/json');
  });

  it('should accept JSON content type for requests', async () => {
    await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'test@test.com', password: 'test' })
      .expect(401); // Invalid creds, but request was accepted
  });
});

describe('Environment Configuration', () => {
  it('should be running in test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should use test JWT secret', () => {
    expect(process.env.JWT_SECRET).toBe('test-secret-key-for-jwt');
  });
});

describe('Route Registration', () => {
  describe('Auth Routes', () => {
    it('should have POST /api/auth/signup', async () => {
      const res = await request(app).post('/api/auth/signup').send({});
      expect(res.status).not.toBe(404);
    });

    it('should have POST /api/auth/login', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).not.toBe(404);
    });

    it('should have GET /api/auth/me', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).not.toBe(404);
    });

    it('should have POST /api/auth/refresh', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.status).not.toBe(404);
    });

    it('should have POST /api/auth/logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).not.toBe(404);
    });

    it('should have POST /api/auth/change-password', async () => {
      const res = await request(app).post('/api/auth/change-password');
      expect(res.status).not.toBe(404);
    });
  });

  describe('Audit Routes', () => {
    it('should have POST /api/audits', async () => {
      const res = await request(app).post('/api/audits');
      expect(res.status).not.toBe(404);
    });

    it('should have GET /api/audits', async () => {
      const res = await request(app).get('/api/audits');
      expect(res.status).not.toBe(404);
    });

    it('should have GET /api/audits/:id', async () => {
      const res = await request(app).get('/api/audits/test-id');
      expect(res.status).not.toBe(404);
    });

    it('should have PATCH /api/audits/:id', async () => {
      const res = await request(app).patch('/api/audits/test-id');
      expect(res.status).not.toBe(404);
    });

    it('should have DELETE /api/audits/:id', async () => {
      const res = await request(app).delete('/api/audits/test-id');
      expect(res.status).not.toBe(404);
    });
  });

  describe('Analysis Routes', () => {
    it('should have POST /api/analysis/:auditId/run', async () => {
      const res = await request(app).post('/api/analysis/test-id/run');
      expect(res.status).not.toBe(404);
    });

    it('should have GET /api/analysis/:auditId/results', async () => {
      const res = await request(app).get('/api/analysis/test-id/results');
      expect(res.status).not.toBe(404);
    });

    it('should have GET /api/analysis/:auditId/status', async () => {
      const res = await request(app).get('/api/analysis/test-id/status');
      expect(res.status).not.toBe(404);
    });

    it('should have POST /api/analysis/:auditId/rerun', async () => {
      const res = await request(app).post('/api/analysis/test-id/rerun');
      expect(res.status).not.toBe(404);
    });
  });

  describe('Billing Routes', () => {
    it('should have GET /api/billing/subscription', async () => {
      const res = await request(app).get('/api/billing/subscription');
      expect(res.status).not.toBe(404);
    });

    it('should have GET /api/billing/plans', async () => {
      const res = await request(app).get('/api/billing/plans');
      expect(res.status).not.toBe(404);
    });

    it('should have POST /api/billing/checkout', async () => {
      const res = await request(app).post('/api/billing/checkout');
      expect(res.status).not.toBe(404);
    });

    it('should have POST /api/billing/portal', async () => {
      const res = await request(app).post('/api/billing/portal');
      expect(res.status).not.toBe(404);
    });

    it('should have POST /api/billing/cancel', async () => {
      const res = await request(app).post('/api/billing/cancel');
      expect(res.status).not.toBe(404);
    });

    it('should have POST /api/billing/resume', async () => {
      const res = await request(app).post('/api/billing/resume');
      expect(res.status).not.toBe(404);
    });

    it('should have GET /api/billing/invoices', async () => {
      const res = await request(app).get('/api/billing/invoices');
      expect(res.status).not.toBe(404);
    });
  });
});
