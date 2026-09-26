const mongoose = require('mongoose');
const { Product, Stock, Receipt, Delivery, InternalTransfer, Warehouse, Category, StockLedger } = require('../models');

/**
 * Dashboard Analytics, KPI Summary & Global Search Service
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

  // 2. Map stocks by product ID & calculate total stock units
  const stockMap = new Map();
  let totalStock = 0;
  for (const s of stockAggregation) {
    stockMap.set(s._id.toString(), s.totalQuantity);
    totalStock += s.totalQuantity || 0;
  }

  // 3. Compute low stock, out of stock, critical stock counts
  let lowStockItems = 0;
  let outOfStockItems = 0;
  let criticalItems = 0;

  for (const prod of products) {
    const qty = stockMap.get(prod._id.toString()) || 0;
    const reorderLevel = prod.reorderLevel || 10;

    if (qty === 0) {
      outOfStockItems++;
      criticalItems++;
    } else if (qty <= Math.ceil(reorderLevel * 0.4)) {
      criticalItems++;
      lowStockItems++;
    } else if (qty <= reorderLevel) {
      lowStockItems++;
    }
  }

  const healthyProducts = Math.max(0, totalProducts - lowStockItems - outOfStockItems);
  
  // Health score calculation
  let healthPercentage = 100;
  if (totalProducts > 0) {
    const rawScore = ((healthyProducts * 1.0) + (lowStockItems * 0.5) + (outOfStockItems * 0.0)) / totalProducts;
    healthPercentage = Math.max(0, Math.min(100, Math.round(rawScore * 100)));
  }

  const inventoryHealth = {
    score: healthPercentage,
    healthyCount: healthyProducts,
    lowStockCount: lowStockItems,
    criticalCount: criticalItems,
    outOfStockCount: outOfStockItems
  };

  return {
    totalProducts,
    totalStock,
    lowStockItems,
    outOfStockItems,
    criticalItems,
    healthyProducts,
    healthPercentage,
    inventoryHealth,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers
  };
};

/**
 * Smart Reorder Recommendation Engine (Rule-based, transparent algorithm)
 * Analyzes: Current Stock, Reorder Level, Recent Stock Usage & Movement velocity
 */
