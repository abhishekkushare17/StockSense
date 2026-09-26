const mongoose = require('mongoose');
const { StockLedger, Product, Warehouse } = require('../models');

/**
 * Stock Ledger Service
 * Provides comprehensive audit trail queries of every stock movement
 */

/**
 * Retrieve stock ledger entries with filtering, pagination and sorting
 */
const getLedgerEntries = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 25,
    product,
    productId,
    warehouse,
    warehouseId,
    operationType,
    transactionType,
    referenceNumber,
    referenceId,
    startDate,
    endDate,
    search,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = queryParams;

  const filter = {};

  const pId = product || productId;
  if (pId && mongoose.Types.ObjectId.isValid(pId)) {
    filter.product = pId;
  }

  const whId = warehouse || warehouseId;
  if (whId && mongoose.Types.ObjectId.isValid(whId)) {
    filter.warehouse = whId;
  }

  const opType = operationType || transactionType;
  if (opType) {
    filter.$or = [
      { operationType: opType.toUpperCase() },
      { transactionType: opType.toUpperCase() }
    ];
  }

  const ref = referenceNumber || referenceId;
  if (ref) {
    filter.$or = [
      { referenceId: new RegExp(ref.trim(), 'i') },
      { referenceNumber: new RegExp(ref.trim(), 'i') }
    ];
  }

  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) {
      filter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.timestamp.$lte = new Date(endDate);
    }
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { referenceId: searchRegex },
      { referenceNumber: searchRegex },
      { notes: searchRegex },
      { operationType: searchRegex }
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
  const pageLimit = Math.max(1, parseInt(limit, 10));
  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;

  const [ledgerEntries, total] = await Promise.all([
    StockLedger.find(filter)
      .populate('product', 'name sku unitOfMeasure category')
      .populate('warehouse', 'name code location city')
      .populate('createdBy', 'name email role')
      .populate('user', 'name email role')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageLimit)
      .lean(),
    StockLedger.countDocuments(filter)
  ]);

  return {
    entries: ledgerEntries,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: pageLimit,
      pages: Math.ceil(total / pageLimit)
    }
  };
};

/**
 * Retrieve ledger history for a specific product
 */
const getLedgerByProduct = async (productId, queryParams = {}) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error('Invalid product ID format');
    error.statusCode = 400;
    throw error;
  }

  return getLedgerEntries({ ...queryParams, product: productId });
};

/**
 * Retrieve single ledger entry by ID
 */
const getLedgerById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid ledger entry ID format');
    error.statusCode = 400;
    throw error;
  }

  const entry = await StockLedger.findById(id)
    .populate('product', 'name sku unitOfMeasure category')
    .populate('warehouse', 'name code location city')
    .populate('createdBy', 'name email role')
    .populate('user', 'name email role')
    .lean();

  if (!entry) {
    const error = new Error('Ledger entry not found');
    error.statusCode = 404;
    throw error;
  }

  return entry;
};

module.exports = {
  getLedgerEntries,
  getLedgerByProduct,
  getLedgerById
};
