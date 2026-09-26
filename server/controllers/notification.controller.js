const mongoose = require('mongoose');
const { Product, Stock, Receipt, Delivery, InternalTransfer, Notification } = require('../models');
const { successResponse } = require('../utils/apiResponse');

/**
 * Retrieve notifications (combining live alerts and recorded notifications)
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = [];

    // 1. Query stocks to detect Out of Stock and Low Stock
    const stocks = await Stock.find({ quantity: { $gte: 0 } })
      .populate('product', 'name sku reorderLevel unitOfMeasure')
      .populate('warehouse', 'name code')
      .lean();

    for (const s of stocks) {
      if (!s.product || !s.warehouse) continue;
      const reorder = s.product.reorderLevel ?? 10;
      if (s.quantity === 0) {
        notifications.push({
          id: `out-${s._id}`,
          type: 'OUT_OF_STOCK',
          title: 'Out of Stock Alert',
          message: `${s.product.name} (${s.product.sku}) has 0 available units in ${s.warehouse.name}.`,
          timestamp: s.updatedAt || new Date(),
          severity: 'danger',
          link: '/products?outOfStock=true'
        });
      } else if (s.quantity <= reorder) {
        notifications.push({
          id: `low-${s._id}`,
          type: 'LOW_STOCK',
          title: 'Low Stock Alert',
          message: `${s.product.name} (${s.product.sku}) stock is low: ${s.quantity} ${s.product.unitOfMeasure || 'units'} (Reorder at ${reorder}) in ${s.warehouse.name}.`,
          timestamp: s.updatedAt || new Date(),
          severity: 'warning',
          link: '/products?lowStock=true'
        });
      }
    }

    // 2. Query Pending Receipts
    const pendingReceipts = await Receipt.find({
      status: { $in: ['Draft', 'Waiting', 'Ready'] }
    })
      .populate('warehouse', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    for (const r of pendingReceipts) {
      notifications.push({
        id: `rec-${r._id}`,
        type: 'RECEIPT_PENDING',
        title: 'Pending Inbound Receipt',
        message: `Receipt ${r.receiptNumber} from ${r.supplier || 'Supplier'} is awaiting validation at ${r.warehouse?.name || 'facility'}.`,
        timestamp: r.createdAt,
        severity: 'info',
        link: '/receipts'
      });
    }

    // 3. Query Pending Deliveries
    const pendingDeliveries = await Delivery.find({
      status: { $in: ['Draft', 'Waiting', 'Ready'] }
    })
      .populate('warehouse', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    for (const d of pendingDeliveries) {
      notifications.push({
        id: `del-${d._id}`,
        type: 'DELIVERY_PENDING',
        title: 'Pending Delivery Order',
        message: `Delivery ${d.deliveryNumber} for ${d.customer || 'Customer'} requires fulfillment at ${d.warehouse?.name || 'facility'}.`,
        timestamp: d.createdAt,
        severity: 'purple',
        link: '/deliveries'
      });
    }

    // 4. Query Recent Transfers
    const recentTransfers = await InternalTransfer.find()
      .populate('sourceWarehouse', 'name')
      .populate('destinationWarehouse', 'name')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    for (const t of recentTransfers) {
      notifications.push({
        id: `tr-${t._id}`,
        type: 'TRANSFER_UPDATE',
        title: 'Internal Transfer Update',
        message: `Transfer ${t.transferNumber} (${t.status}): ${t.sourceWarehouse?.name || 'Origin'} → ${t.destinationWarehouse?.name || 'Destination'}.`,
        timestamp: t.updatedAt || t.createdAt,
        severity: 'neutral',
        link: '/transfers'
      });
    }

    // Sort notifications by timestamp descending
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return successResponse(res, 'Notifications retrieved successfully', {
      notifications,
      totalAlerts: notifications.length,
      unreadCount: notifications.filter((n) => n.severity === 'danger' || n.severity === 'warning').length
    }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications
};
