const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken, isCustomer } = require('../middleware/auth');

// All cart routes require customer authentication
router.use(authenticateToken);
router.use(isCustomer);

// Cart routes
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/:cartItemId', cartController.updateCartItem);
router.delete('/:cartItemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
