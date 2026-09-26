const User = require('./User');
const Warehouse = require('./Warehouse');
const Category = require('./Category');
const Product = require('./Product');
const Stock = require('./Stock');
const Receipt = require('./Receipt');
const Delivery = require('./Delivery');
const InternalTransfer = require('./InternalTransfer');
const StockAdjustment = require('./StockAdjustment');
const StockLedger = require('./StockLedger');

module.exports = {
  User,
  Warehouse,
  Category,
  Product,
  Stock,
  Receipt,
  Delivery,
  InternalTransfer,
  StockAdjustment,
  StockLedger
};
