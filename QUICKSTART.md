# 🚀 StackAudit Deployment - Quick Start

**Goal:** Get StackAudit live on Render in under 15 minutes

---

## ⚡ Fast Track (5 minutes)

### Step 1: Deploy via Render Dashboard

1. **Open Render Dashboard:**  
   👉 https://dashboard.render.com

2. **Create New Blueprint:**
   - Click **"New +"** → **"Blueprint"**
   - Connect repo: **`BitCodeHub/stackaudit-ai`**
   - Render auto-detects `render.yaml` ✅
   - Click **"Apply"**

3. **Services Created:**
   - ✅ `stackaudit-api` (Backend)
   - ✅ `stackaudit-frontend` (Frontend)
   - ✅ `stackaudit-db` (PostgreSQL)

### Step 2: Set Environment Variables

Go to **`stackaudit-api`** service → **Environment** tab:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxx
STRIPE_SECRET_KEY=sk_test_xxx (or sk_live_xxx)
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Where to find these:**
- **Anthropic API:** https://console.anthropic.com/settings/keys
- **Stripe Secret:** https://dashboard.stripe.com/apikeys
- **Webhook Secret:** See Step 3 below

### Step 3: Configure Stripe Webhook

1. Get your backend URL: `https://stackaudit-api.onrender.com`
2. Go to: https://dashboard.stripe.com/webhooks
3. Click **"Add endpoint"**
4. Set URL: `https://stackaudit-api.onrender.com/api/webhook/stripe`
5. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Copy the **webhook signing secret** (starts with `whsec_`)
7. Add to Render environment: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

### Step 4: Update FRONTEND_URL

After frontend deploys:
1. Get frontend URL (e.g., `https://stackaudit-frontend.onrender.com`)
2. Update backend environment variable:
   ```
   FRONTEND_URL=https://stackaudit-frontend.onrender.com
   ```
3. Save (triggers redeploy)

---

## 🎯 Service URLs

After deployment, your services will be available at:

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | `https://stackaudit-api.onrender.com` | REST API |
| Frontend | `https://stackaudit-frontend.onrender.com` | React App |
| Health Check | `https://stackaudit-api.onrender.com/health` | Status |

---

## ✅ Verify Deployment

### 1. Check Backend Health

```bash
curl https://stackaudit-api.onrender.com/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-29T..."
}
```

### 2. Check Frontend

Open: `https://stackaudit-frontend.onrender.com`

Should see the StackAudit landing page ✨

### 3. Check Database Connection

Logs for `stackaudit-api` should show:
```
✅ Database connected
✅ Prisma migrations applied
🚀 Server running on port 3001
```

---

## 🐛 Troubleshooting

### Backend won't start

**Issue:** `DATABASE_URL` not set  
**Fix:** Ensure database is linked in render.yaml (auto-linked in blueprint)

**Issue:** Prisma migrations fail  
**Fix:** Check database is running and accessible

### Frontend shows blank page

**Issue:** API URL not set  
**Fix:** `VITE_API_URL` should auto-link to backend (check environment)

### CORS errors

**Issue:** Frontend can't reach backend  
**Fix:** Update `FRONTEND_URL` in backend environment variables

---

## ⚙️ Alternative: Use Existing Services

If you have existing `stackaudit-api` and `stackaudit-app` services, update them:

### Update Backend Service

1. Go to: https://dashboard.render.com/web/srv-d5th00a4d50c73c624kg
2. Settings → **Root Directory:** `backend`
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npx prisma migrate deploy && npm start`
5. Add environment variables (see Step 2 above)

### Update Frontend Service

1. Go to: https://dashboard.render.com/static/srv-d5th03buibrs73dmdprg
2. Settings → **Root Directory:** `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`

---

## 📊 Free Tier Limits

⚠️ **Important:** Render Free tier services spin down after 15 minutes of inactivity

**Impact:**
- First request after spin-down = 30-60 seconds cold start
- Not suitable for production with real users

**Solution:**
- Upgrade to **Starter plan** ($7/month per service)
- Keeps services always running
- No cold starts

---

## 🔄 CI/CD Workflow

✅ **Auto-deploy enabled** on `main` branch

**Workflow:**
1. Push code to `main`
2. Render detects changes
3. Rebuilds & redeploys
4. Health checks pass
5. Routes traffic to new version

**Manual deploy:**
- Dashboard → Service → "Manual Deploy" → Select branch

---

## 📚 Full Documentation

For detailed info, see:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[README.md](./README.md)** - Project overview
- **[render.yaml](./render.yaml)** - Infrastructure as code

---

## 🆘 Need Help?

**Render Support:**
- Docs: https://render.com/docs
- Support: support@render.com
- Status: https://status.render.com

**Common Issues:**
- Database connection: Check `DATABASE_URL` is set
- Build fails: Check build logs in Render dashboard
- Service won't start: Check start command and logs

---

**Deployment Time:** ~10 minutes (first deploy)  
**Total Cost:** $0 (Free tier) or $21/month (Starter: 3 services × $7)

🚀 **Ready to ship!**
