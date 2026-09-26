const mongoose = require('mongoose');
const { Product, Category, Warehouse, Stock, StockLedger } = require('../models');

/**
 * Product Business Logic Service
 */

/**
 * Create a new product with optional initial stock
 */
const createProduct = async (data, userId = null) => {
  const {
    name,
    sku,
    code,
    category,
    unitOfMeasure = 'pcs',
    reorderLevel = 0,
    minStockLevel = 0,
    maxStockLevel = 0,
    costPrice = 0,
    sellingPrice = 0,
    description = '',
    status = 'active',
    initialStock = 0,
    warehouseId = null
  } = data;

  const targetSku = (sku || code || '').trim().toUpperCase();

  // 1. Validate required fields and inputs
  if (!name || !name.trim()) {
    const error = new Error('Product name is required');
    error.statusCode = 400;
    throw error;
  }

  if (!targetSku) {
    const error = new Error('Product SKU/code is required');
    error.statusCode = 400;
    throw error;
  }

  if (!category) {
    const error = new Error('Category is required');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    const error = new Error('Invalid category ID format');
    error.statusCode = 400;
    throw error;
  }

  const parsedReorderLevel = Number(reorderLevel) || 0;
  if (parsedReorderLevel < 0) {
    const error = new Error('Reorder level cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  const parsedInitialStock = Number(initialStock) || 0;
  if (parsedInitialStock < 0) {
    const error = new Error('Initial stock cannot be negative');
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate category exists in database
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    const error = new Error('Category does not exist in the database');
    error.statusCode = 400;
    throw error;
  }

  // 3. Prevent duplicate SKU
  const existingProduct = await Product.findOne({ sku: targetSku });
  if (existingProduct) {
    const error = new Error(`Product with SKU '${targetSku}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  // 5. Create product record
  const product = new Product({
    name: name.trim(),
    sku: targetSku,
    category,
    unitOfMeasure: unitOfMeasure.trim(),
    reorderLevel: parsedReorderLevel,
    reorderPoint: parsedReorderLevel,
    minStockLevel: Number(minStockLevel) || 0,
    maxStockLevel: Number(maxStockLevel) || 0,
    costPrice: Number(costPrice) || 0,
    sellingPrice: Number(sellingPrice) || 0,
    description: (description || '').trim(),
    status,
    isActive: status === 'active'
  });

  await product.save();

  // 6. Handle optional initial stock
  let stockRecord = null;
  if (parsedInitialStock > 0) {
    let targetWarehouse = null;

    if (warehouseId) {
      if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
        const error = new Error('Invalid warehouse ID format');
        error.statusCode = 400;
        throw error;
      }
      targetWarehouse = await Warehouse.findById(warehouseId);
      if (!targetWarehouse) {
        const error = new Error('Target warehouse does not exist');
        error.statusCode = 400;
        throw error;
      }
    } else {
      // Find the first active warehouse
      targetWarehouse = await Warehouse.findOne({ isActive: true });
      if (!targetWarehouse) {
        // Create a default primary warehouse if none exists yet
        targetWarehouse = await Warehouse.create({
          name: 'Main Central Warehouse',
          code: 'WH-MAIN-01',
          city: 'Primary Distribution Hub',
          isActive: true
        });
      }
    }

    // Create Stock record
    stockRecord = await Stock.create({
      product: product._id,
      warehouse: targetWarehouse._id,
      quantity: parsedInitialStock,
      reservedQuantity: 0
    });

    // Record in StockLedger if user context is available
    if (userId) {
      await StockLedger.create({
        product: product._id,
        warehouse: targetWarehouse._id,
        transactionType: 'RECEIPT',
        referenceNumber: `INIT-${product.sku}`,
        quantityChanged: parsedInitialStock,
        balanceAfter: parsedInitialStock,
        user: userId,
        notes: 'Initial stock on product creation'
      });
    }
  }

  // Populate category for response
  await product.populate('category', 'name code');

  const result = product.toJSON();
  result.initialStock = parsedInitialStock;
  result.totalStock = parsedInitialStock;
  result.lowStock = parsedInitialStock <= product.reorderLevel;

  return result;
};

/**
 * Retrieve single product by ID with warehouse stock breakdown
 */
const getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid product ID format');
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id).populate('category', 'name code description');
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // Get stock entries across all warehouses
  const stockEntries = await Stock.find({ product: id }).populate('warehouse', 'name code city location isActive');

  const totalStock = stockEntries.reduce((sum, item) => sum + item.quantity, 0);
  const totalReserved = stockEntries.reduce((sum, item) => sum + item.reservedQuantity, 0);
  const totalAvailable = Math.max(0, totalStock - totalReserved);
  const isLowStock = totalStock <= product.reorderLevel;
  const isOutOfStock = totalStock === 0;

  const productObj = product.toJSON();
  productObj.totalStock = totalStock;
  productObj.totalReserved = totalReserved;
  productObj.availableStock = totalAvailable;
  productObj.lowStock = isLowStock;
  productObj.outOfStock = isOutOfStock;
  productObj.stocks = stockEntries;

  return productObj;
};

/**
 * Update product by ID
 */
const updateProduct = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid product ID format');
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate SKU if provided
  if (updateData.sku || updateData.code) {
    const targetSku = (updateData.sku || updateData.code).trim().toUpperCase();
    if (targetSku !== product.sku) {
      const existing = await Product.findOne({ sku: targetSku, _id: { $ne: id } });
      if (existing) {
        const error = new Error(`Product with SKU '${targetSku}' already exists`);
        error.statusCode = 400;
        throw error;
      }
      product.sku = targetSku;
    }
  }

  // Validate Category if provided
  if (updateData.category) {
    if (!mongoose.Types.ObjectId.isValid(updateData.category)) {
      const error = new Error('Invalid category ID format');
      error.statusCode = 400;
      throw error;
    }
    const cat = await Category.findById(updateData.category);
    if (!cat) {
      const error = new Error('Category does not exist in the database');
      error.statusCode = 400;
      throw error;
    }
    product.category = updateData.category;
  }

  if (updateData.name) product.name = updateData.name.trim();
  if (updateData.description !== undefined) product.description = updateData.description.trim();
  if (updateData.unitOfMeasure) product.unitOfMeasure = updateData.unitOfMeasure.trim();
  if (updateData.costPrice !== undefined) product.costPrice = Number(updateData.costPrice);
  if (updateData.sellingPrice !== undefined) product.sellingPrice = Number(updateData.sellingPrice);
  if (updateData.minStockLevel !== undefined) product.minStockLevel = Number(updateData.minStockLevel);
  if (updateData.maxStockLevel !== undefined) product.maxStockLevel = Number(updateData.maxStockLevel);

  if (updateData.reorderLevel !== undefined) {
    const lvl = Number(updateData.reorderLevel);
    if (lvl < 0) {
      const error = new Error('Reorder level cannot be negative');
      error.statusCode = 400;
      throw error;
    }
    product.reorderLevel = lvl;
    product.reorderPoint = lvl;
  }

  if (updateData.status) {
    product.status = updateData.status;
    product.isActive = updateData.status === 'active';
  }

  await product.save();
  await product.populate('category', 'name code');

  return product.toJSON();
};

/**
 * Delete product by ID (safely handles stock check)
 */
const deleteProduct = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid product ID format');
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if there is positive stock
  const stockRecords = await Stock.find({ product: id });
  const totalStock = stockRecords.reduce((acc, curr) => acc + curr.quantity, 0);

  if (totalStock > 0) {
    const error = new Error(`Cannot delete product '${product.name}' because it currently has ${totalStock} units in stock. Please adjust stock to 0 first.`);
    error.statusCode = 400;
    throw error;
  }

  // Remove zero-quantity stock entries and delete product
  await Stock.deleteMany({ product: id });
  await Product.findByIdAndDelete(id);

  return { message: `Product '${product.name}' (${product.sku}) successfully deleted` };
};

/**
 * Retrieve products with search, pagination, and multi-criteria filters
 */
const getProducts = async (queryParams) => {
  const {
    search,
    sku,
    name,
    category,
    warehouse,
    status,
    lowStock,
    outOfStock,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  const filter = {};

  // Search by keyword across name and SKU
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { sku: searchRegex }];
  }

  // Specific name or SKU filters
  if (name && name.trim()) {
    filter.name = new RegExp(name.trim(), 'i');
  }

  if (sku && sku.trim()) {
    filter.sku = new RegExp(sku.trim(), 'i');
  }

  // Category filter
  if (category && category.trim()) {
    if (mongoose.Types.ObjectId.isValid(category.trim())) {
      filter.category = category.trim();
    }
  }

  // Status filter
  if (status && (status === 'active' || status === 'inactive')) {
    filter.status = status;
  }

  // Pagination calculation
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  // Query database
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  // Fetch products matching preliminary filters
  const products = await Product.find(filter)
    .populate('category', 'name code')
    .sort(sort)
    .lean();

  // Aggregate stock quantities for each product
  const productIds = products.map((p) => p._id);
  const stockMatch = { product: { $in: productIds } };

  if (warehouse && mongoose.Types.ObjectId.isValid(warehouse.trim())) {
    stockMatch.warehouse = new mongoose.Types.ObjectId(warehouse.trim());
  }

  const stockAgg = await Stock.aggregate([
    { $match: stockMatch },
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
      totalReserved: item.totalReserved,
      availableStock: Math.max(0, item.totalStock - item.totalReserved)
    });
  });

  // Attach stock metadata to products
  let enrichedProducts = products.map((prod) => {
    const stockInfo = stockMap.get(prod._id.toString()) || {
      totalStock: 0,
      totalReserved: 0,
      availableStock: 0
    };
    const isLow = stockInfo.totalStock <= (prod.reorderLevel || 0);
    const isOut = stockInfo.totalStock === 0;

    return {
      ...prod,
      totalStock: stockInfo.totalStock,
      totalReserved: stockInfo.totalReserved,
      availableStock: stockInfo.availableStock,
      lowStock: isLow,
      outOfStock: isOut
    };
  });

  // Apply warehouse filter if specified (keep only products that have a stock record in that warehouse)
  if (warehouse && mongoose.Types.ObjectId.isValid(warehouse.trim())) {
    const productsInWarehouse = new Set(stockAgg.map((s) => s._id.toString()));
    enrichedProducts = enrichedProducts.filter((p) => productsInWarehouse.has(p._id.toString()));
  }

  // Apply low-stock and out-of-stock post-filters if specified
  if (lowStock === 'true' || lowStock === true) {
    enrichedProducts = enrichedProducts.filter((p) => p.lowStock);
  }

  if (outOfStock === 'true' || outOfStock === true) {
    enrichedProducts = enrichedProducts.filter((p) => p.outOfStock);
  }

  const total = enrichedProducts.length;
  const paginatedProducts = enrichedProducts.slice(skip, skip + parsedLimit);

  return {
    products: paginatedProducts,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProducts
};
