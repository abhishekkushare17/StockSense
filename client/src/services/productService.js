import api from './api';

/**
 * Product Master & Inventory Service
 */

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data?.data || { products: [], pagination: {} };
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data?.data?.product || null;
};

export const createProduct = async (data) => {
  try {
    const response = await api.post('/products', data);
    return response.data?.data?.product;
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('already exists')) {
      throw new Error(`SKU "${data.sku}" is already in use by another product. Please specify a unique code.`);
    }
    throw err;
  }
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data?.data?.product;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
