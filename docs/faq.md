# Frequently Asked Questions

Common questions about StackAudit.ai and SaaS stack optimization.

---

## General Questions

### What is StackAudit.ai?

StackAudit.ai is an AI-powered platform that helps organizations analyze, optimize, and manage their SaaS (Software as a Service) and AI tool spending. It identifies waste, redundancy, and opportunities for cost savings.

### Who is StackAudit for?

StackAudit is designed for:

- **IT Leaders** — Managing SaaS portfolios
- **Finance Teams** — Controlling software spend
- **FinOps Practitioners** — Optimizing cloud costs
- **Engineering Managers** — Evaluating AI/ML tooling
- **Procurement Teams** — Negotiating renewals

### How much can I save?

Most organizations find **20-40% potential savings** in their first audit. Common sources of savings include:

- Unused licenses (30% average waste)
- Overlapping tools (2-5 tools doing the same thing)
- Overprovisioned tiers (paying for features you don't use)
- Zombie subscriptions (no active users)

### Is my data secure?

Yes. StackAudit.ai:

- **Encrypts all data** in transit (TLS 1.3) and at rest (AES-256)
- **Never stores credentials** to your SaaS tools
- **SOC 2 Type II compliant**
- **GDPR compliant**
- **Processes data in your region** (US, EU, or self-hosted)

---

## Getting Started

### How do I run my first audit?

1. **Install StackAudit** (see [Getting Started](./getting-started.md))
2. **Prepare your tool list** (spreadsheet or manual entry)
3. **Submit via API or dashboard**
4. **Download your PDF report**

```bash
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"clientName": "My Company", "currentStack": [...]}'
```

### What data do I need to provide?

At minimum:
- **Organization name**
- **List of tools** (name, cost, users)

For a more comprehensive audit, include:
- Utilization rates
- Contract dates
- Department ownership
- Feature usage

### Can I import data from spreadsheets?

Yes! Export your data as JSON:

```json
{
  "clientName": "My Company",
  "currentStack": [
    {"name": "Slack", "monthlyCost": 750, "users": 100},
    {"name": "Zoom", "monthlyCost": 1500, "users": 100}
  ]
}
```

Or use our spreadsheet template (available in the dashboard).

### How long does an audit take?

- **Basic audit**: < 1 second
- **Full audit with AI analysis**: 5-30 seconds
- **PDF report generation**: 2-5 seconds

---

## Features

### What types of tools can StackAudit analyze?

StackAudit can analyze:

| Category | Examples |
|----------|----------|
| **SaaS Tools** | Slack, Salesforce, HubSpot, Zoom |
| **Productivity** | Microsoft 365, Google Workspace |
| **AI/ML** | OpenAI, Anthropic, AWS Bedrock |
| **Infrastructure** | AWS, GCP, Azure |
| **Development** | GitHub, GitLab, Jira |

### How does overlap detection work?

StackAudit compares tools across multiple dimensions:

1. **Capability overlap** — Do tools share features?
2. **Use case overlap** — Are they solving the same problem?
3. **Category overlap** — Multiple tools in same category?
4. **Pairwise similarity** — How similar are any two tools?

Example output:
```
⚠️ OVERLAP DETECTED
Slack + Zoom both provide video calling
Slack Huddles could replace basic Zoom usage
Potential savings: $500/month
```

### What's included in reports?

Standard reports include:

- **Executive Summary** — Key metrics at a glance
- **Tool Inventory** — Complete list with costs/usage
- **Waste Analysis** — Identified savings opportunities
- **Overlap Detection** — Redundant tools
- **Recommendations** — Prioritized action items
- **ROI Projections** — Expected savings timeline

### Can I customize reports?

Yes! Customize:

- **Branding** — Logo, colors, company name
- **Sections** — Include/exclude specific sections
- **Format** — PDF, JSON, or CSV
- **Detail level** — Executive vs. detailed

---

## Pricing & Plans

### Is there a free tier?

Yes! The free tier includes:

- **5 audits per month**
- **Up to 25 tools per audit**
- **Basic PDF reports**
- **Community support**

### What's included in paid plans?

| Feature | Free | Starter ($29/mo) | Pro ($99/mo) |
|---------|------|------------------|--------------|
| Audits/month | 5 | 50 | Unlimited |
| Tools/audit | 25 | 100 | Unlimited |
| AI recommendations | Basic | Advanced | Advanced |
| Custom branding | ❌ | ✅ | ✅ |
| API access | Limited | Full | Full |
| Support | Community | Email | Priority |

### Do you offer enterprise pricing?

Yes! Enterprise includes:

- Custom integrations
- SSO/SAML
- Dedicated support
- On-premise deployment
- Custom SLAs

Contact sales@stackaudit.ai.

---

## Technical Questions

### What's the API rate limit?

| Plan | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 10 | 100 |
| Starter | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | Custom | Custom |

### What formats are supported?

**Input:**
- JSON (API)
- CSV (upload)
- Direct integrations (coming soon)

**Output:**
- PDF (reports)
- JSON (API responses)
- CSV (export)

### Can I self-host StackAudit?

Yes! Self-hosting is available for Enterprise customers:

```bash
docker run -d \
  -p 3001:3001 \
  -v /data/stackaudit:/app/data \
  stackaudit/stackaudit:enterprise
```

Contact sales for licensing.

### Does StackAudit integrate with other tools?

Coming soon:
- Okta (SSO discovery)
- Google Workspace (app inventory)
- AWS Cost Explorer
- Stripe (billing data)
- Salesforce

---

## Cost Analysis

### How are savings calculated?

Savings are calculated based on:

1. **Underutilization** — Licenses with < 30% usage
2. **Redundancy** — Overlapping tools (keep best, cut rest)
3. **Overprovisioning** — Paying for unused tiers
4. **Zombies** — Tools with no active users in 30+ days

Formula:
```
Monthly Savings = 
  (Unused Licenses × License Cost) +
  (Redundant Tools Monthly Cost × 0.8) +
  (Overprovision Delta)
```

### What's a good health score?

| Score | Rating | Meaning |
|-------|--------|---------|
| 90-100 | Excellent | Highly optimized stack |
| 70-89 | Good | Minor optimization opportunities |
| 50-69 | Fair | Significant waste present |
| 30-49 | Poor | Major optimization needed |
| 0-29 | Critical | Urgent review required |

### How do I improve my health score?

Focus on:

1. **Eliminate zombies** — Cancel unused tools
2. **Reduce overlap** — Consolidate similar tools
3. **Right-size licenses** — Match to actual usage
4. **Negotiate renewals** — Use our benchmarks

---

## AI Stack Analysis

### Can StackAudit analyze AI/LLM costs?

Yes! Our AI Stack module analyzes:

- **LLM API spend** (OpenAI, Anthropic, etc.)
- **Token usage patterns**
- **Model selection optimization**
- **Cheaper alternatives**
- **Caching opportunities**

### What AI providers are supported?

| Provider | Status |
|----------|--------|
| OpenAI | ✅ Full support |
| Anthropic | ✅ Full support |
| Google Gemini | ✅ Full support |
| Mistral | ✅ Full support |
| Groq | ✅ Full support |
| AWS Bedrock | ✅ Full support |
| Cohere | ✅ Full support |
| Together AI | ✅ Full support |
| DeepSeek | ⚠️ With warnings |

### How do you handle provider-specific warnings?

We flag compliance and risk concerns:

```json
{
  "provider": "deepseek",
  "warnings": [
    "Data processed in China",
    "May not meet GDPR requirements",
    "Consider for non-sensitive workloads only"
  ]
}
```

---

## Troubleshooting

### I'm getting a "clientName required" error

Ensure your request includes `clientName`:

```json
{
  "clientName": "My Company",   // ← Required!
  "currentStack": [...]
}
```

### Report generation is slow

If PDF generation is slow:

1. Reduce the number of tools
2. Check server resources (memory)
3. Use async generation for large reports

### I can't download my report

1. Check the filename is correct
2. Ensure the reports directory exists
3. Verify file permissions

```bash
ls -la reports/
# Ensure your user can read files
```

### See more in [Troubleshooting →](./troubleshooting.md)

---

## Contact & Support

### How do I get help?

- **Documentation**: You're here! 📚
- **Email**: support@stackaudit.ai
- **GitHub Issues**: github.com/stackaudit/stackaudit/issues
- **Discord**: discord.gg/stackaudit

### How do I report a bug?

1. Check existing [issues](https://github.com/stackaudit/stackaudit/issues)
2. Create a new issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details

### Can I request a feature?

Yes! Submit feature requests via:
- GitHub Discussions
- Email: feedback@stackaudit.ai

---

*Have a question not answered here? Contact support@stackaudit.ai*
