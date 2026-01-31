# Cost Optimization

Practical strategies for reducing your SaaS and AI spending with StackAudit.ai.

---

## Overview

Organizations typically find **20-40% potential savings** in their SaaS spend. StackAudit identifies these opportunities across five categories:

| Category | Typical Savings |
|----------|-----------------|
| License right-sizing | 15-25% |
| Tool consolidation | 10-20% |
| Tier optimization | 5-15% |
| Zombie elimination | 5-10% |
| Negotiation leverage | 10-30% |

---

## Optimization Strategies

### 1. License Right-Sizing

**Problem**: Paying for more licenses than you need.

**Detection**:
```javascript
// StackAudit identifies:
{
  "tool": "Zoom",
  "licensesOwned": 200,
  "activeUsers": 70,
  "utilizationRate": 35,
  "wastedLicenses": 130,
  "wastedSpend": 1950
}
```

**Actions**:
- Reduce license count to match actual usage (+10% buffer)
- Switch inactive users to free tier
- Implement approval workflow for new licenses

**Example Savings**:
```
Before: 200 Zoom Pro licenses × $15/user = $3,000/month
After:  80 Zoom Pro licenses × $15/user = $1,200/month
Savings: $1,800/month ($21,600/year)
```

---

### 2. Tool Consolidation

**Problem**: Multiple tools doing the same job.

**Detection**:
```javascript
{
  "overlap": {
    "capability": "video-conferencing",
    "tools": ["Zoom", "Microsoft Teams", "Google Meet"],
    "recommendation": "Consolidate to Teams (included in M365)"
  }
}
```

**Common Consolidation Opportunities**:

| Overlap | Keep | Retire | Typical Savings |
|---------|------|--------|-----------------|
| Video calling | Teams/Slack | Zoom | $15-30/user/mo |
| Cloud storage | Google Drive | Dropbox | $10-15/user/mo |
| Project mgmt | Jira | Asana + Monday | $20-40/user/mo |
| Messaging | Slack | Teams + Discord | $8-15/user/mo |

**Example Savings**:
```
Before: 
  - Microsoft 365: $2,400/month (includes Teams)
  - Zoom: $3,000/month
  - Google Meet: $0 (free tier)
  
After:
  - Microsoft 365: $2,400/month (use Teams for video)
  
Savings: $3,000/month ($36,000/year)
```

---

### 3. Tier Optimization

**Problem**: Paying for premium features you don't use.

**Detection**:
```javascript
{
  "tool": "Salesforce",
  "currentTier": "Enterprise",
  "tierCost": 150,
  "featuresUsed": ["contacts", "deals", "reports"],
  "recommendedTier": "Professional",
  "tierCost": 75,
  "savingsPerUser": 75
}
```

**Common Downgrades**:

| Tool | From | To | Savings |
|------|------|-----|---------|
| Salesforce | Enterprise | Professional | $75/user |
| Slack | Business+ | Pro | $5/user |
| GitHub | Enterprise | Team | $17/user |
| Zoom | Business | Pro | $5/user |

**Example Savings**:
```
Before: 50 Salesforce Enterprise @ $150/user = $7,500/month
After:  50 Salesforce Professional @ $75/user = $3,750/month
Savings: $3,750/month ($45,000/year)
```

---

### 4. Zombie Subscription Elimination

**Problem**: Tools that nobody uses anymore.

**Detection**:
```javascript
{
  "zombies": [
    {
      "tool": "Basecamp",
      "lastUsed": "2024-03-15",
      "daysSinceUse": 300,
      "monthlyCost": 99,
      "recommendation": "Cancel immediately"
    }
  ]
}
```

**Common Zombies**:
- Free trials that converted to paid
- Tools from departed employees
- Abandoned pilot programs
- Legacy tools after migration

**Example Savings**:
```
Identified Zombies:
  - Basecamp: $99/month (unused 10 months)
  - Trello Business: $100/month (team moved to Jira)
  - Old CRM: $200/month (migrated to Salesforce)

Total Zombie Spend: $399/month ($4,788/year)
```

---

### 5. AI Cost Optimization

**Problem**: Overpaying for AI/LLM APIs.

**Strategies**:

#### a) Model Right-Sizing
```javascript
// Current: Using GPT-4 for everything
{
  "model": "gpt-4o",
  "monthlyCost": 5000,
  "useCases": {
    "simple_chat": 60,      // Could use mini
    "coding": 25,           // Needs GPT-4
    "complex_analysis": 15  // Needs GPT-4
  }
}

// Optimized: Right model for right task
{
  "gpt-4o-mini": { "spend": 800, "percentage": 60 },
  "gpt-4o": { "spend": 2000, "percentage": 40 },
  "total": 2800,
  "savings": 2200
}
```

#### b) Provider Alternatives
```javascript
{
  "current": { "provider": "openai", "model": "gpt-4o", "cost": 5000 },
  "alternatives": [
    { "provider": "anthropic", "model": "claude-sonnet-4", "cost": 4500, "savings": 500 },
    { "provider": "google", "model": "gemini-2.5-pro", "cost": 3500, "savings": 1500 },
    { "provider": "deepseek", "model": "v3", "cost": 500, "savings": 4500, "warning": "China-based" }
  ]
}
```

