# StackAudit API Documentation

Base URL: `http://localhost:3001` (development)

All endpoints return JSON.

---

## Health Check

### GET /health

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T12:00:00.000Z"
}
```

---

## Users

### POST /api/users

Create a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "companyName": "Acme Corp",     // optional
  "companySize": "50-200"         // optional
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "companyName": "Acme Corp",
  "companySize": "50-200",
  "createdAt": "2026-01-28T12:00:00.000Z"
}
```

**Note:** If user with email already exists, returns existing user (idempotent).

---

### GET /api/users/:id

Get user by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "companyName": "Acme Corp",
  "companySize": "50-200",
  "createdAt": "2026-01-28T12:00:00.000Z",
  "audits": [
    {
      "id": "audit-uuid",
      "status": "complete",
      "tier": "paid",
      "createdAt": "2026-01-28T12:00:00.000Z"
    }
  ]
}
```

**Errors:**
- `404 Not Found` - User doesn't exist

---

## Audits

### POST /api/audits

Create a new audit.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "tier": "free"           // optional, defaults to "free"
}
```

**Response:** `201 Created`
```json
{
  "id": "audit-uuid",
  "userId": "user-uuid",
  "status": "draft",
  "tier": "free",
  "totalSpend": null,
  "potentialSavings": null,
  "createdAt": "2026-01-28T12:00:00.000Z",
  "updatedAt": "2026-01-28T12:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "tools": [],
  "recommendations": []
}
```

---

### GET /api/audits/:id

Get audit by ID with all related data.

**Response:** `200 OK`
```json
{
  "id": "audit-uuid",
  "userId": "user-uuid",
  "status": "complete",
  "tier": "paid",
  "totalSpend": "250.00",
  "potentialSavings": "75.00",
  "createdAt": "2026-01-28T12:00:00.000Z",
  "user": { ... },
  "tools": [ ... ],
  "recommendations": [ ... ]
}
```

**Errors:**
- `404 Not Found` - Audit doesn't exist

---

### PUT /api/audits/:id

Update audit (typically to add tools).

**Request Body:**
```json
{
  "tools": [
    {
      "toolName": "ChatGPT Plus",
      "monthlyCost": 20,
      "seats": 5,
      "useCases": ["writing", "research", "coding"],
      "utilization": "high"     // optional: high, medium, low, unknown
    },
    {
      "toolName": "GitHub Copilot",
      "monthlyCost": 10,
      "seats": 3,
      "useCases": ["coding"],
      "utilization": "medium"
    }
  ],
  "tier": "paid",              // optional
  "status": "draft"            // optional
}
```

**Note:** Sending `tools` array will replace all existing tools.

**Response:** `200 OK`
```json
{
  "id": "audit-uuid",
  "tools": [
    {
      "id": "tool-uuid-1",
      "auditId": "audit-uuid",
      "toolName": "ChatGPT Plus",
      "monthlyCost": "20.00",
      "seats": 5,
      "useCases": ["writing", "research", "coding"],
      "utilization": "high",
      "createdAt": "2026-01-28T12:00:00.000Z"
    },
    ...
  ]
}
```

---

### POST /api/audits/:id/analyze

Run AI analysis on the audit.

**Prerequisites:**
- Audit must have at least one tool added
- Audit status will be set to "analyzing" during processing

**Request Body:** None

**Response:** `200 OK`
```json
{
  "id": "audit-uuid",
  "status": "complete",
  "totalSpend": "250.00",
  "potentialSavings": "75.00",
  "tools": [ ... ],
  "recommendations": [
    {
      "id": "rec-uuid-1",
      "auditId": "audit-uuid",
      "type": "consolidate",
      "priority": 5,
      "description": "Multiple tools detected for \"coding\": ChatGPT Plus, GitHub Copilot. Consider consolidating to a single solution.",
      "savingsEstimate": "30.00",
      "createdAt": "2026-01-28T12:00:00.000Z"
    },
    {
      "id": "rec-uuid-2",
      "type": "eliminate",
      "priority": 4,
      "description": "Tool XYZ shows low utilization. Consider eliminating or reducing seats.",
      "savingsEstimate": "45.00"
    }
  ]
}
```

**Errors:**
- `404 Not Found` - Audit doesn't exist
- `400 Bad Request` - No tools added to audit yet

**Status Updates:**
- On start: status → "analyzing"
- On success: status → "complete"
- On error: status → "failed"

---

### GET /api/audits/:id/report

Get the complete audit report (same as GET /api/audits/:id but only when status is "complete").

**Response:** `200 OK` (same structure as GET /api/audits/:id)

**Errors:**
- `404 Not Found` - Audit doesn't exist
- `400 Bad Request` - Analysis not complete yet

```json
{
  "error": "Audit analysis not complete yet",
  "status": "analyzing"
}
```

---

## Data Models

### User
```typescript
{
  id: string;              // UUID
  email: string;           // Unique
  companyName?: string;
  companySize?: string;    // e.g., "1-10", "50-200", "500+"
  createdAt: Date;
}
```

### Audit
```typescript
{
  id: string;
  userId: string;
  status: "draft" | "analyzing" | "complete" | "failed";
  tier: "free" | "paid";
  totalSpend?: number;          // Calculated during analysis
  potentialSavings?: number;    // Calculated during analysis
  createdAt: Date;
  updatedAt: Date;
}
```

### AuditTool
```typescript
{
  id: string;
  auditId: string;
  toolName: string;
  monthlyCost: number;          // Decimal(10,2)
  seats: number;                // Number of licenses
  useCases: string[];           // Array of use cases
  utilization?: "high" | "medium" | "low" | "unknown";
  createdAt: Date;
}
```

### Recommendation
```typescript
{
  id: string;
  auditId: string;
  type: "consolidate" | "eliminate" | "keep" | "migrate";
  priority: number;             // 1-5, higher = more important
  description: string;          // Detailed explanation
  savingsEstimate?: number;     // Estimated monthly savings
  createdAt: Date;
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

### Common Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate resource (e.g., email already exists)
- `500 Internal Server Error` - Server error

### Prisma Errors

The API handles common Prisma errors:

- `P2002` → `409 Conflict` (Unique constraint violation)
- `P2025` → `404 Not Found` (Record not found)

---

## Example Workflow

1. **Create user:**
   ```bash
   POST /api/users
   { "email": "user@example.com", "companyName": "Acme" }
   ```

2. **Create audit:**
   ```bash
   POST /api/audits
   { "userId": "<user-id>", "tier": "free" }
   ```

3. **Add tools:**
   ```bash
   PUT /api/audits/<audit-id>
   { "tools": [ ... ] }
   ```

4. **Run analysis:**
   ```bash
   POST /api/audits/<audit-id>/analyze
   ```

5. **Get report:**
   ```bash
   GET /api/audits/<audit-id>/report
   ```

---

## Development Notes

### Mock Analysis
The analysis service currently returns mock recommendations. This will be replaced with Claude API integration.

### Free vs Paid Tier
Currently no enforcement of tool limits for free tier. This needs to be implemented:
- Free: Max 5 tools
- Paid: Unlimited tools

### Authentication
Not yet implemented. All endpoints are public. Will add in V1.1.

---

## Testing with cURL

See `QUICKSTART.md` for complete cURL examples.

Quick test:
```bash
# Health check
curl http://localhost:3001/health

# Create user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

**Need help?** Check the backend logs for detailed error messages.
