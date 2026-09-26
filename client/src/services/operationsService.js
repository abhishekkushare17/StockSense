import api from './api';

/**
 * Unified Operations Service for Inventory Operations
 * - Receipts
 * - Deliveries
 * - Internal Transfers
 * - Stock Adjustments
 * - Move History & Ledger
 */

// Format user-friendly error message
export const handleApiError = (error, defaultMessage = 'Operation failed') => {
  if (error.response) {
    const data = error.response.data;
    if (data && data.message) {
      return data.message;
    }
    if (data && data.error) {
      return data.error;
    }
    return `Server error (${error.response.status}): ${defaultMessage}`;
  }
  if (error.request) {
    return 'Network connection error. Please verify backend server connectivity.';
  }
  return error.message || defaultMessage;
};

// ----------------------------------------
// 1. Inbound Receipts API
// ----------------------------------------

export const getReceipts = async (params = {}) => {
  try {
    const response = await api.get('/receipts', { params });
    return response.data?.data || { receipts: [], pagination: {} };
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch receipts'));
  }
};

export const getReceiptById = async (id) => {
  try {
    const response = await api.get(`/receipts/${id}`);
    return response.data?.data?.receipt || null;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch receipt details'));
  }
};

export const createReceipt = async (receiptData) => {
  try {
    const response = await api.post('/receipts', receiptData);
    return response.data?.data?.receipt;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to create receipt'));
  }
};

export const updateReceipt = async (id, receiptData) => {
  try {
    const response = await api.put(`/receipts/${id}`, receiptData);
    return response.data?.data?.receipt;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to update receipt'));
  }
};

export const validateReceipt = async (id) => {
  try {
    const response = await api.patch(`/receipts/${id}/validate`);
    return response.data?.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to validate receipt'));
  }
};

// ----------------------------------------
// 2. Outbound Deliveries API
// ----------------------------------------

export const getDeliveries = async (params = {}) => {
  try {
    const response = await api.get('/deliveries', { params });
    return response.data?.data || { deliveries: [], pagination: {} };
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch delivery orders'));
  }
};

export const getDeliveryById = async (id) => {
  try {
    const response = await api.get(`/deliveries/${id}`);
    return response.data?.data?.delivery || null;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch delivery details'));
  }
};

export const createDelivery = async (deliveryData) => {
  try {
    const response = await api.post('/deliveries', deliveryData);
    return response.data?.data?.delivery;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to create delivery order'));
  }
};

export const updateDelivery = async (id, deliveryData) => {
  try {
    const response = await api.put(`/deliveries/${id}`, deliveryData);
    return response.data?.data?.delivery;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to update delivery order'));
  }
};

export const validateDelivery = async (id) => {
  try {
    const response = await api.patch(`/deliveries/${id}/validate`);
    return response.data?.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to validate delivery order'));
  }
};

// ----------------------------------------
// 3. Internal Transfers API
// ----------------------------------------

export const getTransfers = async (params = {}) => {
  try {
    const response = await api.get('/transfers', { params });
    return response.data?.data || { transfers: [], pagination: {} };
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch internal transfers'));
  }
};

export const getTransferById = async (id) => {
  try {
    const response = await api.get(`/transfers/${id}`);
    return response.data?.data?.transfer || null;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch transfer details'));
  }
};

export const createTransfer = async (transferData) => {
  try {
    const response = await api.post('/transfers', transferData);
    return response.data?.data?.transfer;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to create internal transfer'));
  }
};

export const validateTransfer = async (id) => {
  try {
    const response = await api.patch(`/transfers/${id}/validate`);
    return response.data?.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to validate internal transfer'));
  }
};

// ----------------------------------------
// 4. Stock Adjustments API
// ----------------------------------------

export const getAdjustments = async (params = {}) => {
  try {
    const response = await api.get('/adjustments', { params });
    return response.data?.data || { adjustments: [], pagination: {} };
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch adjustments'));
  }
};

export const getAdjustmentById = async (id) => {
  try {
    const response = await api.get(`/adjustments/${id}`);
    return response.data?.data?.adjustment || null;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch adjustment details'));
  }
};

export const createAdjustment = async (adjustmentData) => {
  try {
    const response = await api.post('/adjustments', adjustmentData);
    return response.data?.data?.adjustment;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to create adjustment'));
  }
};

export const validateAdjustment = async (id) => {
  try {
    const response = await api.patch(`/adjustments/${id}/validate`);
    return response.data?.data;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to validate adjustment'));
  }
};

export const fetchCurrentStockForProduct = async (productId, warehouseId) => {
  try {
    const res = await api.get('/stock', {
      params: { product: productId, warehouse: warehouseId }
    });
    const stocks = res.data?.data?.stocks || [];
    if (stocks.length > 0) {
      return stocks[0].quantity ?? 0;
    }
    return 0;
  } catch {
    return 0;
  }
};

// ----------------------------------------
// 5. Move History & Stock Ledger API
// ----------------------------------------

export const getMoves = async (params = {}) => {
  try {
    const response = await api
      .get('/moves', { params })
      .catch(() => api.get('/ledger', { params }));
    return response.data?.data || { entries: [], pagination: {} };
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch move history'));
  }
};

export const getMoveById = async (id) => {
  try {
    const response = await api
      .get(`/moves/${id}`)
      .catch(() => api.get(`/ledger/${id}`));
    return response.data?.data?.entry || null;
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch move details'));
  }
};

export default {
  getReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  validateReceipt,
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  validateDelivery,
  getTransfers,
  getTransferById,
  createTransfer,
  validateTransfer,
  getAdjustments,
  getAdjustmentById,
  createAdjustment,
  validateAdjustment,
  fetchCurrentStockForProduct,
  getMoves,
  getMoveById
};
