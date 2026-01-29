/**
 * StackAudit.ai - Authentication Service
 * JWT authentication, password hashing, session management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Configuration
const config = {
  jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  saltRounds: 12,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

// In-memory session store (replace with Redis in production)
const sessions = new Map();
const refreshTokens = new Map();
const loginAttempts = new Map();

/**
 * Password Hashing
 */
const password = {
  /**
   * Hash a password using bcrypt
   * @param {string} plainPassword - The plain text password
   * @returns {Promise<string>} - The hashed password
   */
  async hash(plainPassword) {
    if (!plainPassword || plainPassword.length < 8) {
      throw new AuthError('Password must be at least 8 characters', 'WEAK_PASSWORD');
    }
    return bcrypt.hash(plainPassword, config.saltRounds);
  },

  /**
   * Verify a password against a hash
   * @param {string} plainPassword - The plain text password
   * @param {string} hashedPassword - The stored hash
   * @returns {Promise<boolean>} - True if password matches
   */
  async verify(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) {
      return false;
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Check password strength
   * @param {string} pwd - Password to check
   * @returns {Object} - Strength assessment
   */
  checkStrength(pwd) {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const strength = score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong';
    
    return { checks, score, strength, isValid: score >= 3 };
  },
};

/**
 * JWT Token Management
 */
const tokens = {
  /**
   * Generate an access token
   * @param {Object} user - User object with id, email, role
   * @returns {string} - JWT access token
   */
  generateAccessToken(user) {
    if (!user?.id || !user?.email) {
      throw new AuthError('Invalid user data for token generation', 'INVALID_USER');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
      plan: user.plan || 'free',
      type: 'access',
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiry,
      issuer: 'stackaudit.ai',
      audience: 'stackaudit-api',
    });
  },

  /**
   * Generate a refresh token
   * @param {Object} user - User object
   * @returns {Object} - Refresh token and expiry
   */
  generateRefreshToken(user) {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    refreshTokens.set(token, {
      userId: user.id,
      email: user.email,
      expiresAt,
      createdAt: new Date(),
    });

    return { token, expiresAt };
  },

  /**
   * Verify an access token
   * @param {string} token - JWT token to verify
   * @returns {Object} - Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret, {
        issuer: 'stackaudit.ai',
        audience: 'stackaudit-api',
      });

      if (decoded.type !== 'access') {
        throw new AuthError('Invalid token type', 'INVALID_TOKEN_TYPE');
      }

      return decoded;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      
      if (error.name === 'TokenExpiredError') {
        throw new AuthError('Token has expired', 'TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AuthError('Invalid token', 'INVALID_TOKEN');
      }
      throw new AuthError('Token verification failed', 'TOKEN_VERIFICATION_FAILED');
    }
  },

  /**
   * Verify and consume a refresh token
   * @param {string} token - Refresh token
   * @returns {Object} - Token data if valid
   */
  verifyRefreshToken(token) {
    const data = refreshTokens.get(token);
    
    if (!data) {
      throw new AuthError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    if (new Date() > data.expiresAt) {
      refreshTokens.delete(token);
      throw new AuthError('Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
    }

    return data;
  },

  /**
   * Revoke a refresh token
   * @param {string} token - Token to revoke
   */
  revokeRefreshToken(token) {
    refreshTokens.delete(token);
  },

  /**
   * Revoke all refresh tokens for a user
   * @param {string} userId - User ID
   */
  revokeAllUserTokens(userId) {
    for (const [token, data] of refreshTokens) {
      if (data.userId === userId) {
        refreshTokens.delete(token);
      }
    }
  },
};

/**
 * Session Management
 */
const session = {
  /**
   * Create a new session
   * @param {Object} user - User object
   * @param {Object} metadata - Session metadata (IP, user agent, etc.)
   * @returns {Object} - Session data with tokens
   */
  create(user, metadata = {}) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const accessToken = tokens.generateAccessToken(user);
    const refreshToken = tokens.generateRefreshToken(user);

    const sessionData = {
      sessionId,
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      ip: metadata.ip || null,
      userAgent: metadata.userAgent || null,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: refreshToken.expiresAt,
    };

    sessions.set(sessionId, sessionData);

    // Clear any login attempt records on successful login
    loginAttempts.delete(user.email);

    return {
      sessionId,
      accessToken,
      refreshToken: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
    };
  },

  /**
   * Get session by ID
   * @param {string} sessionId - Session ID
   * @returns {Object|null} - Session data
   */
  get(sessionId) {
    const data = sessions.get(sessionId);
    if (!data) return null;

    if (new Date() > data.expiresAt) {
      sessions.delete(sessionId);
      return null;
    }

    return data;
  },

  /**
   * Update session activity
   * @param {string} sessionId - Session ID
   */
  touch(sessionId) {
    const data = sessions.get(sessionId);
    if (data) {
      data.lastActivity = new Date();
      sessions.set(sessionId, data);
    }
  },

  /**
   * Destroy a session
   * @param {string} sessionId - Session ID
   */
  destroy(sessionId) {
    sessions.delete(sessionId);
  },

  /**
   * Get all sessions for a user
   * @param {string} userId - User ID
   * @returns {Array} - Array of sessions
   */
  getUserSessions(userId) {
    const userSessions = [];
    for (const [id, data] of sessions) {
      if (data.userId === userId) {
        userSessions.push({ ...data, sessionId: id });
      }
    }
    return userSessions;
  },

  /**
   * Destroy all sessions for a user
   * @param {string} userId - User ID
   */
  destroyAllUserSessions(userId) {
    for (const [id, data] of sessions) {
      if (data.userId === userId) {
        sessions.delete(id);
      }
    }
    tokens.revokeAllUserTokens(userId);
  },
};

/**
 * Rate Limiting / Brute Force Protection
 */
const rateLimit = {
  /**
   * Record a login attempt
   * @param {string} identifier - Email or IP
   * @returns {Object} - Attempt status
   */
  recordAttempt(identifier) {
    const now = Date.now();
    let attempts = loginAttempts.get(identifier) || { count: 0, firstAttempt: now, lockedUntil: null };

    // Check if lockout has expired
    if (attempts.lockedUntil && now > attempts.lockedUntil) {
      attempts = { count: 0, firstAttempt: now, lockedUntil: null };
    }

    // Check if locked
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      const remainingMs = attempts.lockedUntil - now;
      throw new AuthError(
        `Account locked. Try again in ${Math.ceil(remainingMs / 60000)} minutes`,
        'ACCOUNT_LOCKED',
        { retryAfter: attempts.lockedUntil }
      );
    }

    attempts.count++;

    // Lock if max attempts exceeded
    if (attempts.count >= config.maxLoginAttempts) {
      attempts.lockedUntil = now + config.lockoutDuration;
      loginAttempts.set(identifier, attempts);
      throw new AuthError(
        'Too many login attempts. Account locked for 15 minutes',
        'ACCOUNT_LOCKED',
        { retryAfter: attempts.lockedUntil }
      );
    }

    loginAttempts.set(identifier, attempts);

    return {
      attemptsRemaining: config.maxLoginAttempts - attempts.count,
      isLocked: false,
    };
  },

  /**
   * Clear attempts for an identifier
   * @param {string} identifier - Email or IP
   */
  clearAttempts(identifier) {
    loginAttempts.delete(identifier);
  },

  /**
   * Check if identifier is locked
   * @param {string} identifier - Email or IP
   * @returns {boolean}
   */
  isLocked(identifier) {
    const attempts = loginAttempts.get(identifier);
    if (!attempts?.lockedUntil) return false;
    return Date.now() < attempts.lockedUntil;
  },
};

