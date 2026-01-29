const express = require('express');
const { body, param, query } = require('express-validator');
const { audits, organizations, generateId } = require('../data/store');
const { authenticate, requirePlan } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/audits
 * Create a new audit
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Audit name is required'),
  body('url').optional().isURL().withMessage('Valid URL required'),
  body('repositoryUrl').optional().isURL().withMessage('Valid repository URL required'),
  body('description').optional().trim(),
  body('tags').optional().isArray()
], validate, async (req, res, next) => {
  try {
    const { name, url, repositoryUrl, description, tags } = req.body;
    const org = organizations.get(req.user.organizationId);

    // Check audit limits
    const userAudits = Array.from(audits.values())
      .filter(a => a.organizationId === req.user.organizationId);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const auditsThisMonth = userAudits.filter(a => 
      new Date(a.createdAt) >= thisMonth
    ).length;

    if (auditsThisMonth >= org.settings.maxAuditsPerMonth) {
      throw ApiError.forbidden(`Monthly audit limit reached (${org.settings.maxAuditsPerMonth}). Upgrade your plan for more.`);
    }

    const auditId = generateId('audit');
    const audit = {
      id: auditId,
      name,
      url: url || null,
      repositoryUrl: repositoryUrl || null,
      description: description || null,
      tags: tags || [],
      status: 'pending', // pending, analyzing, completed, failed
      organizationId: req.user.organizationId,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      results: null,
      score: null
    };

    audits.set(auditId, audit);
    logger.info(`Audit created: ${auditId} by ${req.user.email}`);

    res.status(201).json({
      message: 'Audit created successfully',
      audit
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audits
 * List audits for the organization
 */
router.get('/', [
  query('status').optional().isIn(['pending', 'analyzing', 'completed', 'failed']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('sortBy').optional().isIn(['createdAt', 'name', 'score']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], validate, (req, res) => {
  const { status, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  let orgAudits = Array.from(audits.values())
    .filter(a => a.organizationId === req.user.organizationId);

  // Filter by status
  if (status) {
    orgAudits = orgAudits.filter(a => a.status === status);
  }

  // Sort
  orgAudits.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const order = sortOrder === 'asc' ? 1 : -1;
    
    if (aVal < bVal) return -1 * order;
    if (aVal > bVal) return 1 * order;
    return 0;
  });

  // Paginate
  const total = orgAudits.length;
  const paginatedAudits = orgAudits.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    audits: paginatedAudits,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + paginatedAudits.length < total
    }
  });
});

/**
 * GET /api/audits/:id
 * Get a specific audit
 */
router.get('/:id', [
  param('id').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.id);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  res.json({ audit });
});

/**
 * PATCH /api/audits/:id
 * Update an audit
 */
router.patch('/:id', [
  param('id').notEmpty(),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('tags').optional().isArray()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.id);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  const { name, description, tags } = req.body;

  if (name) audit.name = name;
  if (description !== undefined) audit.description = description;
  if (tags) audit.tags = tags;
  audit.updatedAt = new Date().toISOString();

  logger.info(`Audit updated: ${audit.id}`);

  res.json({
    message: 'Audit updated',
    audit
  });
});

/**
 * DELETE /api/audits/:id
 * Delete an audit
 */
router.delete('/:id', [
  param('id').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.id);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  audits.delete(req.params.id);
  logger.info(`Audit deleted: ${req.params.id}`);

  res.json({ message: 'Audit deleted' });
});

/**
 * GET /api/audits/:id/export
 * Export audit as PDF/JSON
 */
router.get('/:id/export', [
  param('id').notEmpty(),
  query('format').optional().isIn(['json', 'pdf'])
], validate, (req, res, next) => {
  const audit = audits.get(req.params.id);
  const format = req.query.format || 'json';

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  if (format === 'pdf') {
    // In production, generate actual PDF
    return next(ApiError.badRequest('PDF export coming soon'));
  }

  res.json({
    export: {
      audit,
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.email
    }
  });
});

module.exports = router;
