const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken, isVendor } = require('../middleware/auth');

// Public routes
router.post('/signup', vendorController.registerVendor);
router.post('/login', vendorController.loginVendor);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, isVendor, vendorController.getVendorProfile);
router.put('/profile', authenticateToken, isVendor, vendorController.updateVendorProfile);
router.get('/id-card', authenticateToken, isVendor, vendorController.getVendorIdCard);

module.exports = router;
