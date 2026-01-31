/**
 * Data Store Tests
 * Tests for in-memory data store functionality
 */

const {
  users,
  organizations,
  audits,
  analysisResults,
  subscriptions,
  teamInvites,
  auditComments,
  auditShares,
  auditUserShares,
  commentReactions,
  collaborationActivity,
  notificationPreferences,
  integrationCredentials,
  toolCosts,
  generateId
} = require('../src/data/store');

describe('Data Store', () => {
  describe('Store Initialization', () => {
    it('should have empty users store after setup', () => {
      expect(users.size).toBe(0);
    });

    it('should have empty organizations store after setup', () => {
      expect(organizations.size).toBe(0);
    });

    it('should have empty audits store after setup', () => {
      expect(audits.size).toBe(0);
    });

    it('should have empty analysisResults store after setup', () => {
      expect(analysisResults.size).toBe(0);
    });

    it('should have all stores as Map instances', () => {
      expect(users).toBeInstanceOf(Map);
      expect(organizations).toBeInstanceOf(Map);
      expect(audits).toBeInstanceOf(Map);
      expect(analysisResults).toBeInstanceOf(Map);
      expect(subscriptions).toBeInstanceOf(Map);
      expect(teamInvites).toBeInstanceOf(Map);
      expect(auditComments).toBeInstanceOf(Map);
      expect(auditShares).toBeInstanceOf(Map);
      expect(auditUserShares).toBeInstanceOf(Map);
      expect(commentReactions).toBeInstanceOf(Map);
      expect(collaborationActivity).toBeInstanceOf(Map);
      expect(notificationPreferences).toBeInstanceOf(Map);
      expect(integrationCredentials).toBeInstanceOf(Map);
      expect(toolCosts).toBeInstanceOf(Map);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate ID with prefix', () => {
      const userId = generateId('user');
      const orgId = generateId('org');
      const auditId = generateId('audit');

      expect(userId).toMatch(/^user_/);
      expect(orgId).toMatch(/^org_/);
      expect(auditId).toMatch(/^audit_/);
    });

    it('should generate ID without prefix when none provided', () => {
      const id = generateId();
      expect(id).not.toContain('_');
    });

    it('should generate UUIDs', () => {
      const id = generateId();
      // UUID v4 format
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate prefixed IDs with UUIDs', () => {
      const id = generateId('test');
      expect(id).toMatch(/^test_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('Store Operations', () => {
    describe('Users Store', () => {
      it('should set and get user', () => {
        const userId = generateId('user');
        const user = {
          id: userId,
          email: 'test@example.com',
          name: 'Test User'
        };

        users.set(userId, user);
        
        expect(users.get(userId)).toEqual(user);
      });

      it('should check if user exists', () => {
        const userId = generateId('user');
        users.set(userId, { id: userId });

        expect(users.has(userId)).toBe(true);
        expect(users.has('nonexistent')).toBe(false);
      });

      it('should delete user', () => {
        const userId = generateId('user');
        users.set(userId, { id: userId });
        
        expect(users.has(userId)).toBe(true);
        users.delete(userId);
        expect(users.has(userId)).toBe(false);
      });

      it('should iterate over users', () => {
        const user1 = { id: generateId('user'), name: 'User 1' };
        const user2 = { id: generateId('user'), name: 'User 2' };
        
        users.set(user1.id, user1);
        users.set(user2.id, user2);

        const names = Array.from(users.values()).map(u => u.name);
        expect(names).toContain('User 1');
        expect(names).toContain('User 2');
      });

      it('should find user by email', () => {
        const user = { 
          id: generateId('user'), 
          email: 'findme@example.com',
          name: 'Find Me'
        };
        users.set(user.id, user);

        const found = Array.from(users.values()).find(u => u.email === 'findme@example.com');
        expect(found).toEqual(user);
      });
    });

    describe('Audits Store', () => {
      it('should store audit with all properties', () => {
        const auditId = generateId('audit');
        const audit = {
          id: auditId,
          name: 'Test Audit',
          url: 'https://example.com',
          status: 'pending',
          organizationId: 'org_123',
          createdBy: 'user_123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          score: null,
          results: null
        };

        audits.set(auditId, audit);
        
        const retrieved = audits.get(auditId);
        expect(retrieved.name).toBe('Test Audit');
        expect(retrieved.status).toBe('pending');
      });

      it('should filter audits by organization', () => {
        const orgId = 'org_test';
        const audit1 = { id: generateId('audit'), organizationId: orgId, name: 'Audit 1' };
        const audit2 = { id: generateId('audit'), organizationId: orgId, name: 'Audit 2' };
        const audit3 = { id: generateId('audit'), organizationId: 'other_org', name: 'Audit 3' };

        audits.set(audit1.id, audit1);
        audits.set(audit2.id, audit2);
        audits.set(audit3.id, audit3);

        const orgAudits = Array.from(audits.values())
          .filter(a => a.organizationId === orgId);

        expect(orgAudits).toHaveLength(2);
        expect(orgAudits.map(a => a.name)).toContain('Audit 1');
        expect(orgAudits.map(a => a.name)).toContain('Audit 2');
      });

      it('should update audit properties', () => {
        const audit = { 
          id: generateId('audit'), 
          name: 'Original',
          status: 'pending'
        };
        audits.set(audit.id, audit);

        // Update the audit
        const stored = audits.get(audit.id);
        stored.name = 'Updated';
        stored.status = 'completed';
        stored.score = 85;

        const retrieved = audits.get(audit.id);
        expect(retrieved.name).toBe('Updated');
        expect(retrieved.status).toBe('completed');
        expect(retrieved.score).toBe(85);
      });
    });

    describe('Organizations Store', () => {
      it('should store organization with settings', () => {
        const orgId = generateId('org');
        const org = {
          id: orgId,
          name: 'Test Org',
          plan: 'pro',
          settings: {
            maxAuditsPerMonth: 50,
            auditRetentionDays: 90
          }
        };

        organizations.set(orgId, org);
        
        const retrieved = organizations.get(orgId);
        expect(retrieved.settings.maxAuditsPerMonth).toBe(50);
      });
    });

    describe('Subscriptions Store', () => {
      it('should store subscription data', () => {
        const subId = generateId('sub');
        const subscription = {
          id: subId,
          organizationId: 'org_123',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        subscriptions.set(subId, subscription);
        
        expect(subscriptions.get(subId).status).toBe('active');
      });
    });
  });

  describe('Store Relationships', () => {
    it('should link user to organization', () => {
      const orgId = generateId('org');
      const userId = generateId('user');

      organizations.set(orgId, { id: orgId, name: 'Test Org' });
      users.set(userId, { id: userId, organizationId: orgId });

      const user = users.get(userId);
      const org = organizations.get(user.organizationId);

      expect(org.name).toBe('Test Org');
    });

    it('should link audit to organization and user', () => {
      const orgId = generateId('org');
      const userId = generateId('user');
      const auditId = generateId('audit');

      organizations.set(orgId, { id: orgId });
      users.set(userId, { id: userId, organizationId: orgId });
      audits.set(auditId, { id: auditId, organizationId: orgId, createdBy: userId });

      const audit = audits.get(auditId);
      const user = users.get(audit.createdBy);
      const org = organizations.get(audit.organizationId);

      expect(user.organizationId).toBe(orgId);
      expect(org.id).toBe(orgId);
    });

    it('should link analysis results to audit', () => {
      const auditId = generateId('audit');
      const analysisId = generateId('analysis');

      audits.set(auditId, { id: auditId, status: 'completed' });
      analysisResults.set(analysisId, { id: analysisId, auditId: auditId, score: 85 });

      const results = Array.from(analysisResults.values())
        .filter(r => r.auditId === auditId);

      expect(results).toHaveLength(1);
      expect(results[0].score).toBe(85);
    });
  });

  describe('Store Performance', () => {
    it('should handle many records efficiently', () => {
      const start = Date.now();
      
      // Create 1000 records
      for (let i = 0; i < 1000; i++) {
        const id = generateId('perf');
        audits.set(id, { id, name: `Audit ${i}` });
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      expect(audits.size).toBe(1000);

      // Query performance
      const queryStart = Date.now();
      const filtered = Array.from(audits.values()).filter(a => a.name.includes('500'));
      const queryDuration = Date.now() - queryStart;
      
      expect(queryDuration).toBeLessThan(100);
    });
  });
});

describe('Collaboration Stores', () => {
  describe('Team Invites', () => {
    it('should store team invite', () => {
      const inviteId = generateId('invite');
      const invite = {
        id: inviteId,
        email: 'invited@example.com',
        organizationId: 'org_123',
        role: 'member',
        status: 'pending'
      };

      teamInvites.set(inviteId, invite);
      expect(teamInvites.get(inviteId).email).toBe('invited@example.com');
    });
  });

  describe('Audit Comments', () => {
    it('should store audit comment', () => {
      const commentId = generateId('comment');
      const comment = {
        id: commentId,
        auditId: 'audit_123',
        userId: 'user_123',
        content: 'This is a comment',
        createdAt: new Date().toISOString()
      };

      auditComments.set(commentId, comment);
      expect(auditComments.get(commentId).content).toBe('This is a comment');
    });

    it('should filter comments by audit', () => {
      const auditId = 'audit_filter_test';
      const comment1 = { id: generateId('comment'), auditId, content: 'Comment 1' };
      const comment2 = { id: generateId('comment'), auditId, content: 'Comment 2' };
      const comment3 = { id: generateId('comment'), auditId: 'other_audit', content: 'Comment 3' };

      auditComments.set(comment1.id, comment1);
      auditComments.set(comment2.id, comment2);
      auditComments.set(comment3.id, comment3);

      const auditCommentsList = Array.from(auditComments.values())
        .filter(c => c.auditId === auditId);

      expect(auditCommentsList).toHaveLength(2);
    });
  });

  describe('Audit Shares', () => {
    it('should store share settings', () => {
      const auditId = 'audit_share_test';
      const share = {
        id: generateId('share'),
        auditId,
        visibility: 'team',
        allowComments: true,
        allowDownloads: true
      };

      auditShares.set(auditId, share);
      expect(auditShares.get(auditId).visibility).toBe('team');
    });
  });

  describe('User Shares', () => {
    it('should track individual user shares', () => {
      const shareId = generateId('usershare');
      const userShare = {
        id: shareId,
        auditId: 'audit_123',
        userId: 'user_456',
        sharedBy: 'user_123',
        permission: 'view',
        viewCount: 0
      };

      auditUserShares.set(shareId, userShare);
      expect(auditUserShares.get(shareId).permission).toBe('view');
    });
  });

  describe('Comment Reactions', () => {
    it('should store reaction', () => {
      const reactionId = generateId('reaction');
      const reaction = {
        id: reactionId,
        commentId: 'comment_123',
        userId: 'user_123',
        emoji: '👍'
      };

      commentReactions.set(reactionId, reaction);
      expect(commentReactions.get(reactionId).emoji).toBe('👍');
    });
  });

  describe('Collaboration Activity', () => {
    it('should log activity', () => {
      const activityId = generateId('activity');
      const activity = {
        id: activityId,
        organizationId: 'org_123',
        activityType: 'audit_created',
        userId: 'user_123',
        description: 'Created an audit'
      };

      collaborationActivity.set(activityId, activity);
      expect(collaborationActivity.get(activityId).activityType).toBe('audit_created');
    });
  });
});

describe('Integration Stores', () => {
  describe('Integration Credentials', () => {
    it('should store credentials per organization', () => {
      const orgId = 'org_int_test';
      const credentials = {
        stripe: { accessToken: 'sk_test', refreshToken: 'rt_test' },
        quickbooks: { accessToken: 'qb_test' }
      };

      integrationCredentials.set(orgId, credentials);
      expect(integrationCredentials.get(orgId).stripe.accessToken).toBe('sk_test');
    });
  });

  describe('Tool Costs', () => {
    it('should store imported tool costs', () => {
      const orgId = 'org_cost_test';
      const costs = [
        { id: generateId('cost'), source: 'stripe', toolName: 'Slack', amount: 100 },
        { id: generateId('cost'), source: 'quickbooks', toolName: 'GitHub', amount: 50 }
      ];

      toolCosts.set(orgId, costs);
      expect(toolCosts.get(orgId)).toHaveLength(2);
    });
  });
});
