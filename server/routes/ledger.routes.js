const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledger.controller');
const { protect } = require('../middleware/auth.middleware');

// Stock Ledger is an audit trail accessed by authenticated users
router.use(protect);

router.get('/', ledgerController.getLedgerEntries);
router.get('/product/:productId', ledgerController.getLedgerByProduct);
router.get('/:id', ledgerController.getLedgerById);

module.exports = router;
