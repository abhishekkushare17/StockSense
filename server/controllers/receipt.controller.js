const receiptService = require('../services/receipt.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Receipt Controller
 */

const createReceipt = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const receipt = await receiptService.createReceipt(req.body, userId);
    const { logAudit } = require('../utils/auditLogger');
    logAudit({
      user: req.user,
      action: 'Receipt Created',
      module: 'Receipts',
      recordId: receipt._id,
      newValue: { receiptNumber: receipt.receiptNumber, supplier: receipt.supplier },
      ipAddress: req.ip || ''
    });
    return successResponse(res, 'Receipt created successfully', { receipt }, 201);
  } catch (error) {
    next(error);
  }
};

const getReceipts = async (req, res, next) => {
  try {
    const data = await receiptService.getReceipts(req.query);
    return successResponse(res, 'Receipts retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getReceiptById = async (req, res, next) => {
  try {
    const receipt = await receiptService.getReceiptById(req.params.id);
    return successResponse(res, 'Receipt details retrieved successfully', { receipt }, 200);
  } catch (error) {
    next(error);
  }
};

const updateReceipt = async (req, res, next) => {
  try {
    const receipt = await receiptService.updateReceipt(req.params.id, req.body);
    return successResponse(res, 'Receipt updated successfully', { receipt }, 200);
  } catch (error) {
    next(error);
  }
};

const validateReceipt = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const data = await receiptService.validateReceipt(req.params.id, userId);
    const { logAudit } = require('../utils/auditLogger');
    logAudit({
      user: req.user,
      action: 'Receipt Validated',
      module: 'Receipts',
      recordId: req.params.id,
      details: { itemsCount: data.receipt?.items?.length },
      ipAddress: req.ip || ''
    });
    return successResponse(res, 'Receipt validated and stock updated successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  validateReceipt
};
