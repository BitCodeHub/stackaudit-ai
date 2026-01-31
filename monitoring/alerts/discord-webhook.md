# Discord Webhook Integration

## Setup for StackAudit.ai Alerts

### Step 1: Create Discord Webhook

1. Go to your Discord server
2. Click on the channel where you want alerts → **Edit Channel**
3. Go to **Integrations** → **Webhooks**
4. Click **New Webhook**
5. Name: `StackAudit Alerts`
6. Copy Webhook URL

### Step 2: Store Webhook URL

```bash
# Add to .env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXXXXXXXXX/XXXXXXXXXXXXXXXXXXXX
```

### Step 3: Test Webhook

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"content": "🧪 Test alert from StackAudit.ai monitoring", "username": "StackAudit Monitor"}' \
  $DISCORD_WEBHOOK_URL
```

### Alert Message Formats

#### Downtime Alert (Rich Embed)
```json
{
  "username": "StackAudit Monitor",
  "avatar_url": "https://stackaudit.ai/favicon.ico",
  "embeds": [
    {
      "title": "🔴 Service Down",
      "description": "StackAudit API is not responding",
      "color": 15158332,
      "fields": [
        {
          "name": "Service",
          "value": "StackAudit API",
          "inline": true
        },
        {
          "name": "Status",
          "value": "Down",
          "inline": true
        },
        {
          "name": "Duration",
          "value": "5 minutes",
          "inline": true
        },
        {
          "name": "URL",
          "value": "[api.stackaudit.ai](https://api.stackaudit.ai)",
          "inline": false
        }
      ],
      "footer": {
        "text": "UptimeRobot"
      },
      "timestamp": "2024-01-15T10:20:00.000Z"
    }
  ]
}
```

#### Recovery Alert
```json
{
  "username": "StackAudit Monitor",
  "avatar_url": "https://stackaudit.ai/favicon.ico",
  "embeds": [
    {
      "title": "🟢 Service Recovered",
      "description": "StackAudit API is back online",
      "color": 3066993,
      "fields": [
        {
          "name": "Service",
          "value": "StackAudit API",
          "inline": true
        },
        {
          "name": "Downtime",
          "value": "12 minutes",
          "inline": true
        },
        {
          "name": "Recovered At",
          "value": "2024-01-15 10:32 UTC",
          "inline": true
        }
      ],
      "footer": {
        "text": "UptimeRobot"
      },
      "timestamp": "2024-01-15T10:32:00.000Z"
    }
  ]
}
```

#### Error Alert
```json
{
  "username": "StackAudit Monitor",
  "avatar_url": "https://stackaudit.ai/favicon.ico",
  "embeds": [
    {
      "title": "⚠️ Error Spike Detected",
      "description": "50 errors in the last 5 minutes",
      "color": 15105570,
      "fields": [
        {
          "name": "Top Error",
          "value": "`DatabaseConnectionError`",
          "inline": true
        },
        {
          "name": "Environment",
          "value": "Production",
          "inline": true
        },
        {
          "name": "Link",
          "value": "[View in Sentry](https://sentry.io/organizations/stackaudit/)",
          "inline": false
        }
      ],
      "footer": {
        "text": "Sentry"
      },
      "timestamp": "2024-01-15T10:25:00.000Z"
    }
  ]
}
```

### Discord Color Codes

| Status | Color Name | Color Code |
|--------|------------|------------|
| Critical/Down | Red | 15158332 |
| Warning | Orange | 15105570 |
| Success/Up | Green | 3066993 |
| Info | Blue | 3447003 |

### UptimeRobot Integration

1. In UptimeRobot → **Alert Contacts** → Add
2. Select **Webhook**
3. URL: `{DISCORD_WEBHOOK_URL}/slack` (Discord's Slack-compatible endpoint)
4. Method: POST
5. Test and save

### Sentry Integration

1. In Sentry → **Settings** → **Integrations**
2. Search for **Discord**
3. Add Discord Server
4. Select notification channel
5. Configure alert rules to use Discord

### Create Alert Channels

| Channel | Purpose | Who has access |
|---------|---------|----------------|
| `#stackaudit-alerts` | All production alerts | Team |
| `#stackaudit-deploys` | Deployment notifications | Team |
| `#stackaudit-status` | Status page updates | Public |
