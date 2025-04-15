const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const { ApiError } = require('../utils/error.util');

/**
 * Order Controller - Handles all order-related operations
 */
class OrderController {
  /**
   * Create a new order from the user's cart
   */
  async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { paymentIntentId } = req.body;
      
      // Check if cart has items
      const cartItems = await Cart.getCartItems(userId);
      if (cartItems.length === 0) {
        return next(new ApiError('Cannot create order with empty cart', 400));
      }
      
      // Create order
      const order = await Order.createFromCart(userId, paymentIntentId);
      
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const order = await Order.findById(id);
      
      // Check if order exists
      if (!order) {
        return next(new ApiError('Order not found', 404));
      }
      
      // Ensure user owns this order or is admin
      if (order.user_id !== userId && req.user.role !== 'admin') {
        return next(new ApiError('Not authorized to access this order', 403));
      }
      
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders for the current user
   */
  async getUserOrders(req, res, next) {
    try {
      const userId = req.user.id;
      
      const orders = await Order.getUserOrders(userId);
      
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Parse filters
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.fromDate) filters.fromDate = req.query.fromDate;
      if (req.query.toDate) filters.toDate = req.query.toDate;
      
      const orders = await Order.getAll(limit, offset, filters);
      
      res.status(200).json({
        success: true,
        count: orders.length,
        pagination: {
          page,
          limit
        },
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an order's status (admin only)
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return next(new ApiError('Invalid order status', 400));
      }
      
      const order = await Order.findById(id);
      
      // Check if order exists
      if (!order) {
        return next(new ApiError('Order not found', 404));
      }
      
      // Update status
      const updatedOrder = await Order.updateStatus(id, status);
      
      res.status(200).json({
        success: true,
        data: updatedOrder
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
