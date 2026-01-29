# StackAudit.ai Deployment Guide

Production deployment configuration for StackAudit.ai - the SaaS stack optimization platform.

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production build |
| `docker-compose.yml` | Local development environment |
| `render.yaml` | Render.com infrastructure blueprint |
| `.env.example` | Environment variables template |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose v2+
- Node.js 20+ (for local development without Docker)

### 1. Setup Environment

```bash
# Navigate to deploy directory
cd projects/stackaudit/deploy

# Copy environment template
cp .env.example .env

# Edit with your values (at minimum, set API keys)
nano .env
```

### 2. Start Services

```bash
# Start all services (postgres + redis + app)
docker compose up -d

# View logs
docker compose logs -f app

# Start with hot-reload client (development)
docker compose --profile dev up -d
```

### 3. Access the App

| Service | URL |
|---------|-----|
| Application | http://localhost:3000 |
| Vite Dev Server | http://localhost:5173 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### 4. Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v
```

---

## ☁️ Render.com Deployment

### Option A: Blueprint Deployment (Recommended)

1. **Fork the Repository**
   ```bash
   # Ensure repo is at github.com/BitCodeHub/stackaudit
   ```

2. **Deploy via Render Dashboard**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect GitHub and select `stackaudit` repo
   - Render reads `render.yaml` and creates all services

3. **Set API Keys**
   - Navigate to each service in Render Dashboard
   - Set `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` manually
   - These are marked `sync: false` for security

### Option B: Manual Deployment

1. **Create PostgreSQL Database**
   ```
   Name: stackaudit-db
   Plan: Free
   Region: Oregon
   ```

2. **Create Redis Instance**
   ```
   Name: stackaudit-redis
   Plan: Free
   Region: Oregon
   ```

3. **Create Web Service**
   ```
   Name: stackaudit
   Environment: Docker
   Dockerfile Path: ./deploy/Dockerfile
   ```

4. **Link Services**
   - Add `DATABASE_URL` from PostgreSQL
   - Add `REDIS_URL` from Redis

---

## 🔒 Security Configuration

### Production Checklist

- [ ] Generate unique `JWT_SECRET` (min 32 chars)
- [ ] Generate unique `SESSION_SECRET` (min 32 chars)  
- [ ] Generate unique `ENCRYPTION_KEY` (exactly 32 chars)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Enable `TRUST_PROXY=true` behind load balancer
- [ ] Set strong database passwords
- [ ] Enable rate limiting

### Generate Secrets

```bash
# Generate secure random strings
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Load Balancer                     │
│                  (Render / Nginx)                    │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              StackAudit Application                  │
│         (Node.js + Express + React SPA)              │
│                    Port 3000                         │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
┌──────────▼──────────┐    ┌─────────▼────────────┐
│     PostgreSQL       │    │        Redis          │
│   (Primary Store)    │    │  (Cache & Sessions)   │
│     Port 5432        │    │      Port 6379        │
└─────────────────────┘    └──────────────────────┘
```

---

## 📊 Health Checks

The app exposes a health endpoint for monitoring:

```bash
# Check health
curl http://localhost:3000/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-28T00:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Connect directly to database
docker compose exec postgres psql -U stackaudit -d stackaudit
```

### Redis Connection Issues

```bash
# Check Redis is running
docker compose ps redis

# Test Redis connection
docker compose exec redis redis-cli -a stackaudit_redis_dev ping
```

### Application Issues

```bash
# View application logs
docker compose logs -f app

# Enter container for debugging
docker compose exec app sh

# Check environment variables
docker compose exec app env | grep -E "(DATABASE|REDIS|NODE)"
```

### Build Issues

```bash
# Rebuild from scratch
docker compose build --no-cache

# Clean up everything
docker compose down -v --rmi all
docker system prune -af
```

---

## 🔄 CI/CD Integration

### GitHub Actions (Example)

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST \
            "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
            -H "Authorization: Bearer $RENDER_API_KEY"
```

---

## 📈 Scaling (Future)

When ready to scale beyond free tier:

1. **Database**: Upgrade to Render PostgreSQL Standard ($7/mo)
2. **Redis**: Upgrade to Render Redis Standard ($10/mo)
3. **Web Service**: Upgrade to Starter ($7/mo) or Standard ($25/mo)
4. **Add Workers**: Scale background job processing

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/BitCodeHub/stackaudit/issues)
- **Docs**: [StackAudit Documentation](https://docs.stackaudit.ai)

---

*Built with ❤️ by the StackAudit team*
