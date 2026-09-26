const mongoose = require('mongoose');
const { StockAdjustment, Stock, StockLedger, Product, Warehouse } = require('../models');
const { TRANSACTION_TYPES } = require('../utils/constants');

/**
 * Stock Adjustment Operations Service
 */

/**
 * Create a new stock adjustment document
 */
const createAdjustment = async (data, userId = null) => {
  const {
    adjustmentNumber,
    warehouse,
    warehouseId,
    product,
    productId,
    recordedQuantity,
    oldQuantity,
    physicalQuantity,
    newQuantity,
    reason,
    items,
    products,
    status = 'Draft',
    notes = ''
  } = data;

  const whId = warehouse || warehouseId;
  if (!whId || !mongoose.Types.ObjectId.isValid(whId)) {
    const error = new Error('A valid warehouse reference is required');
    error.statusCode = 400;
    throw error;
  }

  const warehouseDoc = await Warehouse.findById(whId);
  if (!warehouseDoc) {
    const error = new Error('Warehouse not found');
    error.statusCode = 404;
    throw error;
  }

  // Parse items: support items/products array or single product payload
  let rawItems = items || products || [];
  if (rawItems.length === 0 && (product || productId)) {
    rawItems = [
      {
        product: product || productId,
        recordedQuantity: recordedQuantity !== undefined ? recordedQuantity : oldQuantity,
        oldQuantity: oldQuantity !== undefined ? oldQuantity : recordedQuantity,
        physicalQuantity: physicalQuantity !== undefined ? physicalQuantity : newQuantity,
        newQuantity: newQuantity !== undefined ? newQuantity : physicalQuantity,
        reason: reason || notes || 'Physical inventory count reconciliation'
      }
    ];
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    const error = new Error('Adjustment must contain at least one item');
    error.statusCode = 400;
    throw error;
  }

  const formattedItems = [];
  for (const item of rawItems) {
    const pId = item.product?._id || item.product || item.productId;
    if (!pId || !mongoose.Types.ObjectId.isValid(pId)) {
      const error = new Error('Invalid product ID in adjustment items');
      error.statusCode = 400;
      throw error;
    }

    const productDoc = await Product.findById(pId);
    if (!productDoc) {
      const error = new Error(`Product with ID ${pId} does not exist`);
      error.statusCode = 400;
      throw error;
    }

    let recQty = item.recordedQuantity !== undefined ? item.recordedQuantity : item.oldQuantity;
    // If recordedQuantity not provided, fetch current recorded stock
    if (recQty === undefined || recQty === null) {
      const stockDoc = await Stock.findOne({ product: pId, warehouse: whId });
      recQty = stockDoc ? stockDoc.quantity : 0;
    }

    const physQty = item.physicalQuantity !== undefined ? item.physicalQuantity : item.newQuantity;
    if (physQty === undefined || physQty === null) {
      const error = new Error('Physical counted quantity is required for each item');
      error.statusCode = 400;
      throw error;
    }

    const numRecQty = Number(recQty);
    const numPhysQty = Number(physQty);

    if (numRecQty < 0 || isNaN(numRecQty)) {
      const error = new Error('Recorded quantity cannot be negative');
      error.statusCode = 400;
      throw error;
    }

    if (numPhysQty < 0 || isNaN(numPhysQty)) {
      const error = new Error('Physical counted quantity cannot be negative');
      error.statusCode = 400;
      throw error;
    }

    const diff = numPhysQty - numRecQty;
    const itemReason = (item.reason || notes || 'Physical inventory count reconciliation').trim();

    formattedItems.push({
      product: pId,
      oldQuantity: numRecQty,
      recordedQuantity: numRecQty,
      newQuantity: numPhysQty,
      physicalQuantity: numPhysQty,
      difference: diff,
      reason: itemReason
    });
  }

  // Generate unique adjustmentNumber if not provided
  let generatedAdjustmentNumber = adjustmentNumber;
  if (!generatedAdjustmentNumber) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    generatedAdjustmentNumber = `ADJ-${dateStr}-${randomSuffix}`;
  }

  const existing = await StockAdjustment.findOne({
    adjustmentNumber: generatedAdjustmentNumber.toUpperCase().trim()
  });
  if (existing) {
    const error = new Error(`Adjustment number ${generatedAdjustmentNumber} already exists`);
    error.statusCode = 409;
    throw error;
  }

  const adjustment = await StockAdjustment.create({
    adjustmentNumber: generatedAdjustmentNumber.toUpperCase().trim(),
    warehouse: whId,
    items: formattedItems,
    status: status || 'Draft',
    createdBy: userId || null,
    adjustedBy: userId || null,
    notes: notes || ''
  });

  return StockAdjustment.findById(adjustment._id)
    .populate('warehouse', 'name code location city')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel category')
    .populate('createdBy', 'name email role')
    .lean();
};

/**
 * Retrieve all stock adjustments with filtering, search & pagination
 */
