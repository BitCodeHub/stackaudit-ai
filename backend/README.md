# StackAudit.ai Backend

Backend API for StackAudit.ai - AI tool spending audit platform.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Payment:** Stripe (planned)
- **AI Analysis:** Claude API (planned)

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── auditController.ts
│   │   └── userController.ts
│   ├── services/              # Business logic
│   │   ├── analysisService.ts
│   │   ├── auditService.ts
│   │   └── userService.ts
│   ├── routes/                # API routes
│   │   ├── auditRoutes.ts
│   │   └── userRoutes.ts
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── utils/                 # Utilities
│   │   └── prisma.ts
│   └── index.ts               # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your database URL and API keys.

### 3. Run database migrations

```bash
npm run prisma:migrate
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Start development server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Users

- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID

### Audits

- `POST /api/audits` - Create a new audit
- `GET /api/audits/:id` - Get audit by ID
- `PUT /api/audits/:id` - Update audit (add tools)
- `POST /api/audits/:id/analyze` - Run AI analysis
- `GET /api/audits/:id/report` - Get audit report

### Health

- `GET /health` - Health check endpoint

## Database Schema

### Users
- `id` (UUID, PK)
- `email` (unique)
- `company_name`
- `company_size`
- `created_at`

### Audits
- `id` (UUID, PK)
- `user_id` (FK → users)
- `status` (draft, analyzing, complete, failed)
- `tier` (free, paid)
- `total_spend`
- `potential_savings`
- `created_at`, `updated_at`

### Audit Tools
- `id` (UUID, PK)
- `audit_id` (FK → audits)
- `tool_name`
- `monthly_cost`
- `seats`
- `use_cases` (array)
- `utilization` (high, medium, low, unknown)

### Recommendations
- `id` (UUID, PK)
- `audit_id` (FK → audits)
- `type` (consolidate, eliminate, keep, migrate)
- `priority` (1-5)
- `description`
- `savings_estimate`

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

### Database Management

View and edit data with Prisma Studio:

```bash
npm run prisma:studio
```

## Next Steps

1. **Set up PostgreSQL database** (local or Render.com)
2. **Implement Claude API integration** in `analysisService.ts`
3. **Add Stripe payment endpoints** (checkout, webhooks)
4. **Add authentication** (magic links or JWT)
5. **Add input validation** (express-validator or Zod)
6. **Add rate limiting** for API endpoints
7. **Add tests** (Jest + Supertest)

## Production Deployment

1. Set up PostgreSQL on Render.com
2. Add environment variables in Render dashboard
3. Deploy as Web Service
4. Run migrations: `npm run prisma:migrate`

## Notes

- The analysis service currently returns mock data
- Claude API integration needs to be implemented
- Stripe integration is planned but not yet implemented
- No authentication implemented yet (planned for V1.1)
