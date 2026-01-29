# 🔄 Update Existing StackAudit Services

You have existing services deployed on Render that need to be updated to use the new `backend/` and `frontend/` structure.

---

## 📋 Existing Services

### Backend API
- **Service ID:** `srv-d5th00a4d50c73c624kg`
- **Name:** `stackaudit-api`
- **URL:** https://stackaudit-api.onrender.com
- **Dashboard:** https://dashboard.render.com/web/srv-d5th00a4d50c73c624kg

### Frontend App
- **Service ID:** `srv-d5th03buibrs73dmdprg`
- **Name:** `stackaudit-app`
- **URL:** https://stackaudit-app.onrender.com
- **Dashboard:** https://dashboard.render.com/static/srv-d5th03buibrs73dmdprg

---

## 🔧 Update Backend Service

### Via Dashboard (Recommended)

1. **Open Backend Service:**  
   👉 https://dashboard.render.com/web/srv-d5th00a4d50c73c624kg

2. **Update Settings:**
   
   **Build & Deploy:**
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm start`
   
   **Environment:**
   - `NODE_ENV=production`
   - `PORT=3001`
   - `DATABASE_URL` - Link to database (if not already linked)
   - `FRONTEND_URL=https://stackaudit-app.onrender.com`
   - `ANTHROPIC_API_KEY=sk-ant-api03-xxx` (ADD THIS)
   - `STRIPE_SECRET_KEY=sk_test_xxx` (ADD THIS)
   - `STRIPE_WEBHOOK_SECRET=whsec_xxx` (ADD THIS)

3. **Save & Deploy**
   - Click "Save Changes"
   - Service will redeploy automatically

### Via Render API

```bash
# Update backend service configuration
curl -X PATCH "https://api.render.com/v1/services/srv-d5th00a4d50c73c624kg" \
  -H "Authorization: Bearer rnd_uKzrkA9u9JdzwgMPTjjRaxPHHM1y" \
  -H "Content-Type: application/json" \
  -d '{
    "rootDir": "backend",
    "envSpecificDetails": {
      "buildCommand": "npm install && npx prisma generate && npm run build",
      "startCommand": "npx prisma migrate deploy && npm start"
    }
  }'
```

---

## 🎨 Update Frontend Service

### Via Dashboard (Recommended)

1. **Open Frontend Service:**  
   👉 https://dashboard.render.com/static/srv-d5th03buibrs73dmdprg

2. **Update Settings:**
   
   **Build & Deploy:**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   
   **Environment:**
   - `VITE_API_URL=https://stackaudit-api.onrender.com`

3. **Save & Deploy**
   - Click "Save Changes"
   - Service will redeploy automatically

### Via Render API

```bash
# Update frontend service configuration
curl -X PATCH "https://api.render.com/v1/services/srv-d5th03buibrs73dmdprg" \
  -H "Authorization: Bearer rnd_uKzrkA9u9JdzwgMPTjjRaxPHHM1y" \
  -H "Content-Type: application/json" \
  -d '{
    "rootDir": "frontend",
    "serviceDetails": {
      "buildCommand": "npm install && npm run build",
      "publishPath": "dist"
    }
  }'
```

---

## 🗄️ Set Up Database

### Option 1: Create New Database

Follow the steps in [QUICKSTART.md](../QUICKSTART.md) to create a new `stackaudit-db`.

### Option 2: Use Existing Database

If you have an existing database, link it to the backend service:

1. Go to backend service settings
2. Environment tab
3. Add variable: `DATABASE_URL`
4. Link to existing database

---

## ✅ Verification

After updating both services, run the validation script:

```bash
./scripts/validate-deployment.sh
```

Or manually test:

```bash
# Test backend
curl https://stackaudit-api.onrender.com/health

# Test frontend
curl https://stackaudit-app.onrender.com
```

---

## 🔄 Rollback Plan

If something goes wrong:

1. **Via Dashboard:**
   - Go to service → "Manual Deploy"
   - Select a previous commit
   - Click "Deploy"

2. **Via Settings:**
   - Revert the Root Directory and commands
   - Save to trigger redeploy

---

## 📝 Notes

- **Downtime:** ~2-5 minutes during redeploy
- **Database:** Migrations run automatically on startup
- **Environment Variables:** Changes trigger automatic redeploy
- **Free Tier:** Services spin down after 15 min inactivity

---

## 🆘 If Something Breaks

1. **Check Logs:**
   - Dashboard → Service → Logs tab
   - Look for build or runtime errors

2. **Common Issues:**
   - Missing environment variables
   - Wrong root directory
   - Build command errors
   - Database not linked

3. **Quick Fix:**
   - Revert to previous successful deploy
   - Double-check all settings
   - Try manual deploy from working commit

---

## 🎯 Success Criteria

✅ Backend health check returns 200  
✅ Frontend loads without errors  
✅ Database migrations applied successfully  
✅ API calls from frontend work  
✅ No errors in service logs  

---

**Estimated Time:** 10-15 minutes  
**Risk Level:** Low (can rollback easily)  
**Recommended:** Test on a non-production service first
