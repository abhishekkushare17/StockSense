const stockService = require('../services/stock.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Stock & Low-Stock Controller
 */

const getAllStock = async (req, res, next) => {
  try {
    const data = await stockService.getAllStock(req.query);
    return successResponse(res, 'Stock records retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getStockByProduct = async (req, res, next) => {
  try {
    const data = await stockService.getStockByProduct(req.params.productId);
    return successResponse(res, 'Product stock retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getStockByWarehouse = async (req, res, next) => {
  try {
    const data = await stockService.getStockByWarehouse(req.params.warehouseId);
    return successResponse(res, 'Warehouse stock retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getLowStockReport = async (req, res, next) => {
  try {
    const data = await stockService.getLowStockReport();
    return successResponse(res, 'Low stock inventory report generated', data, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStock,
  getStockByProduct,
  getStockByWarehouse,
  getLowStockReport
};
