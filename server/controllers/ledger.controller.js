const ledgerService = require('../services/ledger.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Stock Ledger Controller
 */

const getLedgerEntries = async (req, res, next) => {
  try {
    const data = await ledgerService.getLedgerEntries(req.query);
    return successResponse(res, 'Stock ledger entries retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getLedgerByProduct = async (req, res, next) => {
  try {
    const data = await ledgerService.getLedgerByProduct(req.params.productId, req.query);
    return successResponse(res, 'Product stock ledger history retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getLedgerById = async (req, res, next) => {
  try {
    const entry = await ledgerService.getLedgerById(req.params.id);
    return successResponse(res, 'Ledger entry details retrieved successfully', { entry }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLedgerEntries,
  getLedgerByProduct,
  getLedgerById
};
