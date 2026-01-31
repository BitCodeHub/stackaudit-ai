const express = require('express');
const { body, param, query } = require('express-validator');
const { 
  users, 
  audits, 
  auditComments, 
  auditShares,
  auditUserShares,
  commentReactions,
  collaborationActivity,
  generateId 
} = require('../data/store');
const { authenticate, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

// =============================================================================
// HELPER: Check if user can access audit
// =============================================================================

const canAccessAudit = (audit, user, requiredPermission = 'view') => {
  // Owner or same org member can always access
  if (user && audit.organizationId === user.organizationId) {
    return true;
  }

  // Check share settings
  const share = auditShares.get(audit.id);
  
  if (!share) {
    return false; // No sharing, org-only access
  }

  // Check visibility
  if (share.visibility === 'public') {
    if (requiredPermission === 'comment' && !share.allowPublicComments) {
      return false;
    }
    return true;
  }

  // Check individual user shares
  if (user) {
    const userShare = Array.from(auditUserShares.values())
      .find(s => s.auditId === audit.id && s.userId === user.id);
    
    if (userShare) {
      const permissions = { view: 1, comment: 2, edit: 3 };
      return permissions[userShare.permission] >= permissions[requiredPermission];
    }
  }

  return false;
};

const canComment = (audit, user) => {
  // Check if commenting is allowed
  const share = auditShares.get(audit.id);
  if (share && !share.allowComments) {
    return false;
  }
  
  return canAccessAudit(audit, user, 'comment');
};

// =============================================================================
// AUDIT COMMENTS
// =============================================================================

/**
 * GET /api/audits/:auditId/comments
 * Get comments for an audit
 */
router.get('/:auditId/comments', authenticate, [
  param('auditId').notEmpty(),
  query('targetType').optional().isIn(['audit', 'tool', 'recommendation', 'result']),
  query('targetId').optional().isUUID(),
  query('includeReplies').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (!canAccessAudit(audit, req.user)) {
    return next(ApiError.forbidden('Access denied'));
  }

  const { 
    targetType, 
    targetId, 
    includeReplies = 'true',
    limit = 50, 
    offset = 0 
  } = req.query;

  let comments = Array.from(auditComments.values())
    .filter(c => 
      c.auditId === req.params.auditId && 
      !c.deletedAt
    );

  // Filter by target if specified
  if (targetType) {
    comments = comments.filter(c => c.targetType === targetType);
  }
  if (targetId) {
    comments = comments.filter(c => c.targetId === targetId);
  }

  // Get top-level comments only if not including replies
  if (includeReplies !== 'true') {
    comments = comments.filter(c => !c.parentId);
  }

  // Sort by creation date (newest first for top-level, oldest first for replies)
  comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const total = comments.length;
  comments = comments.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // Enrich with user info and reactions
  comments = comments.map(c => {
    const author = users.get(c.userId);
    const reactions = Array.from(commentReactions.values())
      .filter(r => r.commentId === c.id);
    
    // Group reactions by emoji
    const reactionCounts = {};
    reactions.forEach(r => {
      if (!reactionCounts[r.emoji]) {
        reactionCounts[r.emoji] = { count: 0, users: [] };
      }
      reactionCounts[r.emoji].count++;
      const reactor = users.get(r.userId);
      reactionCounts[r.emoji].users.push(reactor?.name || 'Unknown');
    });

    // Get reply count
    const replyCount = Array.from(auditComments.values())
      .filter(reply => reply.parentId === c.id && !reply.deletedAt).length;

    return {
      ...c,
      author: {
        id: author?.id,
        name: author?.name || 'Unknown',
        email: author?.email,
        avatarUrl: author?.avatarUrl
      },
      reactions: reactionCounts,
      replyCount,
      // Don't include replies in the list, fetch separately
      isOwner: author?.id === req.user.id
    };
  });

  // Build thread structure if including replies
  if (includeReplies === 'true') {
    const topLevel = comments.filter(c => !c.parentId);
    const repliesMap = {};
    comments.filter(c => c.parentId).forEach(c => {
      if (!repliesMap[c.parentId]) repliesMap[c.parentId] = [];
      repliesMap[c.parentId].push(c);
    });

    comments = topLevel.map(c => ({
      ...c,
      replies: repliesMap[c.id] || []
    }));
  }

  res.json({
    comments,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + comments.length < total
    }
  });
});

/**
 * POST /api/audits/:auditId/comments
 * Add a comment to an audit
 */
