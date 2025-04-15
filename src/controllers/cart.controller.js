const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const { ApiError } = require('../utils/error.util');

/**
 * Cart Controller - Handles all cart-related operations
 */
class CartController {
  /**
   * Get the current user's shopping cart
   */
  async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      const cartItems = await Cart.getCartItems(userId);
      const total = await Cart.getCartTotal(userId);
      
      res.status(200).json({
        success: true,
        data: {
          items: cartItems,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a product to the user's cart
   */
  async addItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, quantity = 1 } = req.body;
      
      // Validate product exists
      const product = await Product.findById(productId);
      if (!product) {
        return next(new ApiError('Product not found', 404));
      }
      
      // Validate quantity
      if (quantity <= 0) {
        return next(new ApiError('Quantity must be greater than 0', 400));
      }
      
      // Check inventory
      if (product.inventory < quantity) {
        return next(new ApiError('Not enough inventory available', 400));
      }
      
      // Add to cart
      const updatedCart = await Cart.addItem(userId, productId, quantity);
      const total = await Cart.getCartTotal(userId);
      
      res.status(200).json({
        success: true,
        data: {
          items: updatedCart,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update the quantity of a cart item
   */
  async updateItemQuantity(req, res, next) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      const { quantity } = req.body;
      
      // Validate quantity
      if (quantity < 0) {
        return next(new ApiError('Quantity cannot be negative', 400));
      }
      
      // Update cart
      const updatedCart = await Cart.updateItemQuantity(userId, itemId, quantity);
      const total = await Cart.getCartTotal(userId);
      
      res.status(200).json({
        success: true,
        data: {
          items: updatedCart,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove an item from the cart
   */
  async removeItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      
      const updatedCart = await Cart.removeItem(userId, itemId);
      const total = await Cart.getCartTotal(userId);
      
      res.status(200).json({
        success: true,
        data: {
          items: updatedCart,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear all items from the cart
   */
  async clearCart(req, res, next) {
    try {
      const userId = req.user.id;
      
      await Cart.clearCart(userId);
      
      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        data: {
          items: [],
          total: 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
