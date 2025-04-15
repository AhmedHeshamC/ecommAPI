const logger = require('../utils/logger.util');

/**
 * Middleware to log security-relevant operations for audit purposes
 */
const auditLog = (req, res, next) => {
  // Skip logging for non-security-relevant endpoints
  if (req.path === '/health' || req.path.startsWith('/api/v1/products') && req.method === 'GET') {
    return next();
  }
  
  // Log user actions that modify data or access secure resources
  const auditData = {
    endpoint: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user ? req.user.id : 'unauthenticated',
    userRole: req.user ? req.user.role : 'none',
    timestamp: new Date().toISOString()
  };
  
  // Log body data for actions that modify data (but remove sensitive info)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive information
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.creditCard) sanitizedBody.creditCard = '[REDACTED]';
    
    auditData.requestData = sanitizedBody;
  }
  
  logger.security('API Request', auditData);
  
  // Capture response data for audit log
  const originalSend = res.send;
  res.send = function(body) {
    res.send = originalSend;
    
    // Log responses for security-relevant endpoints
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      // Try to parse JSON response
      let responseData;
      try {
        responseData = JSON.parse(body);
        // Remove sensitive data from response
        if (responseData.token) responseData.token = '[REDACTED]';
        if (responseData.user && responseData.user.password) {
          responseData.user.password = '[REDACTED]';
        }
        
        logger.security('API Response', {
          endpoint: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          userId: req.user ? req.user.id : 'unauthenticated',
          responseData
        });
      } catch (e) {
        // If not JSON, just log status code
        logger.security('API Response', {
          endpoint: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          userId: req.user ? req.user.id : 'unauthenticated'
        });
      }
    }
    
    return res.send(body);
  };
  
  next();
};

module.exports = auditLog;
