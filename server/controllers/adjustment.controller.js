const adjustmentService = require('../services/adjustment.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Stock Adjustment Controller
 */

const createAdjustment = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const adjustment = await adjustmentService.createAdjustment(req.body, userId);
    const { logAudit } = require('../utils/auditLogger');
    logAudit({
      user: req.user,
      action: 'Adjustment Created',
      module: 'Adjustments',
      recordId: adjustment._id,
      newValue: { difference: adjustment.difference, reason: adjustment.reason },
      ipAddress: req.ip || ''
    });
    return successResponse(res, 'Stock adjustment created successfully', { adjustment }, 201);
  } catch (error) {
    next(error);
  }
};

const getAdjustments = async (req, res, next) => {
  try {
    const data = await adjustmentService.getAdjustments(req.query);
    return successResponse(res, 'Stock adjustments retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getAdjustmentById = async (req, res, next) => {
  try {
    const adjustment = await adjustmentService.getAdjustmentById(req.params.id);
    return successResponse(res, 'Stock adjustment details retrieved successfully', { adjustment }, 200);
  } catch (error) {
    next(error);
  }
};

const validateAdjustment = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const adjustment = await adjustmentService.validateAdjustment(req.params.id, userId);
    return successResponse(res, 'Stock adjustment validated and applied successfully', { adjustment }, 200);
  } catch (error) {
    next(error);
  }
};

const updateAdjustment = async (req, res, next) => {
  try {
    const adjustment = await adjustmentService.updateAdjustment(req.params.id, req.body);
    return successResponse(res, 'Stock adjustment updated successfully', { adjustment }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdjustment,
  getAdjustments,
  getAdjustmentById,
  validateAdjustment,
  updateAdjustment
};
