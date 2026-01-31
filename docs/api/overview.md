# API Overview

The StackAudit.ai API provides programmatic access to SaaS/AI stack auditing, analysis, team collaboration, and cost management capabilities.

---

## Base URL

```
https://api.stackaudit.ai/v1
```

For local development:
```
http://localhost:3001
```

---

## API Architecture

StackAudit follows RESTful principles:

- **JSON** for request/response bodies
- **HTTP methods** indicate actions (GET, POST, PATCH, DELETE)
- **HTTP status codes** indicate success/failure
- **JWT Bearer tokens** for authentication
- **Stateless** requests (each request is independent)

---

## Quick Start

### 1. Create an Account

```bash
curl -X POST https://api.stackaudit.ai/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "securepassword123",
    "name": "Your Name"
  }'
```

### 2. Login and Get Token

```bash
curl -X POST https://api.stackaudit.ai/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "securepassword123"
  }'
```

### 3. Create and Run an Audit

```bash
# Create audit
curl -X POST https://api.stackaudit.ai/v1/audits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Q1 Stack Review",
    "description": "Quarterly stack audit"
  }'

# Run analysis
curl -X POST https://api.stackaudit.ai/v1/analysis/AUDIT_ID/run \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Core Concepts

### 1. Authentication

StackAudit uses **JWT Bearer tokens** for API authentication. Include your token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Tokens are obtained via `/api/auth/login` and can be refreshed via `/api/auth/refresh`.

### 2. Organizations

Every user belongs to an **organization**. Organizations:
- Have a billing plan (Free, Pro, Enterprise)
- Set audit limits and retention policies
- Manage team members and permissions

### 3. Audits

An **audit** is an analysis of your SaaS/AI tool stack. Audits include:

- **Tool inventory** — All tools with costs and usage
- **Analysis results** — Security, performance, cost, compliance scores
- **Recommendations** — AI-powered optimization suggestions
- **Sharing** — Public links or user-specific access

### 4. Analysis

**Analysis** runs automated checks on your audit:

| Category | What It Checks |
|----------|----------------|
| Security | Dependencies, headers, authentication |
| Performance | Bundle size, caching, optimization |
| Cost | Resource utilization, over-provisioning |
| Compliance | Privacy policy, cookie consent, GDPR |

Analysis depth options: `quick`, `standard`, `deep` (Pro+ only)

### 5. Recommendations

The **recommendations engine** uses AI to suggest:

- Tool consolidation opportunities
- Alternative providers (with cost/quality tradeoffs)
- Compliance improvements
- Budget optimizations

### 6. Teams & Collaboration

- Invite team members with role-based access
- Comment on audits and specific findings
- React to comments with emoji
- Track all activity in the team feed

### 7. Sharing

Share audits with:
- **Team** — All organization members
- **Individual users** — Specific people with `view`, `comment`, or `edit` permissions
- **Public link** — Anyone with the link (optional commenting)

### 8. Integrations

Connect billing sources to auto-import tool costs:
- **Stripe** — Subscription data
- **QuickBooks** — Expense tracking

---

## API Endpoint Categories

| Category | Base Path | Description |
|----------|-----------|-------------|
| **Auth** | `/api/auth/*` | Signup, login, tokens |
| **Audits** | `/api/audits/*` | Create, list, manage audits |
| **Analysis** | `/api/analysis/*` | Run and retrieve analysis |
| **Recommendations** | `/api/recommendations/*` | AI-powered suggestions |
| **Teams** | `/api/teams/*` | Members, invites, activity |
| **Comments** | `/api/audits/:id/comments/*` | Audit comments & reactions |
| **Sharing** | `/api/audits/:id/sharing/*` | Sharing settings |
| **Organizations** | `/api/organizations/*` | Org settings, usage |
| **Users** | `/api/users/*` | User management |
| **Billing** | `/api/billing/*` | Plans, subscriptions |
| **Integrations** | `/api/integrations/*` | Stripe, QuickBooks |
| **Webhooks** | `/api/webhooks/*` | Stripe webhooks |

---

## Request Format

### Headers

```http
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

### Request Body

Send JSON in the request body for POST/PATCH requests:

```json
{
  "name": "My Audit",
  "description": "Description here",
  "tags": ["quarterly", "cost-review"]
}
```

---

## Response Format

### Success Response

```json
{
  "message": "Audit created successfully",
  "audit": {
    "id": "audit_abc123",
    "name": "My Audit",
    "status": "pending"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name is required",
    "details": {
      "field": "name"
    }
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad request (invalid input) |
| `401` | Unauthorized (invalid/missing token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not found |
| `409` | Conflict (resource exists) |
| `429` | Rate limit exceeded |
| `500` | Server error |

---

## Rate Limiting

| Plan | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 10 | 100 |
| Pro | 60 | 1,000 |
| Enterprise | 300 | 10,000 |

Rate limit headers included in responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705312800
```

---

## Pagination

List endpoints support pagination:

```bash
GET /api/audits?limit=20&offset=40
```

Response includes pagination metadata:
```json
{
  "audits": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
```

---

## Plan Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Audits/month | 3 | 50 | 500 |
| Team members | 1 | 10 | 100 |
| Retention | 7 days | 90 days | 365 days |
| Deep analysis | ❌ | ✅ | ✅ |
| API keys | ❌ | ❌ | ✅ |
| Integrations | ❌ | ✅ | ✅ |
| Priority support | ❌ | ✅ | ✅ |
| SSO/SAML | ❌ | ❌ | ✅ |

---

## SDKs & Libraries

### Official SDKs (Coming Soon)

```bash
# Node.js
npm install @stackaudit/sdk

# Python
pip install stackaudit
```

### Node.js Example

```javascript
// Using fetch
const response = await fetch('https://api.stackaudit.ai/v1/audits', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Q1 Stack Review'
  })
});

const { audit } = await response.json();
console.log(audit.id);
```

### Python Example

```python
import requests

response = requests.post(
    'https://api.stackaudit.ai/v1/audits',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    },
    json={'name': 'Q1 Stack Review'}
)

audit = response.json()['audit']
print(audit['id'])
```

---

## Local Development

For local development:

```bash
# Start the server
cd server
npm install
npm run dev

# Server runs at http://localhost:3001
```

Environment variables:
```bash
PORT=3001
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...      # Optional
STRIPE_WEBHOOK_SECRET=whsec_...    # Optional
```

---

## Next Steps

- [Authentication →](./authentication.md)
- [Complete Endpoint Reference →](./endpoints.md)
- [Data Models →](./data-models.md)
- [Webhooks →](./webhooks.md)