const getAdjustments = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 20,
    warehouse,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams;

  const filter = {};

  if (warehouse && mongoose.Types.ObjectId.isValid(warehouse)) {
    filter.warehouse = warehouse;
  }

  if (status) {
    filter.status = status;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { adjustmentNumber: searchRegex },
      { notes: searchRegex },
      { 'items.reason': searchRegex }
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
  const pageLimit = Math.max(1, parseInt(limit, 10));
  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;

  const [adjustments, total] = await Promise.all([
    StockAdjustment.find(filter)
      .populate('warehouse', 'name code location city')
      .populate('items.product', 'name sku unitOfMeasure category')
      .populate('createdBy', 'name email role')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageLimit)
      .lean(),
    StockAdjustment.countDocuments(filter)
  ]);

  return {
    adjustments,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: pageLimit,
      pages: Math.ceil(total / pageLimit)
    }
  };
};

/**
 * Retrieve single adjustment by ID
 */
const getAdjustmentById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid adjustment ID format');
    error.statusCode = 400;
    throw error;
  }

  const adjustment = await StockAdjustment.findById(id)
    .populate('warehouse', 'name code location city')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel category')
    .populate('createdBy', 'name email role')
    .populate('adjustedBy', 'name email role')
    .lean();

  if (!adjustment) {
    const error = new Error('Stock adjustment not found');
    error.statusCode = 404;
    throw error;
  }

  return adjustment;
};

/**
 * Validate and apply stock adjustment:
 * 1. Calculate difference between physical count and recorded stock
 * 2. Update stock record in warehouse
 * 3. Generate StockLedger entry with operationType: 'ADJUSTMENT'
 * 4. Mark adjustment status as 'Done'
 */
const validateAdjustment = async (id, userId = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid adjustment ID format');
    error.statusCode = 400;
    throw error;
  }

  const adjustment = await StockAdjustment.findById(id).populate('items.product');
  if (!adjustment) {
    const error = new Error('Stock adjustment not found');
    error.statusCode = 404;
    throw error;
  }

  if (['Done', 'done'].includes(adjustment.status)) {
    const error = new Error('Adjustment has already been validated and processed');
    error.statusCode = 400;
    throw error;
  }

  if (['Canceled', 'canceled'].includes(adjustment.status)) {
    const error = new Error('Cannot validate a canceled adjustment');
    error.statusCode = 400;
    throw error;
  }

  // Process each adjustment line item
  for (const item of adjustment.items) {
    const productId = item.product._id || item.product;
    const warehouseId = adjustment.warehouse;
    const physicalQty = item.physicalQuantity !== undefined ? item.physicalQuantity : item.newQuantity;

    // Locate current stock record or create if not present
    let stock = await Stock.findOne({ product: productId, warehouse: warehouseId });
    if (!stock) {
      stock = new Stock({
        product: productId,
        warehouse: warehouseId,
        quantity: 0
      });
    }

    const quantityBefore = stock.quantity;
    const quantityAfter = physicalQty;
    const quantityChange = quantityAfter - quantityBefore;

    // Update item recorded quantity and difference if stock shifted in the interim
    item.recordedQuantity = quantityBefore;
    item.oldQuantity = quantityBefore;
    item.difference = quantityChange;

    // Update stock quantity directly to physical counted quantity
    stock.quantity = quantityAfter;
    await stock.save();

    // Create audit trail entry in StockLedger
    await StockLedger.create({
      product: productId,
      warehouse: warehouseId,
      operationType: TRANSACTION_TYPES.ADJUSTMENT,
      transactionType: TRANSACTION_TYPES.ADJUSTMENT,
      referenceId: adjustment.adjustmentNumber,
      referenceNumber: adjustment.adjustmentNumber,
      quantityBefore,
      quantityChange,
      quantityChanged: quantityChange,
      quantityAfter,
      balanceAfter: quantityAfter,
      createdBy: userId || adjustment.createdBy,
      user: userId || adjustment.createdBy,
      notes: item.reason || adjustment.notes || 'Physical inventory reconciliation'
    });
  }

  adjustment.status = 'Done';
  if (userId) {
    adjustment.adjustedBy = userId;
  }
  await adjustment.save();

  return StockAdjustment.findById(adjustment._id)
    .populate('warehouse', 'name code location city')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel category')
    .populate('createdBy', 'name email role')
    .populate('adjustedBy', 'name email role')
    .lean();
};

/**
 * Update a stock adjustment (when in Draft state)
 */
const updateAdjustment = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid adjustment ID format');
    error.statusCode = 400;
    throw error;
  }

  const adjustment = await StockAdjustment.findById(id);
  if (!adjustment) {
    const error = new Error('Stock adjustment not found');
    error.statusCode = 404;
    throw error;
  }

  if (['Done', 'done'].includes(adjustment.status)) {
    const error = new Error('Cannot modify a validated adjustment');
    error.statusCode = 400;
    throw error;
  }

  if (data.notes !== undefined) adjustment.notes = data.notes;
  if (data.status && ['Draft', 'Waiting', 'Ready', 'Canceled'].includes(data.status)) {
    adjustment.status = data.status;
  }

  await adjustment.save();

  return StockAdjustment.findById(adjustment._id)
    .populate('warehouse', 'name code location city')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel category')
    .lean();
};

module.exports = {
  createAdjustment,
  getAdjustments,
  getAdjustmentById,
  validateAdjustment,
  updateAdjustment
};
