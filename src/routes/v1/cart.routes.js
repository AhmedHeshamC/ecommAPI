const express = require('express');
const cartController = require('../../controllers/cart.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

// Protect all cart routes
router.use(protect);

router
  .route('/')
  .get(cartController.getCart)
  .post(cartController.addItem)
  .delete(cartController.clearCart);

router
  .route('/:itemId')
  .patch(cartController.updateItemQuantity)
  .delete(cartController.removeItem);

module.exports = router;
