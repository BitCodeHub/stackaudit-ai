# Slack Webhook Integration

## Setup for StackAudit.ai Alerts

### Step 1: Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name: `StackAudit Alerts`
4. Workspace: Select your workspace

### Step 2: Enable Incoming Webhooks

1. In your app settings, go to **Incoming Webhooks**
2. Toggle **Activate Incoming Webhooks** → On
3. Click **Add New Webhook to Workspace**
4. Select channel: `#stackaudit-alerts`
5. Click **Allow**
6. Copy the Webhook URL

### Step 3: Store Webhook URL

```bash
# Add to .env (example format - replace with your actual webhook URL from Step 2)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WORKSPACE_ID/YOUR_CHANNEL_ID/YOUR_SECRET_TOKEN
```

### Step 4: Test Webhook

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🧪 Test alert from StackAudit.ai monitoring"}' \
  $SLACK_WEBHOOK_URL
```

### Alert Message Formats

#### Downtime Alert
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🔴 Service Down: StackAudit API",
        "emoji": true
      }
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*Service:*\nStackAudit API"},
        {"type": "mrkdwn", "text": "*Status:*\nDown"},
        {"type": "mrkdwn", "text": "*Duration:*\n5 minutes"},
        {"type": "mrkdwn", "text": "*URL:*\nhttps://api.stackaudit.ai"}
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Status"},
          "url": "https://status.stackaudit.ai"
        },
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Logs"},
          "url": "https://dashboard.render.com"
        }
      ]
    }
  ]
}
```

#### Recovery Alert
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🟢 Service Recovered: StackAudit API",
        "emoji": true
      }
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*Service:*\nStackAudit API"},
        {"type": "mrkdwn", "text": "*Status:*\nUp"},
        {"type": "mrkdwn", "text": "*Downtime:*\n12 minutes"},
        {"type": "mrkdwn", "text": "*Recovered at:*\n2024-01-15 10:32 UTC"}
      ]
    }
  ]
}
```

#### Error Alert
```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "⚠️ Error Spike Detected",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*50 errors* in the last 5 minutes on `StackAudit API`"
      }
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*Top Error:*\nDatabaseConnectionError"},
        {"type": "mrkdwn", "text": "*Environment:*\nProduction"}
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View in Sentry"},
          "url": "https://sentry.io/organizations/stackaudit/issues/"
        }
      ]
    }
  ]
}
```

### Create Alert Channels

| Channel | Purpose | Alert Types |
|---------|---------|-------------|
| `#stackaudit-alerts` | All alerts | Everything |
| `#stackaudit-critical` | Critical only | Downtime, high error rates |
| `#stackaudit-oncall` | On-call engineers | After-hours critical |

### UptimeRobot Integration

1. In UptimeRobot, go to **My Settings** → **Alert Contacts**
2. Add new contact → **Webhook (advanced)**
3. URL: Your Slack webhook
4. POST data (JSON): Use downtime alert format above
5. Test and save
