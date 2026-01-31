# Your First Audit

A step-by-step guide to running your first SaaS stack audit with StackAudit.ai.

---

## What You'll Accomplish

By the end of this guide, you'll have:

- ✅ Collected your tool inventory
- ✅ Submitted data to StackAudit
- ✅ Generated your first PDF report
- ✅ Identified potential savings

**Time required**: 15-30 minutes

---

## Step 1: Gather Your Data

### Minimum Required Data

At minimum, you need:
- Organization name
- List of SaaS tools with costs

### Recommended Data

For the best analysis, gather:

| Data Point | Why It Matters |
|------------|----------------|
| Tool name | Identify each tool |
| Monthly cost | Calculate spend |
| Number of users | Detect underutilization |
| Utilization % | Find waste |
| Category | Detect overlap |

### Where to Find This Data

| Source | What You'll Find |
|--------|------------------|
| **Finance/Accounting** | Invoices, expenses, subscriptions |
| **IT Admin Console** | License counts, user lists |
| **Tool dashboards** | Usage analytics, active users |
| **Procurement** | Contracts, renewal dates |

### Quick Data Collection Template

Create a spreadsheet with these columns:

| Tool Name | Category | Monthly Cost | Licensed Users | Active Users | Utilization % |
|-----------|----------|--------------|----------------|--------------|---------------|
| Slack | Communication | $1,125 | 150 | 145 | 97% |
| Zoom | Communication | $3,000 | 200 | 70 | 35% |
| Microsoft 365 | Productivity | $2,400 | 200 | 185 | 93% |
| Salesforce | Sales | $6,750 | 45 | 38 | 84% |
| GitHub | Development | $570 | 30 | 28 | 93% |

---

## Step 2: Format Your Data

Convert your spreadsheet to JSON format:

```json
{
  "clientName": "Your Company Name",
  "auditDate": "2025-01-15",
  "currentStack": [
    {
      "name": "Slack",
      "category": "Communication",
      "users": 150,
      "monthlyCost": 1125,
      "utilization": 97,
      "status": "Active"
    },
    {
      "name": "Zoom",
      "category": "Communication",
      "users": 200,
      "monthlyCost": 3000,
      "utilization": 35,
      "status": "Underutilized"
    },
    {
      "name": "Microsoft 365",
      "category": "Productivity",
      "users": 200,
      "monthlyCost": 2400,
      "utilization": 93,
      "status": "Active"
    },
    {
      "name": "Salesforce",
      "category": "Sales",
      "users": 45,
      "monthlyCost": 6750,
      "utilization": 84,
      "status": "Active"
    },
    {
      "name": "GitHub",
      "category": "Development",
      "users": 30,
      "monthlyCost": 570,
      "utilization": 93,
      "status": "Active"
    }
  ]
}
```

Save this as `my-audit.json`.

### Status Values

Use these status values based on utilization:

| Utilization | Status |
|-------------|--------|
| > 70% | Active |
| 30-70% | Underutilized |
| < 30% | Redundant |

---

## Step 3: Start the Server

If you haven't already, start StackAudit:

```bash
cd stackaudit/server
npm install
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

---

## Step 4: Validate Your Data

Before generating a report, validate your data:

```bash
curl -X POST http://localhost:3001/api/templates/validate \
  -H "Content-Type: application/json" \
  -d @my-audit.json
```

**Good response**:
```json
{
  "valid": true,
  "warnings": []
}
```

**If there are issues**:
```json
{
  "valid": false,
  "errors": ["clientName is required"]
}
```

---

## Step 5: Generate Your Report

Submit your data to generate a PDF report:

```bash
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d @my-audit.json
```

**Response**:
```json
{
  "success": true,
  "filename": "YourCompanyName_Stack_Audit_2025-01-15.pdf",
  "downloadUrl": "/reports/YourCompanyName_Stack_Audit_2025-01-15.pdf",
  "generatedAt": "2025-01-15T10:35:00.000Z"
}
```

---

## Step 6: Download Your Report

Download the PDF:

```bash
curl -O http://localhost:3001/reports/YourCompanyName_Stack_Audit_2025-01-15.pdf
```

Or open in browser:
```
http://localhost:3001/reports/YourCompanyName_Stack_Audit_2025-01-15.pdf
```

---

## Step 7: Review Your Results

### Understanding the Report

Your report includes:

#### Executive Summary
- **Health Score**: 0-100 rating of your stack
- **Total Spend**: Monthly SaaS cost
- **Potential Savings**: Identified optimization opportunities

#### Tool Analysis
- Each tool with utilization status
- Cost breakdown by category

#### Waste Identification
- Underutilized tools
- Overlapping capabilities
- Zombie subscriptions

#### Recommendations
- Prioritized action items
- Estimated savings per action
- Implementation difficulty

### Example Findings

Based on our sample data, you might see:

```
FINDINGS:
─────────────────────────────────────────────
⚠️  Zoom is significantly underutilized (35%)
    → 130 licenses unused
    → Potential savings: $1,950/month

