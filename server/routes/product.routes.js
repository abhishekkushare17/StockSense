const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');

// Public or Protected - enable optional protect if token present, or enforce protect
// Enforce protect for write operations; allow read operations
router.route('/')
  .get(productController.getProducts)
  .post(protect, productController.createProduct);

router.route('/:id')
  .get(productController.getProductById)
  .put(protect, productController.updateProduct)
  .delete(protect, productController.deleteProduct);

module.exports = router;
