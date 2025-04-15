const express = require('express');
const { register, login, logout, getMe, updateDetails, updatePassword } = require('../../controllers/auth.controller');
const { protect, refreshToken } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/refreshtoken', refreshToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
