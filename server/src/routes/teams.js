const express = require('express');
const { body, param, query } = require('express-validator');
const crypto = require('crypto');
const { 
  users, 
  organizations, 
  teamInvites, 
  collaborationActivity,
  generateId 
} = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// =============================================================================
// TEAM MEMBERS
// =============================================================================

/**
 * GET /api/teams/members
 * List team members for current organization
 */
router.get('/members', (req, res) => {
  const members = Array.from(users.values())
    .filter(u => u.organizationId === req.user.organizationId)
    .map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatarUrl: u.avatarUrl || null,
      joinedAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    }));

  res.json({
    members,
    total: members.length
  });
});

/**
 * GET /api/teams/members/:id
 * Get a specific team member
 */
router.get('/members/:id', [
  param('id').notEmpty()
], validate, (req, res, next) => {
  const member = users.get(req.params.id);

  if (!member) {
    return next(ApiError.notFound('Member not found'));
  }

  if (member.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  res.json({
    member: {
      id: member.id,
      email: member.email,
      name: member.name,
      role: member.role,
      avatarUrl: member.avatarUrl || null,
      joinedAt: member.createdAt,
      lastLoginAt: member.lastLoginAt
    }
  });
});

/**
 * PATCH /api/teams/members/:id/role
 * Update a team member's role (admin/owner only)
 */
router.patch('/members/:id/role', authorize('admin', 'owner'), [
  param('id').notEmpty(),
  body('role').isIn(['admin', 'member', 'viewer']).withMessage('Invalid role')
], validate, (req, res, next) => {
  const member = users.get(req.params.id);

  if (!member) {
    return next(ApiError.notFound('Member not found'));
  }

  if (member.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  // Can't change owner's role
  if (member.role === 'owner') {
    return next(ApiError.forbidden('Cannot change owner role'));
  }

  // Only owner can promote to admin
  if (req.body.role === 'admin' && req.user.role !== 'owner') {
    return next(ApiError.forbidden('Only owner can promote to admin'));
  }

  const previousRole = member.role;
  member.role = req.body.role;

  // Log activity
  const activityId = generateId('activity');
  collaborationActivity.set(activityId, {
    id: activityId,
    organizationId: req.user.organizationId,
    activityType: 'member_role_changed',
    userId: req.user.id,
    targetUserId: member.id,
    description: `Changed ${member.name}'s role from ${previousRole} to ${member.role}`,
    metadata: { previousRole, newRole: member.role },
    createdAt: new Date().toISOString()
  });

  logger.info(`Member role updated: ${member.id} to ${member.role} by ${req.user.email}`);

  res.json({
    message: 'Member role updated',
    member: {
      id: member.id,
      email: member.email,
      name: member.name,
      role: member.role
    }
  });
});

/**
 * DELETE /api/teams/members/:id
 * Remove a team member (admin/owner only)
 */
router.delete('/members/:id', authorize('admin', 'owner'), [
  param('id').notEmpty()
], validate, (req, res, next) => {
  const member = users.get(req.params.id);

  if (!member) {
    return next(ApiError.notFound('Member not found'));
  }

  if (member.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  // Can't remove yourself
  if (member.id === req.user.id) {
    return next(ApiError.badRequest('Cannot remove yourself'));
  }

  // Can't remove owner
  if (member.role === 'owner') {
    return next(ApiError.forbidden('Cannot remove organization owner'));
  }

  // Admins can't remove other admins
  if (member.role === 'admin' && req.user.role !== 'owner') {
    return next(ApiError.forbidden('Only owner can remove admins'));
  }

  users.delete(member.id);

  // Log activity
  const activityId = generateId('activity');
  collaborationActivity.set(activityId, {
    id: activityId,
    organizationId: req.user.organizationId,
    activityType: 'member_removed',
    userId: req.user.id,
    targetUserId: member.id,
    description: `Removed ${member.name} from the team`,
    metadata: { removedEmail: member.email },
    createdAt: new Date().toISOString()
  });

  logger.info(`Member removed: ${member.email} by ${req.user.email}`);

  res.json({ message: 'Member removed' });
});

// =============================================================================
// TEAM INVITES
// =============================================================================

/**
 * GET /api/teams/invites
 * List pending invites
 */
router.get('/invites', authorize('admin', 'owner'), (req, res) => {
  const invites = Array.from(teamInvites.values())
    .filter(i => i.organizationId === req.user.organizationId && i.status === 'pending')
    .map(i => ({
      id: i.id,
      email: i.email,
      role: i.role,
      invitedBy: i.invitedByName,
      personalMessage: i.personalMessage,
      expiresAt: i.expiresAt,
      createdAt: i.createdAt
    }));

  res.json({
    invites,
    total: invites.length
  });
});

/**
 * POST /api/teams/invites
 * Send a team invite
 */
router.post('/invites', authorize('admin', 'owner'), [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['admin', 'member', 'viewer']).withMessage('Invalid role'),
  body('personalMessage').optional().trim().isLength({ max: 500 })
], validate, (req, res, next) => {
  const { email, role = 'member', personalMessage } = req.body;
  const org = organizations.get(req.user.organizationId);

  // Check if user already exists in org
  const existingUser = Array.from(users.values())
    .find(u => u.email === email && u.organizationId === req.user.organizationId);
  
  if (existingUser) {
    return next(ApiError.badRequest('User is already a team member'));
  }

  // Check for existing pending invite
  const existingInvite = Array.from(teamInvites.values())
    .find(i => 
      i.email === email && 
      i.organizationId === req.user.organizationId && 
      i.status === 'pending'
    );

  if (existingInvite) {
    return next(ApiError.badRequest('An invite is already pending for this email'));
  }

  // Check team size limits based on plan
  const memberCount = Array.from(users.values())
    .filter(u => u.organizationId === req.user.organizationId).length;
  const pendingCount = Array.from(teamInvites.values())
    .filter(i => i.organizationId === req.user.organizationId && i.status === 'pending').length;
  
  const planLimits = { free: 1, pro: 10, enterprise: 100 };
  const limit = planLimits[org.plan] || 1;
  
  if (memberCount + pendingCount >= limit) {
    return next(ApiError.forbidden(`Team size limit reached (${limit}). Upgrade your plan for more.`));
  }

  // Only owner can invite admins
  if (role === 'admin' && req.user.role !== 'owner') {
    return next(ApiError.forbidden('Only owner can invite admins'));
  }

  // Generate invite token
  const inviteToken = crypto.randomBytes(32).toString('hex');
  const inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex');

  const inviteId = generateId('invite');
  const invite = {
    id: inviteId,
    organizationId: req.user.organizationId,
    organizationName: org.name,
    email,
    role,
    status: 'pending',
    inviteTokenHash,
    invitedBy: req.user.id,
    invitedByName: req.user.name,
    invitedByEmail: req.user.email,
    personalMessage: personalMessage || null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    createdAt: new Date().toISOString()
  };

  teamInvites.set(inviteId, invite);

  // Log activity
  const activityId = generateId('activity');
  collaborationActivity.set(activityId, {
    id: activityId,
    organizationId: req.user.organizationId,
    activityType: 'member_invited',
    userId: req.user.id,
    description: `Invited ${email} to join the team`,
    metadata: { email, role },
    createdAt: new Date().toISOString()
  });

  logger.info(`Team invite sent: ${email} by ${req.user.email}`);

  // In production, send email with invite link
  const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${inviteToken}`;

  res.status(201).json({
    message: 'Invite sent successfully',
    invite: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt
    },
    // Include invite link in response for demo (in prod, only send via email)
    inviteLink
  });
});

/**
 * POST /api/teams/invites/:token/accept
 * Accept an invite (public route, but needs invite token)
 */
router.post('/invites/:token/accept', [
  param('token').notEmpty()
], validate, (req, res, next) => {
  const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
  
  const invite = Array.from(teamInvites.values())
    .find(i => i.inviteTokenHash === tokenHash);

  if (!invite) {
    return next(ApiError.notFound('Invalid or expired invite'));
  }

  if (invite.status !== 'pending') {
    return next(ApiError.badRequest(`Invite has already been ${invite.status}`));
  }

  if (new Date(invite.expiresAt) < new Date()) {
    invite.status = 'expired';
    return next(ApiError.badRequest('Invite has expired'));
  }

  // Check if accepting user matches invite email
  if (req.user.email !== invite.email) {
    return next(ApiError.forbidden('This invite was sent to a different email address'));
  }

  // Update user's organization
  const user = users.get(req.user.id);
  user.organizationId = invite.organizationId;
  user.role = invite.role;

  // Update invite status
  invite.status = 'accepted';
  invite.acceptedAt = new Date().toISOString();
  invite.acceptedBy = req.user.id;

  // Log activity
  const activityId = generateId('activity');
  collaborationActivity.set(activityId, {
    id: activityId,
    organizationId: invite.organizationId,
    activityType: 'member_joined',
    userId: req.user.id,
    description: `${req.user.name} joined the team`,
    metadata: { email: req.user.email, role: invite.role },
    createdAt: new Date().toISOString()
  });

  logger.info(`Invite accepted: ${req.user.email} joined org ${invite.organizationId}`);

  res.json({
    message: 'Welcome to the team!',
    organization: {
      id: invite.organizationId,
      name: invite.organizationName
    }
  });
});

/**
 * GET /api/teams/invites/:token
 * Get invite details by token (for preview before accepting)
 */
router.get('/invites/:token', [
  param('token').notEmpty()
], validate, (req, res, next) => {
  const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
  
  const invite = Array.from(teamInvites.values())
    .find(i => i.inviteTokenHash === tokenHash);

  if (!invite) {
    return next(ApiError.notFound('Invalid or expired invite'));
  }

  res.json({
    invite: {
      organizationName: invite.organizationName,
      invitedBy: invite.invitedByName,
      role: invite.role,
      personalMessage: invite.personalMessage,
      status: invite.status,
      expiresAt: invite.expiresAt
    }
  });
});

/**
 * DELETE /api/teams/invites/:id
 * Revoke/cancel a pending invite
 */
router.delete('/invites/:id', authorize('admin', 'owner'), [
  param('id').notEmpty()
], validate, (req, res, next) => {
  const invite = teamInvites.get(req.params.id);

  if (!invite) {
    return next(ApiError.notFound('Invite not found'));
  }

  if (invite.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  if (invite.status !== 'pending') {
    return next(ApiError.badRequest('Can only revoke pending invites'));
  }

  invite.status = 'revoked';

  logger.info(`Invite revoked: ${invite.email} by ${req.user.email}`);

  res.json({ message: 'Invite revoked' });
});

/**
 * POST /api/teams/invites/:id/resend
 * Resend an invite email
 */
router.post('/invites/:id/resend', authorize('admin', 'owner'), [
  param('id').notEmpty()
], validate, (req, res, next) => {
  const invite = teamInvites.get(req.params.id);

  if (!invite) {
    return next(ApiError.notFound('Invite not found'));
  }

  if (invite.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  if (invite.status !== 'pending') {
    return next(ApiError.badRequest('Can only resend pending invites'));
  }

  // Generate new token and extend expiry
  const inviteToken = crypto.randomBytes(32).toString('hex');
  invite.inviteTokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex');
  invite.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  logger.info(`Invite resent: ${invite.email} by ${req.user.email}`);

  const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${inviteToken}`;

  res.json({
    message: 'Invite resent',
    inviteLink
  });
});

// =============================================================================
// ACTIVITY FEED
// =============================================================================

/**
 * GET /api/teams/activity
 * Get team activity feed
 */
router.get('/activity', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], validate, (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  let activities = Array.from(collaborationActivity.values())
    .filter(a => a.organizationId === req.user.organizationId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = activities.length;
  activities = activities.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  // Enrich with user info
  activities = activities.map(a => {
    const actor = users.get(a.userId);
    return {
      ...a,
      actorName: actor?.name || 'Unknown',
      actorEmail: actor?.email || null
    };
  });

  res.json({
    activities,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + activities.length < total
    }
  });
});

module.exports = router;
