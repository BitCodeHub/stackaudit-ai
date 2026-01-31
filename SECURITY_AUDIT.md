# StackAudit.ai Security Audit Report

**Audit Date:** 2025-01-14  
**Auditor:** QA Security Engineer  
**Version:** 1.0.0  
**Status:** Complete

---

## Executive Summary

This security audit examined the StackAudit.ai application for common web application vulnerabilities including SQL Injection, XSS, CSRF, Authentication Bypass, and Rate Limiting issues. The application demonstrates **moderate security posture** with several areas requiring attention.

### Risk Summary

| Category | Severity | Status |
|----------|----------|--------|
| SQL Injection | 🟢 Low | Mitigated (In-memory store) |
| XSS (Cross-Site Scripting) | 🟡 Medium | Requires fixes |
| CSRF (Cross-Site Request Forgery) | 🔴 High | Missing protection |
| Authentication Bypass | 🟡 Medium | Partial vulnerabilities |
| Rate Limiting | 🟢 Low | Implemented |
| IDOR (Insecure Direct Object Reference) | 🟡 Medium | Partial vulnerabilities |
| Secrets Management | 🔴 High | Hardcoded defaults |
| Session Management | 🟡 Medium | Improvements needed |

---

## Detailed Findings

### 1. SQL Injection

**Risk Level:** 🟢 LOW  
**Status:** Currently Mitigated

**Finding:**  
The application uses an in-memory data store (`Map` objects) instead of a SQL database. This inherently prevents SQL injection attacks.

**Location:** `/server/src/data/store.js`

```javascript
// In-memory data store - inherently safe from SQL injection
const users = new Map();
const organizations = new Map();
const audits = new Map();
```

**Recommendation:**  
When migrating to a production database:
- Use parameterized queries (prepared statements)
- Implement an ORM like Prisma, Sequelize, or TypeORM
- Never concatenate user input into queries
- Add input validation at the database layer

**Future-proofing example:**
```javascript
// ❌ AVOID when using SQL
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ USE parameterized queries
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);
```

---

### 2. Cross-Site Scripting (XSS)

**Risk Level:** 🟡 MEDIUM  
**Status:** Requires Fixes

#### 2.1 Reflected XSS - Input Validation Gaps

**Location:** `/server/src/routes/comments.js` (Lines 100-130)

**Finding:**  
Comment content is validated as non-empty but not sanitized for HTML/JavaScript:

```javascript
router.post('/:auditId/comments', authenticate, [
  param('auditId').notEmpty(),
  body('content').trim().notEmpty().withMessage('Comment content is required'),
  // Missing: HTML sanitization
```

**Impact:** Malicious users could inject script tags in comments.

**Fix Required:**
```javascript
const sanitizeHtml = require('sanitize-html');

router.post('/:auditId/comments', authenticate, [
  param('auditId').notEmpty(),
  body('content')
    .trim()
    .notEmpty()
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'code', 'pre'],
      allowedAttributes: { 'a': ['href'] },
      allowedSchemes: ['http', 'https']
    }))
    .withMessage('Comment content is required'),
```

#### 2.2 Stored XSS - Audit Names and Descriptions

**Location:** `/server/src/routes/audits.js` (Lines 50-70)

**Finding:**  
Audit names, descriptions, and tags are not sanitized:

```javascript
const audit = {
  id: auditId,
  name,  // Unsanitized user input
  description: description || null,  // Unsanitized
  tags: tags || [],  // Unsanitized array
```

**Fix Required:**
```javascript
const sanitizeHtml = require('sanitize-html');

const sanitize = (str) => str ? sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} }) : str;

const audit = {
  id: auditId,
  name: sanitize(name),
  description: sanitize(description) || null,
  tags: tags ? tags.map(sanitize) : [],
```

#### 2.3 Client-Side XSS Protection

**Location:** `/client/src/context/AuthContext.jsx`

**Finding:**  
React's JSX naturally escapes content, providing XSS protection. However, ensure no `dangerouslySetInnerHTML` is used.

**Status:** ✅ No `dangerouslySetInnerHTML` found in reviewed components.

