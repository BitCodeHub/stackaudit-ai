require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const auditRoutes = require('./routes/audits');
const analysisRoutes = require('./routes/analysis');
const userRoutes = require('./routes/users');
const orgRoutes = require('./routes/organizations');
const billingRoutes = require('./routes/billing');
const webhookRoutes = require('./routes/webhooks');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3003',
    'https://stackaudit-app.onrender.com',
    'https://stackaudit-landing.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Logging
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing - Note: webhooks need raw body, so we handle it specially
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    name: 'StackAudit.ai API',
    version: '1.0.0',
    description: 'AI-powered SaaS stack analysis API',
    status: 'operational',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      audits: '/api/audits',
      analysis: '/api/analysis',
      billing: '/api/billing'
    },
    documentation: 'https://stackaudit-landing.onrender.com',
    app: 'https://stackaudit-app.onrender.com'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`StackAudit API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
