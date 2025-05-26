const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect, protectCustomerRoutes } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', customerController.registerCustomer);
router.post('/login', customerController.loginCustomer);
router.post('/social-auth', customerController.socialAuth);
router.post('/forgot-password', customerController.forgotPassword);
router.post('/reset-password', customerController.resetPassword);

// Protected routes (require authentication)
router.get('/profile', protect, protectCustomerRoutes, customerController.getCustomerProfile);
router.put('/profile', protect, protectCustomerRoutes, customerController.updateCustomerProfile);

module.exports = router;
