# StackAudit.ai Monitoring & Alerting

Comprehensive monitoring stack using **free-tier** tools for uptime, error tracking, and performance monitoring.

## 🎯 Monitoring Stack Overview

| Tool | Purpose | Tier | Cost |
|------|---------|------|------|
| UptimeRobot | Uptime monitoring & status page | Free | $0/mo |
| Sentry | Error tracking & performance | Free | $0/mo (5K errors) |
| Render Metrics | Infrastructure metrics | Built-in | $0 |
| GitHub Actions | Health check cron | Built-in | $0 |

## 📁 Directory Structure

```
monitoring/
├── README.md           # This file
├── sentry/             # Sentry error tracking configs
│   ├── sentry.client.config.ts   # Frontend Sentry setup
│   ├── sentry.server.config.py   # Backend Sentry setup
│   └── alerts.json               # Sentry alert rules
├── uptime/             # UptimeRobot configuration
│   ├── monitors.json             # Monitor definitions
│   ├── status-page.json          # Public status page config
│   └── setup-guide.md            # Manual setup instructions
├── alerts/             # Alert configurations
│   ├── pagerduty-free.md         # PagerDuty free tier setup
│   ├── slack-webhook.md          # Slack integration
│   └── discord-webhook.md        # Discord integration
└── dashboards/         # Dashboard configs
    └── metrics.md                # Key metrics to track
```

## 🚀 Quick Setup

### 1. UptimeRobot (5 minutes)
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Import monitors from `uptime/monitors.json`
3. Set up alert contacts (email, Slack, Discord)
4. Enable public status page

### 2. Sentry (10 minutes)
1. Sign up at [sentry.io](https://sentry.io)
2. Create project for Python (FastAPI backend)
3. Create project for React (frontend)
4. Copy DSN keys to environment variables
5. Deploy with Sentry SDK integration

### 3. Health Checks (already configured)
- Backend: `GET /api/health` - Returns service status
- Database: Included in health check response
- Redis: Included in health check response

## 📊 Key Metrics

### Uptime Targets
| Service | Target | Alert Threshold |
|---------|--------|-----------------|
| API | 99.9% | < 99.5% |
| Frontend | 99.9% | < 99.5% |
| Status Page | 99.99% | < 99.9% |

### Response Time Targets
| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| Health Check | < 50ms | < 100ms | < 200ms |
| API Calls | < 200ms | < 500ms | < 1s |
| Repo Analysis | < 30s | < 60s | < 120s |

### Error Rate Targets
- API Error Rate: < 1%
- Frontend Crash Rate: < 0.1%
- Job Failure Rate: < 5%

## 🔔 Alert Channels

Configure at least 2 alert channels for redundancy:

1. **Email** (default) - All alerts
2. **Slack/Discord** - Critical alerts only
3. **SMS** (optional) - Downtime > 5 min

## 📈 Cost Breakdown

| Service | Free Tier Limits | Our Usage |
|---------|------------------|-----------|
| UptimeRobot | 50 monitors, 5-min intervals | ~10 monitors |
| Sentry | 5K errors/month, 10K transactions | Well under |
| Render | Basic metrics included | Included |

**Total Monthly Cost: $0**
