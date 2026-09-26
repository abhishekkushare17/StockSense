import api from './api';

/**
 * Category Management Service
 */

export const getCategories = async (params = {}) => {
  const response = await api.get('/categories', { params });
  return response.data?.data?.categories || [];
};

export const createCategory = async (data) => {
  try {
    const response = await api.post('/categories', data);
    return response.data?.data?.category;
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('code')) {
      throw new Error(`Category code "${data.code}" already exists. Please choose a different code.`);
    }
    throw err;
  }
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data?.data?.category;
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('product')) {
      throw new Error('Cannot delete this category because active products are assigned to it. Please reassign or delete those products first.');
    }
    throw err;
  }
};

export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};

export default categoryService;
