const mongoose = require('mongoose');
const { Receipt, Stock, StockLedger, Product, Warehouse } = require('../models');

/**
 * Receipt Operations Service
 */

/**
 * Create a new inbound receipt
 */
const createReceipt = async (data, userId = null) => {
  const {
    receiptNumber,
    supplier,
    supplierName,
    warehouse,
    warehouseId,
    products,
    items,
    status = 'Draft',
    receivedDate,
    notes = ''
  } = data;

  const targetSupplier = (supplier || supplierName || '').trim();
  if (!targetSupplier) {
    const error = new Error('Supplier name is required');
    error.statusCode = 400;
    throw error;
  }

  const targetWarehouseId = warehouse || warehouseId;
  if (!targetWarehouseId || !mongoose.Types.ObjectId.isValid(targetWarehouseId)) {
    const error = new Error('A valid target warehouse is required');
    error.statusCode = 400;
    throw error;
  }

  const warehouseDoc = await Warehouse.findById(targetWarehouseId);
  if (!warehouseDoc) {
    const error = new Error('Target warehouse does not exist');
    error.statusCode = 400;
    throw error;
  }

  // Support items array or products array
  const rawItems = items || products || [];
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    const error = new Error('Receipt must contain at least one product item');
    error.statusCode = 400;
    throw error;
  }

  // Validate items
  const formattedItems = [];
  for (const item of rawItems) {
    const prodId = item.product?._id || item.product || item.productId;
    const qty = Number(item.quantity ?? item.quantityReceived);

    if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
      const error = new Error('Invalid product ID in receipt items');
      error.statusCode = 400;
      throw error;
    }

    if (!qty || qty < 1) {
      const error = new Error('Received quantity must be at least 1');
      error.statusCode = 400;
      throw error;
    }

    const productDoc = await Product.findById(prodId);
    if (!productDoc) {
      const error = new Error(`Product with ID ${prodId} does not exist`);
      error.statusCode = 400;
      throw error;
    }

    formattedItems.push({
      product: prodId,
      quantity: qty,
      quantityReceived: qty,
      unitCost: Number(item.unitCost) || productDoc.costPrice || 0
    });
  }

  // Generate unique receipt number if not provided
  let generatedNumber = (receiptNumber || '').trim().toUpperCase();
  if (!generatedNumber) {
    generatedNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  } else {
    const existing = await Receipt.findOne({ receiptNumber: generatedNumber });
    if (existing) {
      const error = new Error(`Receipt with number '${generatedNumber}' already exists`);
      error.statusCode = 400;
      throw error;
    }
  }

  const receipt = new Receipt({
    receiptNumber: generatedNumber,
    supplier: targetSupplier,
    supplierName: targetSupplier,
    warehouse: targetWarehouseId,
    items: formattedItems,
    status: status || 'Draft',
    receivedDate: receivedDate || new Date(),
    createdBy: userId,
    receivedBy: userId,
    notes: (notes || '').trim()
  });

  await receipt.save();
  await receipt.populate([
    { path: 'warehouse', select: 'name code location city' },
    { path: 'items.product', select: 'name sku unitOfMeasure' }
  ]);

  return receipt.toJSON();
};

/**
 * Retrieve receipts with filters
 */
const getReceipts = async (queryParams = {}) => {
  const { status, warehouse, supplier, search, page = 1, limit = 20 } = queryParams;
  const filter = {};

  if (status && status.trim()) {
    filter.status = new RegExp(`^${status.trim()}$`, 'i');
  }

  if (warehouse && mongoose.Types.ObjectId.isValid(warehouse.trim())) {
    filter.warehouse = warehouse.trim();
  }

  if (supplier && supplier.trim()) {
    filter.$or = [
      { supplier: new RegExp(supplier.trim(), 'i') },
      { supplierName: new RegExp(supplier.trim(), 'i') }
    ];
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { receiptNumber: regex },
      { supplier: regex },
      { supplierName: regex },
      { notes: regex }
    ];
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await Receipt.countDocuments(filter);
  const receipts = await Receipt.find(filter)
    .populate('warehouse', 'name code location')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  return {
    receipts,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

/**
 * Retrieve single receipt by ID
 */
const getReceiptById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid receipt ID format');
    error.statusCode = 400;
    throw error;
  }

  const receipt = await Receipt.findById(id)
    .populate('warehouse', 'name code location city')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel category')
    .populate('createdBy', 'name email role')
    .lean();

  if (!receipt) {
    const error = new Error('Receipt not found');
    error.statusCode = 404;
    throw error;
  }

  return receipt;
};

