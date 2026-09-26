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

module.exports = {
  getDashboardSummary
};
