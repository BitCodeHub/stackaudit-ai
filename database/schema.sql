-- StackAudit.ai PostgreSQL Schema
-- Database Architecture for SaaS Tool Stack Auditing Platform
-- Version: 1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'paused');
CREATE TYPE audit_status AS ENUM ('pending', 'running', 'completed', 'failed', 'canceled');
CREATE TYPE tool_category AS ENUM (
    'analytics', 'marketing', 'sales', 'support', 'productivity',
    'development', 'design', 'finance', 'hr', 'communication',
    'security', 'infrastructure', 'data', 'ai_ml', 'other'
);
CREATE TYPE recommendation_priority AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE recommendation_type AS ENUM (
    'consolidate', 'replace', 'upgrade', 'downgrade', 'remove',
    'add', 'integrate', 'security', 'cost_optimization', 'compliance'
);
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_domain ON organizations(domain) WHERE deleted_at IS NULL;

-- =============================================================================
-- USERS
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMPTZ,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en',
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- =============================================================================
-- ORGANIZATION MEMBERSHIPS (User <-> Organization relationship)
-- =============================================================================

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    
    -- Stripe integration
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    
    -- Billing details
    billing_email VARCHAR(255),
    billing_name VARCHAR(255),
    billing_address JSONB,
    
    -- Subscription periods
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    -- Usage limits (overrides tier defaults if set)
    audit_limit INTEGER,           -- Monthly audit limit
    tool_limit INTEGER,            -- Tools per audit limit
    user_limit INTEGER,            -- Team members limit
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =============================================================================
-- AUDITS
-- =============================================================================

CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status audit_status NOT NULL DEFAULT 'pending',
    
    -- Audit configuration
    config JSONB DEFAULT '{}',
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Summary scores (populated on completion)
    total_tools INTEGER DEFAULT 0,
    total_monthly_cost DECIMAL(12, 2) DEFAULT 0,
    overlap_score DECIMAL(5, 2),        -- 0-100 score for feature overlap
    efficiency_score DECIMAL(5, 2),      -- 0-100 overall efficiency
    security_score DECIMAL(5, 2),        -- 0-100 security posture
    potential_savings DECIMAL(12, 2),    -- Estimated monthly savings
    
    -- AI analysis
    ai_summary TEXT,
    ai_insights JSONB DEFAULT '[]',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_audits_org ON audits(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_audits_status ON audits(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_audits_created_by ON audits(created_by);
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);

-- =============================================================================
-- AUDIT TOOLS (Tools being audited in each audit)
-- =============================================================================

CREATE TABLE audit_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    
    -- Tool identification
    name VARCHAR(255) NOT NULL,
    vendor VARCHAR(255),
    category tool_category NOT NULL DEFAULT 'other',
    website_url TEXT,
    logo_url TEXT,
    
    -- Subscription/cost details
    monthly_cost DECIMAL(10, 2),
    annual_cost DECIMAL(12, 2),
    billing_cycle VARCHAR(50),          -- monthly, annual, per-seat, usage-based
    seats_purchased INTEGER,
    seats_used INTEGER,
    
    -- Usage metrics
    active_users INTEGER,
    last_activity_at TIMESTAMPTZ,
    usage_frequency VARCHAR(50),        -- daily, weekly, monthly, rarely
    usage_data JSONB DEFAULT '{}',
    
    -- Features and capabilities
    features JSONB DEFAULT '[]',        -- Array of feature strings
    integrations JSONB DEFAULT '[]',    -- Connected tools/integrations
    
    -- Contract details
    contract_start_date DATE,
    contract_end_date DATE,
    renewal_date DATE,
    cancellation_notice_days INTEGER,
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tools_audit ON audit_tools(audit_id);
CREATE INDEX idx_audit_tools_category ON audit_tools(category);
CREATE INDEX idx_audit_tools_name ON audit_tools(name);
CREATE INDEX idx_audit_tools_cost ON audit_tools(monthly_cost DESC);

-- =============================================================================
-- AUDIT RESULTS (Analysis results for each tool)
-- =============================================================================

CREATE TABLE audit_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    audit_tool_id UUID NOT NULL REFERENCES audit_tools(id) ON DELETE CASCADE,
    
    -- Scores (0-100)
    utilization_score DECIMAL(5, 2),     -- How well is it being used
    value_score DECIMAL(5, 2),           -- Value for money
    overlap_score DECIMAL(5, 2),         -- Feature overlap with other tools
    risk_score DECIMAL(5, 2),            -- Security/compliance risk
    overall_score DECIMAL(5, 2),         -- Composite score
    
    -- Analysis details
    overlapping_tools JSONB DEFAULT '[]', -- IDs of tools with feature overlap
    overlap_features JSONB DEFAULT '[]',  -- Features that overlap
    unique_features JSONB DEFAULT '[]',   -- Features unique to this tool
    
    -- Cost analysis
    cost_per_user DECIMAL(10, 2),
    cost_per_active_user DECIMAL(10, 2),
    estimated_value DECIMAL(10, 2),
    roi_score DECIMAL(5, 2),
    
    -- AI analysis
    ai_analysis TEXT,
    ai_verdict VARCHAR(100),             -- keep, review, replace, remove
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_results_audit ON audit_results(audit_id);
CREATE INDEX idx_audit_results_tool ON audit_results(audit_tool_id);
CREATE INDEX idx_audit_results_overall_score ON audit_results(overall_score);

-- =============================================================================
-- RECOMMENDATIONS
-- =============================================================================

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    audit_tool_id UUID REFERENCES audit_tools(id) ON DELETE SET NULL,
    
    type recommendation_type NOT NULL,
    priority recommendation_priority NOT NULL DEFAULT 'medium',
    
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT,
    
    -- Impact estimates
    estimated_savings DECIMAL(10, 2),
    estimated_savings_percent DECIMAL(5, 2),
    implementation_effort VARCHAR(50),   -- low, medium, high
    time_to_implement VARCHAR(100),      -- e.g., "2-4 weeks"
    
    -- Suggested alternatives (for replace recommendations)
    alternatives JSONB DEFAULT '[]',     -- [{name, url, price, features}]
    
    -- Action tracking
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, dismissed
    actioned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    actioned_at TIMESTAMPTZ,
    action_notes TEXT,
    
    -- AI confidence
    confidence_score DECIMAL(5, 2),       -- How confident is AI in this rec
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendations_audit ON recommendations(audit_id);
CREATE INDEX idx_recommendations_tool ON recommendations(audit_tool_id);
CREATE INDEX idx_recommendations_type ON recommendations(type);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
CREATE INDEX idx_recommendations_status ON recommendations(status);

-- =============================================================================
-- USAGE LOGS (API and feature usage tracking)
-- =============================================================================

CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Event details
    event_type VARCHAR(100) NOT NULL,    -- audit_created, tool_added, api_call, etc.
    event_category VARCHAR(50),          -- audit, api, report, integration
    resource_type VARCHAR(50),           -- audit, tool, recommendation
    resource_id UUID,
    
    -- Request details (for API calls)
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    
    -- Usage metrics
    tokens_used INTEGER,                 -- AI tokens consumed
    credits_used DECIMAL(10, 4),
    
    -- Additional context
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioning by month for efficient querying and cleanup
CREATE INDEX idx_usage_logs_org ON usage_logs(organization_id);
CREATE INDEX idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_event_type ON usage_logs(event_type);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX idx_usage_logs_org_created ON usage_logs(organization_id, created_at DESC);

-- =============================================================================
-- API KEYS (for programmatic access)
-- =============================================================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,     -- First chars for identification (sa_live_xxx)
    key_hash VARCHAR(255) NOT NULL,      -- Hashed key (never store plaintext)
    
    scopes JSONB DEFAULT '["read"]',     -- Permissions: read, write, admin
    
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- =============================================================================
-- INTEGRATIONS (Connected services for auto-discovery)
-- =============================================================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    connected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    provider VARCHAR(100) NOT NULL,       -- google_workspace, microsoft_365, okta, etc.
    provider_account_id VARCHAR(255),
    
    -- OAuth tokens (encrypted)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    
    scopes JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',  -- active, expired, revoked, error
    
    last_sync_at TIMESTAMPTZ,
    sync_error TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE UNIQUE INDEX idx_integrations_org_provider ON integrations(organization_id, provider);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at BEFORE UPDATE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_tools_updated_at BEFORE UPDATE ON audit_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_results_updated_at BEFORE UPDATE ON audit_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Organization dashboard stats
CREATE VIEW vw_organization_stats AS
SELECT 
    o.id AS organization_id,
    o.name AS organization_name,
    s.tier AS subscription_tier,
    s.status AS subscription_status,
    COUNT(DISTINCT om.user_id) AS member_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL) AS total_audits,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed' AND a.deleted_at IS NULL) AS completed_audits,
    COALESCE(SUM(a.potential_savings) FILTER (WHERE a.status = 'completed'), 0) AS total_potential_savings
