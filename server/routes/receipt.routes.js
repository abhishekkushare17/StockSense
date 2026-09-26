const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(receiptController.getReceipts)
  .post(protect, receiptController.createReceipt);

router.route('/:id')
  .get(receiptController.getReceiptById)
  .put(protect, receiptController.updateReceipt);

router.patch('/:id/validate', protect, receiptController.validateReceipt);

module.exports = router;
