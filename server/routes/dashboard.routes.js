const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/search', dashboardController.searchGlobal);
router.get('/stock-by-warehouse', dashboardController.getStockByWarehouse);

module.exports = router;
