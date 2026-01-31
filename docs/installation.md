# Installation Guide

Complete installation instructions for StackAudit.ai across different environments.

---

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **Node.js** | v18.0.0 or higher |
| **npm** | v9.0.0 or higher |
| **Memory** | 512 MB RAM |
| **Storage** | 100 MB free space |
| **OS** | Linux, macOS, Windows |

### Recommended for Production

| Component | Recommendation |
|-----------|----------------|
| **Node.js** | v20.x LTS |
| **Memory** | 2 GB RAM |
| **Storage** | 1 GB free space |
| **CPU** | 2+ cores |

---

## Installation Methods

### Method 1: npm (Recommended)

```bash
# Install globally
npm install -g stackaudit

# Or use npx
npx stackaudit serve
```

### Method 2: From Source

```bash
# Clone repository
git clone https://github.com/stackaudit/stackaudit.git
cd stackaudit

# Install server dependencies
cd server
npm install

# Start development server
npm run dev
```

### Method 3: Docker

```bash
# Pull the image
docker pull stackaudit/stackaudit:latest

# Run container
docker run -d \
  --name stackaudit \
  -p 3001:3001 \
  -v stackaudit-reports:/app/reports \
  stackaudit/stackaudit:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  stackaudit:
    image: stackaudit/stackaudit:latest
    ports:
      - "3001:3001"
    volumes:
      - ./reports:/app/reports
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

---

## Environment Configuration

### Environment Variables

Create a `.env` file in the server directory:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Report Configuration
REPORT_OUTPUT_DIR=./reports
COMPANY_NAME=StackAudit.ai

# Optional: Database (for persistence)
DATABASE_URL=postgresql://user:pass@localhost:5432/stackaudit

# Optional: Redis (for caching)
REDIS_URL=redis://localhost:6379

# Optional: API Keys
API_KEY_SECRET=your-secret-key-here

# Optional: Email notifications
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@stackaudit.ai
SMTP_PASS=your-smtp-password
```

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `REPORT_OUTPUT_DIR` | ./reports | PDF output directory |
| `COMPANY_NAME` | StackAudit.ai | Default branding |
| `MAX_REPORT_SIZE` | 10mb | Maximum report data size |
| `CORS_ORIGIN` | * | Allowed CORS origins |

---

## Platform-Specific Instructions

### macOS

```bash
# Install Node.js via Homebrew
brew install node

# Verify installation
node --version  # Should be v18+
npm --version   # Should be v9+

# Install StackAudit
git clone https://github.com/stackaudit/stackaudit.git
cd stackaudit/server
npm install
npm start
```

### Ubuntu/Debian

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Install StackAudit
git clone https://github.com/stackaudit/stackaudit.git
cd stackaudit/server
npm install
npm start
```

### Windows

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (includes npm)
3. Open PowerShell or Command Prompt:

```powershell
# Verify installation
node --version
npm --version

# Clone and install
git clone https://github.com/stackaudit/stackaudit.git
cd stackaudit\server
npm install
npm start
```

### AWS EC2

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup
git clone https://github.com/stackaudit/stackaudit.git
cd stackaudit/server
npm install

# Run with PM2 for production
npm install -g pm2
pm2 start index.js --name stackaudit
pm2 save
pm2 startup
```

---

## Post-Installation Verification

### Health Check

```bash
curl http://localhost:3001/health
```

Expected:
```json
{
  "status": "ok",
  "service": "stackaudit-server",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

### Generate Test Report

```bash
curl -X POST http://localhost:3001/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"clientName": "Test Company"}'
```

### List Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/reports/generate` | POST | Generate PDF report |
| `/api/reports` | GET | List all reports |
| `/api/reports/download/:filename` | GET | Download specific report |
| `/api/templates/brands` | GET | Available brand presets |
| `/api/templates/types` | GET | Report types |
| `/api/sample-data` | GET | Sample audit data |

---

## Upgrading

### From npm

```bash
npm update -g stackaudit
```

### From Source

```bash
cd stackaudit
git pull origin main
cd server
npm install
npm start
```

### Docker

```bash
docker pull stackaudit/stackaudit:latest
docker-compose down
docker-compose up -d
```

---

## Uninstallation

### npm

```bash
npm uninstall -g stackaudit
```

### From Source

```bash
rm -rf stackaudit
```

### Docker

```bash
docker stop stackaudit
docker rm stackaudit
docker rmi stackaudit/stackaudit
```

---

## Next Steps

- [Quick Start Guide →](./getting-started.md)
- [API Documentation →](./api/overview.md)
- [Run Your First Audit →](./first-audit.md)
