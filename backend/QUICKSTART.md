# StackAudit Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd /Users/jimmysmacstudio/clawd/projects/stackaudit/backend
npm install
```

### Step 2: Set Up Environment

```bash
cp .env.example .env
```

Then edit `.env` and add your database URL:

```
DATABASE_URL="postgresql://user:password@localhost:5432/stackaudit?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 3: Set Up Database

If you don't have PostgreSQL locally, you can:
- Install via Homebrew: `brew install postgresql@15`
- Or use Docker: `docker run --name stackaudit-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15`
- Or set up on Render.com (free tier)

Create the database:

```bash
createdb stackaudit
```

Run migrations:

```bash
npm run prisma:migrate
```

### Step 4: Start the Server

```bash
npm run dev
```

The API will be running at `http://localhost:3001`

Test it:

```bash
curl http://localhost:3001/health
```

You should see: `{"status":"ok","timestamp":"2026-01-28T..."}`

## 📝 Test the API

### Create a User

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "companyName": "Test Corp",
    "companySize": "50-200"
  }'
```

### Create an Audit

```bash
curl -X POST http://localhost:3001/api/audits \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<USER_ID_FROM_ABOVE>",
    "tier": "free"
  }'
```

### Add Tools to Audit

```bash
curl -X PUT http://localhost:3001/api/audits/<AUDIT_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "tools": [
      {
        "toolName": "ChatGPT Plus",
        "monthlyCost": 20,
        "seats": 5,
        "useCases": ["writing", "research", "coding"],
        "utilization": "high"
      },
      {
        "toolName": "GitHub Copilot",
        "monthlyCost": 10,
        "seats": 3,
        "useCases": ["coding"],
        "utilization": "medium"
      }
    ]
  }'
```

### Run Analysis

```bash
curl -X POST http://localhost:3001/api/audits/<AUDIT_ID>/analyze
```

### Get Report

```bash
curl http://localhost:3001/api/audits/<AUDIT_ID>/report
```

## 🗄️ View Database

Open Prisma Studio to view/edit data:

```bash
npm run prisma:studio
```

This opens a web UI at `http://localhost:5555`

## 📂 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema (4 tables)
├── src/
│   ├── controllers/           # HTTP request handlers
│   │   ├── auditController.ts (5 endpoints)
│   │   └── userController.ts  (2 endpoints)
│   ├── services/              # Business logic layer
│   │   ├── analysisService.ts (AI analysis - Claude API)
│   │   ├── auditService.ts    (CRUD operations)
│   │   └── userService.ts     (User management)
│   ├── routes/                # Express routes
│   │   ├── auditRoutes.ts
│   │   └── userRoutes.ts
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.ts    (Global error handling)
│   │   └── requestLogger.ts   (HTTP logging)
│   ├── models/                # TypeScript types
│   │   └── types.ts
│   ├── utils/                 # Utilities
│   │   ├── prisma.ts          (DB client)
│   │   ├── validation.ts      (Input validation)
│   │   └── logger.ts          (Logging utility)
│   └── index.ts               # App entry point
└── package.json
```

## ✅ What's Implemented

- ✅ Full TypeScript setup
- ✅ Express server with CORS
- ✅ PostgreSQL database with Prisma ORM
- ✅ 4 database tables (users, audits, audit_tools, recommendations)
- ✅ 7 API endpoints (users, audits, analyze, report)
- ✅ Service layer architecture (separation of concerns)
- ✅ Error handling middleware
- ✅ Request logging
- ✅ Mock analysis engine (placeholder for Claude API)

## 🔜 Next Steps

1. **Implement Claude API Integration**
   - Edit `src/services/analysisService.ts`
   - Replace mock analysis with real Claude API calls
   - Use the prepared prompt structure

2. **Add Input Validation**
   - Install: `npm install express-validator`
   - Add validation middleware to routes

3. **Add Stripe Integration**
   - Create checkout endpoint
   - Add webhook handler
   - Update audit tier after payment

4. **Add Authentication**
   - Magic link email auth (recommended for MVP)
   - Or JWT tokens
   - Protect endpoints

5. **Deploy to Render**
   - Create PostgreSQL database on Render
   - Deploy backend as Web Service
   - Set environment variables

## 🐛 Troubleshooting

### "Can't connect to database"
- Make sure PostgreSQL is running: `brew services start postgresql@15`
- Check DATABASE_URL in `.env`
- Try: `psql -d stackaudit -c "SELECT 1"`

### "Prisma Client not generated"
```bash
npm run prisma:generate
```

### "Port 3001 already in use"
Change PORT in `.env` or kill the process:
```bash
lsof -ti:3001 | xargs kill
```

## 📚 Documentation

- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Ready to build the frontend?** The API is ready to receive requests!
