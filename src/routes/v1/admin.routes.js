const express = require('express');
const adminController = require('../../controllers/admin.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// All admin routes require auth and admin role
router.use(protect, authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/sales-report', adminController.getSalesReport);

module.exports = router;
