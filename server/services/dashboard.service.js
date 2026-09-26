const mongoose = require('mongoose');
const { Product, Stock, Receipt, Delivery, InternalTransfer, Warehouse, Category } = require('../models');

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

  const healthyProducts = Math.max(0, totalProducts - lowStockItems - outOfStockItems);
  const healthPercentage = totalProducts > 0
    ? Math.round((healthyProducts / totalProducts) * 100)
    : 100;

  return {
    totalProducts,
    totalStock,
    lowStockItems,
    outOfStockItems,
    healthyProducts,
    healthPercentage,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers
  };
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
  getStockByWarehouse
};
