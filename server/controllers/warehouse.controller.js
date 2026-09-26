const warehouseService = require('../services/warehouse.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Warehouse Controller
 */

const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.createWarehouse(req.body);
    return successResponse(res, 'Warehouse created successfully', { warehouse }, 201);
  } catch (error) {
    next(error);
  }
};

const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await warehouseService.getWarehouses(req.query);
    return successResponse(res, 'Warehouses retrieved successfully', { warehouses }, 200);
  } catch (error) {
    next(error);
  }
};

const getWarehouseById = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.getWarehouseById(req.params.id);
    return successResponse(res, 'Warehouse details retrieved successfully', { warehouse }, 200);
  } catch (error) {
    next(error);
  }
};

const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
    const { logAudit } = require('../utils/auditLogger');
    logAudit({
      user: req.user,
      action: 'Warehouse Updated',
      module: 'Warehouses',
      recordId: warehouse._id,
      newValue: req.body,
      ipAddress: req.ip || ''
    });
    return successResponse(res, 'Warehouse updated successfully', { warehouse }, 200);
  } catch (error) {
    next(error);
  }
};

const deleteWarehouse = async (req, res, next) => {
  try {
    const result = await warehouseService.deleteWarehouse(req.params.id);
    return successResponse(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse
};
