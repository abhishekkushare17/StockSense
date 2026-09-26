const mongoose = require('mongoose');
const { InternalTransfer, Stock, StockLedger, Product, Warehouse } = require('../models');

/**
 * Internal Transfer Operations Service
 */

/**
 * Create a new inter-warehouse transfer request
 */
const createTransfer = async (data, userId = null) => {
  const {
    transferNumber,
    sourceWarehouse,
    sourceWarehouseId,
    destinationWarehouse,
    destinationWarehouseId,
    product,
    productId,
    quantity,
    products,
    items,
    status = 'Draft',
    notes = ''
  } = data;

  const srcId = sourceWarehouse || sourceWarehouseId;
  const destId = destinationWarehouse || destinationWarehouseId;

  if (!srcId || !mongoose.Types.ObjectId.isValid(srcId)) {
    const error = new Error('A valid source warehouse is required');
    error.statusCode = 400;
    throw error;
  }

  if (!destId || !mongoose.Types.ObjectId.isValid(destId)) {
    const error = new Error('A valid destination warehouse is required');
    error.statusCode = 400;
    throw error;
  }

  if (srcId.toString() === destId.toString()) {
    const error = new Error('Source and destination warehouses cannot be the same facility');
    error.statusCode = 400;
    throw error;
  }

  const [srcDoc, destDoc] = await Promise.all([
    Warehouse.findById(srcId),
    Warehouse.findById(destId)
  ]);

  if (!srcDoc) {
    const error = new Error('Source warehouse does not exist');
    error.statusCode = 400;
    throw error;
  }

  if (!destDoc) {
    const error = new Error('Destination warehouse does not exist');
    error.statusCode = 400;
    throw error;
  }

  // Parse items: support either items array or single product/quantity
  let rawItems = items || products || [];
  if (rawItems.length === 0 && (product || productId) && quantity) {
    rawItems = [{ product: product || productId, quantity }];
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    const error = new Error('Transfer must specify at least one product and quantity');
    error.statusCode = 400;
    throw error;
  }

  const formattedItems = [];
  for (const item of rawItems) {
    const pId = item.product?._id || item.product || item.productId;
    const qty = Number(item.quantity);

    if (!pId || !mongoose.Types.ObjectId.isValid(pId)) {
      const error = new Error('Invalid product ID in transfer items');
      error.statusCode = 400;
      throw error;
    }

    if (!qty || qty < 1) {
      const error = new Error('Transfer quantity must be at least 1');
      error.statusCode = 400;
      throw error;
    }

    const productDoc = await Product.findById(pId);
    if (!productDoc) {
      const error = new Error(`Product with ID ${pId} does not exist`);
      error.statusCode = 400;
      throw error;
    }

    formattedItems.push({
      product: pId,
      quantity: qty
    });
  }

  let generatedNumber = (transferNumber || '').trim().toUpperCase();
  if (!generatedNumber) {
    generatedNumber = `TRF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  } else {
    const existing = await InternalTransfer.findOne({ transferNumber: generatedNumber });
    if (existing) {
      const error = new Error(`Transfer with number '${generatedNumber}' already exists`);
      error.statusCode = 400;
      throw error;
    }
  }

  const transfer = new InternalTransfer({
    transferNumber: generatedNumber,
    sourceWarehouse: srcId,
    destinationWarehouse: destId,
    items: formattedItems,
    status: status || 'Draft',
    createdBy: userId,
    initiatedBy: userId,
    notes: (notes || '').trim()
  });

  await transfer.save();
  await transfer.populate([
    { path: 'sourceWarehouse', select: 'name code location' },
    { path: 'destinationWarehouse', select: 'name code location' },
    { path: 'items.product', select: 'name sku unitOfMeasure' }
  ]);

  return transfer.toJSON();
};

/**
 * Retrieve transfers with filters
 */
const getTransfers = async (queryParams = {}) => {
  const { status, sourceWarehouse, destinationWarehouse, search, page = 1, limit = 20 } = queryParams;
  const filter = {};

  if (status && status.trim()) {
    filter.status = new RegExp(`^${status.trim()}$`, 'i');
  }

  if (sourceWarehouse && mongoose.Types.ObjectId.isValid(sourceWarehouse.trim())) {
    filter.sourceWarehouse = sourceWarehouse.trim();
  }

  if (destinationWarehouse && mongoose.Types.ObjectId.isValid(destinationWarehouse.trim())) {
    filter.destinationWarehouse = destinationWarehouse.trim();
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ transferNumber: regex }, { notes: regex }];
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await InternalTransfer.countDocuments(filter);
  const transfers = await InternalTransfer.find(filter)
    .populate('sourceWarehouse', 'name code location')
    .populate('destinationWarehouse', 'name code location')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  return {
    transfers,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

/**
 * Retrieve single transfer by ID
 */
const getTransferById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid transfer ID format');
    error.statusCode = 400;
    throw error;
  }

  const transfer = await InternalTransfer.findById(id)
    .populate('sourceWarehouse', 'name code location city')
    .populate('destinationWarehouse', 'name code location city')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel category')
    .populate('createdBy', 'name email role')
    .lean();

  if (!transfer) {
    const error = new Error('Transfer not found');
    error.statusCode = 404;
    throw error;
  }

  return transfer;
};

/**
 * Validate transfer:
 * 1. Check source warehouse has sufficient stock
 * 2. Decrease stock in source warehouse
 * 3. Increase stock in destination warehouse
 * 4. Create two StockLedger entries: TRANSFER_OUT and TRANSFER_IN
 * 5. Mark transfer as Done
 */
const validateTransfer = async (id, userId = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid transfer ID format');
    error.statusCode = 400;
    throw error;
  }

  const transfer = await InternalTransfer.findById(id).populate('items.product');
  if (!transfer) {
    const error = new Error('Transfer not found');
    error.statusCode = 404;
    throw error;
  }

  if (['Done', 'done'].includes(transfer.status)) {
    const error = new Error('Transfer has already been validated and processed');
    error.statusCode = 400;
    throw error;
  }

  if (['Canceled', 'canceled'].includes(transfer.status)) {
    const error = new Error('Cannot validate a canceled transfer');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify stock sufficiency in source warehouse
  const transferItemsData = [];
  for (const item of transfer.items) {
    const srcStock = await Stock.findOne({
      product: item.product._id,
      warehouse: transfer.sourceWarehouse
    });

    const currentQty = srcStock ? srcStock.quantity : 0;
    if (!srcStock || currentQty < item.quantity) {
      const error = new Error(
        `Insufficient stock for product '${item.product.name}' in source warehouse. Available: ${currentQty}, Requested: ${item.quantity}`
      );
      error.statusCode = 400;
      throw error;
    }

    transferItemsData.push({
      item,
      srcStock
    });
  }

  // 2. Perform transfer movements and create dual ledger records
  const ledgerEntries = [];
  for (const { item, srcStock } of transferItemsData) {
    // Decrease source stock
    const srcQtyBefore = srcStock.quantity;
    srcStock.quantity -= item.quantity;
    await srcStock.save();

    const ledgerOut = await StockLedger.create({
      product: item.product._id,
      warehouse: transfer.sourceWarehouse,
      operationType: 'TRANSFER_OUT',
      transactionType: 'TRANSFER_OUT',
      referenceId: transfer.transferNumber,
      referenceNumber: transfer.transferNumber,
      quantityBefore: srcQtyBefore,
      quantityChange: -item.quantity,
      quantityChanged: -item.quantity,
      quantityAfter: srcStock.quantity,
      balanceAfter: srcStock.quantity,
      user: userId || transfer.createdBy,
      createdBy: userId || transfer.createdBy,
      notes: `Transfer OUT to destination warehouse`
    });
    ledgerEntries.push(ledgerOut);

    // Increase destination stock
    let destStock = await Stock.findOne({
      product: item.product._id,
      warehouse: transfer.destinationWarehouse
    });

    let destQtyBefore = 0;
    if (!destStock) {
      destStock = new Stock({
        product: item.product._id,
        warehouse: transfer.destinationWarehouse,
        quantity: 0,
        reservedQuantity: 0
      });
    } else {
      destQtyBefore = destStock.quantity;
    }

    destStock.quantity += item.quantity;
    await destStock.save();

    const ledgerIn = await StockLedger.create({
      product: item.product._id,
      warehouse: transfer.destinationWarehouse,
      operationType: 'TRANSFER_IN',
      transactionType: 'TRANSFER_IN',
      referenceId: transfer.transferNumber,
      referenceNumber: transfer.transferNumber,
      quantityBefore: destQtyBefore,
      quantityChange: item.quantity,
      quantityChanged: item.quantity,
      quantityAfter: destStock.quantity,
      balanceAfter: destStock.quantity,
      user: userId || transfer.createdBy,
      createdBy: userId || transfer.createdBy,
      notes: `Transfer IN from source warehouse`
    });
    ledgerEntries.push(ledgerIn);
  }

  transfer.status = 'Done';
  await transfer.save();
  await transfer.populate([
    { path: 'sourceWarehouse', select: 'name code location' },
    { path: 'destinationWarehouse', select: 'name code location' },
    { path: 'items.product', select: 'name sku unitOfMeasure' }
  ]);

  return {
    transfer: transfer.toJSON(),
    ledgerEntries
  };
};

module.exports = {
  createTransfer,
  getTransfers,
  getTransferById,
  validateTransfer
};
