# 🚀 StackAudit.ai Deployment Guide

**Status:** Ready for deployment to Render.com  
**Target:** Production environment  
**Deadline:** Feb 15, 2025

---

## 📋 Prerequisites

✅ **Completed:**
- [x] Working backend code (Node.js + Express + Prisma)
- [x] Working frontend code (React + Vite)
- [x] GitHub repository connected (BitCodeHub/stackaudit)
- [x] Render account set up
- [x] `render.yaml` blueprint created

⏳ **Required API Keys (set in Render dashboard):**
- [ ] `ANTHROPIC_API_KEY` - Claude AI for audit analysis
- [ ] `STRIPE_SECRET_KEY` - Payment processing
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook validation

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│ Frontend (Static Site)                          │
│ • React + Vite                                  │
│ • Served via Render CDN                         │
│ • URL: https://stackaudit-frontend.onrender.com│
└────────────────┬────────────────────────────────┘
                 │ API Calls
                 ↓
┌─────────────────────────────────────────────────┐
│ Backend API (Web Service)                       │
│ • Node.js + Express + Prisma                    │
│ • URL: https://stackaudit-api.onrender.com     │
└────────────────┬────────────────────────────────┘
                 │ PostgreSQL Connection
                 ↓
┌─────────────────────────────────────────────────┐
│ Database (PostgreSQL)                           │
│ • Managed by Render                             │
│ • Internal connection only                      │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Steps

### Option A: Deploy via Render Dashboard (Recommended)

1. **Log in to Render:** https://dashboard.render.com
2. **Create New → Blueprint**
3. **Connect Repository:** Select `BitCodeHub/stackaudit`
4. **Render will auto-detect** `render.yaml` in the root
5. **Review Services:**
   - `stackaudit-api` (Backend)
   - `stackaudit-frontend` (Frontend)
   - `stackaudit-db` (PostgreSQL)
6. **Set Environment Variables:**
   - Go to `stackaudit-api` service
   - Navigate to "Environment" tab
   - Add:
     ```
     ANTHROPIC_API_KEY=sk-ant-api03-xxx
     STRIPE_SECRET_KEY=sk_live_xxx (or sk_test_xxx for testing)
     STRIPE_WEBHOOK_SECRET=whsec_xxx
     ```
7. **Click "Apply"** → Render will provision and deploy everything

### Option B: Deploy via Render API

Using the provided API key: `rnd_uKzrkA9u9JdzwgMPTjjRaxPHHM1y`

```bash
# Create blueprint deployment
curl -X POST https://api.render.com/v1/blueprints \
  -H "Authorization: Bearer rnd_uKzrkA9u9JdzwgMPTjjRaxPHHM1y" \
  -H "Content-Type: application/json" \
  -d '{
    "autoDeploy": "yes",
    "branch": "main",
    "repo": "https://github.com/BitCodeHub/stackaudit"
  }'
```

---

## 🔧 Post-Deployment Configuration

### 1. Update FRONTEND_URL

After frontend is deployed, update the backend's `FRONTEND_URL`:

```bash
# Get the frontend URL (will be something like https://stackaudit-frontend.onrender.com)
# Then update backend environment variable via Render dashboard
```

In Render dashboard:
- Go to `stackaudit-api` → Environment
- Update `FRONTEND_URL` to actual frontend URL
- Save (triggers redeploy)

### 2. Set Up Stripe Webhook

1. **Get the backend URL:** `https://stackaudit-api.onrender.com`
2. **Go to Stripe Dashboard:** https://dashboard.stripe.com/webhooks
3. **Add endpoint:** `https://stackaudit-api.onrender.com/api/webhook/stripe`
4. **Select events:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. **Copy the webhook secret** (starts with `whsec_`)
6. **Add to Render:**
   - Go to `stackaudit-api` → Environment
   - Set `STRIPE_WEBHOOK_SECRET=whsec_xxx`

### 3. Database Migrations

Migrations run automatically on startup via:
```bash
npx prisma migrate deploy
```

To manually run migrations (if needed):
```bash
# In Render shell for stackaudit-api
npx prisma migrate deploy
```

To view database in Prisma Studio (locally):
```bash
# Get DATABASE_URL from Render dashboard
export DATABASE_URL="postgresql://..."
npx prisma studio
```

---

## 🔐 Environment Variables Reference