#### c) Caching & Batching
```
Prompt Caching (OpenAI, Anthropic):
- 90% discount on cached prompts
- Ideal for: System prompts, repeated context
- Savings: 30-50% on qualifying requests

Batch API:
- 50% discount
- 24-hour processing window
- Ideal for: Non-real-time workloads
- Savings: 50% on batch-eligible requests
```

---

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1)

Low effort, immediate savings:

| Action | Effort | Savings | Time |
|--------|--------|---------|------|
| Cancel zombies | ⭐ | $$$ | Same day |
| Remove inactive users | ⭐ | $$ | 1-2 days |
| Enable caching | ⭐ | $$ | 1 day |

### Phase 2: Optimization (Weeks 2-4)

Medium effort, significant savings:

| Action | Effort | Savings | Time |
|--------|--------|---------|------|
| Right-size licenses | ⭐⭐ | $$$ | 1 week |
| Downgrade tiers | ⭐⭐ | $$ | 1 week |
| Model optimization | ⭐⭐ | $$$ | 2 weeks |

### Phase 3: Consolidation (Months 2-3)

Higher effort, strategic savings:

| Action | Effort | Savings | Time |
|--------|--------|---------|------|
| Tool consolidation | ⭐⭐⭐ | $$$$ | 4-8 weeks |
| Provider migration | ⭐⭐⭐ | $$$ | 4-6 weeks |
| Contract negotiation | ⭐⭐ | $$$$ | Next renewal |

---

## Negotiation Leverage

### Using Benchmark Data

StackAudit provides benchmark data for negotiations:

```javascript
{
  "tool": "Salesforce",
  "yourPrice": 150,
  "marketAverage": 125,
  "bestPrice": 95,
  "negotiationRange": "20-35% discount possible"
}
```

### Negotiation Tactics

1. **Volume discounts**: Consolidate licenses for better rates
2. **Multi-year deals**: Lock in lower rates (but include exit clauses)
3. **Competitive pressure**: Show alternatives (use our comparisons)
4. **Timing**: Negotiate at end of vendor quarter/year
5. **Bundle deals**: Combine products from same vendor

### Sample Negotiation Email

```
Subject: License Renewal Discussion - [Company]

Hi [Vendor Rep],

We're reviewing our SaaS stack and preparing for our upcoming renewal.

Based on our analysis:
- Current usage: 70 active users (down from 100 licenses)
- Market benchmarks show similar companies paying $X/user
- We're evaluating [Competitor] as an alternative

We'd like to discuss:
1. Adjusting license count to match actual usage
2. Pricing alignment with market rates
3. [If applicable] Downgrading to tier that matches our needs

We value our partnership and would prefer to continue, but need 
pricing that reflects our actual usage and market conditions.

Best regards
```

---

## Tracking Progress

### Key Metrics

| Metric | Target | How to Track |
|--------|--------|--------------|
| Monthly SaaS spend | ↓20% | Finance reports |
| Cost per employee | < Industry avg | Spend ÷ headcount |
| License utilization | > 80% | Usage analytics |
| Tool count | ↓ Where redundant | Inventory count |
| AI cost per request | ↓30% | API billing |

### Monthly Review

```javascript
{
  "month": "January 2025",
  "metrics": {
    "totalSpend": 45000,
    "vsLastMonth": -3000,
    "savingsRealized": 5000,
    "savingsRemaining": 8000
  },
  "actions": [
    { "completed": "Cancelled 3 zombie subscriptions" },
    { "completed": "Reduced Zoom licenses by 50" },
    { "inProgress": "Migrating from Zoom to Teams" }
  ]
}
```

---

## Common Pitfalls

### ❌ Don't

- Cut tools without consulting users
- Optimize prematurely (measure first)
- Ignore contract exit terms
- Choose cheapest option without quality check
- Forget to communicate changes

### ✅ Do

- Get stakeholder buy-in
- Pilot changes with small groups
- Document current workflows before changes
- Plan migration carefully
- Monitor for issues post-change

---

## ROI Calculator

### Basic Formula

```
Monthly Savings = (Current Spend) - (Optimized Spend)
Annual Savings = Monthly Savings × 12
ROI = Annual Savings / (Implementation Cost + StackAudit Cost)
```

### Example

```
Current State:
  - SaaS spend: $50,000/month
  - Identified waste: $10,000/month (20%)

Optimization Cost:
  - StackAudit: $99/month
  - Internal effort: 40 hours × $75/hour = $3,000 (one-time)

Results:
  - Monthly savings: $10,000
  - Annual savings: $120,000
  - Implementation cost: $3,000 + ($99 × 12) = $4,188
  - First-year ROI: $120,000 / $4,188 = 2,866%
```

---

## Next Steps

1. **Run your first audit** → [Getting Started](../getting-started.md)
2. **Generate a report** → [Reports](./reports.md)
3. **Review recommendations** → [Recommendations](./recommendations.md)
4. **Get help** → [FAQ](../faq.md)
