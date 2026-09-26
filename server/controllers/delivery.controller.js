const deliveryService = require('../services/delivery.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Delivery Orders Controller
 */

const createDelivery = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const delivery = await deliveryService.createDelivery(req.body, userId);
    const { logAudit } = require('../utils/auditLogger');
    logAudit({
      user: req.user,
      action: 'Delivery Created',
      module: 'Deliveries',
      recordId: delivery._id,
      newValue: { deliveryNumber: delivery.deliveryNumber, customer: delivery.customer },
      ipAddress: req.ip || ''
    });
    return successResponse(res, 'Delivery order created successfully', { delivery }, 201);
  } catch (error) {
    next(error);
  }
};

const getDeliveries = async (req, res, next) => {
  try {
    const data = await deliveryService.getDeliveries(req.query);
    return successResponse(res, 'Delivery orders retrieved successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await deliveryService.getDeliveryById(req.params.id);
    return successResponse(res, 'Delivery order details retrieved successfully', { delivery }, 200);
  } catch (error) {
    next(error);
  }
};

const updateDelivery = async (req, res, next) => {
  try {
    const delivery = await deliveryService.updateDelivery(req.params.id, req.body);
    return successResponse(res, 'Delivery order updated successfully', { delivery }, 200);
  } catch (error) {
    next(error);
  }
};

const validateDelivery = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const data = await deliveryService.validateDelivery(req.params.id, userId);
    const { logAudit } = require('../utils/auditLogger');
    logAudit({
      user: req.user,
      action: 'Delivery Validated',
      module: 'Deliveries',
      recordId: req.params.id,
      details: { itemsCount: data.delivery?.items?.length },
      ipAddress: req.ip || ''
    });
    return successResponse(res, 'Delivery order validated and stock deducted successfully', data, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  validateDelivery
};
