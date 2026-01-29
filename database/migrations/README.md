# StackAudit.ai Database Migrations

## Overview

This directory contains SQL migrations for the StackAudit.ai database schema.

## Migration Naming Convention

```
{version}_{description}.sql
```

- `version`: 3-digit zero-padded number (001, 002, 003...)
- `description`: snake_case description of changes

## Migrations

| Version | Description | Date |
|---------|-------------|------|
| 001 | Initial schema | 2025-01-15 |
| 002 | Seed data | 2025-01-15 |

## Running Migrations

### Development

```bash
# Run all migrations
for f in migrations/*.sql; do psql -d stackaudit_dev -f "$f"; done

# Run specific migration
psql -d stackaudit_dev -f migrations/001_initial_schema.sql
```

### Production (with safety checks)

```bash
# Always backup first
pg_dump stackaudit_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration in transaction
psql -d stackaudit_prod -1 -f migrations/XXX_migration.sql
```

## Creating New Migrations

1. Create new file: `{next_version}_{description}.sql`
2. Start with transaction: `BEGIN;`
3. Check if already applied (see existing migrations)
4. Make schema changes
5. Record in `schema_migrations` table
6. End with: `COMMIT;`

## Rollback

Each migration should have a corresponding rollback file:

```
{version}_{description}_rollback.sql
```

## Schema Tracking

The `schema_migrations` table tracks applied migrations:

```sql
SELECT * FROM schema_migrations ORDER BY applied_at;
```
