const express = require('express');
const router = express.Router();
const adjustmentController = require('../controllers/adjustment.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(adjustmentController.getAdjustments)
  .post(protect, adjustmentController.createAdjustment);

router.route('/:id')
  .get(adjustmentController.getAdjustmentById)
  .put(protect, adjustmentController.updateAdjustment);

router.patch('/:id/validate', protect, adjustmentController.validateAdjustment);

module.exports = router;
