const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const db = require('../config/db');
const { ApiError } = require('../utils/error.util');

/**
 * Admin Controller - Handles all admin-specific operations
 */
class AdminController {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      const users = await User.getAll(limit, offset);
      
      res.status(200).json({
        success: true,
        count: users.length,
        pagination: {
          page,
          limit
        },
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      
      if (!user) {
        return next(new ApiError('User not found', 404));
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      // Validate role
      if (!['user', 'admin'].includes(role)) {
        return next(new ApiError('Invalid role', 400));
      }
      
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }
      
      // Update role
      await db.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, id]
      );
      
      const updatedUser = await User.findById(id);
      
      res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard statistics (admin only)
   */
  async getDashboardStats(req, res, next) {
    try {
      // Get total users
      const [userResult] = await db.execute('SELECT COUNT(*) as count FROM users');
      const totalUsers = userResult[0].count;
      
      // Get total products
      const [productResult] = await db.execute('SELECT COUNT(*) as count FROM products');
      const totalProducts = productResult[0].count;
      
      // Get total orders
      const [orderResult] = await db.execute('SELECT COUNT(*) as count FROM orders');
      const totalOrders = orderResult[0].count;
      
      // Get total sales
      const [salesResult] = await db.execute('SELECT SUM(total) as totalSales FROM orders WHERE status != "cancelled"');
      const totalSales = salesResult[0].totalSales || 0;
      
      // Get low inventory products
      const [lowInventoryResult] = await db.execute(
        'SELECT COUNT(*) as count FROM products WHERE inventory < 10'
      );
      const lowInventory = lowInventoryResult[0].count;
      
      // Get recent orders
      const [recentOrders] = await db.execute(
        'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
      );
      
      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalSales,
          lowInventory,
          recentOrders
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales report (admin only)
   */
  async getSalesReport(req, res, next) {
    try {
      const { period = 'monthly', startDate, endDate } = req.query;
      
      let query = '';
      let dateFormat = '';
      
      // Configure query based on period
      switch(period) {
        case 'daily':
          dateFormat = '%Y-%m-%d';
          break;
        case 'weekly':
          dateFormat = '%Y-%u'; // Year-week number
          break;
        case 'monthly':
          dateFormat = '%Y-%m';
          break;
        case 'yearly':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m';
      }
      
      // Build date filter
      const dateFilter = [];
      const params = [];
      
      if (startDate) {
        dateFilter.push('created_at >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        dateFilter.push('created_at <= ?');
        params.push(endDate);
      }
      
      const dateFilterClause = dateFilter.length > 0 ? 
        `WHERE ${dateFilter.join(' AND ')}` : '';
      
      // Query for sales by period
      query = `
        SELECT 
          DATE_FORMAT(created_at, '${dateFormat}') as period,
          COUNT(*) as orderCount,
          SUM(total) as totalSales
        FROM orders
        ${dateFilterClause}
        GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
        ORDER BY period ASC
      `;
      
      const [salesData] = await db.execute(query, params);
      
      // Query for top selling products
      const [topProducts] = await db.execute(`
        SELECT 
          p.id, p.name, p.category,
          SUM(oi.quantity) as totalQuantity,
          SUM(oi.price * oi.quantity) as totalSales
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        ${dateFilterClause}
        GROUP BY p.id
        ORDER BY totalQuantity DESC
        LIMIT 10
      `, params);
      
      res.status(200).json({
        success: true,
        data: {
          salesByPeriod: salesData,
          topProducts
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
