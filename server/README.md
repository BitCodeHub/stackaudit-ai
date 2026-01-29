# StackAudit.ai API Server

Backend API server for StackAudit.ai - AI-powered tech stack analysis SaaS.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev

# Start production server
npm start
```

Server runs on `http://localhost:3001` by default.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/change-password` | Change password |

### Audits
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/audits` | Create new audit |
| GET | `/api/audits` | List audits |
| GET | `/api/audits/:id` | Get audit details |
| PATCH | `/api/audits/:id` | Update audit |
| DELETE | `/api/audits/:id` | Delete audit |
| GET | `/api/audits/:id/export` | Export audit |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/:auditId/run` | Run analysis |
| GET | `/api/analysis/:auditId/results` | Get results |
| GET | `/api/analysis/:auditId/status` | Get status |
| POST | `/api/analysis/:auditId/rerun` | Rerun analysis |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List org users |
| POST | `/api/users/invite` | Invite user |
| GET | `/api/users/:id` | Get user |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Remove user |

### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations/current` | Get org |
| PATCH | `/api/organizations/current` | Update org |
| GET | `/api/organizations/usage` | Get usage stats |
| GET | `/api/organizations/api-keys` | List API keys |
| POST | `/api/organizations/api-keys` | Create API key |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing/subscription` | Get subscription |
| GET | `/api/billing/plans` | Get available plans |
| POST | `/api/billing/checkout` | Create checkout |
| POST | `/api/billing/portal` | Customer portal |
| POST | `/api/billing/cancel` | Cancel subscription |
| POST | `/api/billing/resume` | Resume subscription |
| GET | `/api/billing/invoices` | Get invoices |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe webhooks |

## Authentication

All protected endpoints require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/audits
```

## Demo Credentials

For testing:
- Email: `demo@stackaudit.ai`
- Password: `demo123`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN` | Token expiry | No (default: 7d) |
| `STRIPE_SECRET_KEY` | Stripe secret key | For billing |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret | For billing |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## Project Structure

```
server/
├── src/
│   ├── index.js           # Express app entry
│   ├── routes/
│   │   ├── auth.js        # Authentication
│   │   ├── audits.js      # Audit CRUD
│   │   ├── analysis.js    # Run analysis
│   │   ├── users.js       # User management
│   │   ├── organizations.js # Org settings
│   │   ├── billing.js     # Stripe billing
│   │   └── webhooks.js    # Stripe webhooks
│   ├── middleware/
│   │   ├── auth.js        # JWT middleware
│   │   ├── errorHandler.js
│   │   └── validate.js    # Input validation
│   ├── data/
│   │   └── store.js       # In-memory store
│   └── utils/
│       ├── ApiError.js    # Error handling
│       └── logger.js      # Winston logger
├── package.json
├── .env
└── README.md
```

## Plans & Limits

| Feature | Free | Pro ($49/mo) | Enterprise ($199/mo) |
|---------|------|--------------|----------------------|
| Audits/month | 3 | 50 | 500 |
| Team members | 1 | 10 | 100 |
| Data retention | 7 days | 90 days | 365 days |
| Deep analysis | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ |
| Priority support | ❌ | ✅ | ✅ |
| SSO/SAML | ❌ | ❌ | ✅ |

## Development

```bash
# Run with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a real database (PostgreSQL recommended)
3. Set secure `JWT_SECRET`
4. Configure Stripe production keys
5. Set up proper logging
6. Use HTTPS

## License

MIT - StackAudit.ai
