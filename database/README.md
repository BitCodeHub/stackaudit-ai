# StackAudit.ai Database

PostgreSQL database schema for the StackAudit.ai SaaS platform.

## Schema Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  organizations  │────<│ organization_members │>────│    users    │
└────────┬────────┘     └──────────────────────┘     └─────────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
    ▼         ▼              ▼              ▼
┌───────┐ ┌───────────┐ ┌──────────┐ ┌─────────────┐
│audits │ │subscript- │ │usage_logs│ │integrations │
└───┬───┘ │   ions    │ └──────────┘ └─────────────┘
    │     └───────────┘
    │
    ├──────────────┐
    │              │
    ▼              ▼
┌───────────┐  ┌─────────────────┐
│audit_tools│  │ recommendations │
└─────┬─────┘  └─────────────────┘
      │
      ▼
┌─────────────┐
│audit_results│
└─────────────┘
```

## Tables

| Table | Description |
|-------|-------------|
| `organizations` | Companies/teams using StackAudit |
| `users` | Individual user accounts |
| `organization_members` | User <-> Organization membership with roles |
| `subscriptions` | Billing subscriptions (Stripe integration) |
| `audits` | Tool stack audit sessions |
| `audit_tools` | Tools being analyzed in each audit |
| `audit_results` | AI analysis results per tool |
| `recommendations` | Actionable recommendations from audits |
| `usage_logs` | API/feature usage for billing & analytics |
| `api_keys` | API keys for programmatic access |
| `integrations` | Connected services (Google, Microsoft, Okta) |

## Key Features

- **UUIDs** for all primary keys (security, distribution-ready)
- **Soft deletes** on critical tables (`deleted_at` column)
- **JSONB columns** for flexible metadata and settings
- **Comprehensive indexes** for common query patterns
- **Row Level Security (RLS)** enabled for multi-tenant isolation
- **Automatic timestamps** via triggers

## Quick Start

```bash
# Create database
createdb stackaudit_dev

# Run schema
psql -d stackaudit_dev -f schema.sql

# Run migrations
psql -d stackaudit_dev -f migrations/001_initial_schema.sql
psql -d stackaudit_dev -f migrations/002_seed_data.sql
```

## Environment Setup

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/stackaudit_dev
```

## Subscription Tiers

| Tier | Audits/mo | Tools/audit | Team | Price |
|------|-----------|-------------|------|-------|
| Free | 1 | 10 | 1 | $0 |
| Starter | 5 | 25 | 3 | $29/mo |
| Professional | 20 | 100 | 10 | $99/mo |
| Enterprise | Unlimited | Unlimited | Unlimited | Custom |

## Migrations

See [migrations/README.md](./migrations/README.md) for migration documentation.
