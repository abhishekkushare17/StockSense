import api from './api';

/**
 * Service for interacting with Warehouse APIs
 */

export const getWarehouses = async (params = {}) => {
  try {
    const response = await api.get('/warehouses', { params });
    return response.data?.data?.warehouses || [];
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch warehouses';
    throw new Error(message);
  }
};

export const getWarehouseById = async (id) => {
  try {
    const response = await api.get(`/warehouses/${id}`);
    return response.data?.data?.warehouse || null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch warehouse details';
    throw new Error(message);
  }
};

export const createWarehouse = async (warehouseData) => {
  try {
    const response = await api.post('/warehouses', warehouseData);
    return response.data?.data?.warehouse;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create warehouse';
    throw new Error(message);
  }
};

export const updateWarehouse = async (id, warehouseData) => {
  try {
    const response = await api.put(`/warehouses/${id}`, warehouseData);
    return response.data?.data?.warehouse;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update warehouse';
    throw new Error(message);
  }
};

export const deleteWarehouse = async (id) => {
  try {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete warehouse';
    throw new Error(message);
  }
};
