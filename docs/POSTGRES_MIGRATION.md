# PostgreSQL Migration Plan for StackAudit

**Created:** January 2025  
**Status:** Ready for Implementation  
**Priority:** CRITICAL - Data loss on every restart/deploy  
**Estimated Effort:** 16-24 hours

---

## 1. Executive Summary

### The Problem
StackAudit currently uses in-memory JavaScript `Map()` objects for all data storage. This means:
- ❌ All user data is lost on server restart
- ❌ All audits are lost on deployment
- ❌ Cannot scale horizontally (no shared state)
- ❌ No data durability or backup capability

### The Solution
Migrate to PostgreSQL with:
- ✅ Persistent data storage
- ✅ ACID compliance
- ✅ Horizontal scaling capability
- ✅ Proper indexing for performance
- ✅ Connection pooling for efficiency

---

## 2. Current Data Structures

### Primary Stores (14 total)

```javascript
// From: server/src/data/store.js

// Core entities
const users = new Map();           // User accounts
const organizations = new Map();   // Organization/company records
const audits = new Map();          // Stack audits
const analysisResults = new Map(); // AI analysis results
const subscriptions = new Map();   // Stripe subscriptions

// Team collaboration
const teamInvites = new Map();           // Pending team invites
const auditComments = new Map();         // Comments on audits
const auditShares = new Map();           // Audit visibility settings
const auditUserShares = new Map();       // Individual user shares
const commentReactions = new Map();      // Reactions to comments
const collaborationActivity = new Map(); // Activity feed
const notificationPreferences = new Map(); // User notification settings

// Integrations
const integrationCredentials = new Map(); // OAuth tokens per org
const toolCosts = new Map();              // Imported cost data
```

### Data Structure Analysis

#### Users
```javascript
{
  id: 'user_demo_123',
  email: 'demo@stackaudit.ai',
  passwordHash: '$2a$10$...',
  name: 'Demo User',
  organizationId: 'org_demo_123',
  role: 'admin',  // admin, member, viewer
  plan: 'pro',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastLoginAt: null
}
```

#### Organizations
```javascript
{
  id: 'org_demo_123',
  name: 'Demo Company',
  plan: 'pro',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  settings: {
    allowedDomains: [],
    maxAuditsPerMonth: 50,
    auditRetentionDays: 90
  }
}
```

#### Audits
```javascript
{
  id: 'audit_uuid',
  organizationId: 'org_id',
  userId: 'user_id',
  name: 'Q1 2025 Stack Audit',
  stackData: { /* large JSON object */ },
  status: 'completed',  // pending, analyzing, completed, failed
  createdAt: '2025-01-01T00:00:00.000Z',
  completedAt: '2025-01-01T00:05:00.000Z'
}
```

#### Analysis Results
```javascript
{
  id: 'analysis_uuid',
  auditId: 'audit_id',
  summary: { /* AI-generated summary */ },
  recommendations: [ /* array of recommendations */ ],
  costAnalysis: { /* cost breakdown */ },
  riskAssessment: { /* risk scores */ },
  createdAt: '2025-01-01T00:05:00.000Z'
}
```

---

## 3. PostgreSQL Schema Design

### 3.1 Core Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================
CREATE TABLE organizations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_stripe_customer ON organizations(stripe_customer_id);
CREATE INDEX idx_organizations_plan ON organizations(plan);

-- ============================================================================
-- USERS
-- ============================================================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'member',
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);

