const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { users, organizations, generateId } = require('../data/store');
const { generateToken, authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('organizationName').optional().trim()
], validate, async (req, res, next) => {
  try {
    const { email, password, name, organizationName } = req.body;

    // Check if user exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create organization
    const orgId = generateId('org');
    organizations.set(orgId, {
      id: orgId,
      name: organizationName || `${name}'s Organization`,
      plan: 'free',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date().toISOString(),
      settings: {
        allowedDomains: [],
        maxAuditsPerMonth: 3,
        auditRetentionDays: 7
      }
    });

    // Create user
    const userId = generateId('user');
    const user = {
      id: userId,
      email,
      passwordHash,
      name,
      organizationId: orgId,
      role: 'admin',
      plan: 'free',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    users.set(userId, user);

    // Generate token
    const token = generateToken(user);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        role: user.role,
        plan: user.plan
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();

    // Generate token
    const token = generateToken(user);

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        role: user.role,
        plan: user.plan
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, (req, res) => {
  const user = users.get(req.user.id);
  const org = organizations.get(user.organizationId);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    },
    organization: org ? {
      id: org.id,
      name: org.name,
      plan: org.plan
    } : null
  });
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticate, (req, res) => {
  const user = users.get(req.user.id);
  const token = generateToken(user);

  res.json({ token });
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, but we can track it server-side if needed)
 */
router.post('/logout', authenticate, (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);
  res.json({ message: 'Logged out successfully' });
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], validate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = users.get(req.user.id);

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);

    logger.info(`Password changed for user: ${user.email}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
