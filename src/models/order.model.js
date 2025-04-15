const db = require('../config/db');
const Cart = require('./cart.model');
const Product = require('./product.model');

class Order {
  static async createFromCart(userId, paymentIntentId) {
    try {
      // Start a transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        // Get cart items and total
        const cartItems = await Cart.getCartItems(userId);
        const total = await Cart.getCartTotal(userId);
        
        if (cartItems.length === 0) {
          throw new Error('Cannot create order from empty cart');
        }
        
        // Create order
        const [orderResult] = await connection.execute(
          'INSERT INTO orders (user_id, status, total, payment_intent_id) VALUES (?, ?, ?, ?)',
          [userId, 'pending', total, paymentIntentId]
        );
        
        const orderId = orderResult.insertId;
        
        // Create order items and update inventory
        for (const item of cartItems) {
          // Add item to order
          await connection.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.product_id, item.quantity, item.price]
          );
          
          // Update product inventory
          const success = await Product.updateInventory(item.product_id, item.quantity);
          if (!success) {
            throw new Error(`Insufficient inventory for product ${item.product_id}`);
          }
        }
        
        // Clear the user's cart
        await Cart.clearCart(userId);
        
        // Commit the transaction
        await connection.commit();
        
        // Return the created order
        return await this.findById(orderId);
      } catch (error) {
        // Rollback in case of error
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      // Get order details
      const [orders] = await db.execute(
        'SELECT * FROM orders WHERE id = ?',
        [id]
      );
      
      if (orders.length === 0) return null;
      
      // Get order items
      const [items] = await db.execute(`
        SELECT oi.*, p.name, p.description, p.category
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [id]);
      
      return {
        ...orders[0],
        items
      };
    } catch (error) {
      throw new Error(`Error finding order: ${error.message}`);
    }
  }

  static async getUserOrders(userId) {
    try {
      // Get all orders for user
      const [orders] = await db.execute(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      // Get items for each order
      const result = [];
      for (const order of orders) {
        const [items] = await db.execute(`
          SELECT oi.*, p.name, p.description
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id]);
        
        result.push({
          ...order,
          items
        });
      }
      
      return result;
    } catch (error) {
      throw new Error(`Error getting user orders: ${error.message}`);
    }
  }

  static async updateStatus(orderId, status) {
    try {
      await db.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );
      
      return await this.findById(orderId);
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  static async getAll(limit = 10, offset = 0, filters = {}) {
    try {
      let query = 'SELECT * FROM orders';
      const queryParams = [];
      
      // Apply filters if any
      if (Object.keys(filters).length > 0) {
        const filterClauses = [];
        
        if (filters.status) {
          filterClauses.push('status = ?');
          queryParams.push(filters.status);
        }
        
        if (filters.fromDate) {
          filterClauses.push('created_at >= ?');
          queryParams.push(filters.fromDate);
        }
        
        if (filters.toDate) {
          filterClauses.push('created_at <= ?');
          queryParams.push(filters.toDate);
        }
        
        if (filterClauses.length > 0) {
          query += ' WHERE ' + filterClauses.join(' AND ');
        }
      }
      
      // Add sorting and pagination
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(parseInt(limit), parseInt(offset));
      
      // Execute query
      const [orders] = await db.execute(query, queryParams);
      
      return orders;
    } catch (error) {
      throw new Error(`Error getting orders: ${error.message}`);
    }
  }
}

module.exports = Order;