FROM organizations o
LEFT JOIN subscriptions s ON s.organization_id = o.id
LEFT JOIN organization_members om ON om.organization_id = o.id
LEFT JOIN audits a ON a.organization_id = o.id
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, s.tier, s.status;

-- Monthly usage summary
CREATE VIEW vw_monthly_usage AS
SELECT 
    organization_id,
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) FILTER (WHERE event_type = 'audit_created') AS audits_created,
    COUNT(*) FILTER (WHERE event_category = 'api') AS api_calls,
    COALESCE(SUM(tokens_used), 0) AS total_tokens,
    COALESCE(SUM(credits_used), 0) AS total_credits
FROM usage_logs
GROUP BY organization_id, DATE_TRUNC('month', created_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =============================================================================

-- Enable RLS on key tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your auth strategy
-- Example policy (Supabase/PostgREST style):
-- CREATE POLICY "Users can view own organization data" ON audits
--     FOR SELECT USING (
--         organization_id IN (
--             SELECT organization_id FROM organization_members
--             WHERE user_id = auth.uid()
--         )
--     );

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE organizations IS 'Companies/teams using StackAudit';
COMMENT ON TABLE users IS 'Individual user accounts';
COMMENT ON TABLE organization_members IS 'User membership in organizations with roles';
COMMENT ON TABLE subscriptions IS 'Billing subscriptions tied to organizations';
COMMENT ON TABLE audits IS 'Tool stack audit sessions';
COMMENT ON TABLE audit_tools IS 'Individual tools being analyzed in an audit';
COMMENT ON TABLE audit_results IS 'AI-generated analysis results for each tool';
COMMENT ON TABLE recommendations IS 'Actionable recommendations from audits';
COMMENT ON TABLE usage_logs IS 'Event and API usage tracking for billing/analytics';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access';
COMMENT ON TABLE integrations IS 'Connected third-party services for tool discovery';
