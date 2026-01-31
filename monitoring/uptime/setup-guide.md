# UptimeRobot Setup Guide

## Step 1: Create Account

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up with email (free account)
3. Verify email address

## Step 2: Create Monitors

### Via Dashboard (Manual)

For each monitor in `monitors.json`:

1. Click **"+ Add New Monitor"**
2. Select **Monitor Type**: HTTP(s)
3. Fill in details:
   - **Friendly Name**: From `name` field
   - **URL**: From `url` field  
   - **Monitoring Interval**: 5 minutes (free tier)
4. Click **"Create Monitor"**

### Via API (Automated)

```bash
# Set your API key
export UPTIMEROBOT_API_KEY="your-api-key-here"

# Create a monitor
curl -X POST "https://api.uptimerobot.com/v2/newMonitor" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=$UPTIMEROBOT_API_KEY" \
  -d "friendly_name=StackAudit API - Health" \
  -d "url=https://api.stackaudit.ai/api/health" \
  -d "type=1" \
  -d "interval=300"
```

## Step 3: Set Up Alert Contacts

### Email (Primary)

1. Go to **My Settings** → **Alert Contacts**
2. Click **"+ Add Alert Contact"**
3. Select **Email**
4. Enter: `alerts@stackaudit.ai`
5. Save and verify email

### Slack Integration

1. In UptimeRobot, go to **Alert Contacts**
2. Click **"+ Add Alert Contact"**
3. Select **Slack**
4. Authorize with your Slack workspace
5. Select channel: `#stackaudit-alerts`

### Discord Integration

1. In Discord, create a webhook:
   - Server Settings → Integrations → Webhooks
   - Create Webhook → Copy URL
2. In UptimeRobot:
   - Add Alert Contact → Webhook
   - Paste Discord webhook URL
   - Test notification

## Step 4: Create Status Page

1. Go to **Status Pages** in UptimeRobot
2. Click **"+ Create Status Page"**
3. Configure:
   - **Name**: StackAudit.ai Status
   - **Monitors**: Select all production monitors
4. Custom Domain Setup:
   - Add CNAME record: `status.stackaudit.ai` → `stats.uptimerobot.com`
   - Enable custom domain in UptimeRobot

## Step 5: Configure Alert Settings

### Recommended Settings

| Setting | Value |
|---------|-------|
| Alert threshold (down) | 1 check |
| Alert threshold (up) | 1 check |
| SSL certificate alerts | 14 days before expiry |
| Maintenance windows | Sunday 3-4 AM PT |

## Useful API Endpoints

```bash
# Get all monitors
curl -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -d "api_key=$UPTIMEROBOT_API_KEY"

# Get monitor status
curl -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -d "api_key=$UPTIMEROBOT_API_KEY" \
  -d "monitors=monitor_id" \
  -d "response_times=1"

# Pause a monitor
curl -X POST "https://api.uptimerobot.com/v2/editMonitor" \
  -d "api_key=$UPTIMEROBOT_API_KEY" \
  -d "id=monitor_id" \
  -d "status=0"
```

## Troubleshooting

### Monitor Shows Down But Site Works

- Check if firewall blocks UptimeRobot IPs
- Verify URL is publicly accessible
- Check if keyword matching is correct

### Not Receiving Alerts

1. Check spam folder
2. Verify alert contact is attached to monitor
3. Test alert contact manually
4. Check alert threshold settings
