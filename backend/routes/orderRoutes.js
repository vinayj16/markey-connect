const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, isCustomer, isVendor } = require('../middleware/auth');

// Customer order routes
router.post('/', authenticateToken, isCustomer, orderController.createOrder);
router.post('/in-store', authenticateToken, isCustomer, orderController.createInStoreOrder);
router.get('/customer', authenticateToken, isCustomer, orderController.getCustomerOrders);
router.get('/customer/:orderId', authenticateToken, isCustomer, orderController.getOrderById);

// Vendor order routes
router.get('/vendor', authenticateToken, isVendor, orderController.getVendorOrders);
router.put('/:orderId/status', authenticateToken, isVendor, orderController.updateOrderStatus);

module.exports = router;
