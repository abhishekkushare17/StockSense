const mongoose = require('mongoose');
const { Stock, Product, Warehouse } = require('../models');

/**
 * Stock Management & Low-Stock Intelligence Service
 */

/**
 * Retrieve all stock records with populated references & metrics
 */
const getAllStock = async (queryParams = {}) => {
  const { warehouse, product, category, search, lowStock, outOfStock } = queryParams;
  const filter = {};

  if (warehouse && mongoose.Types.ObjectId.isValid(warehouse.trim())) {
    filter.warehouse = warehouse.trim();
  }

  if (product && mongoose.Types.ObjectId.isValid(product.trim())) {
    filter.product = product.trim();
  }

  const stockQuery = Stock.find(filter)
    .populate({
      path: 'product',
      select: 'name sku unitOfMeasure reorderLevel minStockLevel status category',
      populate: { path: 'category', select: 'name code' }
    })
    .populate({
      path: 'warehouse',
      select: 'name code location city isActive'
    })
    .sort({ updatedAt: -1 })
    .lean();

  let stockRecords = await stockQuery;

  // Filter out any orphaned records if product or warehouse was removed
  stockRecords = stockRecords.filter((s) => s.product && s.warehouse);

  // Search by product name, SKU or warehouse name/code
  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    stockRecords = stockRecords.filter(
      (s) =>
        s.product.name.toLowerCase().includes(term) ||
        s.product.sku.toLowerCase().includes(term) ||
        s.warehouse.name.toLowerCase().includes(term) ||
        s.warehouse.code.toLowerCase().includes(term)
    );
  }

  // Filter by category
  if (category && category.trim()) {
    const catId = category.trim();
    stockRecords = stockRecords.filter((s) => {
      const prodCat = s.product.category;
      return prodCat && (prodCat._id?.toString() === catId || prodCat.toString() === catId);
    });
  }

  // Enrich with low stock and available calculations
  let enriched = stockRecords.map((item) => {
    const reorderLevel = item.product.reorderLevel || 0;
    const available = Math.max(0, item.quantity - (item.reservedQuantity || 0));
    const isLow = item.quantity <= reorderLevel;
    const isOut = item.quantity === 0;

    return {
      ...item,
      availableQuantity: available,
      lowStock: isLow,
      outOfStock: isOut
    };
  });

  if (lowStock === 'true' || lowStock === true) {
    enriched = enriched.filter((s) => s.lowStock);
  }

  if (outOfStock === 'true' || outOfStock === true) {
    enriched = enriched.filter((s) => s.outOfStock);
  }

  const totalQuantity = enriched.reduce((sum, s) => sum + s.quantity, 0);
  const totalReserved = enriched.reduce((sum, s) => sum + (s.reservedQuantity || 0), 0);
  const totalAvailable = Math.max(0, totalQuantity - totalReserved);

  return {
    stocks: enriched,
    summary: {
      totalRecords: enriched.length,
      totalQuantity,
      totalReserved,
      totalAvailable
    }
  };
};

/**
 * Retrieve stock for a specific product across all warehouses
 */
const getStockByProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error('Invalid product ID format');
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId)
    .populate('category', 'name code')
    .lean();

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const stockEntries = await Stock.find({ product: productId })
    .populate('warehouse', 'name code location city address isActive')
    .lean();

  const totalStock = stockEntries.reduce((sum, s) => sum + s.quantity, 0);
  const totalReserved = stockEntries.reduce((sum, s) => sum + (s.reservedQuantity || 0), 0);
  const availableStock = Math.max(0, totalStock - totalReserved);
  const reorderLevel = product.reorderLevel || 0;
  const isLowStock = totalStock <= reorderLevel;
  const isOutOfStock = totalStock === 0;
  const deficit = isLowStock ? Math.max(0, reorderLevel - totalStock) : 0;

  return {
    product: {
      _id: product._id,
      name: product.name,
      sku: product.sku,
      unitOfMeasure: product.unitOfMeasure,
      reorderLevel,
      category: product.category,
      status: product.status
    },
    inventory: {
      totalStock,
      totalReserved,
      availableStock,
      lowStock: isLowStock,
      outOfStock: isOutOfStock,
      deficit
    },
    warehouses: stockEntries.map((s) => ({
      warehouseId: s.warehouse?._id,
      warehouseName: s.warehouse?.name,
      warehouseCode: s.warehouse?.code,
      location: s.warehouse?.location,
      quantity: s.quantity,
      reservedQuantity: s.reservedQuantity || 0,
      availableQuantity: Math.max(0, s.quantity - (s.reservedQuantity || 0)),
      locationBin: s.locationBin || '-'
    }))
  };
};

