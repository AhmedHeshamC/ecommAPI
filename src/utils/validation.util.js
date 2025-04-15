const validator = require('validator');
const { ApiError } = require('./error.util');

/**
 * Validation Utility for consistent input validation
 */
class Validation {
  /**
   * Validate user registration input
   */
  static validateUserRegistration(data) {
    const errors = [];
    
    // Name validation
    if (!data.name || !validator.isLength(data.name, { min: 2, max: 50 })) {
      errors.push('Name must be between 2 and 50 characters');
    }
    
    // Email validation
    if (!data.email || !validator.isEmail(data.email)) {
      errors.push('Please provide a valid email address');
    }
    
    // Password validation
    if (!data.password || !validator.isLength(data.password, { min: 6 })) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (errors.length > 0) {
      throw new ApiError(errors.join(', '), 400);
    }
    
    return true;
  }

  /**
   * Validate product input
   */
  static validateProduct(data, isUpdate = false) {
    const errors = [];
    
    // In update mode, we allow partial data
    if (!isUpdate) {
      // Required fields
      if (!data.name) errors.push('Product name is required');
      if (!data.price) errors.push('Product price is required');
    }
    
    // Validations for provided fields
    if (data.name && !validator.isLength(data.name, { min: 2, max: 100 })) {
      errors.push('Product name must be between 2 and 100 characters');
    }
    
    if (data.price && !validator.isFloat(String(data.price), { min: 0.01 })) {
      errors.push('Product price must be a positive number');
    }
    
    if (data.inventory && !validator.isInt(String(data.inventory), { min: 0 })) {
      errors.push('Inventory must be a non-negative integer');
    }
    
    if (errors.length > 0) {
      throw new ApiError(errors.join(', '), 400);
    }
    
    return true;
  }

  /**
   * Validate cart item input
   */
  static validateCartItem(data) {
    const errors = [];
    
    if (!data.productId) {
      errors.push('Product ID is required');
    }
    
    if (data.quantity && !validator.isInt(String(data.quantity), { min: 1 })) {
      errors.push('Quantity must be a positive integer');
    }
    
    if (errors.length > 0) {
      throw new ApiError(errors.join(', '), 400);
    }
    
    return true;
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(data) {
    const sanitized = {};
    
    for (const key in data) {
      if (typeof data[key] === 'string') {
        // Sanitize string inputs
        sanitized[key] = validator.escape(data[key]);
      } else {
        // Keep non-string values as is
        sanitized[key] = data[key];
      }
    }
    
    return sanitized;
  }
}

module.exports = Validation;
