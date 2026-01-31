# Changelog

All notable changes to StackAudit.ai are documented here.

---

## [1.0.0] - 2025-01-15

### 🎉 Initial Release

The first public release of StackAudit.ai!

### Added

#### Core Features
- **Stack Analysis Engine** — Analyze SaaS and AI tool stacks
  - Overlap detection
  - ROI analysis
  - Waste identification
  - Benchmark comparison
  - Consolidation opportunities

- **Recommendations Engine** — AI-powered optimization suggestions
  - Cost optimization recommendations
  - Provider alternatives
  - Capability gap analysis
  - Compliance recommendations

- **Report Generation** — Professional PDF reports
  - Executive summary
  - Tool-by-tool analysis
  - Waste breakdown
  - Recommendations with priorities
  - Implementation roadmap

#### API Endpoints
- `GET /health` — Service health check
- `POST /api/reports/generate` — Generate PDF report
- `GET /api/reports` — List all reports
- `GET /api/reports/download/:filename` — Download specific report
- `GET /api/templates/brands` — Brand presets
- `GET /api/templates/types` — Report types
- `GET /api/templates/sections` — Available sections
- `POST /api/templates/validate` — Validate audit data
- `POST /api/templates/calculate-summary` — Calculate summary
- `GET /api/sample-data` — Sample audit data

#### AI Stack Analysis
- Support for major LLM providers:
  - OpenAI (GPT-4, GPT-4o, GPT-4o-mini)
  - Anthropic (Claude Opus, Sonnet, Haiku)
  - Google (Gemini 2.5, 2.0, 1.5)
  - Mistral (Large, Medium, Small, Codestral)
  - Groq (LLaMA, GPT-OSS)
  - Together AI (LLaMA, DeepSeek)
  - Cohere (Command-R, Embed)
  - Perplexity (Sonar)
  - AWS Bedrock

- Cost benchmarking with 2025 pricing data
- Model alternative recommendations
- Caching and batch optimization suggestions

#### Documentation
- Getting Started guide
- Installation guide
- First Audit tutorial
- API Reference (Overview, Endpoints, Data Models, Authentication, Webhooks)
- Feature guides (Stack Analysis, Reports, Cost Optimization)
- FAQ
- Troubleshooting guide

### Technical
- Node.js 18+ support
- Express.js server
- PDF generation with PDFKit
- JSON API with CORS support
- Configurable via environment variables

---

## [Unreleased]

### Planned Features

#### Short-term
- [ ] CSV import for tool data
- [ ] Email report delivery
- [ ] Scheduled audits
- [ ] Dashboard UI
- [ ] User authentication

#### Medium-term
- [ ] Direct integrations (Okta, Google Workspace)
- [ ] Real-time monitoring and alerts
- [ ] Team collaboration features
- [ ] White-label reports
- [ ] Multiple export formats (XLSX, CSV)

#### Long-term
- [ ] AI-powered data discovery
- [ ] Contract management
- [ ] Renewal negotiations
- [ ] Vendor marketplace
- [ ] Enterprise SSO (SAML, OIDC)

---

## Version Format

StackAudit follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backward compatible)
- **PATCH** version for bug fixes (backward compatible)

Example: `1.2.3`
- `1` = Major version
- `2` = Minor version  
- `3` = Patch version

---

## Upgrade Guide

### From Pre-release to 1.0.0

No breaking changes — this is the initial release.

### Future Upgrades

Upgrade guides will be provided for any breaking changes in major releases.

---

## Release Notes Archive

Release notes for all versions are maintained in this changelog.

For detailed commit history, see [GitHub Releases](https://github.com/stackaudit/stackaudit/releases).

---

## Deprecation Policy

- **Deprecated features** are announced at least 2 minor versions before removal
- **Breaking changes** are reserved for major versions
- **Migration guides** provided for all breaking changes

---

## Feature Requests

Have a feature idea? Let us know:

- **GitHub Discussions**: [github.com/stackaudit/stackaudit/discussions](https://github.com/stackaudit/stackaudit/discussions)
- **Email**: feedback@stackaudit.ai
- **Twitter**: [@StackAuditAI](https://twitter.com/stackauditai)

---

*Stay tuned for more updates! 🚀*
