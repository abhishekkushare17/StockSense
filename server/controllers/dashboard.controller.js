const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Dashboard Controller
 */

const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary(req.query);
    return successResponse(res, 'Dashboard summary retrieved successfully', summary, 200);
  } catch (error) {
    next(error);
  }
};

const searchGlobal = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || '';
    const results = await dashboardService.globalSearch(query);
    return successResponse(res, 'Global search results', results, 200);
  } catch (error) {
    next(error);
  }
};

const getStockByWarehouse = async (req, res, next) => {
  try {
    const data = await dashboardService.getStockByWarehouse();
    return successResponse(res, 'Stock by warehouse retrieved', data, 200);
  } catch (error) {
    next(error);
  }
};

const getReorderRecommendations = async (req, res, next) => {
  try {
    const data = await dashboardService.getSmartReorderRecommendations(req.query);
    return successResponse(res, 'Smart reorder recommendations generated successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  searchGlobal,
  getStockByWarehouse,
  getReorderRecommendations
};
