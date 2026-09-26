import api from './api';

/**
 * Receipt Operations Service
 */

export const getReceipts = async (params = {}) => {
  try {
    const response = await api.get('/receipts', { params });
    return response.data?.data || { receipts: [], pagination: {} };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch receipts';
    throw new Error(message);
  }
};

export const getReceiptById = async (id) => {
  try {
    const response = await api.get(`/receipts/${id}`);
    return response.data?.data?.receipt || null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch receipt details';
    throw new Error(message);
  }
};

export const createReceipt = async (receiptData) => {
  try {
    const response = await api.post('/receipts', receiptData);
    return response.data?.data?.receipt;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create receipt';
    throw new Error(message);
  }
};

export const updateReceipt = async (id, receiptData) => {
  try {
    const response = await api.put(`/receipts/${id}`, receiptData);
    return response.data?.data?.receipt;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update receipt';
    throw new Error(message);
  }
};

export const validateReceipt = async (id) => {
  try {
    const response = await api.patch(`/receipts/${id}/validate`);
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to validate receipt';
    throw new Error(message);
  }
};
