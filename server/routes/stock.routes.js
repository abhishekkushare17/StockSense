const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { protect } = require('../middleware/auth.middleware');

// Low-stock report endpoint
router.get('/low-stock', stockController.getLowStockReport);

// Query stock records with search and filters
router.get('/', stockController.getAllStock);

// Stock by product
router.get('/product/:productId', stockController.getStockByProduct);

// Stock by warehouse
router.get('/warehouse/:warehouseId', stockController.getStockByWarehouse);

module.exports = router;
