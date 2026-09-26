const mongoose = require('mongoose');
const { Category, Product } = require('../models');

/**
 * Category Management Service
 */

/**
 * Create a new category
 */
const createCategory = async (data) => {
  const { name, code, description = '', status = 'active' } = data;

  if (!name || !name.trim()) {
    const error = new Error('Category name is required');
    error.statusCode = 400;
    throw error;
  }

  if (!code || !code.trim()) {
    const error = new Error('Category code is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedName = name.trim();
  const normalizedCode = code.trim().toUpperCase();

  // Check unique code
  const existingCode = await Category.findOne({ code: normalizedCode });
  if (existingCode) {
    const error = new Error(`Category with code '${normalizedCode}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  // Check unique name
  const existingName = await Category.findOne({ name: new RegExp(`^${normalizedName}$`, 'i') });
  if (existingName) {
    const error = new Error(`Category with name '${normalizedName}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  const category = new Category({
    name: normalizedName,
    code: normalizedCode,
    description: (description || '').trim(),
    status,
    isActive: status === 'active'
  });

  await category.save();
  return category.toJSON();
};

/**
 * Retrieve all categories with product counts
 */
const getCategories = async (queryParams = {}) => {
  const { search, status } = queryParams;
  const filter = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { code: searchRegex }, { description: searchRegex }];
  }

  if (status && (status === 'active' || status === 'inactive')) {
    filter.status = status;
  }

  const categories = await Category.find(filter).sort({ name: 1 }).lean();

  // Attach product counts for each category
  const categoryIds = categories.map((c) => c._id);
  const productCounts = await Product.aggregate([
    { $match: { category: { $in: categoryIds } } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const countMap = new Map();
  productCounts.forEach((item) => {
    countMap.set(item._id.toString(), item.count);
  });

  const enrichedCategories = categories.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat._id.toString()) || 0
  }));

  return enrichedCategories;
};

/**
 * Retrieve single category by ID
 */
const getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid category ID format');
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(id).lean();
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const productCount = await Product.countDocuments({ category: id });
  return {
    ...category,
    productCount
  };
};

/**
 * Update category by ID
 */
const updateCategory = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid category ID format');
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  if (updateData.name && updateData.name.trim()) {
    const nameCandidate = updateData.name.trim();
    const existing = await Category.findOne({
      name: new RegExp(`^${nameCandidate}$`, 'i'),
      _id: { $ne: id }
    });
    if (existing) {
      const error = new Error(`Category with name '${nameCandidate}' already exists`);
      error.statusCode = 400;
      throw error;
    }
    category.name = nameCandidate;
  }

  if (updateData.code && updateData.code.trim()) {
    const codeCandidate = updateData.code.trim().toUpperCase();
    const existing = await Category.findOne({ code: codeCandidate, _id: { $ne: id } });
    if (existing) {
      const error = new Error(`Category with code '${codeCandidate}' already exists`);
      error.statusCode = 400;
      throw error;
    }
    category.code = codeCandidate;
  }

  if (updateData.description !== undefined) {
    category.description = updateData.description.trim();
  }

  if (updateData.status) {
    category.status = updateData.status;
    category.isActive = updateData.status === 'active';
  }

  await category.save();
  return category.toJSON();
};

/**
 * Delete category by ID (safe check for assigned products)
 */
const deleteCategory = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid category ID format');
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    const error = new Error(
      `Cannot delete category '${category.name}' because it is assigned to ${productCount} product(s). Reassign products before deleting.`
    );
    error.statusCode = 400;
    throw error;
  }

  await Category.findByIdAndDelete(id);
  return { message: `Category '${category.name}' (${category.code}) deleted successfully` };
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
