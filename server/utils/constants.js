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

const OPERATION_STATUS = {
  DRAFT: 'Draft',
  WAITING: 'Waiting',
  READY: 'Ready',
  DONE: 'Done',
  CANCELED: 'Canceled'
};

const ALL_OPERATION_STATUSES = [
  'Draft',
  'Waiting',
  'Ready',
  'Done',
  'Canceled',
  'draft',
  'waiting',
  'ready',
  'done',
  'canceled',
  'completed',
  'pending',
  'shipped',
  'in_transit',
  'applied'
];

module.exports = {
  ROLES,
  ALL_ROLES,
  USER_STATUS,
  TRANSACTION_TYPES,
  OPERATION_STATUS,
  ALL_OPERATION_STATUSES,
  RECEIPT_STATUS: OPERATION_STATUS,
  DELIVERY_STATUS: OPERATION_STATUS,
  TRANSFER_STATUS: OPERATION_STATUS,
  ADJUSTMENT_STATUS: OPERATION_STATUS
};
