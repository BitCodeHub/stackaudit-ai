const express = require('express');
const { body, param, query } = require('express-validator');
const { audits, analysisResults, generateId } = require('../data/store');
const { authenticate, requirePlan } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { RecommendationsEngine, AuditEngine } = require('../../services');

const router = express.Router();

// Initialize engines
const recommendationsEngine = new RecommendationsEngine();
const auditEngine = new AuditEngine();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/recommendations/generate
 * Generate AI stack recommendations based on tools data
 */
router.post('/generate', [
  body('tools').isArray({ min: 1 }).withMessage('At least one tool is required'),
  body('tools.*.name').notEmpty().withMessage('Tool name is required'),
  body('tools.*.provider').notEmpty().withMessage('Tool provider is required'),
  body('compliance').optional().isArray(),
  body('regions').optional().isArray(),
  body('industry').optional().isString(),
  body('options').optional().isObject()
], validate, async (req, res, next) => {
  try {
    const { tools, compliance, regions, industry, options } = req.body;

    logger.info(`Generating recommendations for ${tools.length} tools`);

    // First run audit analysis to get full context
    const auditData = await auditEngine.runAudit({
      tools,
      businessMetrics: req.body.businessMetrics || {},
    });

    // Add compliance/regional context
    const enrichedAuditData = {
      ...auditData,
      compliance: compliance || [],
      regions: regions || [],
      industry: industry || 'general',
    };

    // Generate recommendations
    const recommendations = await recommendationsEngine.generateRecommendations(enrichedAuditData);

    logger.info(`Generated ${recommendations.summary.totalRecommendations} recommendations`);

    res.json({
      message: 'Recommendations generated successfully',
      recommendations
    });
  } catch (error) {
    logger.error('Failed to generate recommendations:', error);
    next(error);
  }
});

/**
 * POST /api/recommendations/:auditId
 * Generate recommendations for an existing audit
 */
