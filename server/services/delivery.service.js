const mongoose = require('mongoose');
const { Delivery, Stock, StockLedger, Product, Warehouse } = require('../models');

/**
 * Delivery Operations Service
 */

/**
 * Create a new outbound delivery order
 */
const createDelivery = async (data, userId = null) => {
  const {
    deliveryNumber,
    customerName,
    customer,
    warehouse,
    warehouseId,
    products,
    items,
    status = 'Draft',
    deliveryDate,
    notes = ''
  } = data;

  const targetCustomer = (customerName || customer || '').trim();
  if (!targetCustomer) {
    const error = new Error('Customer name is required');
    error.statusCode = 400;
    throw error;
  }

  const targetWarehouseId = warehouse || warehouseId;
  if (!targetWarehouseId || !mongoose.Types.ObjectId.isValid(targetWarehouseId)) {
    const error = new Error('A valid source warehouse is required');
    error.statusCode = 400;
    throw error;
  }

  const rawItems = items || products || [];
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    const error = new Error('Delivery order must contain at least one product item');
    error.statusCode = 400;
    throw error;
  }

  // Synchronously validate item schemas and quantities first
  for (const item of rawItems) {
    const prodId = item.product?._id || item.product || item.productId;
    const qty = Number(item.quantity ?? item.quantityDelivered);

    if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
      const error = new Error('Invalid product ID in delivery items');
      error.statusCode = 400;
      throw error;
    }

    if (!qty || qty < 1) {
      const error = new Error('Delivery quantity must be at least 1');
      error.statusCode = 400;
      throw error;
    }
  }

  const warehouseDoc = await Warehouse.findById(targetWarehouseId);
  if (!warehouseDoc) {
    const error = new Error('Source warehouse does not exist');
    error.statusCode = 400;
    throw error;
  }

  const formattedItems = [];
  for (const item of rawItems) {
    const prodId = item.product?._id || item.product || item.productId;
    const qty = Number(item.quantity ?? item.quantityDelivered);

    const productDoc = await Product.findById(prodId);
    if (!productDoc) {
      const error = new Error(`Product with ID ${prodId} does not exist`);
      error.statusCode = 400;
      throw error;
    }

    formattedItems.push({
      product: prodId,
      quantity: qty,
      quantityDelivered: qty
    });
  }

  // Generate unique delivery number if not provided
  let generatedNumber = (deliveryNumber || '').trim().toUpperCase();
  if (!generatedNumber) {
    generatedNumber = `DEL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  } else {
    const existing = await Delivery.findOne({ deliveryNumber: generatedNumber });
    if (existing) {
      const error = new Error(`Delivery order with number '${generatedNumber}' already exists`);
      error.statusCode = 400;
      throw error;
    }
  }

  const delivery = new Delivery({
    deliveryNumber: generatedNumber,
    customerName: targetCustomer,
    customer: targetCustomer,
    warehouse: targetWarehouseId,
    items: formattedItems,
    status: status || 'Draft',
    deliveryDate: deliveryDate || new Date(),
    createdBy: userId,
    dispatchedBy: userId,
    notes: (notes || '').trim()
  });

  await delivery.save();
  await delivery.populate([
    { path: 'warehouse', select: 'name code location city' },
    { path: 'items.product', select: 'name sku unitOfMeasure' }
  ]);

  return delivery.toJSON();
};

/**
 * Retrieve delivery orders with filters
 */
const getDeliveries = async (queryParams = {}) => {
  const { status, warehouse, customer, search, page = 1, limit = 20 } = queryParams;
  const filter = {};

  if (status && status.trim()) {
    filter.status = new RegExp(`^${status.trim()}$`, 'i');
  }

  if (warehouse && mongoose.Types.ObjectId.isValid(warehouse.trim())) {
    filter.warehouse = warehouse.trim();
  }

  if (customer && customer.trim()) {
    filter.$or = [
      { customerName: new RegExp(customer.trim(), 'i') },
      { customer: new RegExp(customer.trim(), 'i') }
    ];
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { deliveryNumber: regex },
      { customerName: regex },
      { customer: regex },
      { notes: regex }
    ];
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await Delivery.countDocuments(filter);
  const deliveries = await Delivery.find(filter)
    .populate('warehouse', 'name code location')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  return {
    deliveries,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

/**
 * Retrieve single delivery by ID
 */
const getDeliveryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid delivery ID format');
    error.statusCode = 400;
    throw error;
  }

  const delivery = await Delivery.findById(id)
    .populate('warehouse', 'name code location city')
    .populate('items.product', 'name sku unitOfMeasure reorderLevel category')
    .populate('createdBy', 'name email role')
    .lean();

  if (!delivery) {
    const error = new Error('Delivery order not found');
    error.statusCode = 404;
    throw error;
  }

  return delivery;
};

/**
 * Update delivery order
 */
const updateDelivery = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid delivery ID format');
    error.statusCode = 400;
    throw error;
  }

  const delivery = await Delivery.findById(id);
  if (!delivery) {
    const error = new Error('Delivery order not found');
    error.statusCode = 404;
    throw error;
  }

  if (['Done', 'done', 'Canceled', 'canceled'].includes(delivery.status)) {
    const error = new Error(`Cannot update delivery order in '${delivery.status}' status`);
    error.statusCode = 400;
    throw error;
  }

  if (updateData.customerName) delivery.customerName = updateData.customerName.trim();
  if (updateData.customer) delivery.customer = updateData.customer.trim();
  if (updateData.notes !== undefined) delivery.notes = updateData.notes.trim();
  if (updateData.status && !['Done', 'done'].includes(updateData.status)) {
    delivery.status = updateData.status;
  }

  await delivery.save();
  await delivery.populate([
    { path: 'warehouse', select: 'name code location' },
    { path: 'items.product', select: 'name sku unitOfMeasure' }
  ]);

  return delivery.toJSON();
};

/**
 * Validate delivery order:
 * 1. Check available stock for each item (prevent negative stock!)
 * 2. Decrease stock in warehouse
 * 3. Create StockLedger entry
 * 4. Mark delivery as Done
 */
const validateDelivery = async (id, userId = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid delivery ID format');
    error.statusCode = 400;
    throw error;
  }

  const delivery = await Delivery.findById(id).populate('items.product');
  if (!delivery) {
    const error = new Error('Delivery order not found');
    error.statusCode = 404;
    throw error;
  }

  if (['Done', 'done'].includes(delivery.status)) {
    const error = new Error('Delivery order has already been validated and completed');
    error.statusCode = 400;
    throw error;
  }

  if (['Canceled', 'canceled'].includes(delivery.status)) {
    const error = new Error('Cannot validate a canceled delivery order');
    error.statusCode = 400;
    throw error;
  }

  // 1. Pre-validation: Verify stock sufficiency for ALL items before deducting any stock
  const stockDocuments = [];
  for (const item of delivery.items) {
    const stock = await Stock.findOne({
      product: item.product._id,
      warehouse: delivery.warehouse
    });

    const qtyToDeduct = item.quantity || item.quantityDelivered;
    const currentQty = stock ? stock.quantity : 0;

    if (!stock || currentQty < qtyToDeduct) {
      const error = new Error(
        `Insufficient stock for product '${item.product.name}' (${item.product.sku}) in source warehouse. Available: ${currentQty}, Requested: ${qtyToDeduct}`
      );
      error.statusCode = 400;
      throw error;
    }

    stockDocuments.push({ stock, qtyToDeduct, product: item.product });
  }

  // 2. Perform stock deductions and create ledger entries
  const ledgerEntries = [];
  for (const { stock, qtyToDeduct, product } of stockDocuments) {
    const quantityBefore = stock.quantity;
    stock.quantity -= qtyToDeduct;
    await stock.save();

    const ledger = await StockLedger.create({
      product: product._id,
      warehouse: delivery.warehouse,
      operationType: 'DELIVERY',
      transactionType: 'DELIVERY',
      referenceId: delivery.deliveryNumber,
      referenceNumber: delivery.deliveryNumber,
      quantityBefore,
      quantityChange: -qtyToDeduct,
      quantityChanged: -qtyToDeduct,
      quantityAfter: stock.quantity,
      balanceAfter: stock.quantity,
      user: userId || delivery.createdBy,
      createdBy: userId || delivery.createdBy,
      notes: `Delivery order to ${delivery.customerName || delivery.customer || 'customer'}`
    });

    ledgerEntries.push(ledger);
  }

  delivery.status = 'Done';
  await delivery.save();
  await delivery.populate([
    { path: 'warehouse', select: 'name code location' },
    { path: 'items.product', select: 'name sku unitOfMeasure' }
  ]);

  return {
    delivery: delivery.toJSON(),
    ledgerEntries
  };
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  validateDelivery
};
