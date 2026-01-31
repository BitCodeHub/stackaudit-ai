/**
 * Analysis API Tests
 * Tests for /api/analysis endpoints
 */

const request = require('supertest');
const app = require('../src/index');
const { audits, analysisResults } = require('../src/data/store');
const { 
  createTestUser, 
  generateAuthToken,
  createTestAudit,
  createTestAnalysisResults,
  wait
} = require('./helpers/testUtils');

describe('Analysis API', () => {
  describe('POST /api/analysis/:auditId/run', () => {
    it('should start analysis for a pending audit', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'pending' });

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/run`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          analysisTypes: ['security', 'performance'],
          depth: 'standard'
        })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Analysis started');
      expect(res.body).toHaveProperty('analysisId');
      expect(res.body).toHaveProperty('status', 'analyzing');
      expect(res.body).toHaveProperty('estimatedTime');

      // Verify audit status was updated
      const updatedAudit = audits.get(audit.id);
      expect(updatedAudit.status).toBe('analyzing');
    });

    it('should use default analysis types and depth', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id);

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/run`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);

      expect(res.body).toHaveProperty('analysisId');
      expect(res.body.estimatedTime).toBe('1-2 minutes'); // Standard depth estimate
    });

    it('should return longer estimate for deep analysis', async () => {
      const { user, org } = createTestUser({ plan: 'pro' });
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id);

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/run`)
        .set('Authorization', `Bearer ${token}`)
        .send({ depth: 'deep' })
        .expect(200);

      expect(res.body.estimatedTime).toBe('5-10 minutes');
    });

    it('should return 403 for deep analysis on free plan', async () => {
      const { user, org } = createTestUser({ plan: 'free' });
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id);

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/run`)
        .set('Authorization', `Bearer ${token}`)
        .send({ depth: 'deep' })
        .expect(403);

      expect(res.body.error).toContain('Deep analysis requires Pro or Enterprise plan');
    });

    it('should return 404 for non-existent audit', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/analysis/audit_nonexistent/run')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Audit not found');
    });

    it('should return 403 for unauthorized access', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com' });
      const { user: user2 } = createTestUser({ email: 'user2@test.com' });
      
      const audit = createTestAudit(org1.id, user1.id);
      const token2 = generateAuthToken(user2);

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/run`)
        .set('Authorization', `Bearer ${token2}`)
        .send({})
        .expect(403);

      expect(res.body).toHaveProperty('error', 'Access denied');
    });

    it('should return 409 if analysis already in progress', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'analyzing' });

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/run`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(409);

      expect(res.body).toHaveProperty('error', 'Analysis already in progress');
    });

    it('should accept valid analysis types', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id);

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/run`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          analysisTypes: ['security', 'performance', 'cost', 'compliance']
        })
        .expect(200);

      expect(res.body).toHaveProperty('analysisId');
    });

    it('should validate depth parameter', async () => {
      const { user, org } = createTestUser();
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

  describe('GET /api/analysis/:auditId/results', () => {
    it('should return analysis results for completed audit', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { 
        status: 'completed',
        score: 85 
      });
      const results = createTestAnalysisResults(audit.id, { 
        overallScore: 85,
        depth: 'standard'
      });

      const res = await request(app)
        .get(`/api/analysis/${audit.id}/results`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.audit).toHaveProperty('id', audit.id);
      expect(res.body.audit).toHaveProperty('status', 'completed');
      expect(res.body.audit).toHaveProperty('score', 85);
      expect(res.body.results).toHaveProperty('id', results.id);
      expect(res.body.results).toHaveProperty('overallScore', 85);
      expect(res.body.results).toHaveProperty('categories');
      expect(res.body).toHaveProperty('history');
    });

    it('should return null results for pending audit', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'pending' });

      const res = await request(app)
        .get(`/api/analysis/${audit.id}/results`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.audit.status).toBe('pending');
      expect(res.body.results).toBeNull();
      expect(res.body.history).toEqual([]);
    });

    it('should return multiple results in history', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'completed' });
      
      // Create multiple analysis results
      createTestAnalysisResults(audit.id, { overallScore: 70 });
      createTestAnalysisResults(audit.id, { overallScore: 75 });
      createTestAnalysisResults(audit.id, { overallScore: 85 });

      const res = await request(app)
        .get(`/api/analysis/${audit.id}/results`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.history).toHaveLength(3);
      // Results should be sorted by date (newest first)
      expect(res.body.results).toStrictEqual(res.body.history[0]);
    });

    it('should return 404 for non-existent audit', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/analysis/audit_nonexistent/results')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Audit not found');
    });

    it('should return 403 for unauthorized access', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com' });
      const { user: user2 } = createTestUser({ email: 'user2@test.com' });
      
      const audit = createTestAudit(org1.id, user1.id);
      createTestAnalysisResults(audit.id);
      const token2 = generateAuthToken(user2);

      await request(app)
        .get(`/api/analysis/${audit.id}/results`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);
    });
  });

  describe('GET /api/analysis/:auditId/status', () => {
    it('should return current analysis status', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { 
        status: 'analyzing',
        score: null
      });

      const res = await request(app)
        .get(`/api/analysis/${audit.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('auditId', audit.id);
      expect(res.body).toHaveProperty('status', 'analyzing');
      expect(res.body).toHaveProperty('score', null);
      expect(res.body).toHaveProperty('updatedAt');
      expect(res.body).toHaveProperty('completedAt', null);
    });

    it('should return completed status with score', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const completedAt = new Date().toISOString();
      const audit = createTestAudit(org.id, user.id, { 
        status: 'completed',
        score: 92,
        completedAt
      });

      const res = await request(app)
        .get(`/api/analysis/${audit.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('completed');
      expect(res.body.score).toBe(92);
      expect(res.body.completedAt).toBe(completedAt);
    });

    it('should return failed status', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'failed' });

      const res = await request(app)
        .get(`/api/analysis/${audit.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('failed');
    });

    it('should return 404 for non-existent audit', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      await request(app)
        .get('/api/analysis/audit_nonexistent/status')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 403 for unauthorized access', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com' });
      const { user: user2 } = createTestUser({ email: 'user2@test.com' });
      
      const audit = createTestAudit(org1.id, user1.id);
      const token2 = generateAuthToken(user2);

      await request(app)
        .get(`/api/analysis/${audit.id}/status`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);
    });
  });

  describe('POST /api/analysis/:auditId/rerun', () => {
    it('should rerun analysis for pro plan users', async () => {
      const { user, org } = createTestUser({ plan: 'pro' });
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'completed' });

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/rerun`)
        .set('Authorization', `Bearer ${token}`)
        .send({ focusAreas: ['security'] })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Analysis rerun started');
      expect(res.body).toHaveProperty('analysisId');
      expect(res.body).toHaveProperty('status', 'analyzing');

      // Verify audit status was updated
      const updatedAudit = audits.get(audit.id);
      expect(updatedAudit.status).toBe('analyzing');
    });

    it('should rerun analysis for enterprise plan users', async () => {
      const { user, org } = createTestUser({ plan: 'enterprise' });
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'completed' });

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/rerun`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Analysis rerun started');
    });

    it('should return 403 for free plan users', async () => {
      const { user, org } = createTestUser({ plan: 'free' });
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'completed' });

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/rerun`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(403);

      expect(res.body.error).toContain('requires');
    });

    it('should return 404 for non-existent audit', async () => {
      const { user } = createTestUser({ plan: 'pro' });
      const token = generateAuthToken(user);

      await request(app)
        .post('/api/analysis/audit_nonexistent/rerun')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(404);
    });

    it('should return 409 if analysis already in progress', async () => {
      const { user, org } = createTestUser({ plan: 'pro' });
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'analyzing' });

      const res = await request(app)
        .post(`/api/analysis/${audit.id}/rerun`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(409);

      expect(res.body).toHaveProperty('error', 'Analysis already in progress');
    });

    it('should return 403 for unauthorized access', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com', plan: 'pro' });
      const { user: user2 } = createTestUser({ email: 'user2@test.com', plan: 'pro' });
      
      const audit = createTestAudit(org1.id, user1.id, { status: 'completed' });
      const token2 = generateAuthToken(user2);

      await request(app)
        .post(`/api/analysis/${audit.id}/rerun`)
        .set('Authorization', `Bearer ${token2}`)
        .send({})
        .expect(403);
    });
  });

  describe('Analysis Results Structure', () => {
    it('should have correct structure with categories', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { status: 'completed' });
      createTestAnalysisResults(audit.id, {
        overallScore: 78,
        categories: {
          security: { score: 80, grade: 'B', findings: [{ severity: 'high', title: 'Test finding' }] },
          performance: { score: 75, grade: 'C', findings: [] },
          cost: { score: 70, grade: 'C', findings: [] },
          compliance: { score: 85, grade: 'B', findings: [] }
        },
        techStack: {
          frontend: ['React', 'TypeScript'],
          backend: ['Node.js', 'Express'],
          database: ['PostgreSQL', 'Redis']
        },
        recommendations: [
          { priority: 'high', category: 'security', action: 'Fix vulnerabilities' }
        ]
      });

      const res = await request(app)
        .get(`/api/analysis/${audit.id}/results`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const results = res.body.results;
      expect(results.categories.security).toHaveProperty('score', 80);
      expect(results.categories.security).toHaveProperty('grade', 'B');
      expect(results.categories.security.findings).toHaveLength(1);
      expect(results.techStack.frontend).toContain('React');
      expect(results.recommendations).toHaveLength(1);
      expect(results.recommendations[0]).toHaveProperty('priority', 'high');
    });
  });
});

describe('Analysis Integration', () => {
  it('should complete analysis workflow: create audit -> run -> get results', async () => {
    const { user, org } = createTestUser();
    const token = generateAuthToken(user);

    // 1. Create audit
    const createRes = await request(app)
      .post('/api/audits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Full Workflow Test' })
      .expect(201);

    const auditId = createRes.body.audit.id;

    // 2. Start analysis
    const runRes = await request(app)
      .post(`/api/analysis/${auditId}/run`)
      .set('Authorization', `Bearer ${token}`)
      .send({ depth: 'quick' })
      .expect(200);

    expect(runRes.body.status).toBe('analyzing');

    // 3. Check status (should be analyzing)
    const statusRes = await request(app)
      .get(`/api/analysis/${auditId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(statusRes.body.status).toBe('analyzing');

    // 4. Wait for analysis to complete (mock setTimeout)
    await wait(2500); // Analysis completes after 2 seconds

    // 5. Check final status
    const finalStatusRes = await request(app)
      .get(`/api/analysis/${auditId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(finalStatusRes.body.status).toBe('completed');
    expect(finalStatusRes.body.score).toBeGreaterThanOrEqual(60);
    expect(finalStatusRes.body.score).toBeLessThanOrEqual(100);

    // 6. Get results
    const resultsRes = await request(app)
      .get(`/api/analysis/${auditId}/results`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resultsRes.body.results).not.toBeNull();
    expect(resultsRes.body.results).toHaveProperty('categories');
    expect(resultsRes.body.results).toHaveProperty('techStack');
    expect(resultsRes.body.results).toHaveProperty('recommendations');
  }, 10000); // Increase timeout for this test
});
