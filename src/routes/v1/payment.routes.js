const express = require('express');
const paymentController = require('../../controllers/payment.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

// User payment routes
router.post('/create-intent', protect, paymentController.createPaymentIntent);
router.post('/confirm', protect, paymentController.confirmPayment);
router.get('/receipt/:orderId', protect, paymentController.generateReceipt);

// Stripe webhook route - no auth middleware
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