router.post('/:auditId/comments', authenticate, [
  param('auditId').notEmpty(),
  body('content').trim().notEmpty().withMessage('Comment content is required'),
  body('parentId').optional().isUUID(),
  body('targetType').optional().isIn(['audit', 'tool', 'recommendation', 'result']),
  body('targetId').optional().isUUID(),
  body('mentions').optional().isArray()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (!canComment(audit, req.user)) {
    return next(ApiError.forbidden('You cannot comment on this audit'));
  }

  const { content, parentId, targetType, targetId, mentions } = req.body;

  // Validate parent comment exists if replying
  if (parentId) {
    const parentComment = auditComments.get(parentId);
    if (!parentComment || parentComment.deletedAt) {
      return next(ApiError.notFound('Parent comment not found'));
    }
    if (parentComment.auditId !== req.params.auditId) {
      return next(ApiError.badRequest('Parent comment belongs to different audit'));
    }
  }

  const commentId = generateId('comment');
  const comment = {
    id: commentId,
    auditId: req.params.auditId,
    userId: req.user.id,
    content,
    parentId: parentId || null,
    targetType: targetType || 'audit',
    targetId: targetId || null,
    mentions: mentions || [],
    attachments: [],
    isResolved: false,
    resolvedBy: null,
    resolvedAt: null,
    isEdited: false,
    editedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  };

  auditComments.set(commentId, comment);

  // Log activity
  const activityId = generateId('activity');
  collaborationActivity.set(activityId, {
    id: activityId,
    organizationId: audit.organizationId,
    activityType: parentId ? 'comment_replied' : 'comment_added',
    userId: req.user.id,
    auditId: audit.id,
    commentId: commentId,
    description: parentId 
      ? `Replied to a comment on "${audit.name}"`
      : `Commented on "${audit.name}"`,
    metadata: { targetType, targetId },
    createdAt: new Date().toISOString()
  });

  logger.info(`Comment added: ${commentId} on audit ${audit.id} by ${req.user.email}`);

  // Enrich response
  const author = users.get(req.user.id);
  
  res.status(201).json({
    message: 'Comment added',
    comment: {
      ...comment,
      author: {
        id: author?.id,
        name: author?.name,
        email: author?.email,
        avatarUrl: author?.avatarUrl
      },
      reactions: {},
      replyCount: 0,
      isOwner: true
    }
  });
});

/**
 * PATCH /api/audits/:auditId/comments/:commentId
 * Edit a comment
 */
router.patch('/:auditId/comments/:commentId', authenticate, [
  param('auditId').notEmpty(),
  param('commentId').notEmpty(),
  body('content').trim().notEmpty().withMessage('Comment content is required')
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  const comment = auditComments.get(req.params.commentId);

  if (!comment || comment.deletedAt) {
    return next(ApiError.notFound('Comment not found'));
  }

  if (comment.auditId !== req.params.auditId) {
    return next(ApiError.badRequest('Comment belongs to different audit'));
  }

  // Only author can edit
  if (comment.userId !== req.user.id) {
    return next(ApiError.forbidden('You can only edit your own comments'));
  }

  comment.content = req.body.content;
  comment.isEdited = true;
  comment.editedAt = new Date().toISOString();
  comment.updatedAt = new Date().toISOString();

  logger.info(`Comment edited: ${comment.id} by ${req.user.email}`);

  res.json({
    message: 'Comment updated',
    comment
  });
});

/**
 * DELETE /api/audits/:auditId/comments/:commentId
 * Delete a comment (soft delete)
 */
router.delete('/:auditId/comments/:commentId', authenticate, [
  param('auditId').notEmpty(),
  param('commentId').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  const comment = auditComments.get(req.params.commentId);

  if (!comment || comment.deletedAt) {
    return next(ApiError.notFound('Comment not found'));
  }

  if (comment.auditId !== req.params.auditId) {
    return next(ApiError.badRequest('Comment belongs to different audit'));
  }

  // Author or admin/owner can delete
  const isAuthor = comment.userId === req.user.id;
  const isOrgAdmin = audit.organizationId === req.user.organizationId && 
    ['admin', 'owner'].includes(req.user.role);

  if (!isAuthor && !isOrgAdmin) {
    return next(ApiError.forbidden('You cannot delete this comment'));
  }

  comment.deletedAt = new Date().toISOString();
  comment.updatedAt = new Date().toISOString();

  logger.info(`Comment deleted: ${comment.id} by ${req.user.email}`);

  res.json({ message: 'Comment deleted' });
});

/**
 * POST /api/audits/:auditId/comments/:commentId/resolve
 * Mark a comment as resolved
 */
