/**
 * Audits API Tests
 * Tests for /api/audits endpoints
 */

const request = require('supertest');
const app = require('../src/index');
const { audits, organizations, auditUserShares, generateId } = require('../src/data/store');
const { 
  createTestUser, 
  generateAuthToken,
  createTestAudit
} = require('./helpers/testUtils');

describe('Audits API', () => {
  describe('POST /api/audits', () => {
    it('should create a new audit successfully', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const auditData = {
        name: 'My Test Audit',
        url: 'https://myapp.example.com',
        repositoryUrl: 'https://github.com/org/repo',
        description: 'Testing my SaaS stack',
        tags: ['production', 'critical']
      };

      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${token}`)
        .send(auditData)
        .expect(201);

      expect(res.body).toHaveProperty('message', 'Audit created successfully');
      expect(res.body.audit).toHaveProperty('id');
      expect(res.body.audit).toHaveProperty('name', 'My Test Audit');
      expect(res.body.audit).toHaveProperty('url', 'https://myapp.example.com');
      expect(res.body.audit).toHaveProperty('status', 'pending');
      expect(res.body.audit.tags).toEqual(['production', 'critical']);
    });

    it('should create audit with minimal data', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Minimal Audit' })
        .expect(201);

      expect(res.body.audit).toHaveProperty('name', 'Minimal Audit');
      expect(res.body.audit.url).toBeNull();
      expect(res.body.audit.tags).toEqual([]);
    });

    it('should enforce monthly audit limit for free plan', async () => {
      const { user, org } = createTestUser({ plan: 'free', maxAuditsPerMonth: 3 });
      const token = generateAuthToken(user);

      // Create 3 audits (at the limit)
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/audits')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: `Audit ${i + 1}` })
          .expect(201);
      }

      // 4th audit should fail
      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Audit 4' })
        .expect(403);

      expect(res.body.error).toContain('Monthly audit limit reached');
    });

    it('should return 400 for missing name', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'https://example.com' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 for invalid URL', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', url: 'not-a-valid-url' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/audits')
        .send({ name: 'Test Audit' })
        .expect(401);
    });
  });

  describe('GET /api/audits', () => {
    it('should return list of audits for organization', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);

      // Create some audits
      createTestAudit(org.id, user.id, { name: 'Audit 1' });
      createTestAudit(org.id, user.id, { name: 'Audit 2' });
      createTestAudit(org.id, user.id, { name: 'Audit 3' });

      const res = await request(app)
        .get('/api/audits')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.audits).toHaveLength(3);
      expect(res.body.pagination).toHaveProperty('total', 3);
    });

    it('should filter audits by status', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);

      createTestAudit(org.id, user.id, { name: 'Pending 1', status: 'pending' });
      createTestAudit(org.id, user.id, { name: 'Completed 1', status: 'completed' });
      createTestAudit(org.id, user.id, { name: 'Completed 2', status: 'completed' });

      const res = await request(app)
        .get('/api/audits?status=completed')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.audits).toHaveLength(2);
      expect(res.body.audits.every(a => a.status === 'completed')).toBe(true);
    });

    it('should support pagination', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);

      // Create 10 audits
      for (let i = 0; i < 10; i++) {
        createTestAudit(org.id, user.id, { name: `Audit ${i + 1}` });
      }

      const res = await request(app)
        .get('/api/audits?limit=3&offset=0')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.audits).toHaveLength(3);
      expect(res.body.pagination).toEqual({
        total: 10,
        limit: 3,
        offset: 0,
        hasMore: true
      });

      // Get next page
      const res2 = await request(app)
        .get('/api/audits?limit=3&offset=3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res2.body.audits).toHaveLength(3);
      expect(res2.body.pagination.offset).toBe(3);
    });

    it('should sort by different fields', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);

      createTestAudit(org.id, user.id, { name: 'Beta Audit', score: 90 });
      createTestAudit(org.id, user.id, { name: 'Alpha Audit', score: 70 });
      createTestAudit(org.id, user.id, { name: 'Gamma Audit', score: 85 });

      // Sort by name ascending
      const res = await request(app)
        .get('/api/audits?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.audits[0].name).toBe('Alpha Audit');
      expect(res.body.audits[2].name).toBe('Gamma Audit');
    });

    it('should include shared audits when requested', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com' });
      const { user: user2, org: org2 } = createTestUser({ email: 'user2@test.com' });
      const token = generateAuthToken(user2);

      // Create audit in org1 and share with user2
      const sharedAudit = createTestAudit(org1.id, user1.id, { name: 'Shared Audit' });
      
      // Create share
      const shareId = generateId('share');
      auditUserShares.set(shareId, {
        id: shareId,
        auditId: sharedAudit.id,
        userId: user2.id,
        sharedBy: user1.id,
        permission: 'view',
        createdAt: new Date().toISOString()
      });

      // Create audit in user2's org
      createTestAudit(org2.id, user2.id, { name: 'Own Audit' });

      const res = await request(app)
        .get('/api/audits?includeShared=true')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.audits).toHaveLength(2);
      const sharedInResults = res.body.audits.find(a => a.name === 'Shared Audit');
      expect(sharedInResults).toBeTruthy();
      expect(sharedInResults.isShared).toBe(true);
    });

    it('should not show other organizations audits', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com' });
      const { user: user2, org: org2 } = createTestUser({ email: 'user2@test.com' });
      
      createTestAudit(org1.id, user1.id, { name: 'Org1 Audit' });
      createTestAudit(org2.id, user2.id, { name: 'Org2 Audit' });

      const token1 = generateAuthToken(user1);
      const res = await request(app)
        .get('/api/audits?includeShared=false')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(res.body.audits).toHaveLength(1);
      expect(res.body.audits[0].name).toBe('Org1 Audit');
    });
  });

  describe('GET /api/audits/:id', () => {
    it('should return audit details', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { 
        name: 'Detailed Audit',
        score: 85
      });

      const res = await request(app)
        .get(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.audit).toHaveProperty('id', audit.id);
      expect(res.body.audit).toHaveProperty('name', 'Detailed Audit');
      expect(res.body).toHaveProperty('sharing');
      expect(res.body).toHaveProperty('permissions');
      expect(res.body.permissions.canEdit).toBe(true);
      expect(res.body.permissions.canShare).toBe(true);
    });

    it('should return 404 for non-existent audit', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      const res = await request(app)
        .get('/api/audits/audit_nonexistent_123')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body).toHaveProperty('error', 'Audit not found');
    });

    it('should return 403 for unauthorized access', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com' });
      const { user: user2 } = createTestUser({ email: 'user2@test.com' });
      
      const audit = createTestAudit(org1.id, user1.id, { name: 'Private Audit' });
      const token2 = generateAuthToken(user2);

      const res = await request(app)
        .get(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      expect(res.body).toHaveProperty('error', 'Access denied');
    });

    it('should track views for shared audits', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'owner@test.com' });
      const { user: user2 } = createTestUser({ email: 'viewer@test.com' });
      
      const audit = createTestAudit(org1.id, user1.id, { name: 'Shared Audit' });
      
      // Share with user2
      const shareId = generateId('share');
      auditUserShares.set(shareId, {
        id: shareId,
        auditId: audit.id,
        userId: user2.id,
        sharedBy: user1.id,
        permission: 'view',
        viewCount: 0,
        lastViewedAt: null,
        createdAt: new Date().toISOString()
      });

      const token2 = generateAuthToken(user2);
      await request(app)
        .get(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      const share = auditUserShares.get(shareId);
      expect(share.viewCount).toBe(1);
      expect(share.lastViewedAt).not.toBeNull();
    });
  });

  describe('PATCH /api/audits/:id', () => {
    it('should update audit successfully', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { name: 'Original Name' });

      const res = await request(app)
        .patch(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          description: 'Updated description',
          tags: ['updated', 'test']
        })
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Audit updated');
      expect(res.body.audit).toHaveProperty('name', 'Updated Name');
      expect(res.body.audit).toHaveProperty('description', 'Updated description');
      expect(res.body.audit.tags).toEqual(['updated', 'test']);
    });

    it('should partially update audit', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { 
        name: 'Original',
        description: 'Original description'
      });

      const res = await request(app)
        .patch(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Only Name Updated' })
        .expect(200);

      expect(res.body.audit.name).toBe('Only Name Updated');
      expect(res.body.audit.description).toBe('Original description');
    });

    it('should return 404 for non-existent audit', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      await request(app)
        .patch('/api/audits/audit_nonexistent')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' })
        .expect(404);
    });

    it('should return 403 for other organization audit', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com' });
      const { user: user2 } = createTestUser({ email: 'user2@test.com' });
      
      const audit = createTestAudit(org1.id, user1.id);
      const token2 = generateAuthToken(user2);

      await request(app)
        .patch(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ name: 'Hacked Name' })
        .expect(403);
    });
  });

  describe('DELETE /api/audits/:id', () => {
    it('should delete audit successfully', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id);

      const res = await request(app)
        .delete(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Audit deleted');
      expect(audits.get(audit.id)).toBeUndefined();
    });

    it('should return 404 for non-existent audit', async () => {
      const { user } = createTestUser();
      const token = generateAuthToken(user);

      await request(app)
        .delete('/api/audits/audit_nonexistent')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 403 for other organization audit', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com' });
      const { user: user2 } = createTestUser({ email: 'user2@test.com' });
      
      const audit = createTestAudit(org1.id, user1.id);
      const token2 = generateAuthToken(user2);

      await request(app)
        .delete(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      // Verify audit still exists
      expect(audits.get(audit.id)).toBeDefined();
    });
  });

  describe('GET /api/audits/:id/export', () => {
    it('should export audit as JSON', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id, { name: 'Export Test' });

      const res = await request(app)
        .get(`/api/audits/${audit.id}/export?format=json`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.export).toHaveProperty('audit');
      expect(res.body.export.audit.name).toBe('Export Test');
      expect(res.body.export).toHaveProperty('exportedAt');
      expect(res.body.export).toHaveProperty('exportedBy');
    });

    it('should default to JSON format', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id);

      const res = await request(app)
        .get(`/api/audits/${audit.id}/export`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('export');
    });

    it('should return 400 for PDF format (not implemented)', async () => {
      const { user, org } = createTestUser();
      const token = generateAuthToken(user);
      const audit = createTestAudit(org.id, user.id);

      const res = await request(app)
        .get(`/api/audits/${audit.id}/export?format=pdf`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.error).toContain('PDF export coming soon');
    });

    it('should return 403 for unauthorized access', async () => {
      const { user: user1, org: org1 } = createTestUser({ email: 'user1@test.com' });
      const { user: user2 } = createTestUser({ email: 'user2@test.com' });
      
      const audit = createTestAudit(org1.id, user1.id);
      const token2 = generateAuthToken(user2);

      await request(app)
        .get(`/api/audits/${audit.id}/export`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);
    });
  });
});
