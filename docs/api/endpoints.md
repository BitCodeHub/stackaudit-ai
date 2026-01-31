# API Endpoints Reference

Complete reference for all StackAudit.ai API endpoints.

---

## Table of Contents

1. [Health Check](#health-check)
2. [Authentication](#authentication-endpoints)
3. [Audits](#audits)
4. [Analysis](#analysis)
5. [Recommendations](#recommendations)
6. [Teams](#teams)
7. [Comments](#comments)
8. [Sharing](#sharing)
9. [Organizations](#organizations)
10. [Users](#users)
11. [Billing](#billing)
12. [Integrations](#integrations)

---

## Health Check

### GET /health

Check if the service is running and healthy.

**Authentication:** None required

**Request:**
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "stackaudit-server",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Status Codes:**
- `200` — Service is healthy
- `503` — Service is unavailable

---

## Authentication Endpoints

### POST /api/auth/signup

Register a new user account.

**Authentication:** None required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Valid email address |
| `password` | string | ✅ | Min 8 characters |
| `name` | string | ✅ | User's display name |
| `organizationName` | string | ❌ | Organization name (auto-generated if omitted) |

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe",
    "organizationName": "Acme Corp"
  }'
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "organizationId": "org_xyz789",
    "role": "admin",
    "plan": "free"
  }
}
```

---

### POST /api/auth/login

Authenticate and receive a JWT token.

**Authentication:** None required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Email address |
| `password` | string | ✅ | Password |

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "organizationId": "org_xyz789",
    "role": "admin",
    "plan": "free"
  }
}
```

---

### GET /api/auth/me

Get the current authenticated user.

**Authentication:** Required

**Response (200):**
```json
{
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "organizationId": "org_xyz789",
    "role": "admin",
    "plan": "free",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "lastLoginAt": "2025-01-15T10:30:00.000Z"
  },
  "organization": {
    "id": "org_xyz789",
    "name": "Acme Corp",
    "plan": "free"
  }
}
```

---

### POST /api/auth/refresh

Refresh your JWT token.

**Authentication:** Required

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### POST /api/auth/logout

Logout the current user.

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/change-password

Change the current user's password.

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | ✅ | Current password |
| `newPassword` | string | ✅ | New password (min 8 chars) |

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Audits

### POST /api/audits

Create a new audit.

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Audit name |
| `url` | string | ❌ | URL to audit |
| `repositoryUrl` | string | ❌ | GitHub/GitLab repository URL |
| `description` | string | ❌ | Audit description |
| `tags` | array | ❌ | Tags for categorization |

**Response (201):**
```json
{
  "message": "Audit created successfully",
  "audit": {
    "id": "audit_abc123",
    "name": "Q1 Stack Audit",
    "url": "https://example.com",
    "repositoryUrl": null,
    "description": "Quarterly stack review",
    "tags": ["quarterly", "cost-review"],
    "status": "pending",
    "organizationId": "org_xyz789",
    "createdBy": "user_abc123",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "completedAt": null,
    "results": null,
    "score": null
  }
}
```

---

### GET /api/audits

List audits for your organization.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | — | Filter by status: `pending`, `analyzing`, `completed`, `failed` |
| `limit` | number | 20 | Max results (1-100) |
| `offset` | number | 0 | Pagination offset |
| `sortBy` | string | `createdAt` | Sort field: `createdAt`, `name`, `score` |
| `sortOrder` | string | `desc` | Sort order: `asc`, `desc` |
| `includeShared` | boolean | true | Include audits shared with you |

**Response (200):**
```json
{
  "audits": [
    {
      "id": "audit_abc123",
      "name": "Q1 Stack Audit",
      "status": "completed",
      "score": 78,
      "isShared": false,
      "sharedBy": null,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### GET /api/audits/:id

Get a specific audit.

**Authentication:** Required

**Response (200):**
```json
{
  "audit": {
    "id": "audit_abc123",
    "name": "Q1 Stack Audit",
    "status": "completed",
    "score": 78,
    "results": { ... },
    "createdAt": "2025-01-15T10:00:00.000Z"
  },
  "sharing": {
    "visibility": "team",
    "allowComments": true
  },
  "permissions": {
    "canEdit": true,
    "canShare": true,
    "canComment": true,
    "canDownload": true
  }
}
```

---

### PATCH /api/audits/:id

Update an audit.

**Authentication:** Required

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Updated name |
| `description` | string | Updated description |
| `tags` | array | Updated tags |

**Response (200):**
```json
{
  "message": "Audit updated",
  "audit": { ... }
}
```

---

### DELETE /api/audits/:id

Delete an audit.

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Audit deleted"
}
```

---

### GET /api/audits/:id/export

Export audit data.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | `json` | Export format: `json`, `pdf` |

**Response (200):**
```json
{
  "export": {
    "audit": { ... },
    "exportedAt": "2025-01-15T10:30:00.000Z",
    "exportedBy": "user@example.com"
  }
}
```

---

## Analysis

### POST /api/analysis/:auditId/run

Run analysis on an audit.

**Authentication:** Required

**Request Body:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `analysisTypes` | array | `["security", "performance", "cost", "compliance"]` | Types of analysis |
| `depth` | string | `standard` | Analysis depth: `quick`, `standard`, `deep` (deep requires Pro+) |

**Response (200):**
```json
{
  "message": "Analysis started",
  "analysisId": "analysis_xyz789",
  "status": "analyzing",
  "estimatedTime": "1-2 minutes"
}
```

---

### GET /api/analysis/:auditId/results

Get analysis results.

**Authentication:** Required

**Response (200):**
```json
{
  "audit": {
    "id": "audit_abc123",
    "name": "Q1 Stack Audit",
    "status": "completed",
    "score": 78
  },
  "results": {
    "id": "analysis_xyz789",
    "overallScore": 78,
    "categories": {
      "security": { "score": 85, "grade": "B", "findings": [...] },
      "performance": { "score": 82, "grade": "B", "findings": [...] },
      "cost": { "score": 68, "grade": "D", "findings": [...] },
      "compliance": { "score": 78, "grade": "C", "findings": [...] }
    },
    "techStack": {
      "frontend": ["React", "TypeScript"],
      "backend": ["Node.js", "Express"],
      "database": ["PostgreSQL"]
    },
    "recommendations": [...]
  },
  "history": [...]
}
```

---

### GET /api/analysis/:auditId/status

Get current analysis status.

**Authentication:** Required

**Response (200):**
```json
{
  "auditId": "audit_abc123",
  "status": "analyzing",
  "score": null,
  "updatedAt": "2025-01-15T10:30:00.000Z",
  "completedAt": null
}
```

---

### POST /api/analysis/:auditId/rerun

Rerun analysis (Pro/Enterprise only).

**Authentication:** Required  
**Plan:** Pro or Enterprise

**Response (200):**
```json
{
  "message": "Analysis rerun started",
  "analysisId": "analysis_new123",
  "status": "analyzing"
}
```

---

## Recommendations

### POST /api/recommendations/generate

Generate AI-powered stack recommendations.

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tools` | array | ✅ | Array of tools (each with `name` and `provider`) |
| `compliance` | array | ❌ | Required compliance standards |
| `regions` | array | ❌ | Geographic regions |
| `industry` | string | ❌ | Industry vertical |

**Response (200):**
```json
{
  "message": "Recommendations generated successfully",
  "recommendations": {
    "summary": {
      "totalRecommendations": 8,
      "potentialSavings": 5000,
      "criticalIssues": 2
    },
    "items": [...]
  }
}
```

---

### GET /api/recommendations/providers

List all available AI/LLM providers.

**Authentication:** Required

**Response (200):**
```json
{
  "total": 12,
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "description": "GPT-4, GPT-4o, o1 models",
      "pricing_tier": "premium",
      "strengths": ["quality", "ecosystem"],
      "compliance": ["SOC2", "GDPR"]
    }
  ]
}
```

---

### GET /api/recommendations/alternatives/:provider

Get alternative providers.

**Authentication:** Required

**Response (200):**
```json
{
  "provider": {
    "id": "openai",
    "name": "OpenAI",
    "pricing_tier": "premium"
  },
  "alternatives": [
    {
      "id": "anthropic",
      "name": "Anthropic",
      "pricing_tier": "premium",
      "strengths": ["safety", "reasoning"]
    }
  ]
}
```

---

### POST /api/recommendations/compare

Compare two providers head-to-head.

**Authentication:** Required

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `provider1` | string | ✅ |
| `provider2` | string | ✅ |

**Response (200):**
```json
{
  "comparison": {
    "provider1": { ... },
    "provider2": { ... },
    "differences": { ... },
    "recommendation": "..."
  }
}
```

---

### POST /api/recommendations/tool-match

Find best tools for requirements (Pro/Enterprise).

**Authentication:** Required  
**Plan:** Pro or Enterprise

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `use_cases` | array | ✅ | Use cases needed |
| `budget` | string | ❌ | Budget tier: `ultra-budget`, `budget`, `mid`, `premium`, `any` |
| `compliance` | array | ❌ | Required compliance |
| `priority` | string | ❌ | Priority: `cost`, `quality`, `speed`, `compliance` |

**Response (200):**
```json
{
  "requirements": { ... },
  "matches": [
    {
      "id": "anthropic",
      "name": "Anthropic",
      "score": 85,
      "matching_use_cases": ["coding", "chat"]
    }
  ],
  "recommendation": "We recommend Anthropic based on your requirements"
}
```

---

## Teams

### GET /api/teams/members

List team members.

**Authentication:** Required

**Response (200):**
```json
{
  "members": [
    {
      "id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "joinedAt": "2025-01-01T00:00:00.000Z",
      "lastLoginAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "total": 5
}
```

---

### PATCH /api/teams/members/:id/role

Update member role (Admin/Owner only).

**Authentication:** Required  
**Role:** Admin or Owner

**Request Body:**

| Field | Type | Values |
|-------|------|--------|
| `role` | string | `admin`, `member`, `viewer` |

---

### DELETE /api/teams/members/:id

Remove team member (Admin/Owner only).

**Authentication:** Required  
**Role:** Admin or Owner

---

### POST /api/teams/invites

Send a team invite.

**Authentication:** Required  
**Role:** Admin or Owner

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Invitee's email |
| `role` | string | ❌ | Role: `admin`, `member`, `viewer` |
| `personalMessage` | string | ❌ | Custom message (max 500 chars) |

**Response (201):**
```json
{
  "message": "Invite sent successfully",
  "invite": {
    "id": "invite_abc123",
    "email": "newuser@example.com",
    "role": "member",
    "expiresAt": "2025-01-22T10:00:00.000Z"
  },
  "inviteLink": "https://app.stackaudit.ai/invite/abc123..."
}
```

---

### GET /api/teams/activity

Get team activity feed.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default |
|-----------|------|---------|
| `limit` | number | 20 |
| `offset` | number | 0 |

**Response (200):**
```json
{
  "activities": [
    {
      "id": "activity_xyz",
      "activityType": "audit_created",
      "actorName": "John Doe",
      "description": "Created audit \"Q1 Review\"",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

## Comments

### GET /api/audits/:auditId/comments

Get comments for an audit.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `targetType` | string | Filter by target: `audit`, `tool`, `recommendation`, `result` |
| `includeReplies` | boolean | Include nested replies (default: true) |

---

### POST /api/audits/:auditId/comments

Add a comment.

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | ✅ | Comment text |
| `parentId` | string | ❌ | Parent comment ID (for replies) |
| `targetType` | string | ❌ | What the comment is on |
| `mentions` | array | ❌ | User IDs to mention |

---

### POST /api/audits/:auditId/comments/:commentId/resolve

Mark comment as resolved.

**Authentication:** Required

---

### POST /api/audits/:auditId/comments/:commentId/reactions

Add reaction to comment.

**Authentication:** Required

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `emoji` | string | ✅ |

---

## Sharing

### GET /api/audits/:auditId/sharing

Get sharing settings for an audit.

**Authentication:** Required

**Response (200):**
```json
{
  "sharing": {
    "visibility": "team",
    "allowPublicComments": false,
    "allowDownloads": true,
    "allowComments": true,
    "sharedUsers": [
      {
        "userId": "user_xyz",
        "email": "collaborator@example.com",
        "permission": "comment",
        "sharedAt": "2025-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### PATCH /api/audits/:auditId/sharing

Update sharing settings.

**Authentication:** Required

**Request Body:**

| Field | Type | Values |
|-------|------|--------|
| `visibility` | string | `private`, `team`, `organization`, `public` |
| `allowPublicComments` | boolean | — |
| `allowDownloads` | boolean | — |
| `allowComments` | boolean | — |

---

### POST /api/audits/:auditId/sharing/users

Share audit with a specific user.

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `email` | string | ✅ | — |
| `permission` | string | ❌ | `view`, `comment`, `edit` |

---

### GET /api/shared-with-me

List audits shared with you.

**Authentication:** Required

---

### GET /api/shared/:token

Access publicly shared audit.

**Authentication:** Optional

---

## Organizations

### GET /api/organizations/current

Get current organization.

**Authentication:** Required

**Response (200):**
```json
{
  "organization": {
    "id": "org_abc123",
    "name": "Acme Corp",
    "plan": "pro",
    "settings": {
      "maxAuditsPerMonth": 50,
      "auditRetentionDays": 90
    }
  },
  "stats": {
    "memberCount": 5,
    "totalAudits": 23,
    "auditsThisMonth": 4,
    "auditLimit": 50
  }
}
```

---

### PATCH /api/organizations/current

Update organization settings (Admin/Owner only).

**Authentication:** Required  
**Role:** Admin or Owner

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Organization name |
| `settings.allowedDomains` | array | Allowed email domains |
| `settings.auditRetentionDays` | number | Audit retention (7-365 based on plan) |

---

### GET /api/organizations/usage

Get organization usage statistics.

**Authentication:** Required

---

### GET /api/organizations/api-keys

List API keys (Enterprise only).

**Authentication:** Required  
**Plan:** Enterprise

---

### POST /api/organizations/api-keys

Create API key (Enterprise only).

**Authentication:** Required  
**Plan:** Enterprise

---

## Users

### GET /api/users

List users in organization (Admin only).

**Authentication:** Required  
**Role:** Admin or Owner

---

### POST /api/users/invite

Invite new user.

**Authentication:** Required  
**Role:** Admin or Owner

---

### GET /api/users/:id

Get user details.

**Authentication:** Required

---

### PATCH /api/users/:id

Update user.

**Authentication:** Required

---

### DELETE /api/users/:id

Remove user (Admin only).

**Authentication:** Required  
**Role:** Admin or Owner

---

## Billing

### GET /api/billing/subscription

Get current subscription.

**Authentication:** Required

**Response (200):**
```json
{
  "plan": "pro",
  "subscription": {
    "id": "sub_abc123",
    "status": "active",
    "currentPeriodEnd": "2025-02-15T00:00:00.000Z",
    "cancelAtPeriodEnd": false
  },
  "features": {
    "auditsPerMonth": 50,
    "users": 10,
    "retentionDays": 90,
    "deepAnalysis": true,
    "apiAccess": false,
    "prioritySupport": true
  }
}
```

---

### GET /api/billing/plans

Get available plans.

**Authentication:** Required

**Response (200):**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": { ... }
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 49,
      "yearlyPrice": 470,
      "features": { ... }
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price": 199,
      "yearlyPrice": 1910,
      "features": { ... }
    }
  ]
}
```

---

### POST /api/billing/checkout

Create Stripe checkout session (Admin/Owner only).

**Authentication:** Required  
**Role:** Admin or Owner

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `priceId` | string | ✅ |
| `successUrl` | string | ✅ |
| `cancelUrl` | string | ✅ |

---

### POST /api/billing/portal

Create Stripe customer portal session.

**Authentication:** Required  
**Role:** Admin or Owner

---

### POST /api/billing/cancel

Cancel subscription.

**Authentication:** Required  
**Role:** Admin or Owner

---

### POST /api/billing/resume

Resume cancelled subscription.

**Authentication:** Required  
**Role:** Admin or Owner

---

### GET /api/billing/invoices

Get invoice history.

**Authentication:** Required  
**Role:** Admin or Owner

---

## Integrations

### GET /api/integrations

List available integrations.

**Authentication:** Required

**Response (200):**
```json
{
  "integrations": [
    {
      "name": "stripe",
      "displayName": "Stripe",
      "description": "Import subscription data from Stripe",
      "isConnected": true,
      "lastSync": "2025-01-15T10:00:00.000Z"
    },
    {
      "name": "quickbooks",
      "displayName": "QuickBooks",
      "description": "Import expenses from QuickBooks",
      "isConnected": false,
      "lastSync": null
    }
  ]
}
```

---

### POST /api/integrations/stripe/connect

Connect Stripe integration.

**Authentication:** Required  
**Role:** Admin or Owner

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `apiKey` | string | ✅ |
| `customerId` | string | ❌ |

---

### GET /api/integrations/quickbooks/auth-url

Get QuickBooks OAuth URL.

**Authentication:** Required  
**Role:** Admin or Owner

---

### POST /api/integrations/quickbooks/callback

Handle QuickBooks OAuth callback.

**Authentication:** Required  
**Role:** Admin or Owner

---

### DELETE /api/integrations/:name

Disconnect integration.

**Authentication:** Required  
**Role:** Admin or Owner

---

### POST /api/integrations/:name/sync

Sync data from integration.

**Authentication:** Required  
**Role:** Admin or Owner

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `startDate` | string | ISO 8601 date |
| `endDate` | string | ISO 8601 date |

---

### POST /api/integrations/sync-all

Sync all connected integrations.

**Authentication:** Required  
**Role:** Admin or Owner

---

### GET /api/integrations/tool-costs

Get imported tool costs.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `source` | string | Filter by source |
| `status` | string | Filter by status |

---

### GET /api/integrations/analytics

Get billing analytics.

**Authentication:** Required

**Response (200):**
```json
{
  "totalMonthlySpend": 15000,
  "totalTools": 25,
  "byCategory": {
    "ai_ml": { "count": 5, "monthlyTotal": 8000 },
    "productivity": { "count": 10, "monthlyTotal": 4000 }
  },
  "topTools": [
    { "name": "OpenAI API", "vendor": "OpenAI", "amount": 5000 }
  ]
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `MISSING_REQUIRED` | 400 | Required field missing |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INVALID_KEY` | 401 | Invalid API key/token |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Next Steps

- [Authentication Details →](./authentication.md)
- [Data Models →](./data-models.md)
- [Webhooks →](./webhooks.md)
