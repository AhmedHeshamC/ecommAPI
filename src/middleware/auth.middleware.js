const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ApiError } = require('../utils/error.util');

// Protect routes - verify user is authenticated
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from authorization header or cookie
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return next(new ApiError('Not authorized to access this route', 401));
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return next(new ApiError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Authorize roles - restrict access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('Not authorized to perform this action', 403));
    }
    
    next();
  };
};

// Refresh token handler
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return next(new ApiError('Refresh token not found', 401));
    }
    
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }
      
      // Generate new access token
      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      // Set new token in cookie
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000 // 1 hour
      });
      
      req.user = user;
      next();
    } catch (error) {
      return next(new ApiError('Invalid refresh token', 401));
    }
  } catch (error) {
    next(error);
  }
};
