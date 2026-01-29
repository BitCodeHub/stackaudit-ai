-- Rollback: 001_initial_schema
-- WARNING: This will DROP ALL DATA. Use with extreme caution.

BEGIN;

-- Drop views
DROP VIEW IF EXISTS vw_monthly_usage;
DROP VIEW IF EXISTS vw_organization_stats;

-- Drop triggers
DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
DROP TRIGGER IF EXISTS update_recommendations_updated_at ON recommendations;
DROP TRIGGER IF EXISTS update_audit_results_updated_at ON audit_results;
DROP TRIGGER IF EXISTS update_audit_tools_updated_at ON audit_tools;
DROP TRIGGER IF EXISTS update_audits_updated_at ON audits;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_organization_members_updated_at ON organization_members;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;

DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS integrations;
DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS usage_logs;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS audit_results;
DROP TABLE IF EXISTS audit_tools;
DROP TABLE IF EXISTS audits;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;

-- Drop enums
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS recommendation_type;
DROP TYPE IF EXISTS recommendation_priority;
DROP TYPE IF EXISTS tool_category;
DROP TYPE IF EXISTS audit_status;
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS subscription_tier;

-- Remove migration record
DELETE FROM schema_migrations WHERE version = '001_initial_schema';

COMMIT;