/**
 * Authentication Middleware Factory
 */
const middleware = {
  /**
   * Require authentication middleware
   * @param {Object} options - Options
   * @returns {Function} - Express middleware
   */
  requireAuth(options = {}) {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith('Bearer ')) {
          throw new AuthError('No token provided', 'NO_TOKEN');
        }

        const token = authHeader.slice(7);
        const decoded = tokens.verifyAccessToken(token);

        // Update session activity if session exists
        if (req.headers['x-session-id']) {
          session.touch(req.headers['x-session-id']);
        }

        req.user = decoded;
        req.userId = decoded.userId;

        next();
      } catch (error) {
        if (error instanceof AuthError) {
          return res.status(401).json({
            error: error.message,
            code: error.code,
          });
        }
        return res.status(401).json({
          error: 'Authentication failed',
          code: 'AUTH_FAILED',
        });
      }
    };
  },

  /**
   * Require specific role middleware
   * @param {string|string[]} roles - Required role(s)
   * @returns {Function} - Express middleware
   */
  requireRole(roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'NO_AUTH',
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
        });
      }

      next();
    };
  },

  /**
   * Require specific plan middleware
   * @param {string|string[]} plans - Required plan(s)
   * @returns {Function} - Express middleware
   */
  requirePlan(plans) {
    const allowedPlans = Array.isArray(plans) ? plans : [plans];
    
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'NO_AUTH',
        });
      }

      if (!allowedPlans.includes(req.user.plan)) {
        return res.status(403).json({
          error: 'Plan upgrade required',
          code: 'PLAN_REQUIRED',
          requiredPlans: allowedPlans,
        });
      }

      next();
    };
  },

  /**
   * Optional authentication middleware
   * Attaches user if token is valid, continues if not
   * @returns {Function} - Express middleware
   */
  optionalAuth() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          const decoded = tokens.verifyAccessToken(token);
          req.user = decoded;
          req.userId = decoded.userId;
        }
      } catch (error) {
        // Ignore errors for optional auth
      }
      next();
    };
  },
};

