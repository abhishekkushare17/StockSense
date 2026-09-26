const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const {
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
} = require('../models');

test('Database Foundation - All 10 models instantiate with valid schema validation', () => {
  // Test User instantiation
  const user = new User({
    name: 'Alice Manager',
    email: 'alice@stocksense.com',
    password: 'securepassword123',
    role: 'Inventory Manager'
  });
  assert.equal(user.name, 'Alice Manager');
  assert.equal(user.role, 'Inventory Manager');

  // Test Warehouse
  const warehouse = new Warehouse({
    name: 'Main Distribution Center',
    code: 'WH-MAIN-01',
    city: 'Chicago',
    state: 'IL'
  });
  assert.equal(warehouse.code, 'WH-MAIN-01');

  // Test Category
  const category = new Category({
    name: 'Electronics',
    code: 'CAT-ELEC',
    description: 'Hardware and electronic components'
  });
  assert.equal(category.code, 'CAT-ELEC');

  // Test Product
  const product = new Product({
    name: 'Barcode Scanner PRO',
    sku: 'SKU-SCN-001',
    category: category._id,
    unitOfMeasure: 'pcs',
    minStockLevel: 5,
    reorderPoint: 10
  });
  assert.equal(product.sku, 'SKU-SCN-001');

  // Test Stock
  const stock = new Stock({
    product: product._id,
    warehouse: warehouse._id,
    quantity: 100,
    reservedQuantity: 20
  });
  assert.equal(stock.availableQuantity, 80);

  // Test Receipt
  const receipt = new Receipt({
    receiptNumber: 'REC-2026-0001',
    supplierName: 'Global Logistics Supply',
    warehouse: warehouse._id,
    receivedBy: user._id,
    items: [{ product: product._id, quantityReceived: 50, unitCost: 45.0 }]
  });
  assert.equal(receipt.receiptNumber, 'REC-2026-0001');

  // Test Delivery
  const delivery = new Delivery({
    deliveryNumber: 'DEL-2026-0001',
    customerName: 'Acme Retail Corp',
    warehouse: warehouse._id,
    dispatchedBy: user._id,
    items: [{ product: product._id, quantityDelivered: 10 }]
  });
  assert.equal(delivery.deliveryNumber, 'DEL-2026-0001');

  // Test InternalTransfer
  const destWarehouseId = new mongoose.Types.ObjectId();
  const transfer = new InternalTransfer({
    transferNumber: 'TRF-2026-0001',
    sourceWarehouse: warehouse._id,
    destinationWarehouse: destWarehouseId,
    initiatedBy: user._id,
    items: [{ product: product._id, quantity: 15 }]
  });
  assert.equal(transfer.transferNumber, 'TRF-2026-0001');

  // Test StockAdjustment
  const adjustment = new StockAdjustment({
    adjustmentNumber: 'ADJ-2026-0001',
    warehouse: warehouse._id,
    adjustedBy: user._id,
    items: [{ product: product._id, oldQuantity: 100, newQuantity: 95, reason: 'Damaged packaging' }]
  });
  assert.equal(adjustment.adjustmentNumber, 'ADJ-2026-0001');

  // Test StockLedger
  const ledger = new StockLedger({
    product: product._id,
    warehouse: warehouse._id,
    transactionType: 'RECEIPT',
    referenceNumber: receipt.receiptNumber,
    quantityChanged: 50,
    balanceAfter: 150,
    user: user._id
  });
  assert.equal(ledger.transactionType, 'RECEIPT');
  assert.equal(ledger.balanceAfter, 150);
});
