#!/bin/bash

# ============================================
# StackAudit Deployment Validation Script
# ============================================

set -e

echo "🔍 StackAudit Deployment Validation"
echo "====================================="
echo ""

# Default URLs (can be overridden)
BACKEND_URL="${BACKEND_URL:-https://stackaudit-api.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://stackaudit-frontend.onrender.com}"

echo "🌐 Testing Backend: $BACKEND_URL"
echo "🌐 Testing Frontend: $FRONTEND_URL"
echo ""

# Test Backend Health Endpoint
echo "1️⃣  Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" || echo "000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Backend is healthy"
  echo "   Response: $RESPONSE_BODY"
else
  echo "   ❌ Backend health check failed (HTTP $HTTP_CODE)"
  echo "   Response: $RESPONSE_BODY"
fi
echo ""

# Test Frontend
echo "2️⃣  Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL" || echo "000")
FRONTEND_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n1)

if [ "$FRONTEND_CODE" = "200" ]; then
  echo "   ✅ Frontend is accessible"
  
  # Check if it's actually HTML
  if echo "$FRONTEND_RESPONSE" | grep -q "<!DOCTYPE html>"; then
    echo "   ✅ Frontend serving HTML content"
  else
    echo "   ⚠️  Frontend responded but may not be serving correct content"
  fi
else
  echo "   ❌ Frontend check failed (HTTP $FRONTEND_CODE)"
fi
echo ""

# Test CORS (simulated)
echo "3️⃣  Testing CORS Configuration..."
CORS_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  "$BACKEND_URL/health" || echo "000")
CORS_CODE=$(echo "$CORS_RESPONSE" | tail -n1)

if [ "$CORS_CODE" = "200" ]; then
  echo "   ✅ CORS appears to be configured"
else
  echo "   ⚠️  CORS may need configuration (HTTP $CORS_CODE)"
fi
echo ""

# Database connectivity (via API)
echo "4️⃣  Testing Database Connectivity..."
# This would require an actual API endpoint that checks DB connection
# For now, we'll just check if backend is running (which requires DB)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Backend running (likely connected to database)"
else
  echo "   ⚠️  Cannot verify database connectivity (backend not responding)"
fi
echo ""

# Summary
echo "📊 Validation Summary"
echo "====================="
echo ""

ALL_PASSED=true

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Backend API: PASS"
else
  echo "❌ Backend API: FAIL"
  ALL_PASSED=false
fi

if [ "$FRONTEND_CODE" = "200" ]; then
  echo "✅ Frontend: PASS"
else
  echo "❌ Frontend: FAIL"
  ALL_PASSED=false
fi

echo ""

if [ "$ALL_PASSED" = true ]; then
  echo "🎉 All checks passed! Deployment looks good!"
  echo ""
  echo "🔗 Service URLs:"
  echo "   Backend:  $BACKEND_URL"
  echo "   Frontend: $FRONTEND_URL"
  echo ""
  echo "📝 Next Steps:"
  echo "   1. Test the full user flow (signup → audit → payment)"
  echo "   2. Check logs for any errors"
  echo "   3. Monitor performance in Render dashboard"
  echo "   4. Set up custom domain (optional)"
  exit 0
else
  echo "⚠️  Some checks failed. Please review:"
  echo ""
  echo "📝 Troubleshooting:"
  echo "   1. Check service logs in Render dashboard"
  echo "   2. Verify environment variables are set"
  echo "   3. Ensure database is running"
  echo "   4. Check build logs for errors"
  echo ""
  echo "📚 See DEPLOYMENT.md for detailed troubleshooting"
  exit 1
fi