---

### 3. CSRF (Cross-Site Request Forgery)

**Risk Level:** 🔴 HIGH  
**Status:** Missing Protection

**Finding:**  
No CSRF tokens are implemented. The application relies solely on JWT for authentication.

**Location:** `/server/src/index.js`

```javascript
// No CSRF middleware configured
app.use(helmet());
app.use(cors({...}));
// Missing: app.use(csrf())
```

**Impact:**  
- State-changing requests (POST, PATCH, DELETE) are vulnerable
- Attackers could trick authenticated users into performing actions
- Especially critical for billing, user management, and audit deletion

**Fix Required:**

Install and configure CSRF protection:

```bash
npm install csurf cookie-parser
```

```javascript
// server/src/index.js
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

// CSRF protection for non-API routes (if serving HTML)
// For JWT-only APIs, consider double-submit cookie pattern
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply to state-changing routes
app.use('/api/audits', csrfProtection);
app.use('/api/billing', csrfProtection);
app.use('/api/users', csrfProtection);
app.use('/api/teams', csrfProtection);

// Provide CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**Alternative for SPAs (Double-Submit Cookie):**
```javascript
// middleware/csrf.js
const csrfProtection = (req, res, next) => {
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];
  
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
};
```

---

### 4. Authentication Bypass

**Risk Level:** 🟡 MEDIUM  
**Status:** Partial Vulnerabilities

#### 4.1 Hardcoded JWT Secret

**Location:** `/server/src/middleware/auth.js` (Line 5)

**Finding:** 🔴 CRITICAL
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
```

**Impact:**  
If `JWT_SECRET` env variable is not set, all JWTs can be forged using the known default.

**Fix Required:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

#### 4.2 Demo User with Known Credentials

**Location:** `/server/src/data/store.js` (Lines 70-85)

**Finding:** 🟡 MEDIUM
```javascript
// Demo user - Password: "demo123"
users.set(demoUserId, {
  id: demoUserId,
  email: 'demo@stackaudit.ai',
  passwordHash: '$2a$10$XpWtVZ2CQHfRiRrHE7sKIOG//P0Z5dlL4G1OVN6Vil1IrDt3aNOyC',
```

**Impact:** Anyone can access the demo account with known credentials.

**Fix Required:**
```javascript
// Only initialize demo data in development
if (process.env.NODE_ENV !== 'production') {
  initDemoData();
}
```

#### 4.3 Client-Side Fallback to Demo Auth

**Location:** `/client/src/context/AuthContext.jsx` (Lines 28-40)

**Finding:** 🟡 MEDIUM
```javascript
} catch (error) {
  // For demo, simulate successful login
  const demoUser = {
    id: '1',
    email,
    name: email.split('@')[0],
    // ...
  }
```

**Impact:** API failures silently succeed with fake auth, masking real errors.

**Fix Required:**
```javascript
} catch (error) {
  console.error('Login failed:', error);
  return { success: false, error: error.message };
}
```

#### 4.4 Token Expiration Too Long

**Location:** `/server/src/middleware/auth.js` (Line 98)

```javascript
{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
```

**Recommendation:** Reduce to 1 hour with refresh token rotation:
```javascript
{ expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
```

---

### 5. Rate Limiting

**Risk Level:** 🟢 LOW  
**Status:** Implemented

**Finding:**  
Rate limiting is properly configured:

**Location:** `/server/src/index.js` (Lines 45-50)

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);
```

**Improvements Recommended:**

```javascript
// Stricter limits for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  message: { error: 'Too many login attempts. Please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

const billingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 billing actions per hour
  message: { error: 'Billing rate limit exceeded.' }
});
app.use('/api/billing', billingLimiter);
```

---

### 6. Insecure Direct Object Reference (IDOR)

**Risk Level:** 🟡 MEDIUM  
**Status:** Partial Vulnerabilities

#### 6.1 Audit Access Control - GOOD ✅

**Location:** `/server/src/routes/audits.js`

Authorization is properly checked:
```javascript
if (audit.organizationId !== req.user.organizationId) {
  return next(ApiError.forbidden('Access denied'));
}
```

#### 6.2 User Endpoint - Potential IDOR

**Location:** `/server/src/routes/users.js` (Lines 50-65)

**Finding:**  
Users can fetch any user in their org, but user IDs might be guessable.

**Recommendation:** Use UUIDs (already implemented) and ensure all routes validate organization membership.

#### 6.3 Shared Audit Public Token

**Location:** `/server/src/routes/sharing.js`

**Finding:** ✅ Proper 32-byte random tokens used:
```javascript
share.publicToken = crypto.randomBytes(32).toString('hex');
```

---

### 7. Additional Security Findings

#### 7.1 Missing Security Headers

**Location:** `/server/src/index.js`

Helmet is used but could be enhanced:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### 7.2 Sensitive Data in Logs

**Location:** `/server/src/routes/users.js` (Line 60)

```javascript
tempPassword // Remove in production - send via email instead
```

**Fix Required:** Remove from response in production.

#### 7.3 Stripe Webhook Signature Bypass

**Location:** `/server/src/routes/webhooks.js` (Lines 25-30)

```javascript
if (endpointSecret) {
  event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
} else {
  // In development, parse directly - INSECURE
  event = JSON.parse(req.body.toString());
}
```

**Fix Required:**
```javascript
if (!endpointSecret) {
  logger.error('STRIPE_WEBHOOK_SECRET is required');
  return res.status(500).json({ error: 'Webhook not configured' });
}
event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
```

#### 7.4 API Key Storage

**Location:** `/server/src/routes/integrations.js`

**Finding:** API keys stored in memory without encryption.

**Fix Required:**
```javascript
const crypto = require('crypto');

const encryptKey = (key) => {
  const cipher = crypto.createCipheriv('aes-256-gcm', 
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    crypto.randomBytes(16)
  );
  // ... encryption logic
};
```

---

## Remediation Priority

### Immediate (P0) - Fix Before Production
1. ⬜ Remove hardcoded JWT_SECRET default
2. ⬜ Add CSRF protection
3. ⬜ Require Stripe webhook secret in production
4. ⬜ Remove demo user in production

### High Priority (P1) - Fix Within 1 Week
5. ⬜ Add input sanitization for XSS prevention
6. ⬜ Remove client-side demo auth fallback
7. ⬜ Reduce JWT expiration time
8. ⬜ Add stricter rate limits for auth endpoints

### Medium Priority (P2) - Fix Within 1 Month
9. ⬜ Encrypt stored API keys
10. ⬜ Enhance Content Security Policy
11. ⬜ Add audit logging for security events
12. ⬜ Implement account lockout after failed attempts

---

## Recommended Security Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "sanitize-html": "^2.11.0",
    "csurf": "^1.11.0",
    "cookie-parser": "^1.4.6",
    "express-mongo-sanitize": "^2.2.0",
    "hpp": "^0.2.3"
  }
}
```

---

## Security Checklist for Production

```
[ ] JWT_SECRET is a strong random value (32+ chars)
[ ] STRIPE_SECRET_KEY is set
[ ] STRIPE_WEBHOOK_SECRET is set
[ ] NODE_ENV is set to 'production'
[ ] Demo data initialization is disabled
[ ] HTTPS is enforced
[ ] CORS origins are restricted to production URLs
[ ] All security dependencies are installed
[ ] CSRF protection is enabled
[ ] Rate limiting is configured for all sensitive endpoints
[ ] Error messages don't leak internal details
[ ] Logging is configured (without sensitive data)
```

---

## Conclusion

StackAudit.ai has a reasonable security foundation with proper authentication, authorization, and rate limiting. However, **CSRF protection is critically missing** and **several hardcoded secrets** need to be addressed before production deployment.

The most critical fixes are:
1. Enforce required environment variables
2. Implement CSRF protection
3. Sanitize all user input

With the recommended fixes applied, the application will have a **strong security posture** suitable for production deployment.

---

*Report generated by QA Security Engineer*  
*Next audit recommended: After implementing fixes*
