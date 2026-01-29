-- Migration: 002_seed_data
-- Description: Default/seed data for StackAudit.ai
-- Created: 2025-01-15

BEGIN;

-- Check if already applied
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '002_seed_data') THEN
        RAISE EXCEPTION 'Migration 002_seed_data already applied';
    END IF;
END $$;

-- Default subscription tier limits (stored as reference, enforced in app)
CREATE TABLE IF NOT EXISTS subscription_tier_limits (
    tier subscription_tier PRIMARY KEY,
    monthly_audits INTEGER NOT NULL,
    tools_per_audit INTEGER NOT NULL,
    team_members INTEGER NOT NULL,
    history_months INTEGER NOT NULL,
    api_access BOOLEAN NOT NULL DEFAULT false,
    integrations BOOLEAN NOT NULL DEFAULT false,
    white_label BOOLEAN NOT NULL DEFAULT false,
    priority_support BOOLEAN NOT NULL DEFAULT false,
    price_monthly DECIMAL(10, 2),
    price_annual DECIMAL(10, 2)
);

INSERT INTO subscription_tier_limits (tier, monthly_audits, tools_per_audit, team_members, history_months, api_access, integrations, white_label, priority_support, price_monthly, price_annual) VALUES
    ('free', 1, 10, 1, 1, false, false, false, false, 0, 0),
    ('starter', 5, 25, 3, 6, false, true, false, false, 29, 290),
    ('professional', 20, 100, 10, 24, true, true, false, true, 99, 990),
    ('enterprise', -1, -1, -1, -1, true, true, true, true, NULL, NULL);  -- -1 = unlimited

COMMENT ON TABLE subscription_tier_limits IS 'Reference table for subscription tier limits and pricing';

-- Common tool categories with descriptions
CREATE TABLE IF NOT EXISTS tool_category_info (
    category tool_category PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50)
);

INSERT INTO tool_category_info (category, display_name, description, icon) VALUES
    ('analytics', 'Analytics & BI', 'Data analytics, business intelligence, and reporting tools', 'chart-bar'),
    ('marketing', 'Marketing', 'Marketing automation, email, social media, and advertising tools', 'megaphone'),
    ('sales', 'Sales & CRM', 'Customer relationship management and sales enablement', 'currency-dollar'),
    ('support', 'Customer Support', 'Help desk, ticketing, and customer service tools', 'support'),
    ('productivity', 'Productivity', 'Task management, notes, calendars, and collaboration', 'clipboard-check'),
    ('development', 'Development', 'Code editors, version control, CI/CD, and dev tools', 'code'),
    ('design', 'Design', 'UI/UX design, prototyping, and creative tools', 'color-swatch'),
    ('finance', 'Finance & Accounting', 'Accounting, invoicing, expense management', 'calculator'),
    ('hr', 'HR & People', 'Recruiting, payroll, and HR management', 'users'),
    ('communication', 'Communication', 'Chat, video conferencing, and team communication', 'chat'),
    ('security', 'Security', 'Identity, access management, and security tools', 'shield-check'),
    ('infrastructure', 'Infrastructure', 'Cloud hosting, monitoring, and DevOps', 'server'),
    ('data', 'Data & Storage', 'Databases, data warehouses, and file storage', 'database'),
    ('ai_ml', 'AI & Machine Learning', 'AI tools, ML platforms, and automation', 'sparkles'),
    ('other', 'Other', 'Tools that don''t fit other categories', 'dots-horizontal');

COMMENT ON TABLE tool_category_info IS 'Display information for tool categories';

-- Record migration
INSERT INTO schema_migrations (version) VALUES ('002_seed_data');

COMMIT;
