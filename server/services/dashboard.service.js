const mongoose = require('mongoose');
const { Product, Stock, Receipt, Delivery, InternalTransfer } = require('../models');

/**
 * Dashboard Analytics and KPI Summary Service
 */

/**
 * Retrieve high-level operational KPIs for the inventory dashboard
 */
const getDashboardSummary = async (queryParams = {}) => {
  const { warehouse } = queryParams;

  const pendingFilter = {
    status: { $nin: ['Done', 'done', 'Canceled', 'canceled'] }
  };

  // Build warehouse filter if specific warehouse is provided
  const receiptFilter = { ...pendingFilter };
  const deliveryFilter = { ...pendingFilter };
  const transferFilter = { ...pendingFilter };

  if (warehouse && mongoose.Types.ObjectId.isValid(warehouse)) {
    receiptFilter.warehouse = warehouse;
    deliveryFilter.warehouse = warehouse;
    transferFilter.$or = [
      { sourceWarehouse: warehouse },
      { destinationWarehouse: warehouse }
    ];
  }

  // 1. Fetch total products, receipts, deliveries, and transfers in parallel
  const [
    totalProducts,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers,
    products,
    stockAggregation
  ] = await Promise.all([
    Product.countDocuments({ status: { $ne: 'archived' } }),
    Receipt.countDocuments(receiptFilter),
    Delivery.countDocuments(deliveryFilter),
    InternalTransfer.countDocuments(transferFilter),
    Product.find({ status: { $ne: 'archived' } }).select('_id reorderLevel').lean(),
    Stock.aggregate([
      ...(warehouse && mongoose.Types.ObjectId.isValid(warehouse)
        ? [{ $match: { warehouse: new mongoose.Types.ObjectId(warehouse) } }]
        : []),
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ])
  ]);

  // 2. Map stocks by product ID
  const stockMap = new Map();
  for (const s of stockAggregation) {
    stockMap.set(s._id.toString(), s.totalQuantity);
  }

  // 3. Compute low stock and out of stock counts
  let lowStockItems = 0;
  let outOfStockItems = 0;

  for (const prod of products) {
    const qty = stockMap.get(prod._id.toString()) || 0;
    const reorderLevel = prod.reorderLevel || 0;

    if (qty === 0) {
      outOfStockItems++;
    } else if (qty <= reorderLevel) {
      lowStockItems++;
    }
  }

  return {
    totalProducts,
    lowStockItems,
    outOfStockItems,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers
  };
};

module.exports = {
  getDashboardSummary
};
