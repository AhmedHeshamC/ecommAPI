const db = require('../config/db');

class Cart {
  static async getOrCreateCart(userId) {
    try {
      // Check if user already has a cart
      let [carts] = await db.execute(
        'SELECT * FROM carts WHERE user_id = ?',
        [userId]
      );
      
      let cartId;
      
      // If no cart exists, create one
      if (carts.length === 0) {
        const [result] = await db.execute(
          'INSERT INTO carts (user_id) VALUES (?)',
          [userId]
        );
        cartId = result.insertId;
      } else {
        cartId = carts[0].id;
      }
      
      return cartId;
    } catch (error) {
      throw new Error(`Error getting or creating cart: ${error.message}`);
    }
  }

  static async getCartItems(userId) {
    try {
      // Get cart items with product details
      const [items] = await db.execute(`
        SELECT c.id AS cart_id, ci.id, ci.product_id, ci.quantity, 
               p.name, p.description, p.price, p.category
        FROM carts c
        JOIN cart_items ci ON c.id = ci.cart_id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = ?
      `, [userId]);
      
      return items;
    } catch (error) {
      throw new Error(`Error getting cart items: ${error.message}`);
    }
  }

  static async addItem(userId, productId, quantity) {
    try {
      // Get or create cart
      const cartId = await this.getOrCreateCart(userId);
      
      // Check if item already exists in cart
      const [existingItems] = await db.execute(
        'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [cartId, productId]
      );
      
      if (existingItems.length > 0) {
        // Update quantity if item exists
        await db.execute(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
          [quantity, existingItems[0].id]
        );
      } else {
        // Add new item
        await db.execute(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
          [cartId, productId, quantity]
        );
      }
      
      return await this.getCartItems(userId);
    } catch (error) {
      throw new Error(`Error adding item to cart: ${error.message}`);
    }
  }

  static async updateItemQuantity(userId, itemId, quantity) {
    try {
      // Verify the item belongs to the user's cart
      const [items] = await db.execute(`
        SELECT ci.id
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE ci.id = ? AND c.user_id = ?
      `, [itemId, userId]);
      
      if (items.length === 0) {
        throw new Error('Item not found in user cart');
      }
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        await db.execute(
          'DELETE FROM cart_items WHERE id = ?',
          [itemId]
        );
      } else {
        // Update quantity
        await db.execute(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [quantity, itemId]
        );
      }
      
      return await this.getCartItems(userId);
    } catch (error) {
      throw new Error(`Error updating cart item quantity: ${error.message}`);
    }
  }

  static async removeItem(userId, itemId) {
    try {
      // Verify the item belongs to the user's cart
      const [items] = await db.execute(`
        SELECT ci.id
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE ci.id = ? AND c.user_id = ?
      `, [itemId, userId]);
      
      if (items.length === 0) {
        throw new Error('Item not found in user cart');
      }
      
      // Remove item
      await db.execute(
        'DELETE FROM cart_items WHERE id = ?',
        [itemId]
      );
      
      return await this.getCartItems(userId);
    } catch (error) {
      throw new Error(`Error removing item from cart: ${error.message}`);
    }
  }

  static async clearCart(userId) {
    try {
      // Get the cart ID
      const [carts] = await db.execute(
        'SELECT id FROM carts WHERE user_id = ?',
        [userId]
      );
      
      if (carts.length > 0) {
        // Remove all items from cart
        await db.execute(
          'DELETE FROM cart_items WHERE cart_id = ?',
          [carts[0].id]
        );
      }
      
      return true;
    } catch (error) {
      throw new Error(`Error clearing cart: ${error.message}`);
    }
  }

  static async getCartTotal(userId) {
    try {
      // Calculate total
      const [result] = await db.execute(`
        SELECT SUM(p.price * ci.quantity) as total
        FROM carts c
        JOIN cart_items ci ON c.id = ci.cart_id
        JOIN products p ON ci.product_id = p.id
        WHERE c.user_id = ?
      `, [userId]);
      
      return result[0].total || 0;
    } catch (error) {
      throw new Error(`Error calculating cart total: ${error.message}`);
    }
  }
}

module.exports = Cart;
