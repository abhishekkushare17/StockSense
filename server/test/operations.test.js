const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const receiptService = require('../services/receipt.service');
const deliveryService = require('../services/delivery.service');
const transferService = require('../services/transfer.service');
const adjustmentService = require('../services/adjustment.service');
const { Receipt, Delivery, InternalTransfer, StockAdjustment, StockLedger } = require('../models');
const { TRANSACTION_TYPES, ALL_OPERATION_STATUSES } = require('../utils/constants');

test('Receipt Operations - Input validation prevents missing warehouse and empty items', async () => {
  // Missing warehouse check
  await assert.rejects(
    async () => {
      await receiptService.createReceipt({
        supplier: 'Acme Steel Corp',
        warehouse: '',
        items: [{ product: new mongoose.Types.ObjectId(), quantity: 10 }]
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('warehouse'));
      return true;
    }
  );

  // Empty items check
  await assert.rejects(
    async () => {
      await receiptService.createReceipt({
        supplier: 'Acme Steel Corp',
        warehouse: new mongoose.Types.ObjectId(),
        items: []
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('item'));
      return true;
    }
  );

  // Invalid quantity (< 1)
  await assert.rejects(
    async () => {
      await receiptService.createReceipt({
        supplier: 'Acme Steel Corp',
        warehouse: new mongoose.Types.ObjectId(),
        items: [{ product: new mongoose.Types.ObjectId(), quantity: 0 }]
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('quantity'));
      return true;
    }
  );
});

test('Delivery Operations - Input validation prevents missing warehouse and zero items', async () => {
  // Missing warehouse check
  await assert.rejects(
    async () => {
      await deliveryService.createDelivery({
        customer: 'Global Logistics',
        warehouse: '',
        items: [{ product: new mongoose.Types.ObjectId(), quantity: 5 }]
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('warehouse'));
      return true;
    }
  );

  // Empty items check
  await assert.rejects(
    async () => {
      await deliveryService.createDelivery({
        customer: 'Global Logistics',
        warehouse: new mongoose.Types.ObjectId(),
        items: []
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('item'));
      return true;
    }
  );

  // Invalid quantity (< 1)
  await assert.rejects(
    async () => {
      await deliveryService.createDelivery({
        customer: 'Global Logistics',
        warehouse: new mongoose.Types.ObjectId(),
        items: [{ product: new mongoose.Types.ObjectId(), quantity: -2 }]
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('quantity'));
      return true;
    }
  );
});

test('Internal Transfer - Prevents transferring to the exact same warehouse facility', async () => {
  const sameWarehouseId = new mongoose.Types.ObjectId();

  await assert.rejects(
    async () => {
      await transferService.createTransfer({
        sourceWarehouse: sameWarehouseId,
        destinationWarehouse: sameWarehouseId,
        product: new mongoose.Types.ObjectId(),
        quantity: 10
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('cannot be the same facility'));
      return true;
    }
  );
});

test('Stock Adjustment - Model accurately computes difference between physical and recorded counts', () => {
  const adjustment = new StockAdjustment({
    adjustmentNumber: 'ADJ-TEST-001',
    warehouse: new mongoose.Types.ObjectId(),
    items: [
      {
        product: new mongoose.Types.ObjectId(),
        oldQuantity: 100,
        newQuantity: 95,
        reason: 'Damaged in transit'
      }
    ]
  });

  // Verify difference calculation via schema pre-validation
  adjustment.validateSync();
  const item = adjustment.items[0];
  assert.equal(item.oldQuantity, 100);
  assert.equal(item.recordedQuantity, 100);
  assert.equal(item.newQuantity, 95);
  assert.equal(item.physicalQuantity, 95);
  assert.equal(item.difference, -5);
});

test('Stock Ledger - Model enforces non-negative balance and validates audit fields', () => {
  const ledger = new StockLedger({
    product: new mongoose.Types.ObjectId(),
    warehouse: new mongoose.Types.ObjectId(),
    operationType: TRANSACTION_TYPES.RECEIPT,
    referenceId: 'REC-001',
    quantityBefore: 100,
    quantityChange: 50,
    quantityAfter: 150
  });

  const err = ledger.validateSync();
  assert.equal(err, undefined, 'Valid ledger entry should have no validation errors');
  assert.equal(ledger.operationType, 'RECEIPT');
  assert.equal(ledger.quantityAfter, 150);

  // Negative quantityAfter is strictly prevented
  const invalidLedger = new StockLedger({
    product: new mongoose.Types.ObjectId(),
    warehouse: new mongoose.Types.ObjectId(),
    operationType: TRANSACTION_TYPES.DELIVERY,
    referenceId: 'DEL-001',
    quantityBefore: 10,
    quantityChange: -20,
    quantityAfter: -10
  });

  const invalidErr = invalidLedger.validateSync();
  assert.ok(invalidErr, 'Ledger should reject negative quantityAfter');
  assert.ok(invalidErr.errors['quantityAfter']);
});

test('Operations Architecture - System includes all 5 lifecycle statuses and 5 transaction types', () => {
  // Verify statuses
  assert.ok(ALL_OPERATION_STATUSES.includes('Draft'));
  assert.ok(ALL_OPERATION_STATUSES.includes('Waiting'));
  assert.ok(ALL_OPERATION_STATUSES.includes('Ready'));
  assert.ok(ALL_OPERATION_STATUSES.includes('Done'));
  assert.ok(ALL_OPERATION_STATUSES.includes('Canceled'));

  // Verify transaction types
  assert.equal(TRANSACTION_TYPES.RECEIPT, 'RECEIPT');
  assert.equal(TRANSACTION_TYPES.DELIVERY, 'DELIVERY');
  assert.equal(TRANSACTION_TYPES.TRANSFER_IN, 'TRANSFER_IN');
  assert.equal(TRANSACTION_TYPES.TRANSFER_OUT, 'TRANSFER_OUT');
  assert.equal(TRANSACTION_TYPES.ADJUSTMENT, 'ADJUSTMENT');
});
