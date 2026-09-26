const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(deliveryController.getDeliveries)
  .post(protect, deliveryController.createDelivery);

router.route('/:id')
  .get(deliveryController.getDeliveryById)
  .put(protect, deliveryController.updateDelivery);

router.patch('/:id/validate', protect, deliveryController.validateDelivery);

module.exports = router;