/**
 * Password Reset / Email Verification
 */
const verification = {
  tokens: new Map(),

  /**
   * Generate a password reset token
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @returns {string} - Reset token
   */
  generatePasswordResetToken(userId, email) {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    
    this.tokens.set(hash, {
      userId,
      email,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      createdAt: new Date(),
    });

    return token;
  },

  /**
   * Generate an email verification token
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @returns {string} - Verification token
   */
  generateEmailVerificationToken(userId, email) {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    
    this.tokens.set(hash, {
      userId,
      email,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    });

    return token;
  },

  /**
   * Verify and consume a token
   * @param {string} token - The token to verify
   * @param {string} type - Expected token type
   * @returns {Object} - Token data
   */
  verifyToken(token, type) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const data = this.tokens.get(hash);

    if (!data) {
      throw new AuthError('Invalid or expired token', 'INVALID_TOKEN');
    }

    if (data.type !== type) {
      throw new AuthError('Invalid token type', 'INVALID_TOKEN_TYPE');
    }

    if (new Date() > data.expiresAt) {
      this.tokens.delete(hash);
      throw new AuthError('Token has expired', 'TOKEN_EXPIRED');
    }

    // Consume the token
    this.tokens.delete(hash);

    return data;
  },
};

/**
 * Custom Auth Error
 */
class AuthError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
    this.statusCode = this.getStatusCode(code);
  }

  getStatusCode(code) {
    const statusCodes = {
      'NO_TOKEN': 401,
      'INVALID_TOKEN': 401,
      'TOKEN_EXPIRED': 401,
      'INVALID_REFRESH_TOKEN': 401,
      'REFRESH_TOKEN_EXPIRED': 401,
      'INVALID_CREDENTIALS': 401,
      'ACCOUNT_LOCKED': 429,
      'WEAK_PASSWORD': 400,
      'INVALID_USER': 400,
      'FORBIDDEN': 403,
      'PLAN_REQUIRED': 403,
    };
    return statusCodes[code] || 500;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...this.details,
    };
  }
}

/**
 * Utility functions
 */
const utils = {
  /**
   * Extract token from request
   * @param {Object} req - Express request
   * @returns {string|null} - Token or null
   */
  extractToken(req) {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // Check cookie
    if (req.cookies?.access_token) {
      return req.cookies.access_token;
    }

    // Check query param (for WebSocket connections)
    if (req.query?.token) {
      return req.query.token;
    }

    return null;
  },

  /**
   * Generate a secure random string
   * @param {number} length - String length
   * @returns {string}
   */
  generateSecureString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Hash sensitive data (for logging/comparison)
   * @param {string} data - Data to hash
   * @returns {string}
   */
  hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  },
};

// Cleanup expired data periodically
setInterval(() => {
  const now = new Date();
  
  // Clean expired sessions
  for (const [id, data] of sessions) {
    if (now > data.expiresAt) {
      sessions.delete(id);
    }
  }

  // Clean expired refresh tokens
  for (const [token, data] of refreshTokens) {
    if (now > data.expiresAt) {
      refreshTokens.delete(token);
    }
  }

  // Clean expired verification tokens
  for (const [hash, data] of verification.tokens) {
    if (now > data.expiresAt) {
      verification.tokens.delete(hash);
    }
  }

  // Clean old login attempts (older than 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, data] of loginAttempts) {
    if (data.firstAttempt < oneHourAgo && !data.lockedUntil) {
      loginAttempts.delete(id);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

module.exports = {
  password,
  tokens,
  session,
  rateLimit,
  middleware,
  verification,
  utils,
  AuthError,
  config,
};
