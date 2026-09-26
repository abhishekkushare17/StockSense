const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(transferController.getTransfers)
  .post(protect, transferController.createTransfer);

router.route('/:id')
  .get(transferController.getTransferById);

router.patch('/:id/validate', protect, transferController.validateTransfer);

module.exports = router;
