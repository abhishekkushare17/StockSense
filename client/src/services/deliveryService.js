import api from './api';

/**
 * Delivery Operations Service
 */

export const getDeliveries = async (params = {}) => {
  try {
    const response = await api.get('/deliveries', { params });
    return response.data?.data || { deliveries: [], pagination: {} };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch deliveries';
    throw new Error(message);
  }
};

export const getDeliveryById = async (id) => {
  try {
    const response = await api.get(`/deliveries/${id}`);
    return response.data?.data?.delivery || null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch delivery details';
    throw new Error(message);
  }
};

export const createDelivery = async (deliveryData) => {
  try {
    const response = await api.post('/deliveries', deliveryData);
    return response.data?.data?.delivery;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create delivery order';
    throw new Error(message);
  }
};

export const updateDelivery = async (id, deliveryData) => {
  try {
    const response = await api.put(`/deliveries/${id}`, deliveryData);
    return response.data?.data?.delivery;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update delivery order';
    throw new Error(message);
  }
};

export const validateDelivery = async (id) => {
  try {
    const response = await api.patch(`/deliveries/${id}/validate`);
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to validate delivery order';
    throw new Error(message);
  }
};