/**
 * Retrieve stock for all products inside a specific warehouse
 */
const getStockByWarehouse = async (warehouseId) => {
  if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
    const error = new Error('Invalid warehouse ID format');
    error.statusCode = 400;
    throw error;
  }

  const warehouse = await Warehouse.findById(warehouseId).lean();
  if (!warehouse) {
    const error = new Error('Warehouse not found');
    error.statusCode = 404;
    throw error;
  }

  const stockEntries = await Stock.find({ warehouse: warehouseId })
    .populate({
      path: 'product',
      select: 'name sku unitOfMeasure reorderLevel status category',
      populate: { path: 'category', select: 'name code' }
    })
    .lean();

  // Filter out any orphaned stock records
  const validEntries = stockEntries.filter((s) => s.product);

  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalQuantity = 0;

  const items = validEntries.map((s) => {
    const reorderLevel = s.product.reorderLevel || 0;
    const isLow = s.quantity <= reorderLevel;
    const isOut = s.quantity === 0;

    if (isLow) lowStockCount++;
    if (isOut) outOfStockCount++;
    totalQuantity += s.quantity;

    return {
      stockId: s._id,
      product: s.product,
      quantity: s.quantity,
      reservedQuantity: s.reservedQuantity || 0,
      availableQuantity: Math.max(0, s.quantity - (s.reservedQuantity || 0)),
      locationBin: s.locationBin || '-',
      lowStock: isLow,
      outOfStock: isOut
    };
  });

  return {
    warehouse: {
      _id: warehouse._id,
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      city: warehouse.city,
      status: warehouse.status
    },
    summary: {
      totalProductsTracked: items.length,
      totalQuantity,
      lowStockCount,
      outOfStockCount
    },
    items
  };
};

/**
 * Retrieve comprehensive Low Stock and Out of Stock inventory report
 */
const getLowStockReport = async () => {
  // 1. Fetch all active products
  const products = await Product.find({ status: 'active' })
    .populate('category', 'name code')
    .lean();

  // 2. Aggregate current total stock per product
  const stockAgg = await Stock.aggregate([
    {
      $group: {
        _id: '$product',
        totalStock: { $sum: '$quantity' },
        totalReserved: { $sum: '$reservedQuantity' }
      }
    }
  ]);

  const stockMap = new Map();
  stockAgg.forEach((item) => {
    stockMap.set(item._id.toString(), {
      totalStock: item.totalStock,
      totalReserved: item.totalReserved
    });
  });

  // 3. Fetch warehouse breakdown for products that might be low
  const allStockEntries = await Stock.find()
    .populate('warehouse', 'name code location')
    .lean();

  const warehouseStockMap = new Map();
  allStockEntries.forEach((s) => {
    const prodId = s.product.toString();
    if (!warehouseStockMap.has(prodId)) {
      warehouseStockMap.set(prodId, []);
    }
    warehouseStockMap.get(prodId).push({
      warehouse: s.warehouse,
      quantity: s.quantity,
      locationBin: s.locationBin
    });
  });

  const lowStockItems = [];
  const outOfStockItems = [];

  products.forEach((prod) => {
    const stockData = stockMap.get(prod._id.toString()) || { totalStock: 0, totalReserved: 0 };
    const currentStock = stockData.totalStock;
    const reorderLevel = prod.reorderLevel || 0;
    const availableStock = Math.max(0, currentStock - stockData.totalReserved);
    const deficit = Math.max(0, reorderLevel - currentStock);
    const warehouses = warehouseStockMap.get(prod._id.toString()) || [];

    const itemPayload = {
      productId: prod._id,
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      unitOfMeasure: prod.unitOfMeasure,
      currentStock,
      availableStock,
      reorderLevel,
      deficit,
      suggestedReorderQuantity: deficit > 0 ? deficit : 0,
      warehouses
    };

    if (currentStock === 0) {
      outOfStockItems.push({
        ...itemPayload,
        status: 'OUT_OF_STOCK'
      });
    } else if (currentStock <= reorderLevel) {
      lowStockItems.push({
        ...itemPayload,
        status: 'LOW_STOCK'
      });
    }
  });

  return {
    summary: {
      totalMonitoredProducts: products.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      criticalTotal: lowStockItems.length + outOfStockItems.length
    },
    outOfStockProducts: outOfStockItems,
    lowStockProducts: lowStockItems
  };
};

module.exports = {
  getAllStock,
  getStockByProduct,
  getStockByWarehouse,
  getLowStockReport
};