/**
 * Update receipt (only when in editable state)
 */
const updateReceipt = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid receipt ID format');
    error.statusCode = 400;
    throw error;
  }

  const receipt = await Receipt.findById(id);
  if (!receipt) {
    const error = new Error('Receipt not found');
    error.statusCode = 404;
    throw error;
  }

  if (['Done', 'done', 'Canceled', 'canceled'].includes(receipt.status)) {
    const error = new Error(`Cannot update receipt in '${receipt.status}' status`);
    error.statusCode = 400;
    throw error;
  }

  if (updateData.supplier) receipt.supplier = updateData.supplier.trim();
  if (updateData.notes !== undefined) receipt.notes = updateData.notes.trim();
  if (updateData.status && !['Done', 'done'].includes(updateData.status)) {
    receipt.status = updateData.status;
  }

  await receipt.save();
  await receipt.populate([
    { path: 'warehouse', select: 'name code location' },
    { path: 'items.product', select: 'name sku unitOfMeasure' }
  ]);

  return receipt.toJSON();
};

/**
 * Validate receipt:
 * 1. Increase stock in warehouse
 * 2. Create StockLedger entry
 * 3. Mark receipt status as Done
 */
const validateReceipt = async (id, userId = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid receipt ID format');
    error.statusCode = 400;
    throw error;
  }

  const receipt = await Receipt.findById(id);
  if (!receipt) {
    const error = new Error('Receipt not found');
    error.statusCode = 404;
    throw error;
  }

  if (['Done', 'done'].includes(receipt.status)) {
    const error = new Error('Receipt has already been validated and processed');
    error.statusCode = 400;
    throw error;
  }

  if (['Canceled', 'canceled'].includes(receipt.status)) {
    const error = new Error('Cannot validate a canceled receipt');
    error.statusCode = 400;
    throw error;
  }

  const ledgerEntries = [];

  // Update stock and create ledger entries
  for (const item of receipt.items) {
    let stock = await Stock.findOne({
      product: item.product,
      warehouse: receipt.warehouse
    });

    let quantityBefore = 0;
    if (!stock) {
      stock = new Stock({
        product: item.product,
        warehouse: receipt.warehouse,
        quantity: 0,
        reservedQuantity: 0
      });
    } else {
      quantityBefore = stock.quantity;
    }

    const qtyToAdd = item.quantity || item.quantityReceived;
    stock.quantity += qtyToAdd;
    await stock.save();

    // Create StockLedger entry
    const ledger = await StockLedger.create({
      product: item.product,
      warehouse: receipt.warehouse,
      operationType: 'RECEIPT',
      transactionType: 'RECEIPT',
      referenceId: receipt.receiptNumber,
      referenceNumber: receipt.receiptNumber,
      quantityBefore,
      quantityChange: qtyToAdd,
      quantityChanged: qtyToAdd,
      quantityAfter: stock.quantity,
      balanceAfter: stock.quantity,
      user: userId || receipt.createdBy,
      createdBy: userId || receipt.createdBy,
      notes: `Receipt from ${receipt.supplier || receipt.supplierName || 'supplier'}`
    });

    ledgerEntries.push(ledger);
  }

  receipt.status = 'Done';
  await receipt.save();
  await receipt.populate([
    { path: 'warehouse', select: 'name code location' },
    { path: 'items.product', select: 'name sku unitOfMeasure' }
  ]);

  return {
    receipt: receipt.toJSON(),
    ledgerEntries
  };
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  validateReceipt
};