### Backend (`stackaudit-api`)

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| `NODE_ENV` | Auto | ✅ | Set to `production` |
| `PORT` | Auto | ✅ | Set to `3001` |
| `DATABASE_URL` | Database | ✅ | Auto-linked from `stackaudit-db` |
| `FRONTEND_URL` | Manual | ✅ | Frontend URL for CORS |
| `ANTHROPIC_API_KEY` | Manual | ✅ | Claude AI API key |
| `STRIPE_SECRET_KEY` | Manual | ✅ | Stripe payment processing |
| `STRIPE_WEBHOOK_SECRET` | Manual | ✅ | Stripe webhook validation |

### Frontend (`stackaudit-frontend`)

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| `VITE_API_URL` | Auto | ✅ | Backend API URL (auto-linked) |

---

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```bash
curl https://stackaudit-api.onrender.com/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-01-29T12:00:00.000Z"
}
```

### Service URLs

- **Backend API:** https://stackaudit-api.onrender.com
- **Frontend:** https://stackaudit-frontend.onrender.com
- **Database:** Internal only (accessible via `stackaudit-api`)

### Logs

View logs in Render dashboard:
- `stackaudit-api` → Logs tab
- `stackaudit-frontend` → Logs tab

---

## 🐛 Troubleshooting

### Backend won't start

**Issue:** Database connection fails  
**Fix:** Check `DATABASE_URL` is set and database service is running

**Issue:** Prisma migrations fail  
**Fix:** Run `npx prisma migrate reset` (⚠️ DESTROYS DATA) or manually fix migration state

### Frontend shows 404 errors

**Issue:** SPA routing not working  
**Fix:** Ensure `routes` configuration in `render.yaml` redirects all paths to `/index.html`

### CORS Errors

**Issue:** Frontend can't call backend API  
**Fix:** Update `FRONTEND_URL` in backend environment variables to match actual frontend URL

### Free Tier Limitations

⚠️ **Render Free Tier:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month total across all services
- Database: 1GB storage, expires after 90 days

**Solution for production:**
- Upgrade to Starter plan ($7/month per service)
- Keeps services always running (no cold starts)

---

## 🔄 CI/CD Pipeline

Auto-deploy is enabled on the `main` branch:

```yaml
autoDeploy: true
branch: main
```

**Workflow:**
1. Push code to `main` branch
2. Render detects changes
3. Triggers rebuild & redeploy
4. Runs health checks
5. Routes traffic to new version

**Manual Deploy:**
- Render Dashboard → Service → "Manual Deploy" → Select branch/commit

---

## 📈 Performance Optimization

### Backend

- **Build caching:** Render caches `node_modules` between builds
- **Prisma optimization:** `prisma generate` runs during build (not runtime)
- **Health checks:** Prevents spin-down on free tier (if getting traffic)

### Frontend

- **Static site:** Served via Render's global CDN
- **Build optimization:** Vite production build includes minification, tree-shaking
- **Caching:** Static assets get cache headers automatically

---

## 🔐 Security Checklist

- [ ] All API keys stored as environment variables (not in code)
- [ ] `NODE_ENV=production` set
- [ ] Database has no public IP access (`ipAllowList: []`)
- [ ] CORS configured with specific origin (`FRONTEND_URL`)
- [ ] Stripe webhook signature verification enabled
- [ ] HTTPS enforced (automatic on Render)

---

## 📦 Backup & Recovery

### Database Backups

**Render Free Tier:** No automatic backups  
**Render Paid Tier:** Daily backups retained for 7 days

**Manual Backup:**
```bash
# Get DATABASE_URL from Render dashboard
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**Restore:**
```bash
psql $DATABASE_URL < backup-20250129.sql
```

---

## 🎯 Next Steps

1. ✅ **Deploy to Render** (via blueprint)
2. ⏳ **Configure environment variables** (API keys)
3. ⏳ **Update FRONTEND_URL** (after frontend deploys)
4. ⏳ **Set up Stripe webhook**
5. ⏳ **Test end-to-end flow**
6. ⏳ **Configure custom domain** (stackaudit.ai)
7. ⏳ **Set up monitoring** (optional: Sentry, LogRocket)
8. ⏳ **Upgrade to paid tier** (before launch, to avoid cold starts)

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Render Support:** support@render.com
- **Status Page:** https://status.render.com

---

**Last Updated:** 2025-01-29  
**Maintained By:** DevOps Team  
**Review Cadence:** Weekly until launch, then monthly
