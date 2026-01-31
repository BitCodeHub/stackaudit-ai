# Sentry Setup Guide for StackAudit.ai

## Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up with GitHub for easy integration
3. Create organization: `stackaudit`

## Step 2: Create Projects

### Backend Project (Python/FastAPI)

1. Click **Create Project**
2. Select Platform: **Python** → **FastAPI**
3. Project name: `stackaudit-backend`
4. Copy the DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

### Frontend Project (React)

1. Click **Create Project**
2. Select Platform: **JavaScript** → **React**
3. Project name: `stackaudit-frontend`
4. Copy the DSN

## Step 3: Install SDKs

### Backend

```bash
cd server/
pip install sentry-sdk[fastapi,celery,sqlalchemy,redis,httpx]
```

### Frontend

```bash
cd client/
npm install @sentry/react @sentry/tracing
```

## Step 4: Configure Environment Variables

### Backend (.env)

```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/backend-project-id
SENTRY_ENVIRONMENT=production
APP_VERSION=1.0.0
```

### Frontend (.env)

```env
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/frontend-project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
```

## Step 5: Integrate into Application

### Backend (main.py)

```python
from monitoring.sentry.sentry_server_config import init_sentry

# Initialize Sentry before app starts
init_sentry()

app = FastAPI()
```

### Frontend (main.tsx)

```typescript
import { initSentry } from './monitoring/sentry.client.config';

// Initialize Sentry before React renders
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Step 6: Set Up Source Maps (Frontend)

### Vite Configuration

```typescript
// vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "stackaudit",
      project: "stackaudit-frontend",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: true,
  },
});
```

### Create Auth Token

1. Go to Sentry → Settings → Auth Tokens
2. Create new token with `project:write` scope
3. Add to CI/CD: `SENTRY_AUTH_TOKEN`

## Step 7: Configure Alerts

Use the alert configurations in `alerts.json`:

1. Go to **Alerts** → **Create Alert**
2. For each alert in the JSON:
   - Select alert type (Issue Alert or Metric Alert)
   - Configure conditions and thresholds
   - Add notification actions

### Quick Alert Setup

**Critical Alerts (immediate notification):**
- High Error Rate
- Database Connection Errors
- Analysis Job Failures

**Warning Alerts (5-minute delay):**
- Slow API Response
- Authentication Errors
- Error Regression

## Step 8: Set Up Slack Integration

1. Go to **Settings** → **Integrations**
2. Find **Slack** → Click **Add Workspace**
3. Authorize Sentry app
4. Configure default channel: `#stackaudit-alerts`

## Step 9: Create Release Tracking

### In CI/CD Pipeline

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Create release
export SENTRY_AUTH_TOKEN=your-auth-token
sentry-cli releases new "stackaudit-backend@$VERSION"
sentry-cli releases set-commits "stackaudit-backend@$VERSION" --auto
sentry-cli releases finalize "stackaudit-backend@$VERSION"
sentry-cli releases deploys "stackaudit-backend@$VERSION" new -e production
```

## Free Tier Limits

| Feature | Free Limit | Our Usage |
|---------|------------|-----------|
| Errors | 5,000/month | ~500 estimated |
| Performance | 10K transactions/month | ~5K estimated |
| Replays | 50 sessions/month | Low sampling |
| Team members | Unlimited | ✓ |
| Retention | 30 days | ✓ |

## Testing Sentry

### Backend Test

```python
# Test error capture
from sentry_sdk import capture_exception

try:
    1/0
except Exception as e:
    capture_exception(e)
```

### Frontend Test

```typescript
// Test error capture
import * as Sentry from "@sentry/react";

Sentry.captureException(new Error("Test error"));
```

## Troubleshooting

### Events Not Appearing

1. Check DSN is correct
2. Verify environment matches filter
3. Check if error is being filtered
4. Look for `init_sentry()` call

### Too Many Events

1. Adjust sample rates
2. Add more filters in `before_send`
3. Check for error loops

### Missing Stack Traces

1. Enable source maps
2. Upload source maps to Sentry
3. Verify release version matches
