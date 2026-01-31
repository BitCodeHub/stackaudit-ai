# Stack Analysis

Deep-dive into how StackAudit.ai analyzes your SaaS and AI tool stack.

---

## Overview

StackAudit's analysis engine examines your tool stack across five dimensions:

1. **Overlap Detection** — Finding redundant tools
2. **ROI Analysis** — Measuring value delivered
3. **Waste Identification** — Spotting unused spend
4. **Benchmark Comparison** — How you compare to industry
5. **Consolidation Opportunities** — Where to merge tools

---

## How Analysis Works

### 1. Data Normalization

When you submit tools, StackAudit normalizes them into a standard format:

```javascript
// Your input
{
  "name": "GPT-4",
  "monthlyCost": 2500,
  "provider": "OpenAI"
}

// Normalized
{
  "id": "tool_gpt4_abc123",
  "name": "GPT-4",
  "provider": "openai",
  "model": "gpt-4",
  "costs": {
    "monthly": 2500,
    "perToken": { "input": 30, "output": 60 }
  },
  "capabilities": ["chat", "coding", "vision"],
  "useCases": ["chatbot", "coding-assistant"]
}
```

### 2. Multi-Pass Analysis

Each tool is analyzed through multiple passes:

```
Pass 1: Individual tool assessment
Pass 2: Pairwise comparison (every tool vs every other)
Pass 3: Category-level analysis
Pass 4: Stack-wide patterns
Pass 5: Recommendation synthesis
```

### 3. Scoring & Ranking

Results are scored and ranked by impact:

```javascript
{
  "healthScore": 72,
  "criticalIssues": 2,
  "highIssues": 5,
  "potentialSavings": 5000
}
```

---

## Overlap Detection

### What is Overlap?

Overlap occurs when multiple tools provide the same functionality. Common examples:

| Overlap Type | Example |
|--------------|---------|
| **Capability** | Slack + Zoom (both do video calls) |
| **Use Case** | Salesforce + HubSpot (both do CRM) |
| **Feature** | Teams + Slack (both do messaging) |

### How Overlap is Detected

```javascript
// Capability Matrix
{
  "video-calling": ["Zoom", "Slack", "Teams", "Google Meet"],
  "messaging": ["Slack", "Teams", "Discord"],
  "file-storage": ["Dropbox", "Google Drive", "OneDrive"]
}

// If 2+ tools share a capability → overlap detected
```

### Overlap Scoring

```
Redundancy Score = (Total Spend - Best Tool Spend) / Total Spend

Example:
- Zoom: $3,000/month
- Slack (with Huddles): $1,125/month
- Both do video calling

Redundancy Score = ($4,125 - $1,125) / $4,125 = 72.7%
Potential savings by consolidating: $3,000/month
```

### Similarity Analysis

Tools are compared pairwise:

```javascript
{
  "tools": ["Slack", "Microsoft Teams"],
  "similarityScore": 0.85,  // 85% similar
  "sharedCapabilities": ["messaging", "video-calls", "file-sharing"],
  "recommendation": "strong_consolidation_candidate"
}
```

---

## ROI Analysis

### Calculating Tool ROI

ROI is calculated based on value delivered vs. cost:

```
ROI % = ((Estimated Value - Cost) / Cost) × 100
```

### Value Estimation

Value is estimated from:

1. **Productivity gains** — Time saved × hourly rate
2. **User adoption** — Active users × productivity boost
3. **Business outcomes** — Revenue influenced, costs avoided

```javascript
// Example calculation
{
  "tool": "Slack",
  "monthlyCost": 1125,
  "estimatedValue": {
    "timeSaved": 500,      // 500 hours/month
    "hourlyRate": 50,       // $50/hour average
    "productivityGain": 25000  // $25k/month
  },
  "roi": 2122  // 2,122% ROI
}
```

### ROI Benchmarks

| ROI | Rating | Interpretation |
|-----|--------|----------------|
| > 500% | Excellent | High-value tool |
| 200-500% | Good | Solid investment |
| 100-200% | Fair | Acceptable |
| 50-100% | Marginal | Review needed |
| < 50% | Poor | Consider alternatives |

---

## Waste Identification

### Types of Waste

| Type | Description | Example |
|------|-------------|---------|
| **Unused Features** | Paying for unused capabilities | Enterprise tier but only using basic features |
| **Underutilized** | Low usage rate | 100 licenses, only 30 active users |
| **Duplicates** | Overlapping tools | Paying for Zoom and Teams |
| **Overprovisioned** | Too many resources | Using GPT-4 for simple tasks |
| **Zombies** | No recent activity | Tool not used in 30+ days |

### Detection Logic

```javascript
// Underutilization check
if (tool.utilizationRate < 30) {
  waste.push({
    type: 'underutilized',
    tool: tool.name,
    waste: tool.monthlyCost * (1 - tool.utilizationRate / 100)
  });
}

// Zombie detection
if (daysSinceLastUse > 30) {
  waste.push({
    type: 'zombie',
    tool: tool.name,
    waste: tool.monthlyCost
  });
}
```

### Waste Scoring

```javascript
{
  "totalWaste": {
    "monthly": 5000,
    "annual": 60000,
    "percentage": 20  // 20% of total spend is waste
  },
  "byCategory": {
    "underutilized": 2500,
    "duplicates": 1500,
    "zombies": 1000
  }
}
```

---

## Benchmark Comparison

