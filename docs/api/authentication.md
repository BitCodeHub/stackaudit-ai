# Authentication

Secure your StackAudit.ai API access with JWT tokens.

---

## Overview

StackAudit.ai uses **JWT (JSON Web Tokens)** for authentication. Obtain a token via login, then include it in the `Authorization` header with every request.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Authentication Flow

### 1. Create an Account

```bash
curl -X POST https://api.stackaudit.ai/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe",
    "organizationName": "Acme Corp"
  }'
```

**Response:**
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

### 2. Login

```bash
curl -X POST https://api.stackaudit.ai/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
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

### 3. Use the Token

Include the token in all subsequent requests:

```bash
curl https://api.stackaudit.ai/v1/audits \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Token Management

### Get Current User

Verify your token and get user info:

```bash
curl https://api.stackaudit.ai/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Refresh Token

Tokens expire after a set period. Refresh before expiry:

```bash
curl -X POST https://api.stackaudit.ai/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout

Invalidate the current session:

```bash
curl -X POST https://api.stackaudit.ai/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Password Management

### Change Password

```bash
curl -X POST https://api.stackaudit.ai/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newsecurepassword456"
  }'
```

**Password Requirements:**
- Minimum 8 characters
- Recommended: mix of letters, numbers, symbols

---

## Using Tokens in Code

### Node.js

```javascript
const token = 'eyJhbGciOiJIUzI1NiIs...';

const response = await fetch('https://api.stackaudit.ai/v1/audits', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

const { audits } = await response.json();
```

### Python

```python
import requests

token = 'eyJhbGciOiJIUzI1NiIs...'

response = requests.get(
    'https://api.stackaudit.ai/v1/audits',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
)

audits = response.json()['audits']
```

### Using Environment Variables (Recommended)

```bash
# .env file
STACKAUDIT_TOKEN=eyJhbGciOiJIUzI1NiIs...
```

```javascript
// Node.js
const token = process.env.STACKAUDIT_TOKEN;

const response = await fetch('https://api.stackaudit.ai/v1/audits', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Role-Based Access

Different roles have different permissions:

| Role | Permissions |
|------|-------------|
| `owner` | Full access, transfer ownership, delete organization |
| `admin` | Manage members, billing, all audits |
| `member` | Create/edit own audits, comment, view team audits |
| `viewer` | View audits only (read-only) |

### Role Checks in API

Some endpoints require specific roles:

```
POST /api/teams/invites         → admin, owner
DELETE /api/users/:id           → admin, owner
PATCH /api/organizations/current → admin, owner
POST /api/billing/checkout      → admin, owner
```

If you lack permission, you'll receive:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied"
  }
}
```

---

## Plan-Based Access

Some features require specific plans:

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Deep analysis | ❌ | ✅ | ✅ |
| API keys | ❌ | ❌ | ✅ |
| Analysis rerun | ❌ | ✅ | ✅ |
| Tool matching | ❌ | ✅ | ✅ |

Attempting restricted features returns:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "This feature requires Pro or Enterprise plan"
  }
}
```

---

## API Keys (Enterprise)

Enterprise plans can create API keys for service-to-service authentication:

### List API Keys

```bash
curl https://api.stackaudit.ai/v1/organizations/api-keys \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create API Key

```bash
curl -X POST https://api.stackaudit.ai/v1/organizations/api-keys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production API"}'
```

**Response:**
```json
{
  "message": "API key created",
  "apiKey": {
    "id": "key_abc123",
    "name": "Production API",
    "key": "sk_live_abc123...",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

> ⚠️ The full key is only shown once. Store it securely!

---

## Error Responses

### Missing Token

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### Invalid Token

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### Invalid Credentials

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

### Email Already Registered

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered"
  }
}
```

---

## Security Best Practices

### ✅ Do

- **Store tokens securely** — Use environment variables, not code
- **Use HTTPS** — Never send tokens over unencrypted connections
- **Refresh tokens** — Don't let tokens expire during long operations
- **Logout on sign-out** — Invalidate tokens when users log out
- **Minimal permissions** — Use the lowest role needed

### ❌ Don't

- **Commit tokens to Git** — Use `.gitignore` for `.env` files
- **Share tokens** — Each user should have their own
- **Expose in client code** — Tokens are for server-side only
- **Log tokens** — Mask in application logs
- **Use long-lived tokens** — Refresh regularly

### .gitignore Example

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Tokens and secrets
*.key
secrets.json
```

---

## Rate Limits by Plan

| Plan | Requests/min | Requests/day |
|------|--------------|--------------|
| Free | 10 | 100 |
| Pro | 60 | 1,000 |
| Enterprise | 300 | 10,000 |

Exceeding limits returns:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests"
  }
}
```

Rate limit headers in responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705312800
```

---

## Local Development

For local development, configure JWT secret:

```bash
# .env
JWT_SECRET=your-development-secret-key
```

Start the server:
```bash
npm run dev
```

Authentication works the same way locally.

---

## Next Steps

- [API Endpoints →](./endpoints.md)
- [Data Models →](./data-models.md)
- [Webhooks →](./webhooks.md)
