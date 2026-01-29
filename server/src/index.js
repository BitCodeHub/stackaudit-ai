require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const auditRoutes = require('./routes/audits');
const analysisRoutes = require('./routes/analysis');
const recommendationsRoutes = require('./routes/recommendations');
const userRoutes = require('./routes/users');
const orgRoutes = require('./routes/organizations');
const billingRoutes = require('./routes/billing');
const webhookRoutes = require('./routes/webhooks');
// Team Collaboration routes
const teamRoutes = require('./routes/teams');
const commentRoutes = require('./routes/comments');
const sharingRoutes = require('./routes/sharing');
// Integrations Hub routes
const integrationsRoutes = require('./routes/integrations');

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

// Serve static files from public directory (built React app)
// In production, the Dockerfile copies the built client to ./public
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Root endpoint - API info (only if not serving static files)
app.get('/api', (req, res) => {
  res.json({
    name: 'StackAudit.ai API',
    version: '1.2.0',
    description: 'AI-powered SaaS stack analysis API',
    status: 'operational',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      audits: '/api/audits',
      analysis: '/api/analysis',
      recommendations: '/api/recommendations',
      billing: '/api/billing',
      teams: '/api/teams',
      comments: '/api/audits/:id/comments',
      sharing: '/api/audits/:id/sharing',
      sharedWithMe: '/api/shared-with-me'
    },
    features: {
      aiRecommendations: 'Proactive AI stack alternatives and optimization suggestions',
      auditEngine: 'Comprehensive tool overlap, ROI, and waste analysis',
      providerComparison: 'Head-to-head provider comparisons',
      toolMatching: 'Find best tools for your specific requirements'
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
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/webhooks', webhookRoutes);

// Team Collaboration Routes
app.use('/api/teams', teamRoutes);
app.use('/api/audits', commentRoutes);    // /api/audits/:auditId/comments
app.use('/api/audits', sharingRoutes);    // /api/audits/:auditId/sharing
app.use('/api', sharingRoutes);           // /api/shared-with-me, /api/shared/:token

// Integrations Hub Routes
app.use('/api/integrations', integrationsRoutes);

// Serve React app for all non-API routes (SPA catch-all)
app.get('*', (req, res, next) => {
  // Skip if this is an API route
  if (req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  // Serve the React app
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use(errorHandler);

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`StackAudit API server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