router.post('/:auditId/comments/:commentId/resolve', authenticate, [
  param('auditId').notEmpty(),
  param('commentId').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  // Only org members can resolve
  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  const comment = auditComments.get(req.params.commentId);

  if (!comment || comment.deletedAt) {
    return next(ApiError.notFound('Comment not found'));
  }

  if (comment.auditId !== req.params.auditId) {
    return next(ApiError.badRequest('Comment belongs to different audit'));
  }

  if (comment.isResolved) {
    return next(ApiError.badRequest('Comment is already resolved'));
  }

  comment.isResolved = true;
  comment.resolvedBy = req.user.id;
  comment.resolvedAt = new Date().toISOString();
  comment.updatedAt = new Date().toISOString();

  // Log activity
  const activityId = generateId('activity');
  collaborationActivity.set(activityId, {
    id: activityId,
    organizationId: audit.organizationId,
    activityType: 'comment_resolved',
    userId: req.user.id,
    auditId: audit.id,
    commentId: comment.id,
    description: `Resolved a comment on "${audit.name}"`,
    createdAt: new Date().toISOString()
  });

  logger.info(`Comment resolved: ${comment.id} by ${req.user.email}`);

  res.json({
    message: 'Comment resolved',
    comment
  });
});

/**
 * POST /api/audits/:auditId/comments/:commentId/unresolve
 * Unresolve a comment
 */
router.post('/:auditId/comments/:commentId/unresolve', authenticate, [
  param('auditId').notEmpty(),
  param('commentId').notEmpty()
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (audit.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  const comment = auditComments.get(req.params.commentId);

  if (!comment || comment.deletedAt) {
    return next(ApiError.notFound('Comment not found'));
  }

  if (!comment.isResolved) {
    return next(ApiError.badRequest('Comment is not resolved'));
  }

  comment.isResolved = false;
  comment.resolvedBy = null;
  comment.resolvedAt = null;
  comment.updatedAt = new Date().toISOString();

  logger.info(`Comment unresolved: ${comment.id} by ${req.user.email}`);

  res.json({
    message: 'Comment reopened',
    comment
  });
});

// =============================================================================
// COMMENT REACTIONS
// =============================================================================

/**
 * POST /api/audits/:auditId/comments/:commentId/reactions
 * Add a reaction to a comment
 */
router.post('/:auditId/comments/:commentId/reactions', authenticate, [
  param('auditId').notEmpty(),
  param('commentId').notEmpty(),
  body('emoji').trim().notEmpty().withMessage('Emoji is required')
], validate, (req, res, next) => {
  const audit = audits.get(req.params.auditId);

  if (!audit) {
    return next(ApiError.notFound('Audit not found'));
  }

  if (!canAccessAudit(audit, req.user)) {
    return next(ApiError.forbidden('Access denied'));
  }

  const comment = auditComments.get(req.params.commentId);

  if (!comment || comment.deletedAt) {
    return next(ApiError.notFound('Comment not found'));
  }

  const { emoji } = req.body;

  // Check if reaction already exists
  const existingReaction = Array.from(commentReactions.values())
    .find(r => r.commentId === comment.id && r.userId === req.user.id && r.emoji === emoji);

  if (existingReaction) {
    return next(ApiError.badRequest('You already reacted with this emoji'));
  }

  const reactionId = generateId('reaction');
  const reaction = {
    id: reactionId,
    commentId: comment.id,
    userId: req.user.id,
    emoji,
    createdAt: new Date().toISOString()
  };

  commentReactions.set(reactionId, reaction);

  logger.info(`Reaction added: ${emoji} on comment ${comment.id} by ${req.user.email}`);

  res.status(201).json({
    message: 'Reaction added',
    reaction
  });
});

/**
 * DELETE /api/audits/:auditId/comments/:commentId/reactions/:emoji
 * Remove a reaction
 */
router.delete('/:auditId/comments/:commentId/reactions/:emoji', authenticate, [
  param('auditId').notEmpty(),
  param('commentId').notEmpty(),
  param('emoji').notEmpty()
], validate, (req, res, next) => {
  const comment = auditComments.get(req.params.commentId);

  if (!comment || comment.deletedAt) {
    return next(ApiError.notFound('Comment not found'));
  }

  const reaction = Array.from(commentReactions.values())
    .find(r => 
      r.commentId === comment.id && 
      r.userId === req.user.id && 
      r.emoji === req.params.emoji
    );

  if (!reaction) {
    return next(ApiError.notFound('Reaction not found'));
  }

  commentReactions.delete(reaction.id);

  logger.info(`Reaction removed: ${req.params.emoji} on comment ${comment.id} by ${req.user.email}`);

  res.json({ message: 'Reaction removed' });
});

module.exports = router;
