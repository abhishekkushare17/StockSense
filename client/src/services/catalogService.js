import api from './api';

/**
 * Catalog, Warehouse & Facility Service
 */

export const getWarehouses = async () => {
  const response = await api.get('/warehouses');
  return response.data?.data?.warehouses || [];
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data?.data?.categories || [];
};

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data?.data || { products: [], pagination: {} };
};

export default {
  getWarehouses,
  getCategories,
  getProducts
};
