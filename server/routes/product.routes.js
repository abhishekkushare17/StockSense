const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateCreateProduct } = require('../middleware/validate.middleware');

router.route('/')
  .get(productController.getProducts)
  .post(protect, validateCreateProduct, productController.createProduct);

router.route('/:id')
  .get(productController.getProductById)
  .put(protect, productController.updateProduct)
  .delete(protect, productController.deleteProduct);

module.exports = router;