-- ============================================================================
-- AUDITS
-- ============================================================================
CREATE TABLE audits (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    stack_data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_audits_organization ON audits(organization_id);
CREATE INDEX idx_audits_user ON audits(user_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_created ON audits(created_at DESC);

-- ============================================================================
-- ANALYSIS RESULTS
-- ============================================================================
CREATE TABLE analysis_results (
    id VARCHAR(50) PRIMARY KEY,
    audit_id VARCHAR(50) REFERENCES audits(id) ON DELETE CASCADE,
    summary JSONB,
    recommendations JSONB,
    cost_analysis JSONB,
    risk_assessment JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_audit ON analysis_results(audit_id);

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE subscriptions (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(100),
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
```

### 3.2 Collaboration Tables

```sql
-- ============================================================================
-- TEAM INVITES
-- ============================================================================
CREATE TABLE team_invites (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    invited_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invites_org ON team_invites(organization_id);
CREATE INDEX idx_invites_email ON team_invites(email);
CREATE INDEX idx_invites_token ON team_invites(token);

-- ============================================================================
-- AUDIT COMMENTS
-- ============================================================================
CREATE TABLE audit_comments (
    id VARCHAR(50) PRIMARY KEY,
    audit_id VARCHAR(50) REFERENCES audits(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    parent_id VARCHAR(50) REFERENCES audit_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_audit ON audit_comments(audit_id);
CREATE INDEX idx_comments_user ON audit_comments(user_id);
CREATE INDEX idx_comments_parent ON audit_comments(parent_id);

-- ============================================================================
-- AUDIT SHARES
-- ============================================================================
CREATE TABLE audit_shares (
    id VARCHAR(50) PRIMARY KEY,
    audit_id VARCHAR(50) REFERENCES audits(id) ON DELETE CASCADE,
    visibility VARCHAR(50) DEFAULT 'private',  -- private, organization, public
    share_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(audit_id)
);

CREATE INDEX idx_shares_audit ON audit_shares(audit_id);
CREATE INDEX idx_shares_token ON audit_shares(share_token);

-- ============================================================================
-- AUDIT USER SHARES
-- ============================================================================
CREATE TABLE audit_user_shares (
    id VARCHAR(50) PRIMARY KEY,
    audit_id VARCHAR(50) REFERENCES audits(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(50) DEFAULT 'view',  -- view, comment, edit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(audit_id, user_id)
);

CREATE INDEX idx_user_shares_audit ON audit_user_shares(audit_id);
CREATE INDEX idx_user_shares_user ON audit_user_shares(user_id);

-- ============================================================================
-- COMMENT REACTIONS
-- ============================================================================
CREATE TABLE comment_reactions (
    id VARCHAR(50) PRIMARY KEY,
    comment_id VARCHAR(50) REFERENCES audit_comments(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL,  -- emoji or reaction type
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id, reaction)
);

CREATE INDEX idx_reactions_comment ON comment_reactions(comment_id);

-- ============================================================================
-- COLLABORATION ACTIVITY
-- ============================================================================
CREATE TABLE collaboration_activity (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,
    audit_id VARCHAR(50) REFERENCES audits(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,  -- comment_added, audit_shared, etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_org ON collaboration_activity(organization_id);
CREATE INDEX idx_activity_audit ON collaboration_activity(audit_id);
CREATE INDEX idx_activity_created ON collaboration_activity(created_at DESC);

-- ============================================================================
-- NOTIFICATION PREFERENCES
-- ============================================================================
CREATE TABLE notification_preferences (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_comments BOOLEAN DEFAULT TRUE,
    email_mentions BOOLEAN DEFAULT TRUE,
    email_shares BOOLEAN DEFAULT TRUE,
    email_weekly_digest BOOLEAN DEFAULT TRUE,
    in_app_comments BOOLEAN DEFAULT TRUE,
    in_app_mentions BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_prefs_user ON notification_preferences(user_id);
```

### 3.3 Integrations Tables

```sql
-- ============================================================================
-- INTEGRATION CREDENTIALS
-- ============================================================================
CREATE TABLE integration_credentials (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,  -- stripe, quickbooks, xero, etc.
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    config JSONB DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, provider)
);

CREATE INDEX idx_integration_org ON integration_credentials(organization_id);
CREATE INDEX idx_integration_provider ON integration_credentials(provider);

-- ============================================================================
-- TOOL COSTS
-- ============================================================================
CREATE TABLE tool_costs (
    id VARCHAR(50) PRIMARY KEY,
    organization_id VARCHAR(50) REFERENCES organizations(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,  -- stripe, quickbooks, manual
    tool_name VARCHAR(255) NOT NULL,
    vendor VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    billing_period_start DATE,
    billing_period_end DATE,
    metadata JSONB DEFAULT '{}',
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tool_costs_org ON tool_costs(organization_id);
CREATE INDEX idx_tool_costs_source ON tool_costs(source);
CREATE INDEX idx_tool_costs_period ON tool_costs(billing_period_start, billing_period_end);
```

---

## 4. Migration Implementation

### 4.1 Install Dependencies

```bash
cd /Users/jimmysmacstudio/clawd/projects/stackaudit/server
npm install pg pg-pool
```

### 4.2 Database Configuration

Create `server/src/config/database.js`:

```javascript
const { Pool } = require('pg');

// Connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Connection timeout
});

// Test connection on startup
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
  process.exit(-1);
});

// Helper for transactions
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, transaction };
```

### 4.3 Migration Script

Create `server/src/scripts/migrate.js`:

```javascript
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  console.log('🚀 Starting PostgreSQL migration...');
  
  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '../migrations/001_initial_schema.sql'),
    'utf8'
  );
  
  try {
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

runMigration();
```

### 4.4 Repository Pattern Implementation

Create `server/src/repositories/userRepository.js`:

```javascript
const { pool } = require('../config/database');

class UserRepository {
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  async create(user) {
    const { rows } = await pool.query(
      `INSERT INTO users (id, email, password_hash, name, organization_id, role, plan, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [user.id, user.email, user.passwordHash, user.name, user.organizationId, user.role, user.plan]
    );
    return rows[0];
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      fields.push(`${snakeKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async findByOrganization(organizationId) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE organization_id = $1 ORDER BY created_at',
      [organizationId]
    );
    return rows;
  }
}

module.exports = new UserRepository();
```

Create `server/src/repositories/auditRepository.js`:

```javascript
const { pool } = require('../config/database');

class AuditRepository {
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM audits WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async findByOrganization(organizationId, { limit = 50, offset = 0, status } = {}) {
    let query = 'SELECT * FROM audits WHERE organization_id = $1';
    const params = [organizationId];
    let paramCount = 2;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  }

  async create(audit) {
    const { rows } = await pool.query(
      `INSERT INTO audits (id, organization_id, user_id, name, stack_data, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [audit.id, audit.organizationId, audit.userId, audit.name, JSON.stringify(audit.stackData), audit.status || 'pending']
    );
    return rows[0];
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
      if (key === 'stackData') {
        fields.push(`stack_data = $${paramCount}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE audits SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return rows[0];
  }

  async delete(id) {
    await pool.query('DELETE FROM audits WHERE id = $1', [id]);
  }

  async countByOrganization(organizationId, since) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as count FROM audits 
       WHERE organization_id = $1 AND created_at >= $2`,
      [organizationId, since]
    );
    return parseInt(rows[0].count);
  }

  async getWithAnalysis(id) {
    const { rows } = await pool.query(
      `SELECT a.*, ar.summary, ar.recommendations, ar.cost_analysis, ar.risk_assessment
       FROM audits a
       LEFT JOIN analysis_results ar ON ar.audit_id = a.id
       WHERE a.id = $1`,
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new AuditRepository();
```

### 4.5 Update Existing Routes

Example update for `server/src/routes/auth.js`:

```javascript
// BEFORE (in-memory)
const { users, generateId } = require('../data/store');
const user = users.get(userId);

// AFTER (PostgreSQL)
const userRepository = require('../repositories/userRepository');
const user = await userRepository.findById(userId);
```

---

## 5. Render PostgreSQL Setup

### 5.1 Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name:** `stackaudit-db`
   - **Database:** `stackaudit`
   - **User:** `stackaudit_user`
   - **Region:** Same as your web service (Oregon)
   - **PostgreSQL Version:** 16
   - **Plan:** Free (for development) or Starter ($7/mo for production)

4. Copy the **Internal Database URL** (for same-region services)

### 5.2 Environment Variables

Add to your Render web service:

```env
DATABASE_URL=postgres://stackaudit_user:PASSWORD@HOST:5432/stackaudit
NODE_ENV=production
```

### 5.3 Run Migrations on Deploy

Update `package.json`:

```json
{
  "scripts": {
    "start": "node src/index.js",
    "migrate": "node src/scripts/migrate.js",
    "build": "npm run migrate"
  }
}
```

In Render, set **Build Command** to: `npm install && npm run build`

---

## 6. Connection Pooling Configuration

### Render-Optimized Settings

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  
  // Render Free tier has limited connections
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  
  // Close idle connections quickly on free tier
  idleTimeoutMillis: 10000,
  
  // Fail fast on connection issues
  connectionTimeoutMillis: 5000,
  
  // Keep connections alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});
```

### Health Check Endpoint

```javascript
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});
```

---

## 7. Data Migration Script

For migrating existing demo data:

```javascript
// server/src/scripts/seed.js
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  const orgId = 'org_demo_123';
  const userId = 'user_demo_123';
  
  // Create demo organization
  await pool.query(`
    INSERT INTO organizations (id, name, plan, settings, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (id) DO NOTHING
  `, [
    orgId,
    'Demo Company',
    'pro',
    JSON.stringify({
      allowedDomains: [],
      maxAuditsPerMonth: 50,
      auditRetentionDays: 90
    })
  ]);

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  await pool.query(`
    INSERT INTO users (id, email, password_hash, name, organization_id, role, plan, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    ON CONFLICT (id) DO NOTHING
  `, [
    userId,
    'demo@stackaudit.ai',
    passwordHash,
    'Demo User',
    orgId,
    'admin',
    'pro'
  ]);

  console.log('✅ Seed data created');
  await pool.end();
};

seed();
```

---

## 8. Rollback Plan

### 8.1 Feature Flags

```javascript
// config/features.js
module.exports = {
  USE_POSTGRES: process.env.USE_POSTGRES === 'true',
};

// In your code
const { USE_POSTGRES } = require('../config/features');
const storage = USE_POSTGRES 
  ? require('../repositories/userRepository')
  : require('../data/store');
```

### 8.2 Rollback Steps

1. Set `USE_POSTGRES=false` in Render environment
2. Redeploy the service
3. Service falls back to in-memory storage
4. Investigate and fix PostgreSQL issues
5. Re-enable with `USE_POSTGRES=true`

### 8.3 Database Backup

```bash
# Export data before major changes
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore if needed
psql $DATABASE_URL < backup_20250129.sql
```

---

## 9. Implementation Checklist

### Phase 1: Foundation (4-6 hours)
- [ ] Install pg and pg-pool dependencies
- [ ] Create database configuration
- [ ] Create migration SQL file
- [ ] Set up Render PostgreSQL database
- [ ] Configure environment variables

### Phase 2: Repositories (6-8 hours)
- [ ] Create userRepository
- [ ] Create organizationRepository
- [ ] Create auditRepository
- [ ] Create analysisResultRepository
- [ ] Create subscriptionRepository
- [ ] Create collaboration repositories
- [ ] Create integration repositories

### Phase 3: Route Updates (4-6 hours)
- [ ] Update auth routes
- [ ] Update audit routes
- [ ] Update billing routes
- [ ] Update team collaboration routes
- [ ] Update integration routes

### Phase 4: Testing & Deployment (2-4 hours)
- [ ] Test locally with PostgreSQL
- [ ] Run migrations on Render
- [ ] Deploy and verify
- [ ] Seed demo data
- [ ] Monitor for issues

---

## 10. Files to Create/Modify

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # NEW - Pool configuration
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # NEW - Schema
│   ├── repositories/
│   │   ├── userRepository.js    # NEW
│   │   ├── organizationRepository.js  # NEW
│   │   ├── auditRepository.js   # NEW
│   │   └── ...                  # NEW - All repositories
│   ├── scripts/
│   │   ├── migrate.js           # NEW - Run migrations
│   │   └── seed.js              # NEW - Seed data
│   ├── routes/
│   │   ├── auth.js              # MODIFY
│   │   ├── audits.js            # MODIFY
│   │   └── ...                  # MODIFY - All routes
│   └── data/
│       └── store.js             # KEEP - For rollback
├── package.json                 # MODIFY - Add pg dependencies
└── .env                         # MODIFY - Add DATABASE_URL
```

---

## 11. Cost Estimate

### Render PostgreSQL Pricing

| Plan | Price | Connections | Storage | Best For |
|------|-------|-------------|---------|----------|
| Free | $0/mo | 1 | 1GB | Development |
| Starter | $7/mo | 25 | 1GB | Small production |
| Standard | $20/mo | 75 | 16GB | Growing apps |
| Pro | $85/mo | 150 | 64GB | High traffic |

**Recommendation:** Start with Free for testing, upgrade to Starter ($7/mo) for production.

---

## 12. Success Metrics

After migration, verify:
- [ ] Data persists across server restarts
- [ ] Data persists across deployments
- [ ] Login/signup works correctly
- [ ] Audits are created and retrieved
- [ ] Analysis results are stored
- [ ] Team collaboration features work
- [ ] Response times are acceptable (<200ms)
- [ ] No connection pool exhaustion

---

**Ready to implement. This plan provides everything needed for a clean PostgreSQL migration.**
