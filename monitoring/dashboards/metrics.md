# StackAudit.ai Key Metrics Dashboard

## 📊 Core Metrics to Track

### Availability Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Uptime | % time service is available | 99.9% | < 99.5% |
| Health Check | API health endpoint status | 100% up | Any failure |
| SSL Expiry | Days until cert expires | > 30 days | < 14 days |

### Performance Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| API Response Time (P50) | Median response time | < 200ms | > 500ms |
| API Response Time (P95) | 95th percentile | < 500ms | > 1s |
| API Response Time (P99) | 99th percentile | < 1s | > 2s |
| Time to First Byte | Initial response | < 100ms | > 300ms |
| Frontend Load Time | Full page load | < 2s | > 5s |

### Error Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Error Rate | % requests resulting in 5xx | < 0.1% | > 1% |
| Exception Rate | Unhandled exceptions/min | 0 | > 5 |
| Failed Jobs | Analysis jobs that fail | < 5% | > 10% |

### Business Metrics

| Metric | Description | Track In |
|--------|-------------|----------|
| Daily Active Users | Unique users/day | PostHog/Analytics |
| Analyses Completed | Successful repo analyses | Database |
| Analysis Duration | Time to complete analysis | Sentry Performance |
| Sign-up Rate | New registrations/day | Analytics |
| Conversion Rate | Free → Paid | Stripe |

## 🔧 Render.com Built-in Metrics

Render provides these metrics for free:

### Web Service Metrics
- CPU Usage (%)
- Memory Usage (MB)
- Active Connections
- Request Count
- Response Time (avg/p50/p95/p99)

### Worker Metrics
- CPU Usage
- Memory Usage
- Job Queue Length

### Database Metrics
- Connection Count
- Query Duration
- Storage Usage

**Access:** dashboard.render.com → Service → Metrics

## 📈 Sentry Performance Metrics

Configure these in Sentry Performance:

### Transactions to Monitor

```
/api/auth/github/callback    # OAuth callback
/api/analyze                 # Start analysis
/api/reports/{id}           # View report
/api/reports                # List reports
/api/user/profile           # User profile
```

### Apdex Score

Target Apdex: **0.95**

| Score | Meaning |
|-------|---------|
| 0.94-1.00 | Excellent |
| 0.85-0.93 | Good |
| 0.70-0.84 | Fair |
| 0.50-0.69 | Poor |
| 0.00-0.49 | Unacceptable |

## 📉 Free Monitoring Dashboard Options

### Option 1: Grafana Cloud (Free Tier)

- 10K metrics
- 50GB logs
- 14-day retention
- 3 users

Setup:
1. Sign up at grafana.com
2. Add Prometheus data source
3. Import community dashboards

### Option 2: Datadog (Free Tier)

- 5 hosts
- 1-day retention
- Basic dashboards

### Option 3: Custom Status Page

Using UptimeRobot's status page (included in free tier):
- Real-time status
- Incident history
- Component breakdown
- Custom domain

## 🎯 SLI/SLO Definitions

### Service Level Indicators (SLIs)

1. **Availability SLI**
   ```
   (successful health checks) / (total health checks) × 100
   ```

2. **Latency SLI**
   ```
   (requests < 500ms) / (total requests) × 100
   ```

3. **Error SLI**
   ```
   (requests with 2xx/3xx) / (total requests) × 100
   ```

### Service Level Objectives (SLOs)

| SLI | SLO | Error Budget (monthly) |
|-----|-----|------------------------|
| Availability | 99.9% | 43.2 min downtime |
| Latency (P95) | 99% < 500ms | 1% slow requests |
| Error Rate | 99.9% success | 0.1% errors |

## 🚨 Alert Escalation Matrix

| Severity | Examples | Notification | Response |
|----------|----------|--------------|----------|
| Critical | API down, data loss | SMS + Call | 15 min |
| High | Slow API, job failures | Slack + Email | 1 hour |
| Medium | High error rate | Slack | 4 hours |
| Low | Warnings, notices | Email | 24 hours |

## 📋 Daily Health Check Checklist

```markdown
## Daily Monitoring Checklist

- [ ] Check UptimeRobot dashboard - all green?
- [ ] Review Sentry issues - any new errors?
- [ ] Check Render metrics - normal resource usage?
- [ ] Verify job queue - processing normally?
- [ ] Check SSL cert expiry - > 14 days?
- [ ] Review yesterday's error rate - < 1%?
- [ ] Check response times - P95 < 500ms?
```

## 📊 Weekly Metrics Review Template

```markdown
## Weekly Metrics Review - Week of [DATE]

### Availability
- Uptime: XX.XX%
- Incidents: X
- Total downtime: X minutes

### Performance  
- API P50: XXX ms
- API P95: XXX ms
- Frontend Load: X.X s

### Errors
- Total errors: XXX
- Error rate: X.XX%
- Top error: [Error name]

### Usage
- Daily active users (avg): XXX
- Analyses completed: XXX
- New sign-ups: XXX

### Action Items
1. 
2. 
3. 
```
