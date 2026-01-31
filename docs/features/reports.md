# Report Generation

Generate professional PDF reports from your stack audits.

---

## Overview

StackAudit generates comprehensive PDF reports that include:

- Executive summary with key metrics
- Tool-by-tool analysis
- Waste identification
- Actionable recommendations
- ROI projections
- Implementation roadmap

---

## Generating Reports

### Basic Report

```bash
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Acme Corporation"
  }'
```

Response:
```json
{
  "success": true,
  "filename": "AcmeCorporation_Stack_Audit_2025-01-15.pdf",
  "downloadUrl": "/reports/AcmeCorporation_Stack_Audit_2025-01-15.pdf",
  "generatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Full Report with Data

```bash
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Acme Corporation",
    "auditDate": "2025-01-15",
    "currentStack": [
      {
        "name": "Slack",
        "category": "Communication",
        "users": 150,
        "monthlyCost": 1125,
        "status": "Active",
        "utilization": 95
      },
      {
        "name": "Zoom",
        "category": "Communication",
        "users": 200,
        "monthlyCost": 3000,
        "status": "Underutilized",
        "utilization": 35
      }
    ],
    "executiveSummary": {
      "totalTools": 2,
      "totalMonthlySpend": 4125,
      "identifiedWaste": 1950,
      "potentialSavings": 1950,
      "overallHealthScore": 65,
      "keyFindings": [
        "Zoom significantly underutilized",
        "Video calling overlap with Slack"
      ]
    },
    "recommendations": [
      {
        "title": "Reduce Zoom licenses",
        "description": "Downgrade to 70 licenses based on actual usage",
        "priority": "high",
        "savings": 1950,
        "effort": "Low",
        "timeline": "1 week"
      }
    ]
  }'
```

---

## Report Types

### Standard Report

The default comprehensive report with all sections.

```bash
GET /api/templates/types
```

```json
{
  "types": {
    "standard": {
      "name": "Standard Report",
      "sections": [
        "executive_summary",
        "tool_analysis",
        "waste",
        "recommendations",
        "roadmap"
      ]
    }
  }
}
```

### Executive Report

High-level summary for leadership.

```json
{
  "reportType": "executive",
  "sections": [
    "executive_summary",
    "key_findings",
    "top_recommendations"
  ]
}
```

### Detailed Report

Technical deep-dive with all analysis data.

```json
{
  "reportType": "detailed",
  "sections": [
    "executive_summary",
    "tool_analysis",
    "overlap_analysis",
    "benchmarks",
    "recommendations",
    "appendix"
  ]
}
```

---

## Report Sections

### Executive Summary

The first page with key metrics:

```
╔══════════════════════════════════════════════════════╗
║                  EXECUTIVE SUMMARY                    ║
╠══════════════════════════════════════════════════════╣
║  Health Score: 72/100                                 ║
║  Total Monthly Spend: $25,000                         ║
║  Potential Savings: $5,000 (20%)                      ║
║                                                       ║
║  KEY FINDINGS:                                        ║
║  • 35% of licenses underutilized                      ║
║  • 3 tools with overlapping functionality             ║
║  • 5 subscriptions with no active users               ║
╚══════════════════════════════════════════════════════╝
```

### Tool Analysis

Individual tool breakdown:

| Tool | Category | Users | Cost | Utilization | Status |
|------|----------|-------|------|-------------|--------|
| Slack | Communication | 150 | $1,125 | 95% | ✅ Active |
| Zoom | Communication | 200 | $3,000 | 35% | ⚠️ Underutilized |
| M365 | Productivity | 200 | $2,400 | 88% | ✅ Active |

### Waste Identification

```
╔══════════════════════════════════════════════════════╗
║              IDENTIFIED WASTE: $5,000/month           ║
╠══════════════════════════════════════════════════════╣
║                                                       ║
║  UNDERUTILIZED (65%)                    $3,250        ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░                      ║
║  • Zoom: 70% of licenses unused         $1,950        ║
║  • Adobe CC: Low usage                  $1,300        ║
║                                                       ║
║  DUPLICATES (25%)                       $1,250        ║
║  ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░                      ║
║  • Slack/Zoom video overlap             $550         ║
║  • Dropbox/Google Drive                 $700         ║
║                                                       ║
║  ZOMBIES (10%)                          $500         ║
║  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                      ║
║  • Unused SaaS tools                    $500         ║
╚══════════════════════════════════════════════════════╝
```

### Recommendations

Prioritized action items:

```
PRIORITY: HIGH                           Savings: $1,950/mo

Reduce Zoom Licenses
────────────────────
Description: Downgrade from 200 to 70 licenses based on 
             actual usage patterns.

Effort: Low          Timeline: 1 week
ROI: Immediate       Impact: $23,400/year

Steps:
1. Export current user list
2. Identify inactive users
3. Contact vendor for license adjustment
4. Update billing

───────────────────────────────────────────────────────
```

### Implementation Roadmap

```
SAVINGS TIMELINE

