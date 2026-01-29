const express = require('express');
const { body, param } = require('express-validator');
const { audits, analysisResults, generateId } = require('../data/store');
const { authenticate, requirePlan } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/analysis/:auditId/run
 * Run analysis on an audit
 */
router.post('/:auditId/run', [
  param('auditId').notEmpty(),
  body('analysisTypes').optional().isArray(),
  body('depth').optional().isIn(['quick', 'standard', 'deep'])
], validate, async (req, res, next) => {
  try {
    const audit = audits.get(req.params.auditId);

    if (!audit) {
      return next(ApiError.notFound('Audit not found'));
    }

    if (audit.organizationId !== req.user.organizationId) {
      return next(ApiError.forbidden('Access denied'));
    }

    if (audit.status === 'analyzing') {
      return next(ApiError.conflict('Analysis already in progress'));
    }

    const { analysisTypes = ['security', 'performance', 'cost', 'compliance'], depth = 'standard' } = req.body;

    // Check if deep analysis requires pro plan
    if (depth === 'deep' && req.user.plan === 'free') {
      return next(ApiError.forbidden('Deep analysis requires Pro or Enterprise plan'));
    }

    // Update audit status
    audit.status = 'analyzing';
    audit.updatedAt = new Date().toISOString();

    // Create analysis job (in production, this would be queued)
    const analysisId = generateId('analysis');
    
    // Simulate analysis (in production, this calls AI services)
    setTimeout(() => {
      runAnalysis(audit, analysisId, analysisTypes, depth);
    }, 2000);

    logger.info(`Analysis started: ${analysisId} for audit ${audit.id}`);

    res.json({
      message: 'Analysis started',
      analysisId,
      status: 'analyzing',
      estimatedTime: depth === 'deep' ? '5-10 minutes' : '1-2 minutes'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analysis/:auditId/results
 * Get analysis results for an audit
 */
router.get('/:auditId/results', [
  param('auditId').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  // Get all analysis results for this audit
  const results = Array.from(analysisResults.values())
    .filter(r => r.auditId === req.params.auditId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    audit: {
      id: audit.id,
      name: audit.name,
      status: audit.status,
      score: audit.score
    },
    results: results.length > 0 ? results[0] : null,
    history: results
  });
});

/**
 * GET /api/analysis/:auditId/status
 * Get analysis status
 */
router.get('/:auditId/status', [
  param('auditId').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  res.json({
    auditId: audit.id,
    status: audit.status,
    score: audit.score,
    updatedAt: audit.updatedAt,
    completedAt: audit.completedAt
  });
});

/**
 * POST /api/analysis/:auditId/rerun
 * Rerun analysis with different parameters
 */
router.post('/:auditId/rerun', requirePlan('pro', 'enterprise'), [
  param('auditId').notEmpty(),
  body('focusAreas').optional().isArray()
], validate, async (req, res, next) => {
  try {
    const audit = audits.get(req.params.auditId);

    if (!audit) {
      return next(ApiError.notFound('Audit not found'));
    }

    if (audit.organizationId !== req.user.organizationId) {
      return next(ApiError.forbidden('Access denied'));
    }

    if (audit.status === 'analyzing') {
      return next(ApiError.conflict('Analysis already in progress'));
    }

    audit.status = 'analyzing';
    audit.updatedAt = new Date().toISOString();

    const analysisId = generateId('analysis');
    
    setTimeout(() => {
      runAnalysis(audit, analysisId, ['security', 'performance', 'cost', 'compliance'], 'standard');
    }, 2000);

    logger.info(`Analysis rerun: ${analysisId} for audit ${audit.id}`);

    res.json({
      message: 'Analysis rerun started',
      analysisId,
      status: 'analyzing'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Simulate running analysis (replace with actual AI analysis in production)
 */
function runAnalysis(audit, analysisId, analysisTypes, depth) {
  try {
    // Generate mock results
    const securityScore = Math.floor(Math.random() * 30) + 70;
    const performanceScore = Math.floor(Math.random() * 25) + 75;
    const costScore = Math.floor(Math.random() * 35) + 65;
    const complianceScore = Math.floor(Math.random() * 20) + 80;
    
    const overallScore = Math.round(
      (securityScore + performanceScore + costScore + complianceScore) / 4
    );

    const results = {
      id: analysisId,
      auditId: audit.id,
      createdAt: new Date().toISOString(),
      depth,
      overallScore,
      categories: {
        security: {
          score: securityScore,
          grade: getGrade(securityScore),
          findings: [
            { severity: 'high', title: 'Outdated dependencies detected', description: 'Several npm packages have known vulnerabilities', recommendation: 'Update packages using npm audit fix' },
            { severity: 'medium', title: 'Missing CSP headers', description: 'Content Security Policy not configured', recommendation: 'Add CSP headers to prevent XSS attacks' },
            { severity: 'low', title: 'No rate limiting', description: 'API endpoints lack rate limiting', recommendation: 'Implement rate limiting middleware' }
          ]
        },
        performance: {
          score: performanceScore,
          grade: getGrade(performanceScore),
          findings: [
            { severity: 'medium', title: 'Large bundle size', description: 'JavaScript bundle exceeds 500KB', recommendation: 'Implement code splitting and lazy loading' },
            { severity: 'low', title: 'No caching strategy', description: 'Static assets not properly cached', recommendation: 'Configure Cache-Control headers' }
          ]
        },
        cost: {
          score: costScore,
          grade: getGrade(costScore),
          findings: [
            { severity: 'medium', title: 'Oversized infrastructure', description: 'Server resources may be over-provisioned', recommendation: 'Right-size based on actual usage metrics' },
            { severity: 'low', title: 'No auto-scaling', description: 'Fixed capacity regardless of load', recommendation: 'Implement auto-scaling policies' }
          ]
        },
        compliance: {
          score: complianceScore,
          grade: getGrade(complianceScore),
          findings: [
            { severity: 'medium', title: 'Missing privacy policy', description: 'No privacy policy detected', recommendation: 'Add privacy policy page' },
            { severity: 'low', title: 'Cookie consent', description: 'Cookie consent banner not implemented', recommendation: 'Add GDPR-compliant cookie consent' }
          ]
        }
      },
      techStack: {
        frontend: ['React', 'TypeScript', 'Tailwind CSS'],
        backend: ['Node.js', 'Express'],
        database: ['PostgreSQL'],
        hosting: ['AWS', 'CloudFront'],
        monitoring: ['DataDog']
      },
      recommendations: [
        { priority: 'high', category: 'security', action: 'Update vulnerable dependencies immediately' },
        { priority: 'medium', category: 'performance', action: 'Implement code splitting to reduce bundle size' },
        { priority: 'medium', category: 'cost', action: 'Review and optimize cloud resource allocation' },
        { priority: 'low', category: 'compliance', action: 'Add privacy policy and cookie consent' }
      ]
    };

    // Store results
    analysisResults.set(analysisId, results);

    // Update audit
    audit.status = 'completed';
    audit.score = overallScore;
    audit.results = results;
    audit.completedAt = new Date().toISOString();
    audit.updatedAt = new Date().toISOString();

    logger.info(`Analysis completed: ${analysisId} with score ${overallScore}`);
  } catch (error) {
    audit.status = 'failed';
    audit.updatedAt = new Date().toISOString();
    logger.error(`Analysis failed: ${analysisId}`, error);
  }
}

function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

module.exports = router;