### Industry Benchmarks

StackAudit compares your stack to industry benchmarks:

| Metric | Your Stack | Industry Avg | Status |
|--------|------------|--------------|--------|
| Cost per employee | $69/month | $75/month | ✅ Good |
| Tools per employee | 0.08 | 0.10 | ✅ Good |
| Utilization rate | 65% | 70% | ⚠️ Below |
| Overlap score | 25% | 15% | ❌ High |

### AI Cost Benchmarks

For AI/LLM tools, we compare against market rates:

```javascript
{
  "yourCost": {
    "model": "gpt-4o",
    "inputPer1M": 30,
    "outputPer1M": 60
  },
  "benchmark": {
    "model": "gpt-4o",
    "inputPer1M": 2.50,   // Current market rate
    "outputPer1M": 10.00
  },
  "status": "OVERPAYING",
  "recommendation": "Verify pricing or check for volume discounts"
}
```

### Alternative Comparison

We identify cheaper alternatives that meet your needs:

```javascript
{
  "currentTool": "gpt-4o",
  "currentCost": 2500,
  "alternatives": [
    {
      "name": "claude-sonnet-4",
      "estimatedCost": 2200,
      "savings": 300,
      "capabilityMatch": 95
    },
    {
      "name": "gemini-2.5-pro",
      "estimatedCost": 1500,
      "savings": 1000,
      "capabilityMatch": 90
    },
    {
      "name": "deepseek-v3",
      "estimatedCost": 250,
      "savings": 2250,
      "capabilityMatch": 85,
      "warnings": ["China-based", "Data sovereignty concerns"]
    }
  ]
}
```

---

## Consolidation Opportunities

### Finding Consolidation Candidates

StackAudit identifies tools that can be merged:

```javascript
{
  "opportunity": {
    "capability": "video-conferencing",
    "currentTools": [
      {"name": "Zoom", "cost": 3000},
      {"name": "Teams", "cost": 0}  // Included with M365
    ],
    "recommendation": {
      "keep": "Teams",
      "retire": "Zoom",
      "monthlySavings": 3000
    },
    "difficulty": "moderate",
    "timeline": "4-6 weeks"
  }
}
```

### Consolidation Scoring

Each opportunity is scored by:

- **Savings potential** (40%)
- **Capability coverage** (30%)
- **Migration difficulty** (20%)
- **User impact** (10%)

### Provider Consolidation

We also look for provider consolidation:

```javascript
{
  "type": "provider_consolidation",
  "currentProviders": ["openai", "anthropic", "google"],
  "recommendation": {
    "consolidateTo": "openai",
    "capabilityCoverage": 95,
    "benefits": [
      "Volume discounts (10-15%)",
      "Simplified billing",
      "Single support channel"
    ],
    "estimatedSavings": "15%"
  }
}
```

---

## Health Score Calculation

### Components

The health score (0-100) is calculated from:

| Component | Weight | Description |
|-----------|--------|-------------|
| Utilization | 30% | How well tools are used |
| ROI | 25% | Value vs. cost |
| Overlap | 20% | Redundancy level |
| Waste | 15% | Identified waste % |
| Compliance | 10% | Security/governance |

### Formula

```javascript
healthScore = (
  (utilizationScore * 0.30) +
  (roiScore * 0.25) +
  (overlapScore * 0.20) +
  (wasteScore * 0.15) +
  (complianceScore * 0.10)
);
```

### Score Interpretation

| Score | Grade | Action |
|-------|-------|--------|
| 90-100 | A | Maintain current practices |
| 80-89 | B | Minor optimizations |
| 70-79 | C | Review recommendations |
| 60-69 | D | Prioritize improvements |
| < 60 | F | Urgent action needed |

---

## Running an Analysis

### Basic Analysis

```bash
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Acme Corp",
    "currentStack": [
      {"name": "Slack", "monthlyCost": 1125, "users": 150, "utilization": 95},
      {"name": "Zoom", "monthlyCost": 3000, "users": 150, "utilization": 35}
    ]
  }'
```

### Advanced Analysis (AI Stack)

For AI tool analysis, include more details:

```bash
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{
    "tools": [
      {
        "name": "OpenAI GPT-4",
        "provider": "openai",
        "model": "gpt-4o",
        "costs": {
          "monthly": 2500,
          "perToken": {"input": 2.50, "output": 10.00}
        },
        "usage": {
          "monthlyTokens": {"input": 50000000, "output": 10000000}
        },
        "capabilities": ["chat", "coding", "vision"],
        "useCases": ["chatbot", "coding-assistant"]
      }
    ]
  }'
```

---

## Best Practices

### Data Quality

Better data = better analysis:

| Data Point | Impact on Analysis |
|------------|-------------------|
| Actual costs | Essential |
| User counts | High |
| Utilization rates | High |
| Last used dates | Medium |
| Capabilities | Medium |

### Regular Audits

Schedule audits:
- **Monthly**: Quick health check
- **Quarterly**: Full analysis
- **Annually**: Strategic review

### Acting on Results

1. **Quick wins first** — Low effort, high savings
2. **Plan consolidations** — 4-6 week projects
3. **Negotiate renewals** — Use benchmark data
4. **Monitor progress** — Track savings achieved

---

## Next Steps

- [Cost Optimization →](./cost-optimization.md)
- [Report Generation →](./reports.md)
- [Recommendations →](./recommendations.md)
