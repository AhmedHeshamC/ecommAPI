const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ApiError } = require('../utils/error.util');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Generate refresh token
const generateRefreshToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
};

// Set tokens in cookies
const sendTokenResponse = (user, statusCode, res) => {
  // Create access token
  const token = generateToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);
  
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };
  
  res
    .status(statusCode)
    .cookie('token', token, {
      ...options,
      maxAge: 60 * 60 * 1000 // 1 hour
    })
    .cookie('refreshToken', refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

// Register user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new ApiError('Email already in use', 400));
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password are provided
    if (!email || !password) {
      return next(new ApiError('Please provide an email and password', 400));
    }
    
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return next(new ApiError('Invalid credentials', 401));
    }
    
    // Check if password matches
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }
    
    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });
  
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user details
exports.updateDetails = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return next(new ApiError('Email already in use', 400));
      }
    }
    
    // Update user
    await db.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, req.user.id]
    );
    
    const updatedUser = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );
    
    const user = users[0];
    
    // Check if current password matches
    const isMatch = await User.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return next(new ApiError('Current password is incorrect', 401));
    }
    
    // Update password
    await User.updatePassword(req.user.id, newPassword);
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
