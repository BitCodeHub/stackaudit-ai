#!/bin/bash

# ============================================
# Provision StackAudit PostgreSQL Database on Render
# ============================================

set -e

RENDER_API_KEY="${RENDER_API_KEY:-rnd_uKzrkA9u9JdzwgMPTjjRaxPHHM1y}"
API_BASE="https://api.render.com/v1"

echo "🗄️  Provisioning PostgreSQL database for StackAudit..."

# Create PostgreSQL database
RESPONSE=$(curl -s -X POST "$API_BASE/postgres" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "stackaudit-db",
    "plan": "free",
    "region": "oregon",
    "databaseName": "stackaudit",
    "databaseUser": "stackaudit",
    "ipAllowList": []
  }')

echo "Response: $RESPONSE"

# Extract database ID
DB_ID=$(echo $RESPONSE | jq -r '.id // empty')

if [ -n "$DB_ID" ]; then
  echo "✅ Database created successfully!"
  echo "   Database ID: $DB_ID"
  echo "   Name: stackaudit-db"
  echo "   Dashboard: https://dashboard.render.com/d/$DB_ID"
  echo ""
  echo "⏳ Database is being provisioned... This may take 2-3 minutes."
  echo "   Check status at: https://dashboard.render.com/d/$DB_ID"
else
  echo "⚠️  Database creation response:"
  echo "$RESPONSE" | jq '.'
  
  # Check if database already exists
  EXISTING=$(curl -s "$API_BASE/postgres" \
    -H "Authorization: Bearer $RENDER_API_KEY" | \
    jq -r '.[] | select(.postgres.name == "stackaudit-db") | .postgres.id')
  
  if [ -n "$EXISTING" ]; then
    echo ""
    echo "ℹ️  Database 'stackaudit-db' already exists"
    echo "   Database ID: $EXISTING"
    echo "   Dashboard: https://dashboard.render.com/d/$EXISTING"
  else
    echo "❌ Failed to create database"
    exit 1
  fi
fi

echo ""
echo "📝 Next steps:"
echo "   1. Wait for database to become available (check dashboard)"
echo "   2. Get the DATABASE_URL from Render dashboard"
echo "   3. Deploy services via render.yaml blueprint"
