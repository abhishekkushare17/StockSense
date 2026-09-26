const intelligenceService = require('../services/intelligence.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Controller for StockSense Intelligence Endpoints
 */

const getDailyActions = async (req, res, next) => {
  try {
    const data = await intelligenceService.getDailyActions(req.user);
    return successResponse(res, 'Daily actions retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getStockForecast = async (req, res, next) => {
  try {
    const data = await intelligenceService.getStockForecast(req.query);
    return successResponse(res, 'Stock forecasts generated successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getRiskRadar = async (req, res, next) => {
  try {
    const data = await intelligenceService.getRiskRadar();
    return successResponse(res, 'Risk radar assessment calculated successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getAnomalies = async (req, res, next) => {
  try {
    const data = await intelligenceService.getAnomalies(req.query.status);
    return successResponse(res, 'Inventory anomalies retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const reviewAnomaly = async (req, res, next) => {
  try {
    const data = await intelligenceService.reviewAnomaly(req.params.id, req.body, req.user?._id);
    return successResponse(res, 'Anomaly review updated successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const simulateInventory = async (req, res, next) => {
  try {
    const data = await intelligenceService.simulateInventory(req.body);
    return successResponse(res, 'What-If simulation calculated successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const applySimulation = async (req, res, next) => {
  try {
    const data = await intelligenceService.applySimulation(req.body, req.user?._id);
    return successResponse(res, 'Simulation applied to real inventory records', data, 200);
  } catch (error) {
    next(error);
  }
};

const findStockLocations = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || '';
    const data = await intelligenceService.findStockLocations(query);
    return successResponse(res, 'Stock locations retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const explainStockNumber = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { warehouseId } = req.query;
    const data = await intelligenceService.explainStockNumber(productId, warehouseId);
    return successResponse(res, 'Stock breakdown and ledger timeline explained', data, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyActions,
  getStockForecast,
  getRiskRadar,
  getAnomalies,
  reviewAnomaly,
  simulateInventory,
  applySimulation,
  findStockLocations,
  explainStockNumber
};
