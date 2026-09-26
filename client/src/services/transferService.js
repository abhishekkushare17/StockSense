import api from './api';

/**
 * Internal Transfer Operations Service
 */

export const getTransfers = async (params = {}) => {
  try {
    const response = await api.get('/transfers', { params });
    return response.data?.data || { transfers: [], pagination: {} };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch internal transfers';
    throw new Error(message);
  }
};

export const getTransferById = async (id) => {
  try {
    const response = await api.get(`/transfers/${id}`);
    return response.data?.data?.transfer || null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch transfer details';
    throw new Error(message);
  }
};

export const createTransfer = async (transferData) => {
  try {
    const response = await api.post('/transfers', transferData);
    return response.data?.data?.transfer;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create internal transfer';
    throw new Error(message);
  }
};

export const validateTransfer = async (id) => {
  try {
    const response = await api.patch(`/transfers/${id}/validate`);
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to validate internal transfer';
    throw new Error(message);
  }
};
