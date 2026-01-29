# StackAudit.ai

> AI-Powered Tech Stack Analysis for GitHub Repositories

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-development-yellow.svg)]()

---

## 📋 Project Overview

**StackAudit.ai** is an intelligent SaaS platform that analyzes GitHub repositories to provide comprehensive insights into technology stacks, dependencies, security vulnerabilities, and actionable recommendations.

### Key Features

- 🔍 **Deep Repository Analysis** - Scans codebases to identify frameworks, languages, and tools
- 🛡️ **Security Scanning** - Detects vulnerabilities in dependencies and configurations
- 📊 **Visual Reports** - Beautiful dashboards with stack composition and metrics
- 🤖 **AI Recommendations** - GPT-powered suggestions for improvements and best practices
- ⚡ **Real-time Processing** - Queue-based analysis with live progress updates
- 🔗 **GitHub Integration** - OAuth authentication and webhook support

### Target Users

- **Developers** evaluating new projects or dependencies
- **Tech Leads** assessing technical debt and architecture
- **Security Teams** auditing open-source usage
- **Hiring Managers** evaluating candidate portfolios

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              STACKAUDIT.AI                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   Frontend   │────▶│   Backend    │────▶│   Workers    │                │
│  │   (React)    │     │   (FastAPI)  │     │  (Celery)    │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│         │                    │                    │                         │
│         │              ┌─────┴─────┐              │                         │
│         │              ▼           ▼              │                         │
│         │       ┌──────────┐ ┌──────────┐        │                         │
│         │       │ Postgres │ │  Redis   │◀───────┘                         │
│         │       │    DB    │ │  Cache   │                                  │
│         │       └──────────┘ └──────────┘                                  │
│         │                                                                   │
│  ┌──────┴───────────────────────────────────────────────────┐              │
│  │                    External Services                      │              │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │              │
│  │  │ GitHub  │  │ OpenAI  │  │ Stripe  │  │ SendGrid│     │              │
│  │  │  API    │  │  GPT-4  │  │ Billing │  │  Email  │     │              │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │              │
│  └──────────────────────────────────────────────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Data Flow:
═══════════
1. User submits GitHub URL → Frontend
2. Frontend → POST /api/analyze → Backend
3. Backend validates & queues job → Redis
4. Worker picks up job → Clones repo → Analyzes
5. Worker stores results → Postgres
6. Frontend polls /api/reports/{id} → Displays results
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| Backend | Python 3.11, FastAPI, Pydantic |
| Database | PostgreSQL 15, SQLAlchemy ORM |
| Cache/Queue | Redis 7, Celery |
| AI | OpenAI GPT-4 API |
| Auth | GitHub OAuth 2.0, JWT |
| Deployment | Render.com (Web + Workers) |

---

## 📁 Directory Structure

```
stackaudit/
├── README.md                 # This file
├── ROADMAP.md               # Development timeline
├── LICENSE                  # MIT License
│
├── frontend/                # React SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client
│   │   ├── store/           # State management
│   │   └── utils/           # Helpers
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 # FastAPI server
│   ├── app/
│   │   ├── api/             # Route handlers
│   │   │   ├── auth.py
│   │   │   ├── analyze.py
│   │   │   └── reports.py
│   │   ├── core/            # Config, security
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── main.py          # App entry
│   ├── requirements.txt
│   └── Dockerfile
│
├── workers/                 # Celery workers
│   ├── tasks/
│   │   ├── analyzer.py      # Core analysis
│   │   ├── security.py      # Vulnerability scan
│   │   └── ai_insights.py   # GPT integration
│   ├── celery_app.py
│   └── Dockerfile
│
├── shared/                  # Shared utilities
│   ├── detectors/           # Language/framework detection
│   └── parsers/             # Config file parsers
│
├── tests/                   # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                    # Extended documentation
│   ├── api/
│   └── guides/
│
├── docker-compose.yml       # Local development
├── render.yaml              # Render deployment config
└── .github/
    └── workflows/           # CI/CD pipelines
```

---

## 🚀 Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- GitHub OAuth App credentials
- OpenAI API key

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/BitCodeHub/stackaudit.git
cd stackaudit

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Configure environment variables
# Edit backend/.env with your credentials:
#   - DATABASE_URL
#   - REDIS_URL
#   - GITHUB_CLIENT_ID
#   - GITHUB_CLIENT_SECRET
#   - OPENAI_API_KEY
#   - JWT_SECRET

# 4. Start services with Docker
docker-compose up -d

# 5. Run database migrations
docker-compose exec backend alembic upgrade head

# 6. Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Running Tests

```bash
# Backend tests
cd backend
pytest -v

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Production Deployment

Deployment is automated via Render.com:

1. Push to `main` branch triggers deployment
2. Render builds and deploys all services
3. Environment variables configured in Render dashboard

---

## 📖 API Documentation Outline

Full API documentation available at `/docs` (Swagger UI) when running locally.

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/github` | GET | Initiate GitHub OAuth |
| `/api/auth/callback` | GET | OAuth callback handler |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | Logout user |

### Analysis

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Submit repo for analysis |
| `/api/analyze/{id}/status` | GET | Check analysis status |
| `/api/analyze/{id}/cancel` | POST | Cancel running analysis |

### Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports` | GET | List user's reports |
| `/api/reports/{id}` | GET | Get full report |
| `/api/reports/{id}/pdf` | GET | Download PDF export |
| `/api/reports/{id}/share` | POST | Generate shareable link |

### User

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user/profile` | GET/PUT | User profile |
| `/api/user/usage` | GET | API usage stats |
| `/api/user/billing` | GET | Billing information |

### Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/github` | POST | GitHub webhook receiver |
| `/api/webhooks/stripe` | POST | Stripe webhook receiver |

---

## 🤝 Contributing Guidelines

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pytest && npm test`
5. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Code Style

**Python (Backend/Workers)**
- Follow PEP 8
- Use type hints
- Run `black` and `isort` before committing
- Docstrings for public functions

**TypeScript (Frontend)**
- Follow ESLint configuration
- Use functional components with hooks
- Prop types with TypeScript interfaces

### Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Request review from at least one maintainer
5. Squash commits before merging

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **Project Lead**: BitCodeHub
- **Email**: support@stackaudit.ai
- **GitHub**: [github.com/BitCodeHub/stackaudit](https://github.com/BitCodeHub/stackaudit)

---

<p align="center">
  Built with ❤️ by the StackAudit team
</p>
