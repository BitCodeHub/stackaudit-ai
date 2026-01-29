-- Migration: 001_initial_schema
-- Description: Initial database schema for StackAudit.ai
-- Created: 2025-01-15
-- 
-- Run: psql -d stackaudit -f 001_initial_schema.sql

BEGIN;

-- Track migration version
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Check if already applied
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '001_initial_schema') THEN
        RAISE EXCEPTION 'Migration 001_initial_schema already applied';
    END IF;
END $$;

-- Import main schema
\i ../schema.sql

-- Record migration
INSERT INTO schema_migrations (version) VALUES ('001_initial_schema');

COMMIT;
