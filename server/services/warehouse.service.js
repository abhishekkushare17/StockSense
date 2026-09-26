const mongoose = require('mongoose');
const { Warehouse, Stock } = require('../models');

/**
 * Warehouse Management Service
 */

/**
 * Create a new warehouse
 */
const createWarehouse = async (data) => {
  const {
    name,
    code,
    location = '',
    description = '',
    status = 'active',
    address = '',
    city = '',
    state = '',
    postalCode = '',
    contactPerson = '',
    phone = '',
    email = ''
  } = data;

  if (!name || !name.trim()) {
    const error = new Error('Warehouse name is required');
    error.statusCode = 400;
    throw error;
  }

  if (!code || !code.trim()) {
    const error = new Error('Warehouse code is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedName = name.trim();
  const normalizedCode = code.trim().toUpperCase();

  // Check unique code
  const existingCode = await Warehouse.findOne({ code: normalizedCode });
  if (existingCode) {
    const error = new Error(`Warehouse with code '${normalizedCode}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  const warehouse = new Warehouse({
    name: normalizedName,
    code: normalizedCode,
    location: location.trim(),
    description: description.trim(),
    status,
    isActive: status === 'active',
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    postalCode: postalCode.trim(),
    contactPerson: contactPerson.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase()
  });

  await warehouse.save();
  return warehouse.toJSON();
};

/**
 * Retrieve all warehouses with stock metrics
 */
const getWarehouses = async (queryParams = {}) => {
  const { search, status } = queryParams;
  const filter = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { code: searchRegex },
      { location: searchRegex },
      { city: searchRegex }
    ];
  }

  if (status && (status === 'active' || status === 'inactive')) {
    filter.status = status;
  }

  const warehouses = await Warehouse.find(filter).sort({ name: 1 }).lean();

  // Aggregate stock counts for each warehouse
  const warehouseIds = warehouses.map((w) => w._id);
  const stockAgg = await Stock.aggregate([
    { $match: { warehouse: { $in: warehouseIds }, quantity: { $gt: 0 } } },
    {
      $group: {
        _id: '$warehouse',
        totalProducts: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);

  const stockMap = new Map();
  stockAgg.forEach((item) => {
    stockMap.set(item._id.toString(), {
      totalProducts: item.totalProducts,
      totalQuantity: item.totalQuantity
    });
  });

  const enrichedWarehouses = warehouses.map((wh) => {
    const metrics = stockMap.get(wh._id.toString()) || { totalProducts: 0, totalQuantity: 0 };
    return {
      ...wh,
      totalProducts: metrics.totalProducts,
      totalQuantity: metrics.totalQuantity
    };
  });

  return enrichedWarehouses;
};

/**
 * Retrieve single warehouse by ID with inventory list
 */
const getWarehouseById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid warehouse ID format');
    error.statusCode = 400;
    throw error;
  }

  const warehouse = await Warehouse.findById(id).lean();
  if (!warehouse) {
    const error = new Error('Warehouse not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch stocks inside this warehouse
  const stocks = await Stock.find({ warehouse: id })
    .populate('product', 'name sku unitOfMeasure reorderLevel status')
    .lean();

  const totalProducts = stocks.filter((s) => s.quantity > 0).length;
  const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);

  return {
    ...warehouse,
    totalProducts,
    totalQuantity,
    stocks
  };
};

/**
 * Update warehouse by ID
 */
const updateWarehouse = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid warehouse ID format');
    error.statusCode = 400;
    throw error;
  }

  const warehouse = await Warehouse.findById(id);
  if (!warehouse) {
    const error = new Error('Warehouse not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.code && updateData.code.trim()) {
    const codeCandidate = updateData.code.trim().toUpperCase();
    if (codeCandidate !== warehouse.code) {
      const existing = await Warehouse.findOne({ code: codeCandidate, _id: { $ne: id } });
      if (existing) {
        const error = new Error(`Warehouse with code '${codeCandidate}' already exists`);
        error.statusCode = 400;
        throw error;
      }
      warehouse.code = codeCandidate;
    }
  }

  if (updateData.name && updateData.name.trim()) warehouse.name = updateData.name.trim();
  if (updateData.location !== undefined) warehouse.location = updateData.location.trim();
  if (updateData.description !== undefined) warehouse.description = updateData.description.trim();
  if (updateData.address !== undefined) warehouse.address = updateData.address.trim();
  if (updateData.city !== undefined) warehouse.city = updateData.city.trim();
  if (updateData.state !== undefined) warehouse.state = updateData.state.trim();
  if (updateData.postalCode !== undefined) warehouse.postalCode = updateData.postalCode.trim();
  if (updateData.contactPerson !== undefined) warehouse.contactPerson = updateData.contactPerson.trim();
  if (updateData.phone !== undefined) warehouse.phone = updateData.phone.trim();
  if (updateData.email !== undefined) warehouse.email = updateData.email.trim().toLowerCase();

  if (updateData.status) {
    warehouse.status = updateData.status;
    warehouse.isActive = updateData.status === 'active';
  }

  await warehouse.save();
  return warehouse.toJSON();
};

/**
 * Delete warehouse by ID (validates inventory before deletion)
 */
const deleteWarehouse = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid warehouse ID format');
    error.statusCode = 400;
    throw error;
  }

  const warehouse = await Warehouse.findById(id);
  if (!warehouse) {
    const error = new Error('Warehouse not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if warehouse has active stock
  const activeStock = await Stock.findOne({ warehouse: id, quantity: { $gt: 0 } });
  if (activeStock) {
    const error = new Error(
      `Cannot delete warehouse '${warehouse.name}' because it currently stores active inventory. Transfer or write off stock before deleting.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Clean up any 0-quantity stock records and delete warehouse
  await Stock.deleteMany({ warehouse: id });
  await Warehouse.findByIdAndDelete(id);

  return { message: `Warehouse '${warehouse.name}' (${warehouse.code}) deleted successfully` };
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse
};
