const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param } = require('express-validator');
const { users, organizations, generateId } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users
 * List users in organization (admin only)
 */
router.get('/', authorize('admin', 'owner'), (req, res) => {
  const orgUsers = Array.from(users.values())
    .filter(u => u.organizationId === req.user.organizationId)
    .map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    }));

  res.json({ users: orgUsers });
});

/**
 * POST /api/users/invite
 * Invite a new user to organization
 */
router.post('/invite', authorize('admin', 'owner'), [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().notEmpty(),
  body('role').optional().isIn(['member', 'admin'])
], validate, async (req, res, next) => {
  try {
    const { email, name, role = 'member' } = req.body;
    const org = organizations.get(req.user.organizationId);

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    // Check user limits based on plan
    const orgUsers = Array.from(users.values())
      .filter(u => u.organizationId === req.user.organizationId);
    
    const userLimits = { free: 1, pro: 10, enterprise: 100 };
    if (orgUsers.length >= userLimits[org.plan]) {
      throw ApiError.forbidden(`User limit reached for ${org.plan} plan`);
    }

    // Create user with temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const userId = generateId('user');
    
    const user = {
      id: userId,
      email,
      passwordHash: await bcrypt.hash(tempPassword, 10),
      name,
      organizationId: req.user.organizationId,
      role,
      plan: org.plan,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      invitedBy: req.user.id,
      mustChangePassword: true
    };

    users.set(userId, user);
    logger.info(`User invited: ${email} by ${req.user.email}`);

    // In production, send email invitation
    res.status(201).json({
      message: 'User invited successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      tempPassword // Remove in production - send via email instead
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get user details
 */
router.get('/:id', [
  param('id').notEmpty()
], validate, (req, res, next) => {
  const user = users.get(req.params.id);

  if (!user) {
    return next(ApiError.notFound('User not found'));
  }

  if (user.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }
  });
});

/**
 * PATCH /api/users/:id
 * Update user
 */
router.patch('/:id', [
  param('id').notEmpty(),
  body('name').optional().trim().notEmpty(),
  body('role').optional().isIn(['member', 'admin'])
], validate, (req, res, next) => {
  const user = users.get(req.params.id);

  if (!user) {
    return next(ApiError.notFound('User not found'));
  }

  if (user.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  // Only admins can change roles
  if (req.body.role && !['admin', 'owner'].includes(req.user.role)) {
    return next(ApiError.forbidden('Only admins can change user roles'));
  }

  // Prevent demoting the last admin
  if (req.body.role === 'member' && user.role === 'admin') {
    const admins = Array.from(users.values())
      .filter(u => u.organizationId === req.user.organizationId && u.role === 'admin');
    if (admins.length <= 1) {
      return next(ApiError.badRequest('Cannot remove the last admin'));
    }
  }

  const { name, role } = req.body;
  if (name) user.name = name;
  if (role) user.role = role;

  logger.info(`User updated: ${user.id} by ${req.user.email}`);

  res.json({
    message: 'User updated',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

/**
 * DELETE /api/users/:id
 * Remove user from organization
 */
router.delete('/:id', authorize('admin', 'owner'), [
  param('id').notEmpty()
], validate, (req, res, next) => {
  const user = users.get(req.params.id);

  if (!user) {
    return next(ApiError.notFound('User not found'));
  }

  if (user.organizationId !== req.user.organizationId) {
    return next(ApiError.forbidden('Access denied'));
  }

  // Cannot delete yourself
  if (user.id === req.user.id) {
    return next(ApiError.badRequest('Cannot delete your own account'));
  }

  // Cannot delete the last admin
  if (user.role === 'admin') {
    const admins = Array.from(users.values())
      .filter(u => u.organizationId === req.user.organizationId && u.role === 'admin');
    if (admins.length <= 1) {
      return next(ApiError.badRequest('Cannot remove the last admin'));
    }
  }

  users.delete(req.params.id);
  logger.info(`User removed: ${req.params.id} by ${req.user.email}`);

  res.json({ message: 'User removed from organization' });
});

module.exports = router;
