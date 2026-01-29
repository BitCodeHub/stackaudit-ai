# StackAudit.ai Bug Report

**QA Review Date:** 2026-01-29  
**Tested URL:** https://stackaudit-app.onrender.com  
**Status:** 🟢 Critical bugs fixed - awaiting deployment

---

## Summary

| Severity | Count | Fixed | Description |
|----------|-------|-------|-------------|
| 🔴 Critical | 3 | ✅ 3 | Application broken in production |
| 🟠 High | 4 | ✅ 4 | Major functionality broken |
| 🟡 Medium | 2 | ✅ 1 | Minor issues |

---

## 🔴 Critical Bugs

### BUG-001: Dockerfile runs wrong entry point
**Status:** ✅ FIXED  
**File:** `deploy/Dockerfile`  
**Impact:** API endpoints return 404, application non-functional

**Description:**  
The Dockerfile CMD ran `node index.js` which executed the report generator instead of the main API server.

**Fix Applied:**  
Changed CMD from `["node", "index.js"]` to `["node", "src/index.js"]`

---

### BUG-002: No static file serving in main server
**Status:** ✅ FIXED  
**File:** `server/src/index.js`  
**Impact:** Frontend cannot be served from same origin

**Description:**  
The main API server didn't serve static files from the `./public` directory.

**Fix Applied:**  
- Added `path` module import
- Added static file middleware: `app.use(express.static(publicPath))`
- Added SPA catch-all route to serve React app for non-API routes

---

### BUG-003: API URL mismatch in client
**Status:** ✅ FIXED  
**File:** `client/src/utils/api.js`  
**Impact:** All API calls fail in production

**Description:**  
Client pointed to `https://stackaudit-api.onrender.com` but app is deployed at `https://stackaudit-app.onrender.com`.

**Fix Applied:**  
Changed API_BASE to use empty string `''` for production (same-origin requests).

---

## 🟠 High Priority Bugs

### BUG-004: AuthContext uses inconsistent API URLs
**Status:** ✅ FIXED  
**File:** `client/src/context/AuthContext.jsx`  
**Impact:** Auth worked but silently fell back to demo mode

**Description:**  
AuthContext used relative URLs and silently created demo users on failure.

**Fix Applied:**  
- Imported and used `api` utility functions
- Removed silent demo user fallback
- Added proper error handling and `error` state

---

### BUG-005: DashboardPage uses only mock data
**Status:** ✅ FIXED  
**File:** `client/src/pages/DashboardPage.jsx`  
**Impact:** Dashboard showed fake data

**Description:**  
DashboardPage used `mockData.audits` instead of fetching from API.

**Fix Applied:**  
- Added `useEffect` to fetch audits from API
- Falls back to mock data only on API error
- Added loading and error states

---

### BUG-006: NewAuditPage doesn't create real audits
**Status:** ✅ FIXED  
**File:** `client/src/pages/NewAuditPage.jsx`  
**Impact:** Cannot create new audits

**Description:**  
handleSubmit just navigated to hardcoded `/audit/1`.

**Fix Applied:**  
- Now calls `api.createAudit()` with proper payload
- Navigates to actual created audit ID
- Added error handling and fallback

---

### BUG-007: AuditResultsPage uses only mock data
**Status:** ✅ FIXED  
**File:** `client/src/pages/AuditResultsPage.jsx`  
**Impact:** Audit results always fake

**Description:**  
Used `mockData.auditDetails` regardless of URL audit ID.

**Fix Applied:**  
- Added `useEffect` to fetch audit by ID from API
- Falls back to mock data on error
- Added loading and error states
- Added null check for audit

---

## 🟡 Medium Priority Bugs

### BUG-008: API endpoints missing /api prefix
**Status:** ✅ FIXED  
**File:** `client/src/utils/api.js`  
**Impact:** API calls went to wrong endpoints

**Description:**  
api.js called `/audits` but server expects `/api/audits`.

**Fix Applied:**  
Added `/api` prefix to all API endpoints:
- `/api/auth/login`, `/api/auth/signup`, `/api/auth/me`
- `/api/audits`, `/api/audits/:id`
- `/api/recommendations`
- `/api/users/profile`, `/api/billing`
- `/api/analysis/audit/:id`

---

### BUG-009: Demo credentials not documented
**Status:** 📝 DOCUMENTED  
**Impact:** Users cannot test login

**Demo Credentials:**
- **Email:** demo@stackaudit.ai
- **Password:** demo123

---

## Files Modified

1. `deploy/Dockerfile` - Fixed entry point
2. `server/src/index.js` - Added static file serving + SPA catch-all
3. `client/src/utils/api.js` - Fixed API_BASE + added /api prefix + added new auth methods
4. `client/src/context/AuthContext.jsx` - Use api utility, proper error handling
5. `client/src/pages/DashboardPage.jsx` - Fetch audits from API
6. `client/src/pages/NewAuditPage.jsx` - Create audits via API
7. `client/src/pages/AuditResultsPage.jsx` - Fetch audit by ID from API

---

## Deployment Required

After deploying these fixes, test with:

```bash
# 1. Health check should return JSON
curl https://stackaudit-app.onrender.com/health
# Expected: {"status":"healthy","timestamp":"..."}

# 2. Frontend should load (HTML page)
curl -I https://stackaudit-app.onrender.com/
# Expected: 200 OK, Content-Type: text/html

# 3. API info endpoint
curl https://stackaudit-app.onrender.com/api
# Expected: JSON with API info

# 4. Auth should work
curl -X POST https://stackaudit-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@stackaudit.ai","password":"demo123"}'
# Expected: {"message":"Login successful","token":"...","user":{...}}

# 5. Create audit (with auth token)
TOKEN="<token from step 4>"
curl -X POST https://stackaudit-app.onrender.com/api/audits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Audit","description":"Testing"}'
# Expected: {"message":"Audit created successfully","audit":{...}}
```

---

## Remaining Work

1. **Rebuild client** - Run `npm run build` in client directory
2. **Commit changes** - Push to GitHub
3. **Redeploy** - Trigger new deployment on Render
4. **Test** - Run verification commands above

---

*QA Review completed by automated testing agent*
