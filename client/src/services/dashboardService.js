import api from './api';

/**
 * Dashboard & Inventory Analytics Service
 */

/**
 * Fetch high-level KPI summary
 * Returns: { totalProducts, lowStockItems, outOfStockItems, pendingReceipts, pendingDeliveries, scheduledTransfers }
 */
export const getDashboardSummary = async (params = {}) => {
  const response = await api.get('/dashboard/summary', { params });
  return response.data?.data || {};
};

/**
 * Fetch recent inventory movements from the Stock Ledger
 */
export const getRecentMovements = async (limit = 10, params = {}) => {
  const response = await api.get('/ledger', {
    params: { limit, sortOrder: 'desc', ...params }
  });
  return response.data?.data?.entries || [];
};

/**
 * Fetch products currently at or below minimum threshold
 */
export const getLowStockAlerts = async (params = {}) => {
  const response = await api.get('/stock', {
    params: { lowStock: true, ...params }
  });
  return response.data?.data?.stocks || [];
};

/**
 * Fetch entire stock distribution across products and warehouses
 */
export const getAllStockLevels = async (params = {}) => {
  const response = await api.get('/stock', { params });
  return response.data?.data || { stocks: [], summary: {} };
};

/**
 * Global search across Products, SKU, Receipts, Deliveries, Transfers
 */
export const searchGlobal = async (query) => {
  if (!query || query.trim().length === 0) return { products: [], receipts: [], deliveries: [], transfers: [] };
  const response = await api.get('/dashboard/search', { params: { q: query } });
  return response.data?.data || { products: [], receipts: [], deliveries: [], transfers: [] };
};

/**
 * Fetch stock distribution aggregated by warehouse
 */
export const getStockByWarehouse = async () => {
  const response = await api.get('/dashboard/stock-by-warehouse');
  return response.data?.data || [];
};

/**
 * Fetch smart reorder recommendations
 */
export const getSmartReorderRecommendations = async (params = {}) => {
  const response = await api.get('/dashboard/reorder-recommendations', { params });
  return response.data?.data || [];
};

export default {
  getDashboardSummary,
  getRecentMovements,
  getLowStockAlerts,
  getAllStockLevels,
  searchGlobal,
  getStockByWarehouse,
  getSmartReorderRecommendations
};
