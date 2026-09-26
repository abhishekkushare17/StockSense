/**
 * StockSense Frontend Constants
 */

export const ROLES = {
  INVENTORY_MANAGER: 'Inventory Manager',
  WAREHOUSE_STAFF: 'Warehouse Staff',
};

export const ALL_ROLES = Object.values(ROLES);

export const TOKEN_STORAGE_KEY = 'stocksense_token';
export const USER_STORAGE_KEY = 'stocksense_user';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
