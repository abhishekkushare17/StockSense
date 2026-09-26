import api from './api';

/**
 * Service for interacting with Stock APIs
 */

export const getAllStock = async (params = {}) => {
  try {
    const response = await api.get('/stock', { params });
    return response.data?.data || { stocks: [], summary: {} };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch stock records';
    throw new Error(message);
  }
};

export const getLowStockReport = async () => {
  try {
    const response = await api.get('/stock/low-stock');
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch low stock report';
    throw new Error(message);
  }
};

export const getStockByProduct = async (productId) => {
  try {
    const response = await api.get(`/stock/product/${productId}`);
    return response.data?.data || null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch product stock';
    throw new Error(message);
  }
};

export const getStockByWarehouse = async (warehouseId) => {
  try {
    const response = await api.get(`/stock/warehouse/${warehouseId}`);
    return response.data?.data || null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch warehouse stock';
    throw new Error(message);
  }
};
