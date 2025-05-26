const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/trending', (req, res, next) => {
  console.log('Accessing trending products route');
  productController.getTrendingProducts(req, res, next);
});

router.get('/flash-deals', (req, res, next) => {
  console.log('Accessing flash deals route');
  productController.getFlashDeals(req, res, next);
});

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected vendor routes
router.use(protect);
router.post('/', productController.addProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
