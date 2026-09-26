import api from './api';

/**
 * Move History / Stock Ledger Operations Service
 */

export const getMoves = async (params = {}) => {
  try {
    // Primary endpoint: /moves (supporting route), fallback to /ledger
    const response = await api.get('/moves', { params }).catch(() => api.get('/ledger', { params }));
    return response.data?.data || { entries: [], pagination: {} };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch move history';
    throw new Error(message);
  }
};

export const getMoveById = async (id) => {
  try {
    const response = await api.get(`/moves/${id}`).catch(() => api.get(`/ledger/${id}`));
    return response.data?.data?.entry || null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch movement details';
    throw new Error(message);
  }
};
