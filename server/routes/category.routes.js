const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(categoryController.getCategories)
  .post(protect, categoryController.createCategory);

router.route('/:id')
  .get(categoryController.getCategoryById)
  .put(protect, categoryController.updateCategory)
  .delete(protect, categoryController.deleteCategory);

module.exports = router;
