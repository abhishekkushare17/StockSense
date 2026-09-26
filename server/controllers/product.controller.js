const productService = require('../services/product.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Product Controller
 */

const createProduct = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const product = await productService.createProduct(req.body, userId);
    const { logAudit } = require('../utils/auditLogger');
    logAudit({
      user: req.user,
      action: 'Product Created',
      module: 'Products',
      recordId: product._id,
      newValue: { name: product.name, sku: product.sku },
      ipAddress: req.ip || ''
    });
    return successResponse(res, 'Product created successfully', { product }, 201);
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const data = await productService.getProducts(req.query);
    return successResponse(res, 'Products retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return successResponse(res, 'Product details retrieved successfully', { product }, 200);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    const { logAudit } = require('../utils/auditLogger');
    logAudit({
      user: req.user,
      action: 'Product Updated',
      module: 'Products',
      recordId: product._id,
      newValue: req.body,
      ipAddress: req.ip || ''
    });
    return successResponse(res, 'Product updated successfully', { product }, 200);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    const { logAudit } = require('../utils/auditLogger');
    logAudit({
      user: req.user,
      action: 'Product Deleted',
      module: 'Products',
      recordId: req.params.id,
      ipAddress: req.ip || ''
    });
    return successResponse(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
