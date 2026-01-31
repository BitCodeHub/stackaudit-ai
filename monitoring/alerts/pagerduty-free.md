# PagerDuty Free Tier Setup

## Overview

PagerDuty offers a **free tier** for up to 5 users with basic incident management capabilities.

### Free Tier Limits
- 5 users
- Unlimited incidents
- Mobile app access
- Email & SMS alerts
- Basic escalation policies

## Step 1: Create Account

1. Go to [pagerduty.com](https://www.pagerduty.com)
2. Click **Start Free Trial**
3. Sign up with work email
4. After trial, downgrade to free tier

## Step 2: Create Service

1. Go to **Services** → **Service Directory**
2. Click **New Service**
3. Name: `StackAudit Production`
4. Select integration type based on tool:
   - For UptimeRobot: **Events API V2**
   - For Sentry: **Sentry**
5. Create service and copy Integration Key

## Step 3: Configure Integrations

### UptimeRobot → PagerDuty

1. In UptimeRobot, go to **Alert Contacts**
2. Add **PagerDuty**
3. Paste Integration Key
4. Test connection

### Sentry → PagerDuty

1. In Sentry → **Settings** → **Integrations**
2. Find **PagerDuty** → Install
3. Connect to PagerDuty account
4. Map Sentry projects to PagerDuty services

### Manual Integration (Webhook)

```bash
# Trigger an incident
curl -X POST https://events.pagerduty.com/v2/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "routing_key": "YOUR_INTEGRATION_KEY",
    "event_action": "trigger",
    "payload": {
      "summary": "StackAudit API is down",
      "source": "UptimeRobot",
      "severity": "critical",
      "custom_details": {
        "url": "https://api.stackaudit.ai",
        "downtime": "5 minutes"
      }
    }
  }'
```

## Step 4: Create Escalation Policy

1. Go to **People** → **Escalation Policies**
2. Create new policy: `StackAudit On-Call`
3. Configure escalation levels:

| Level | Target | Timeout |
|-------|--------|---------|
| 1 | Primary on-call | 5 min |
| 2 | Secondary on-call | 10 min |
| 3 | All team members | 15 min |

## Step 5: Create On-Call Schedule

1. Go to **People** → **On-Call Schedules**
2. Create schedule: `StackAudit Rotation`
3. Configure rotation:
   - Type: Weekly
   - Handoff: Monday 9 AM
   - Members: Add team

## Step 6: Configure Notification Rules

Each user should configure their notification preferences:

1. Click profile → **My Profile**
2. Go to **Notification Rules**
3. Recommended setup:

| Urgency | Method | Delay |
|---------|--------|-------|
| High | Push notification | Immediately |
| High | SMS | After 1 min |
| High | Phone call | After 5 min |
| Low | Email | Immediately |
| Low | Push | After 10 min |

## Alternative: Opsgenie Free Tier

If PagerDuty doesn't fit, **Opsgenie** (by Atlassian) offers:
- Free for up to 5 users
- Similar features
- Better Slack integration

### Opsgenie Setup

1. Go to [opsgenie.com](https://www.opsgenie.com)
2. Sign up with Atlassian account
3. Create team: `StackAudit`
4. Add integration for UptimeRobot/Sentry

## Best Practices

### Incident Severity

| Severity | Criteria | Response Time |
|----------|----------|---------------|
| P1 - Critical | Complete outage, data loss | 15 min |
| P2 - High | Major feature broken | 1 hour |
| P3 - Medium | Minor feature impact | 4 hours |
| P4 - Low | Cosmetic, non-urgent | Next business day |

### On-Call Guidelines

1. **Acknowledge** incidents within 5 minutes
2. **Communicate** status in Slack
3. **Escalate** if unable to resolve
4. **Document** root cause after resolution
5. **Update** status page for user-facing issues