const getSmartReorderRecommendations = async (params = {}) => {
  const { warehouse } = params;

  // 1. Fetch active products with category
  const products = await Product.find({ status: { $ne: 'archived' } })
    .populate('category', 'name')
    .lean();

  // 2. Fetch stock levels aggregated by product
  const stockMatch = warehouse && mongoose.Types.ObjectId.isValid(warehouse)
    ? { warehouse: new mongoose.Types.ObjectId(warehouse) }
    : {};

  const stockAgg = await Stock.aggregate([
    { $match: stockMatch },
    {
      $group: {
        _id: '$product',
        totalStock: { $sum: '$quantity' }
      }
    }
  ]);

  const stockMap = new Map();
  stockAgg.forEach((s) => stockMap.set(s._id.toString(), s.totalStock));

  // 3. Query ledger entries in the past 14 days to determine consumption velocity
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const usageAgg = await StockLedger.aggregate([
    {
      $match: {
        timestamp: { $gte: fourteenDaysAgo },
        operationType: { $in: ['DELIVERY', 'ADJUSTMENT', 'TRANSFER_OUT'] }
      }
    },
    {
      $group: {
        _id: '$product',
        totalOutflow: { $sum: { $abs: '$quantityChange' } }
      }
    }
  ]);

  const usageMap = new Map();
  usageAgg.forEach((u) => usageMap.set(u._id.toString(), u.totalOutflow));

  // 4. Generate transparent rule-based recommendations
  const recommendations = [];

  for (const prod of products) {
    const currentStock = stockMap.get(prod._id.toString()) || 0;
    const reorderLevel = prod.reorderLevel || 10;
    const past14DaysUsage = usageMap.get(prod._id.toString()) || 0;
    
    // Average daily usage over 14 days (or conservative baseline based on reorderLevel)
    const measuredDailyUsage = Math.round((past14DaysUsage / 14) * 10) / 10;
    const dailyUsage = measuredDailyUsage > 0 ? measuredDailyUsage : Math.max(1, Math.round(reorderLevel / 7));

    // Recommend if stock is at/below reorder level OR estimated days of inventory < 7
    const daysOfInventoryLeft = dailyUsage > 0 ? Math.round(currentStock / dailyUsage) : 99;

    if (currentStock <= reorderLevel || daysOfInventoryLeft <= 7) {
      // Buffer calculation: replenish to cover 21 days of demand + safety buffer
      const targetStock = Math.ceil(dailyUsage * 21 + reorderLevel);
      const recommendedQuantity = Math.max(
        targetStock - currentStock,
        Math.max(reorderLevel * 2 - currentStock, 25)
      );

      let urgency = 'MEDIUM';
      let reason = `Current stock is below reorder level (${reorderLevel}) and average usage is ~${dailyUsage} ${prod.unitOfMeasure || 'units'}/day.`;

      if (currentStock === 0) {
        urgency = 'CRITICAL';
        reason = `CRITICAL: Product is completely out of stock with active fulfillment demand. Immediate order of ${recommendedQuantity} ${prod.unitOfMeasure || 'units'} required.`;
      } else if (currentStock <= Math.ceil(reorderLevel * 0.4)) {
        urgency = 'HIGH';
        reason = `URGENT: Stock buffer is severely depleted (only ${daysOfInventoryLeft} days of inventory remaining). Order ${recommendedQuantity} ${prod.unitOfMeasure || 'units'} now.`;
      }

      recommendations.push({
        productId: prod._id,
        productName: prod.name,
        sku: prod.sku,
        category: prod.category?.name || 'General',
        unitOfMeasure: prod.unitOfMeasure || 'units',
        currentStock,
        reorderLevel,
        averageUsage: `${dailyUsage}/day`,
        dailyUsage,
        daysOfInventoryLeft,
        recommendedQuantity,
        urgency,
        reason
      });
    }
  }

  // Sort by urgency: CRITICAL first, then HIGH, then MEDIUM
  const urgencyWeight = { CRITICAL: 3, HIGH: 2, MEDIUM: 1 };
  recommendations.sort((a, b) => (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0));

  return recommendations;
};

/**
 * Global Search across Products, SKU, Receipts, Deliveries, and Transfers
 */
const globalSearch = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return { products: [], receipts: [], deliveries: [], transfers: [] };
  }

  const term = searchTerm.trim();
  const regex = new RegExp(term, 'i');

  const [products, receipts, deliveries, transfers] = await Promise.all([
    Product.find({
      $or: [{ name: regex }, { sku: regex }, { description: regex }]
    })
      .select('name sku unitOfMeasure reorderLevel')
      .limit(6)
      .lean(),

    Receipt.find({
      $or: [{ receiptNumber: regex }, { supplier: regex }]
    })
      .populate('warehouse', 'name code')
      .select('receiptNumber supplier status createdAt')
      .limit(5)
      .lean(),

    Delivery.find({
      $or: [{ deliveryNumber: regex }, { customer: regex }, { customerName: regex }]
    })
      .populate('warehouse', 'name code')
      .select('deliveryNumber customer status deliveryDate')
      .limit(5)
      .lean(),

    InternalTransfer.find({
      transferNumber: regex
    })
      .populate('sourceWarehouse', 'name')
      .populate('destinationWarehouse', 'name')
      .select('transferNumber status createdAt')
      .limit(5)
      .lean()
  ]);

  return {
    products,
    receipts,
    deliveries,
    transfers
  };
};

/**
 * Stock by Warehouse aggregation for 4th chart
 */
const getStockByWarehouse = async () => {
  const stockByWh = await Stock.aggregate([
    {
      $group: {
        _id: '$warehouse',
        totalStock: { $sum: '$quantity' },
        itemCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: '_id',
        foreignField: '_id',
        as: 'warehouseDetails'
      }
    },
    { $unwind: '$warehouseDetails' },
    {
      $project: {
        warehouseId: '$_id',
        name: '$warehouseDetails.name',
        code: '$warehouseDetails.code',
        totalStock: 1,
        itemCount: 1
      }
    },
    { $sort: { totalStock: -1 } }
  ]);

  return stockByWh;
};

module.exports = {
  getDashboardSummary,
  globalSearch,
  getStockByWarehouse,
  getSmartReorderRecommendations
};
