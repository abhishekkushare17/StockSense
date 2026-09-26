const express = require('express');
const router = express.Router();
const intelligenceController = require('../controllers/intelligence.controller');
const { protect } = require('../middleware/auth.middleware');

// All intelligence endpoints require authentication
router.use(protect);

// 1. Daily Action Center
router.get('/daily-actions', intelligenceController.getDailyActions);

// 2. Stock Forecast
router.get('/stock-forecast', intelligenceController.getStockForecast);

// 3. Inventory Risk Radar
router.get('/risk-radar', intelligenceController.getRiskRadar);

// 4. Inventory Anomaly Detection & Review
router.get('/anomalies', intelligenceController.getAnomalies);
router.patch('/anomalies/:id/review', intelligenceController.reviewAnomaly);

// 5. What-If Inventory Simulator
router.post('/simulate', intelligenceController.simulateInventory);
router.post('/apply-simulation', intelligenceController.applySimulation);

// 6. Find My Stock (Smart Location Search)
router.get('/stock-location', intelligenceController.findStockLocations);

// 7. Explain This Stock Number
router.get('/stock-explanation/:productId', intelligenceController.explainStockNumber);

module.exports = router;
