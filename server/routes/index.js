const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StockSense API is active and healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

// Authentication and User Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Product Routes
const productRoutes = require('./product.routes');
router.use('/products', productRoutes);

// Category Routes
const categoryRoutes = require('./category.routes');
router.use('/categories', categoryRoutes);

// Warehouse Routes
const warehouseRoutes = require('./warehouse.routes');
router.use('/warehouses', warehouseRoutes);

// Stock Routes
const stockRoutes = require('./stock.routes');
router.use('/stock', stockRoutes);

// Receipt Routes
const receiptRoutes = require('./receipt.routes');
router.use('/receipts', receiptRoutes);

// Delivery Routes
const deliveryRoutes = require('./delivery.routes');
router.use('/deliveries', deliveryRoutes);

// Internal Transfer Routes
const transferRoutes = require('./transfer.routes');
router.use('/transfers', transferRoutes);

// Stock Adjustment Routes
const adjustmentRoutes = require('./adjustment.routes');
router.use('/adjustments', adjustmentRoutes);

module.exports = router;
