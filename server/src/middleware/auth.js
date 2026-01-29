const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { users } = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from store
    const user = users.get(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      role: user.role,
      plan: user.plan
    };
    
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid token'));
    }
  }
};

/**
 * Optional auth - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.get(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organizationId,
          role: user.role,
          plan: user.plan
        };
      }
    }
    next();
  } catch {
    // Continue without user
    next();
  }
};

/**
 * Role-based authorization
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    
    next();
  };
};

/**
 * Plan-based authorization
 */
const requirePlan = (...plans) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    
    if (!plans.includes(req.user.plan)) {
      return next(ApiError.forbidden(`This feature requires ${plans.join(' or ')} plan`));
    }
    
    next();
  };
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePlan,
  generateToken
};
