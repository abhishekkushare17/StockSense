/**
 * StockSense System Constants
 */

const ROLES = {
  INVENTORY_MANAGER: 'Inventory Manager',
  WAREHOUSE_STAFF: 'Warehouse Staff'
};

const ALL_ROLES = Object.values(ROLES);

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

const TRANSACTION_TYPES = {
  RECEIPT: 'RECEIPT',
  DELIVERY: 'DELIVERY',
  TRANSFER_IN: 'TRANSFER_IN',
  TRANSFER_OUT: 'TRANSFER_OUT',
  ADJUSTMENT: 'ADJUSTMENT'
};

const RECEIPT_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const DELIVERY_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled'
};

const TRANSFER_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const ADJUSTMENT_STATUS = {
  DRAFT: 'draft',
  APPLIED: 'applied',
  CANCELLED: 'cancelled'
};

module.exports = {
  ROLES,
  ALL_ROLES,
  USER_STATUS,
  TRANSACTION_TYPES,
  RECEIPT_STATUS,
  DELIVERY_STATUS,
  TRANSFER_STATUS,
  ADJUSTMENT_STATUS
};
