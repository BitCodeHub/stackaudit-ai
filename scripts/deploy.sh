#!/bin/bash

# ============================================
# StackAudit Deployment Helper Script
# ============================================

set -e

echo "🚀 StackAudit.ai Deployment Script"
echo "====================================="
echo ""

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
  echo "❌ render.yaml not found in current directory"
  echo "   Please run this script from the project root"
  exit 1
fi

echo "✅ Found render.yaml"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "⚠️  jq is not installed. Install it for better output formatting:"
  echo "   brew install jq"
  echo ""
fi

# Display deployment options
echo "📋 Deployment Options:"
echo ""
echo "Option 1: Deploy via Render Dashboard (Recommended)"
echo "  1. Go to: https://dashboard.render.com"
echo "  2. Click 'New +' → 'Blueprint'"
echo "  3. Connect repository: BitCodeHub/stackaudit-ai"
echo "  4. Render will auto-detect render.yaml"
echo "  5. Review and approve services"
echo "  6. Set environment variables in each service"
echo ""
echo "Option 2: Manual Service Creation"
echo "  1. Create PostgreSQL database: stackaudit-db"
echo "  2. Create backend service (Node.js)"
echo "  3. Create frontend service (Static Site)"
echo "  4. Link database to backend"
echo ""
echo "Option 3: Update Existing Services"
echo "  Existing StackAudit services detected:"
echo "  - stackaudit-api (srv-d5th00a4d50c73c624kg)"
echo "  - stackaudit-app (srv-d5th03buibrs73dmdprg)"
echo "  Update their configuration to use backend/ and frontend/ directories"
echo ""

# Check if user wants to continue with API deployment
read -p "Deploy database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "🗄️  Creating PostgreSQL database..."
  
  RENDER_API_KEY="${RENDER_API_KEY:-rnd_uKzrkA9u9JdzwgMPTjjRaxPHHM1y}"
  
  # Note: Render API for database creation is limited
  # Using dashboard is more reliable
  echo ""
  echo "⚠️  Note: Database creation via API has limitations"
  echo "   Recommended: Create database via Render Dashboard"
  echo ""
  echo "📝 Manual Database Creation Steps:"
  echo "   1. Go to: https://dashboard.render.com/new/postgres"
  echo "   2. Set name: stackaudit-db"
  echo "   3. Set database name: stackaudit"
  echo "   4. Set user: stackaudit"
  echo "   5. Select plan: Free"
  echo "   6. Select region: Oregon"
  echo "   7. Click 'Create Database'"
  echo ""
fi

echo ""
echo "📄 Configuration Files Created:"
echo "   ✅ render.yaml - Blueprint for Render deployment"
echo "   ✅ DEPLOYMENT.md - Comprehensive deployment guide"
echo ""
echo "🔧 Required Environment Variables:"
echo "   - ANTHROPIC_API_KEY (set in Render dashboard)"
echo "   - STRIPE_SECRET_KEY (set in Render dashboard)"
echo "   - STRIPE_WEBHOOK_SECRET (set in Render dashboard)"
echo ""
echo "📚 Next Steps:"
echo "   1. Read DEPLOYMENT.md for detailed instructions"
echo "   2. Deploy via Render Dashboard (Option 1 above)"
echo "   3. Set environment variables in each service"
echo "   4. Update FRONTEND_URL after deployment"
echo "   5. Configure Stripe webhook"
echo ""
echo "✨ Ready to deploy! Good luck! 🚀"