⚠️  Video calling overlap detected
    → Slack Huddles + Zoom
    → Potential savings: $550/month via consolidation

✅  Core tools (M365, Salesforce, GitHub) well-utilized

TOTAL POTENTIAL SAVINGS: $2,500/month ($30,000/year)
```

---

## Step 8: Take Action

### Quick Wins (This Week)

| Action | Savings | Effort |
|--------|---------|--------|
| Reduce Zoom licenses | $1,950/mo | Low |
| Cancel unused tools | Varies | Low |

### Medium Term (This Month)

| Action | Savings | Effort |
|--------|---------|--------|
| Consolidate video tools | $550/mo | Medium |
| Tier optimization | Varies | Medium |

### Track Your Progress

Run audits monthly to track savings:

```bash
# Month 1
curl -X POST http://localhost:3001/api/reports/generate \
  -d '{"clientName": "My Company - January 2025", ...}'

# Month 2
curl -X POST http://localhost:3001/api/reports/generate \
  -d '{"clientName": "My Company - February 2025", ...}'
```

---

## Enhancing Your Audit

### Add Executive Summary

Include your own analysis:

```json
{
  "clientName": "My Company",
  "executiveSummary": {
    "totalTools": 5,
    "totalMonthlySpend": 13845,
    "identifiedWaste": 2500,
    "potentialSavings": 2500,
    "savingsPercentage": 18,
    "overallHealthScore": 72,
    "keyFindings": [
      "Zoom significantly underutilized at 35%",
      "Video calling overlap between Slack and Zoom",
      "Core tools show healthy utilization rates"
    ]
  }
}
```

### Add Recommendations

Include specific recommendations:

```json
{
  "recommendations": [
    {
      "title": "Reduce Zoom licenses",
      "description": "Downgrade from 200 to 80 licenses based on usage",
      "priority": "high",
      "savings": 1950,
      "effort": "Low",
      "timeline": "1 week"
    },
    {
      "title": "Consolidate video tools",
      "description": "Use Slack Huddles for quick calls, Zoom for large meetings",
      "priority": "medium",
      "savings": 550,
      "effort": "Medium",
      "timeline": "2-4 weeks"
    }
  ]
}
```

### Add ROI Analysis

Include financial metrics:

```json
{
  "roiAnalysis": {
    "currentROI": 165,
    "projectedROI": 210,
    "costPerEmployee": 69,
    "industryBenchmark": 75
  }
}
```

---

## Troubleshooting

### "clientName is required"

Make sure your JSON includes `clientName`:
```json
{"clientName": "My Company", ...}
```

### Report is empty

- Ensure `currentStack` has at least one tool
- Check JSON is valid: `cat my-audit.json | jq .`

### Can't access server

- Verify server is running: `curl http://localhost:3001/health`
- Check port isn't blocked

See [Troubleshooting →](./troubleshooting.md) for more help.

---

## Next Steps

Now that you've completed your first audit:

1. **[Explore the API](./api/endpoints.md)** — Automate your audits
2. **[Customize Reports](./features/reports.md)** — Add branding
3. **[Deep Analysis](./features/stack-analysis.md)** — Understand the algorithms
4. **[Cost Optimization](./features/cost-optimization.md)** — Advanced strategies

---

## Quick Reference

```bash
# Health check
curl http://localhost:3001/health

# Get sample data
curl http://localhost:3001/api/sample-data

# Validate data
curl -X POST http://localhost:3001/api/templates/validate \
  -H "Content-Type: application/json" \
  -d @my-audit.json

# Generate report
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d @my-audit.json

# List reports
curl http://localhost:3001/api/reports

# Download report
curl -O http://localhost:3001/reports/FILENAME.pdf
```

---

*Congratulations on completing your first audit! 🎉*
