# Getting Started with StackAudit.ai

Get your first SaaS stack audit running in under 5 minutes.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- A list of your organization's SaaS tools (optional — we can help discover them)

---

## Quick Start

### 1. Install StackAudit

```bash
# Clone the repository
git clone https://github.com/stackaudit/stackaudit.git
cd stackaudit

# Install dependencies
cd server
npm install

# Start the server
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║           StackAudit.ai Report Server                  ║
╠═══════════════════════════════════════════════════════╣
║  🚀 Server running on port 3001                        ║
╚═══════════════════════════════════════════════════════╝
```

### 2. Verify Installation

Test the health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "stackaudit-server",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 3. Get Sample Data

Explore the sample data structure:

```bash
curl http://localhost:3001/api/sample-data | jq
```

This returns an example audit structure you can use as a template.

### 4. Run Your First Audit

Create a file called `my-audit.json`:

```json
{
  "clientName": "Acme Corp",
  "auditDate": "2025-01-15",
  "currentStack": [
    {
      "name": "Slack",
      "category": "Communication",
      "users": 100,
      "monthlyCost": 750,
      "status": "Active",
      "utilization": 95
    },
    {
      "name": "Zoom",
      "category": "Communication",
      "users": 100,
      "monthlyCost": 1500,
      "status": "Underutilized",
      "utilization": 30
    },
    {
      "name": "Microsoft 365",
      "category": "Productivity",
      "users": 100,
      "monthlyCost": 1200,
      "status": "Active",
      "utilization": 88
    }
  ]
}
```

Generate your report:

```bash
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d @my-audit.json
```

Response:
```json
{
  "success": true,
  "filename": "AcmeCorp_Stack_Audit_2025-01-15.pdf",
  "downloadUrl": "/reports/AcmeCorp_Stack_Audit_2025-01-15.pdf",
  "generatedAt": "2025-01-15T10:35:00.000Z"
}
```

### 5. Download Your Report

Open in browser or download:
```bash
curl -O http://localhost:3001/reports/AcmeCorp_Stack_Audit_2025-01-15.pdf
```

---

## Understanding the Audit Data Structure

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `clientName` | string | Your organization name |
| `currentStack` | array | List of SaaS tools |

### Tool Object

Each tool in `currentStack` should include:

```json
{
  "name": "Tool Name",
  "category": "Category (e.g., Communication, Productivity, Sales)",
  "users": 100,
  "monthlyCost": 1000,
  "status": "Active | Underutilized | Redundant",
  "utilization": 85
}
```

### Optional Fields

```json
{
  "auditDate": "2025-01-15",
  "executiveSummary": {
    "totalTools": 15,
    "totalMonthlySpend": 25000,
    "identifiedWaste": 5000,
    "potentialSavings": 5000,
    "overallHealthScore": 72,
    "keyFindings": [
      "Multiple communication tools causing redundancy",
      "Several licenses underutilized"
    ]
  },
  "recommendations": [
    {
      "title": "Reduce Zoom licenses",
      "description": "Downgrade from 100 to 50 licenses",
      "priority": "high",
      "savings": 750,
      "effort": "Low",
      "timeline": "1 week"
    }
  ]
}
```

---

## Next Steps

Now that you've run your first audit:

1. **[Explore the API](./api/endpoints.md)** — Full endpoint documentation
2. **[Customize Reports](./features/reports.md)** — Brand your PDF exports
3. **[Set Up Integrations](./features/integrations.md)** — Connect your tools
4. **[Advanced Analysis](./features/stack-analysis.md)** — Deep-dive features

---

## Common First-Time Issues

### Port Already in Use

```bash
# Change the port
PORT=3002 npm start
```

### Missing Dependencies

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### PDF Generation Fails

Ensure you have write permissions to the `reports/` directory:
```bash
mkdir -p reports
chmod 755 reports
```

---

## Getting Help

- Check the **[FAQ](./faq.md)** for common questions
- Visit **[Troubleshooting](./troubleshooting.md)** for detailed solutions
- Contact **support@stackaudit.ai** for direct assistance

---

*Ready to optimize your SaaS stack? Let's go! →*
