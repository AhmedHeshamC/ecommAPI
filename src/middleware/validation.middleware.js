const Validation = require('../utils/validation.util');
const { ApiError } = require('../utils/error.util');

/**
 * Validation middleware factory - creates middleware for different validation types
 */
class ValidationMiddleware {
  /**
   * Validate user registration
   */
  static validateUser(req, res, next) {
    try {
      Validation.validateUserRegistration(req.body);
      // Sanitize input
      req.body = Validation.sanitizeInput(req.body);
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate product creation
   */
  static validateNewProduct(req, res, next) {
    try {
      Validation.validateProduct(req.body);
      // Sanitize input
      req.body = Validation.sanitizeInput(req.body);
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate product update
   */
  static validateProductUpdate(req, res, next) {
    try {
      Validation.validateProduct(req.body, true);
      // Sanitize input
      req.body = Validation.sanitizeInput(req.body);
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate cart item
   */
  static validateCartItem(req, res, next) {
    try {
      Validation.validateCartItem(req.body);
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generic ID parameter validator
   */
  static validateIdParam(req, res, next) {
    const id = req.params.id;
    
    if (!id || !(/^\d+$/.test(id))) {
      return next(new ApiError('Invalid ID parameter', 400));
    }
    
    next();
  }
}

module.exports = ValidationMiddleware;