router.post('/:auditId', [
  param('auditId').notEmpty(),
  body('compliance').optional().isArray(),
  body('regions').optional().isArray(),
  body('industry').optional().isString()
], validate, async (req, res, next) => {
  try {
    const audit = audits.get(req.params.auditId);

    if (!audit) {
      return next(ApiError.notFound('Audit not found'));
    }

    if (audit.organizationId !== req.user.organizationId) {
      return next(ApiError.forbidden('Access denied'));
    }

    if (audit.status !== 'completed') {
      return next(ApiError.badRequest('Audit must be completed before generating recommendations'));
    }

    // Get the latest analysis results
    const results = Array.from(analysisResults.values())
      .filter(r => r.auditId === req.params.auditId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (!results) {
      return next(ApiError.badRequest('No analysis results found. Run analysis first.'));
    }

    // Build audit data from results
    const auditData = {
      tools: audit.results?.tools || [],
      analyses: {
        overlap: results.categories?.overlap || {},
        roi: results.categories?.cost || {},
        waste: results.categories?.waste || { summary: { wastePercentage: 0, totalMonthlyWaste: 0 } },
      },
      compliance: req.body.compliance || [],
      regions: req.body.regions || [],
      industry: req.body.industry || 'general',
    };

    const recommendations = await recommendationsEngine.generateRecommendations(auditData);

    // Store recommendations with audit
    audit.recommendations = recommendations;
    audit.updatedAt = new Date().toISOString();

    logger.info(`Generated recommendations for audit ${req.params.auditId}`);

    res.json({
      message: 'Recommendations generated successfully',
      auditId: req.params.auditId,
      recommendations
    });
  } catch (error) {
    logger.error(`Failed to generate recommendations for audit ${req.params.auditId}:`, error);
    next(error);
  }
});

/**
 * GET /api/recommendations/:auditId
 * Get stored recommendations for an audit
 */
router.get('/:auditId', [
  param('auditId').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  if (!audit.recommendations) {
    return next(ApiError.notFound('No recommendations found. Generate them first.'));
  }

  res.json({
    auditId: req.params.auditId,
    recommendations: audit.recommendations
  });
});

/**
 * GET /api/recommendations/alternatives/:provider
 * Get alternative providers for a given provider
 */
router.get('/alternatives/:provider', [
  param('provider').notEmpty()
], validate, (req, res, next) => {
  const { TOOL_ALTERNATIVES_DB } = require('../../services');
  const provider = req.params.provider.toLowerCase();

  const providerData = TOOL_ALTERNATIVES_DB.llm_providers[provider];
  
  if (!providerData) {
    return next(ApiError.notFound('Provider not found'));
  }

  const alternatives = (providerData.alternatives || []).map(altId => {
    const alt = TOOL_ALTERNATIVES_DB.llm_providers[altId];
    return {
      id: altId,
      name: alt?.name,
      description: alt?.description,
      pricing_tier: alt?.pricing_tier,
      strengths: alt?.strengths,
      compliance: alt?.compliance,
      best_for: alt?.best_for,
      warnings: alt?.warnings,
    };
  });

  res.json({
    provider: {
      id: provider,
      name: providerData.name,
      description: providerData.description,
      pricing_tier: providerData.pricing_tier,
      strengths: providerData.strengths,
      weaknesses: providerData.weaknesses,
    },
    alternatives
  });
});

/**
 * POST /api/recommendations/compare
 * Compare two providers head-to-head
 */
router.post('/compare', [
  body('provider1').notEmpty().withMessage('Provider 1 is required'),
  body('provider2').notEmpty().withMessage('Provider 2 is required')
], validate, (req, res, next) => {
  try {
    const { provider1, provider2 } = req.body;

    const comparison = recommendationsEngine.compareProviders(
      provider1.toLowerCase(),
      provider2.toLowerCase()
    );

    if (comparison.error) {
      return next(ApiError.notFound(comparison.error));
    }

    res.json({
      comparison
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recommendations/providers
 * List all available providers with their details
 */
router.get('/providers', (req, res) => {
  const { TOOL_ALTERNATIVES_DB } = require('../../services');

  const providers = Object.entries(TOOL_ALTERNATIVES_DB.llm_providers).map(([id, data]) => ({
    id,
    name: data.name,
    description: data.description,
    pricing_tier: data.pricing_tier,
    strengths: data.strengths,
    weaknesses: data.weaknesses,
    best_for: data.best_for,
    compliance: data.compliance,
    has_warnings: (data.warnings?.length || 0) > 0,
  }));

  res.json({
    total: providers.length,
    providers
  });
});

/**
 * GET /api/recommendations/categories
 * List specialized tool categories with recommendations
 */
router.get('/categories', (req, res) => {
  const { TOOL_ALTERNATIVES_DB } = require('../../services');

  res.json({
    categories: TOOL_ALTERNATIVES_DB.categories
  });
});

/**
 * POST /api/recommendations/tool-match
 * Find best tool matches for specific requirements
 */
router.post('/tool-match', requirePlan('pro', 'enterprise'), [
  body('use_cases').isArray({ min: 1 }).withMessage('At least one use case is required'),
  body('budget').optional().isIn(['ultra-budget', 'budget', 'mid', 'premium', 'any']),
  body('compliance').optional().isArray(),
  body('priority').optional().isIn(['cost', 'quality', 'speed', 'compliance'])
], validate, (req, res, next) => {
  try {
    const { use_cases, budget = 'any', compliance = [], priority = 'quality' } = req.body;
    const { TOOL_ALTERNATIVES_DB } = require('../../services');

    // Score all providers based on requirements
    const scores = Object.entries(TOOL_ALTERNATIVES_DB.llm_providers).map(([id, provider]) => {
      let score = 0;

      // Use case match
      const useCaseMatch = use_cases.filter(uc => provider.best_for.includes(uc)).length;
      score += (useCaseMatch / use_cases.length) * 40;

      // Budget match
      const tierRank = { 'ultra-budget': 1, 'budget': 2, 'mid': 3, 'premium': 4 };
      if (budget !== 'any') {
        const budgetDiff = Math.abs(tierRank[budget] - tierRank[provider.pricing_tier]);
        score += Math.max(0, (4 - budgetDiff) / 4) * 20;
      } else {
        score += 10;
      }

      // Compliance match
      if (compliance.length > 0) {
        const complianceMatch = compliance.filter(c => 
          provider.compliance.includes(c.toUpperCase())
        ).length;
        score += (complianceMatch / compliance.length) * 30;
      } else {
        score += 15;
      }

      // Priority-based adjustments
      if (priority === 'cost' && ['ultra-budget', 'budget'].includes(provider.pricing_tier)) {
        score += 10;
      }
      if (priority === 'speed' && provider.strengths.includes('speed')) {
        score += 10;
      }
      if (priority === 'compliance' && provider.compliance.length >= 3) {
        score += 10;
      }

      // Penalty for warnings
      score -= (provider.warnings?.length || 0) * 5;

      return {
        id,
        name: provider.name,
        description: provider.description,
        score: Math.max(0, score),
        pricing_tier: provider.pricing_tier,
        matching_use_cases: use_cases.filter(uc => provider.best_for.includes(uc)),
        compliance_coverage: compliance.filter(c => provider.compliance.includes(c.toUpperCase())),
        strengths: provider.strengths,
        warnings: provider.warnings || [],
      };
    });

    // Sort by score and return top matches
    const topMatches = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json({
      requirements: {
        use_cases,
        budget,
        compliance,
        priority
      },
      matches: topMatches,
      recommendation: topMatches[0]?.id ? 
        `We recommend ${topMatches[0].name} based on your requirements` : 
        'No suitable providers found'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recommendations/model-alternatives/:model
 * Get alternative models for a specific model
 */
router.get('/model-alternatives/:model', [
  param('model').notEmpty()
], validate, (req, res, next) => {
  const { TOOL_ALTERNATIVES_DB } = require('../../services');
  const model = req.params.model.toLowerCase();

  const alternatives = TOOL_ALTERNATIVES_DB.model_alternatives[model];
  
  if (!alternatives) {
    return next(ApiError.notFound('Model not found or no alternatives available'));
  }

  res.json({
    model,
    alternatives: alternatives.map(alt => ({
      model: alt,
      category: categorizeModel(alt),
    }))
  });
});

/**
 * Helper function to categorize models
 */
function categorizeModel(model) {
  if (model.includes('opus') || model.includes('4o') || model.includes('2.5-pro')) {
    return 'flagship';
  }
  if (model.includes('sonnet') || model.includes('large')) {
    return 'balanced';
  }
  if (model.includes('haiku') || model.includes('mini') || model.includes('flash')) {
    return 'fast';
  }
  return 'general';
}

module.exports = router;
