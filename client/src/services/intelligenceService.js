import api from './api';

/**
 * Service for StockSense Inventory Intelligence Platform
 */

export const getDailyActions = async () => {
  try {
    const response = await api.get('/intelligence/daily-actions');
    return response.data?.data || { greeting: '', totalActionsCount: 0, summary: {}, actions: [] };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch daily actions';
    throw new Error(message);
  }
};

export const getStockForecast = async (params = {}) => {
  try {
    const response = await api.get('/intelligence/stock-forecast', { params });
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to generate stock forecasts';
    throw new Error(message);
  }
};

export const getRiskRadar = async () => {
  try {
    const response = await api.get('/intelligence/risk-radar');
    return response.data?.data || { categories: {}, totalIssuesCount: 0 };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to calculate risk radar';
    throw new Error(message);
  }
};

export const getAnomalies = async (status = 'ALL') => {
  try {
    const response = await api.get('/intelligence/anomalies', { params: { status } });
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to retrieve anomalies';
    throw new Error(message);
  }
};

export const reviewAnomaly = async (id, data) => {
  try {
    const response = await api.patch(`/intelligence/anomalies/${id}/review`, data);
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update anomaly';
    throw new Error(message);
  }
};

export const simulateInventory = async (simulationData) => {
  try {
    const response = await api.post('/intelligence/simulate', simulationData);
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to run what-if simulation';
    throw new Error(message);
  }
};

export const applySimulation = async (simulationData) => {
  try {
    const response = await api.post('/intelligence/apply-simulation', simulationData);
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to apply simulation to real inventory';
    throw new Error(message);
  }
};

export const findStockLocations = async (query) => {
  try {
    const response = await api.get('/intelligence/stock-location', { params: { q: query } });
    return response.data?.data || { found: false, results: [] };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to search stock locations';
    throw new Error(message);
  }
};

export const explainStockNumber = async (productId, warehouseId = null) => {
  try {
    const params = warehouseId ? { warehouseId } : {};
    const response = await api.get(`/intelligence/stock-explanation/${productId}`, { params });
    return response.data?.data || null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to explain stock calculation';
    throw new Error(message);
  }
};

export const intelligenceService = {
  getDailyActions,
  getStockForecast,
  getRiskRadar,
  getAnomalies,
  reviewAnomaly,
  simulateInventory,
  applySimulation,
  findStockLocations,
  explainStockNumber
};

export default intelligenceService;
