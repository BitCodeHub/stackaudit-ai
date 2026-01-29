const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validation middleware - checks express-validator results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const details = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    throw ApiError.badRequest('Validation failed', details);
  }
  
  next();
};

module.exports = validate;
