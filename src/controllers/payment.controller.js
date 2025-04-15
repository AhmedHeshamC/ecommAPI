const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const { ApiError } = require('../utils/error.util');

/**
 * Payment Controller - Handles all payment-related operations
 */
class PaymentController {
  /**
   * Create a payment intent for checkout
   */
  async createPaymentIntent(req, res, next) {
    try {
      const userId = req.user.id;
      
      // Get cart total
      const total = await Cart.getCartTotal(userId);
      
      if (!total || total <= 0) {
        return next(new ApiError('Cannot create payment for empty cart', 400));
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId
        }
      });
      
      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: total
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment and create order
   */
  async confirmPayment(req, res, next) {
    try {
      const userId = req.user.id;
      const { paymentIntentId } = req.body;
      
      // Verify payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (!paymentIntent) {
        return next(new ApiError('Payment intent not found', 404));
      }
      
      // Check payment status
      if (paymentIntent.status !== 'succeeded') {
        return next(new ApiError('Payment has not been completed', 400));
      }
      
      // Create order from cart
      const order = await Order.createFromCart(userId, paymentIntentId);
      
      res.status(201).json({
        success: true,
        message: 'Payment confirmed and order created',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(req, res, next) {
    try {
      const sig = req.headers['stripe-signature'];
      
      let event;
      
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        return next(new ApiError(`Webhook Error: ${err.message}`, 400));
      }
      
      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // Handle successful payment
          console.log('PaymentIntent succeeded:', paymentIntent.id);
          break;
          
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log('Payment failed:', failedPayment.id);
          // Update order status if it exists
          if (failedPayment.metadata && failedPayment.metadata.orderId) {
            await Order.updateStatus(failedPayment.metadata.orderId, 'cancelled');
          }
          break;
          
        // Add other event types as needed
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate a payment receipt for a completed order
   */
  async generateReceipt(req, res, next) {
    try {
      const { orderId } = req.params;
      
      const order = await Order.findById(orderId);
      
      if (!order) {
        return next(new ApiError('Order not found', 404));
      }
      
      // Ensure user owns this order or is admin
      if (order.user_id !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError('Not authorized to access this order', 403));
      }
      
      // Get payment details from Stripe if payment intent exists
      let paymentDetails = null;
      if (order.payment_intent_id) {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);
        if (paymentIntent) {
          paymentDetails = {
            id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            status: paymentIntent.status,
            paymentMethod: paymentIntent.payment_method_types[0],
            createdAt: new Date(paymentIntent.created * 1000).toISOString()
          };
        }
      }
      
      // Generate receipt data
      const receipt = {
        orderId: order.id,
        customerName: req.user.name,
        customerEmail: req.user.email,
        orderDate: order.created_at,
        orderStatus: order.status,
        orderTotal: order.total,
        orderItems: order.items,
        payment: paymentDetails
      };
      
      res.status(200).json({
        success: true,
        data: receipt
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