Month 1  ████████████████  $2,000  (Quick wins)
Month 2  ██████████████████████  $3,500  (Consolidation)
Month 3  ████████████████████████████  $5,000  (Full optimization)

CUMULATIVE SAVINGS
─────────────────────────────────────────────────
$0        $2,000      $5,500       $10,500    ...
Month 1   Month 2     Month 3      Month 4
```

---

## Customization

### Custom Branding

Apply your company branding:

```bash
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Acme Corp",
    "branding": {
      "preset": "enterprise",
      "logo": "https://acme.com/logo.png",
      "colors": {
        "primary": "#1a365d",
        "secondary": "#2b6cb0",
        "accent": "#48bb78"
      }
    }
  }'
```

### Available Presets

```bash
GET /api/templates/brands
```

```json
{
  "brands": {
    "default": {
      "primaryColor": "#2563eb",
      "secondaryColor": "#1e40af"
    },
    "enterprise": {
      "primaryColor": "#1f2937",
      "secondaryColor": "#374151"
    },
    "modern": {
      "primaryColor": "#7c3aed",
      "secondaryColor": "#5b21b6"
    }
  }
}
```

### Section Selection

Include only specific sections:

```json
{
  "clientName": "Acme Corp",
  "sections": [
    "executive_summary",
    "recommendations"
  ]
}
```

---

## Managing Reports

### List All Reports

```bash
curl http://localhost:3001/api/reports
```

Response:
```json
{
  "reports": [
    {
      "filename": "AcmeCorp_Stack_Audit_2025-01-15.pdf",
      "downloadUrl": "/reports/AcmeCorp_Stack_Audit_2025-01-15.pdf",
      "size": 125430,
      "createdAt": "2025-01-15T10:35:00.000Z"
    }
  ]
}
```

### Download Report

```bash
# Direct download
curl -O http://localhost:3001/reports/AcmeCorp_Stack_Audit_2025-01-15.pdf

# Via API endpoint
curl -O http://localhost:3001/api/reports/download/AcmeCorp_Stack_Audit_2025-01-15.pdf
```

### Delete Report

```bash
# Reports are stored in the server's reports/ directory
rm reports/AcmeCorp_Stack_Audit_2025-01-15.pdf
```

---

## Validation

### Validate Before Generation

Check your data before generating:

```bash
curl -X POST http://localhost:3001/api/templates/validate \
  -H "Content-Type: application/json" \
  -d '{
    "auditData": {
      "clientName": "Acme Corp",
      "currentStack": []
    },
    "reportType": "standard"
  }'
```

Response:
```json
{
  "valid": true,
  "warnings": [
    "currentStack is empty - report will have limited content"
  ]
}
```

### Calculate Summary

Auto-calculate metrics from your data:

```bash
curl -X POST http://localhost:3001/api/templates/calculate-summary \
  -H "Content-Type: application/json" \
  -d '{
    "auditData": {
      "currentStack": [
        {"name": "Slack", "monthlyCost": 1125, "utilization": 95},
        {"name": "Zoom", "monthlyCost": 3000, "utilization": 35}
      ]
    }
  }'
```

Response:
```json
{
  "totalTools": 2,
  "totalMonthlySpend": 4125,
  "averageUtilization": 65,
  "underutilizedTools": 1,
  "estimatedWaste": 1950,
  "healthScore": 65
}
```

---

## Export Formats

### PDF (Default)

Professional, print-ready reports.

### JSON

Raw data for integrations:

```bash
curl http://localhost:3001/api/audit \
  -H "Accept: application/json" \
  -d '{"clientName": "Acme"}'
```

### CSV (Coming Soon)

Spreadsheet-compatible exports.

---

## Sample Report

### View Sample Data

```bash
curl http://localhost:3001/api/sample-data | jq
```

### Generate Sample Report

```bash
# Get sample data
curl http://localhost:3001/api/sample-data > sample.json

# Generate report from sample
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d @sample.json
```

---

## Best Practices

### Data Quality

| Tip | Why |
|-----|-----|
| Include all tools | Comprehensive analysis |
| Add utilization rates | Better waste detection |
| Specify costs accurately | Accurate savings calculations |
| Include user counts | License optimization |

### Report Frequency

| Frequency | Purpose |
|-----------|---------|
| Weekly | Quick health check |
| Monthly | Track progress |
| Quarterly | Strategic review |
| Annually | Board reporting |

### Distribution

- **Leadership**: Executive summary
- **IT**: Full report
- **Finance**: Cost analysis sections
- **Teams**: Relevant tool sections

---

## Troubleshooting

### Report is blank

- Check that `clientName` is provided
- Verify JSON is valid
- Check server logs for errors

### Generation is slow

- Reduce number of tools
- Use async generation for large reports
- Check server resources

### Download fails

- Verify filename is correct
- Check reports directory exists
- Ensure proper permissions

See [Troubleshooting →](../troubleshooting.md) for more.

---

## Next Steps

- [Stack Analysis →](./stack-analysis.md)
- [Cost Optimization →](./cost-optimization.md)
- [API Reference →](../api/endpoints.md)
