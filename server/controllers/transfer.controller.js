const transferService = require('../services/transfer.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Internal Transfer Controller
 */

const createTransfer = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const transfer = await transferService.createTransfer(req.body, userId);
    return successResponse(res, 'Internal transfer created successfully', { transfer }, 201);
  } catch (error) {
    next(error);
  }
};

const getTransfers = async (req, res, next) => {
  try {
    const data = await transferService.getTransfers(req.query);
    return successResponse(res, 'Transfers retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getTransferById = async (req, res, next) => {
  try {
    const transfer = await transferService.getTransferById(req.params.id);
    return successResponse(res, 'Transfer details retrieved successfully', { transfer }, 200);
  } catch (error) {
    next(error);
  }
};

const validateTransfer = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const data = await transferService.validateTransfer(req.params.id, userId);
    return successResponse(res, 'Transfer validated and stock moved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransfer,
  getTransfers,
  getTransferById,
  validateTransfer
};
