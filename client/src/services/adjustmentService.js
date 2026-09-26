import api from './api';

/**
 * Stock Adjustment Operations Service
 */

export const getAdjustments = async (params = {}) => {
  try {
    const response = await api.get('/adjustments', { params });
    return response.data?.data || { adjustments: [], pagination: {} };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch adjustments';
    throw new Error(message);
  }
};

export const getAdjustmentById = async (id) => {
  try {
    const response = await api.get(`/adjustments/${id}`);
    return response.data?.data?.adjustment || null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch adjustment details';
    throw new Error(message);
  }
};

export const createAdjustment = async (adjustmentData) => {
  try {
    const response = await api.post('/adjustments', adjustmentData);
    return response.data?.data?.adjustment;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create adjustment';
    throw new Error(message);
  }
};

export const validateAdjustment = async (id) => {
  try {
    const response = await api.patch(`/adjustments/${id}/validate`);
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to validate adjustment';
    throw new Error(message);
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
