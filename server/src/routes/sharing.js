const express = require('express');
const { body, param, query } = require('express-validator');
const crypto = require('crypto');
const { 
  users, 
  audits, 
  auditShares,
  auditUserShares,
  collaborationActivity,
  generateId 
} = require('../data/store');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

// =============================================================================
// AUDIT SHARING SETTINGS
// =============================================================================

/**
 * GET /api/audits/:auditId/sharing
 * Get sharing settings for an audit
 */
router.get('/:auditId/sharing', authenticate, [
  param('auditId').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  // Only org members can view sharing settings
  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  let share = auditShares.get(audit.id);

  // Create default share settings if none exist
  if (!share) {
    share = {
      id: generateId('share'),
      auditId: audit.id,
      visibility: 'team',
      publicToken: null,
      publicTokenExpiresAt: null,
      allowPublicComments: false,
      allowDownloads: true,
      allowComments: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    auditShares.set(audit.id, share);
  }

  // Get shared users
  const sharedUsers = Array.from(auditUserShares.values())
    .filter(s => s.auditId === audit.id)
    .map(s => {
      const user = users.get(s.userId);
      const sharedBy = users.get(s.sharedBy);
      return {
        id: s.id,
        userId: s.userId,
        email: user?.email,
        name: user?.name,
        permission: s.permission,
        sharedBy: sharedBy?.name || 'Unknown',
        sharedAt: s.sharedAt,
        lastViewedAt: s.lastViewedAt,
        viewCount: s.viewCount
      };
    });

  res.json({
    sharing: {
      ...share,
      sharedUsers
    }
  });
});

/**
 * PATCH /api/audits/:auditId/sharing
 * Update sharing settings
 */
router.patch('/:auditId/sharing', authenticate, authorize('admin', 'owner', 'member'), [
  param('auditId').notEmpty(),
  body('visibility').optional().isIn(['private', 'team', 'organization', 'public']),
  body('allowPublicComments').optional().isBoolean(),
  body('allowDownloads').optional().isBoolean(),
  body('allowComments').optional().isBoolean()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  // Only org members with edit rights can change sharing
  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  // Only audit creator or admin/owner can change sharing
  const isCreator = audit.createdBy === req.user.id;
  const isAdmin = ['admin', 'owner'].includes(req.user.role);
  
  if (!isCreator && !isAdmin) {
    return next(ApiError.forbidden('Only audit creator or admin can change sharing settings'));
  }

  let share = auditShares.get(audit.id);

  // Create if doesn't exist
  if (!share) {
    share = {
      id: generateId('share'),
      auditId: audit.id,
      visibility: 'team',
      publicToken: null,
      publicTokenExpiresAt: null,
      allowPublicComments: false,
      allowDownloads: true,
      allowComments: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    auditShares.set(audit.id, share);
  }

  const { visibility, allowPublicComments, allowDownloads, allowComments } = req.body;

  if (visibility !== undefined) {
    share.visibility = visibility;
    
    // Generate public token if making public
    if (visibility === 'public' && !share.publicToken) {
      share.publicToken = crypto.randomBytes(32).toString('hex');
      share.publicTokenExpiresAt = null; // No expiry by default
    }
    
    // Clear public token if not public
    if (visibility !== 'public') {
      share.publicToken = null;
      share.publicTokenExpiresAt = null;
    }
  }

  if (allowPublicComments !== undefined) share.allowPublicComments = allowPublicComments;
  if (allowDownloads !== undefined) share.allowDownloads = allowDownloads;
  if (allowComments !== undefined) share.allowComments = allowComments;

  share.updatedAt = new Date().toISOString();

  // Log activity
  const activityId = generateId('activity');
  collaborationActivity.set(activityId, {
    id: activityId,
    organizationId: audit.organizationId,
    activityType: 'audit_shared',
    userId: req.user.id,
    auditId: audit.id,
    description: `Updated sharing settings for "${audit.name}"`,
    metadata: { visibility: share.visibility },
    createdAt: new Date().toISOString()
  });

  logger.info(`Sharing updated for audit ${audit.id} by ${req.user.email}`);

  res.json({
    message: 'Sharing settings updated',
    sharing: share
  });
});

/**
 * POST /api/audits/:auditId/sharing/users
 * Share audit with specific users
 */
router.post('/:auditId/sharing/users', authenticate, [
  param('auditId').notEmpty(),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('permission').optional().isIn(['view', 'comment', 'edit']).withMessage('Invalid permission')
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  const { email, permission = 'view' } = req.body;

  // Find user by email
  const targetUser = Array.from(users.values()).find(u => u.email === email);

  if (!targetUser) {
    return next(ApiError.notFound('User not found. They must have a StackAudit account.'));
  }

  // Can't share with yourself
  if (targetUser.id === req.user.id) {
    return next(ApiError.badRequest('Cannot share with yourself'));
  }

  // Check if already shared
  const existingShare = Array.from(auditUserShares.values())
    .find(s => s.auditId === audit.id && s.userId === targetUser.id);

  if (existingShare) {
    // Update existing share
    existingShare.permission = permission;
    existingShare.sharedBy = req.user.id;
    existingShare.sharedAt = new Date().toISOString();

    logger.info(`Share updated for audit ${audit.id} with ${email} by ${req.user.email}`);

    return res.json({
      message: 'Share updated',
      share: {
        id: existingShare.id,
        userId: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        permission: existingShare.permission
      }
    });
  }

  // Create new share
  const shareId = generateId('usershare');
  const userShare = {
    id: shareId,
    auditId: audit.id,
    userId: targetUser.id,
    permission,
    sharedBy: req.user.id,
    sharedAt: new Date().toISOString(),
    lastViewedAt: null,
    viewCount: 0,
    createdAt: new Date().toISOString()
  };

  auditUserShares.set(shareId, userShare);

  // Log activity
  const activityId = generateId('activity');
  collaborationActivity.set(activityId, {
    id: activityId,
    organizationId: audit.organizationId,
    activityType: 'audit_shared',
    userId: req.user.id,
    auditId: audit.id,
    targetUserId: targetUser.id,
    description: `Shared "${audit.name}" with ${targetUser.name}`,
    metadata: { permission, email },
    createdAt: new Date().toISOString()
  });

  logger.info(`Audit ${audit.id} shared with ${email} by ${req.user.email}`);

  res.status(201).json({
    message: 'Audit shared successfully',
    share: {
      id: userShare.id,
      userId: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      permission
    }
  });
});

/**
 * DELETE /api/audits/:auditId/sharing/users/:userId
 * Remove user from audit share
 */
router.delete('/:auditId/sharing/users/:userId', authenticate, [
  param('auditId').notEmpty(),
  param('userId').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  const userShare = Array.from(auditUserShares.values())
    .find(s => s.auditId === audit.id && s.userId === req.params.userId);

  if (!userShare) {
    return next(ApiError.notFound('Share not found'));
  }

  auditUserShares.delete(userShare.id);

  logger.info(`Share removed for audit ${audit.id} user ${req.params.userId} by ${req.user.email}`);

  res.json({ message: 'Share removed' });
});

/**
 * POST /api/audits/:auditId/sharing/regenerate-link
 * Regenerate public sharing link
 */
router.post('/:auditId/sharing/regenerate-link', authenticate, [
  param('auditId').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  let share = auditShares.get(audit.id);

  if (!share || share.visibility !== 'public') {
    return next(ApiError.badRequest('Audit is not publicly shared'));
  }

  share.publicToken = crypto.randomBytes(32).toString('hex');
  share.updatedAt = new Date().toISOString();

  const publicLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${share.publicToken}`;

  logger.info(`Public link regenerated for audit ${audit.id} by ${req.user.email}`);

  res.json({
    message: 'Public link regenerated',
    publicLink,
    publicToken: share.publicToken
  });
});

// =============================================================================
// SHARED WITH ME
// =============================================================================

/**
 * GET /api/shared-with-me
 * List audits shared with the current user
 */
router.get('/shared-with-me', authenticate, [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], validate, (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  let sharedAudits = Array.from(auditUserShares.values())
    .filter(s => s.userId === req.user.id)
    .map(s => {
      const audit = audits.get(s.auditId);
      if (!audit) return null;

      const sharedBy = users.get(s.sharedBy);
      
      return {
        id: audit.id,
        name: audit.name,
        description: audit.description,
        status: audit.status,
        permission: s.permission,
        sharedBy: {
          id: sharedBy?.id,
          name: sharedBy?.name,
          email: sharedBy?.email
        },
        sharedAt: s.sharedAt,
        lastViewedAt: s.lastViewedAt,
        viewCount: s.viewCount
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt));

  const total = sharedAudits.length;
  sharedAudits = sharedAudits.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    audits: sharedAudits,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + sharedAudits.length < total
    }
  });
});

// =============================================================================
// PUBLIC ACCESS
// =============================================================================

/**
 * GET /api/shared/:token
 * Access publicly shared audit
 */
router.get('/shared/:token', optionalAuth, [
  param('token').notEmpty()
], validate, (req, res, next) => {
  // Find share by token
  const share = Array.from(auditShares.values())
    .find(s => s.publicToken === req.params.token);

  if (!share) {
    return next(ApiError.notFound('Invalid or expired share link'));
  }

  if (share.visibility !== 'public') {
    return next(ApiError.forbidden('This audit is no longer publicly shared'));
  }

  // Check expiry
  if (share.publicTokenExpiresAt && new Date(share.publicTokenExpiresAt) < new Date()) {
    return next(ApiError.forbidden('This share link has expired'));
  }

  const audit = audits.get(share.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  // Track view for logged-in users
  if (req.user) {
    const userShare = Array.from(auditUserShares.values())
      .find(s => s.auditId === audit.id && s.userId === req.user.id);
    
    if (userShare) {
      userShare.lastViewedAt = new Date().toISOString();
      userShare.viewCount = (userShare.viewCount || 0) + 1;
    }
  }

  res.json({
    audit: {
      id: audit.id,
      name: audit.name,
      description: audit.description,
      status: audit.status,
      tags: audit.tags,
      score: audit.score,
      results: share.allowDownloads ? audit.results : null,
      completedAt: audit.completedAt,
      createdAt: audit.createdAt
    },
    sharing: {
      allowComments: share.allowPublicComments,
      allowDownloads: share.allowDownloads
    },
    isAuthenticated: !!req.user
  });
});

module.exports = router;
