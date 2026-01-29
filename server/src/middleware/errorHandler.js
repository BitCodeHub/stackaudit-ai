const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle known API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details
    });
  }

  // Handle validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.array()
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Handle Stripe errors
  if (err.type === 'StripeCardError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.type === 'StripeInvalidRequestError') {
    return res.status(400).json({ error: 'Invalid payment request' });
  }

  // Default to 500
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
