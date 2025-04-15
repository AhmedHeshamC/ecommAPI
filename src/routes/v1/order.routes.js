const express = require('express');
const orderController = require('../../controllers/order.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// Protect all order routes
router.use(protect);

// User routes
router
  .route('/')
  .post(orderController.createOrder)
  .get(orderController.getUserOrders);

router.get('/:id', orderController.getOrder);

// Admin routes
router.get('/admin/all', authorize('admin'), orderController.getAllOrders);
router.patch('/:id/status', authorize('admin'), orderController.updateOrderStatus);

module.exports = router;
