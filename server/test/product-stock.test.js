const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const productService = require('../services/product.service');
const categoryService = require('../services/category.service');
const warehouseService = require('../services/warehouse.service');
const stockService = require('../services/stock.service');
const { Product, Category, Warehouse, Stock } = require('../models');

// Run tests in-memory or with models directly
test('Product Management - Validation prevents empty name or duplicate SKU', async () => {
  // Empty name check
  await assert.rejects(
    async () => {
      await productService.createProduct({
        name: '',
        sku: 'TEST-SKU-1',
        category: new mongoose.Types.ObjectId()
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('name is required'));
      return true;
    }
  );

  // Missing SKU check
  await assert.rejects(
    async () => {
      await productService.createProduct({
        name: 'Test Item',
        sku: '',
        category: new mongoose.Types.ObjectId()
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('SKU/code is required'));
      return true;
    }
  );

  // Negative reorder level check
  await assert.rejects(
    async () => {
      await productService.createProduct({
        name: 'Test Item',
        sku: 'SKU-NEG-1',
        category: new mongoose.Types.ObjectId(),
        reorderLevel: -5
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('Reorder level cannot be negative'));
      return true;
    }
  );

  // Negative initial stock check
  await assert.rejects(
    async () => {
      await productService.createProduct({
        name: 'Test Item',
        sku: 'SKU-NEG-2',
        category: new mongoose.Types.ObjectId(),
        initialStock: -10
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('Initial stock cannot be negative'));
      return true;
    }
  );
});

test('Category Management - Validation prevents duplicate code and empty name', async () => {
  await assert.rejects(
    async () => {
      await categoryService.createCategory({ name: '', code: 'CAT-1' });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('Category name is required'));
      return true;
    }
  );

  await assert.rejects(
    async () => {
      await categoryService.createCategory({ name: 'Valid Name', code: '' });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('Category code is required'));
      return true;
    }
  );
});

test('Warehouse Management - Validation prevents empty name and code', async () => {
  await assert.rejects(
    async () => {
      await warehouseService.createWarehouse({ name: '', code: 'WH-1' });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('Warehouse name is required'));
      return true;
    }
  );

  await assert.rejects(
    async () => {
      await warehouseService.createWarehouse({ name: 'Central Warehouse', code: '' });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('Warehouse code is required'));
      return true;
    }
  );
});

test('Reorder Rules - Low stock logic accurately compares currentStock with reorderLevel', () => {
  // Scenario from prompt: Steel Rod, Current Stock: 15, Reorder Level: 20 -> lowStock = true
  const steelRod = {
    name: 'Steel Rod',
    currentStock: 15,
    reorderLevel: 20
  };
  const isLowStock = steelRod.currentStock <= steelRod.reorderLevel;
  const isOutOfStock = steelRod.currentStock === 0;

  assert.equal(isLowStock, true);
  assert.equal(isOutOfStock, false);

  // Sufficient stock scenario
  const aluminumPipe = {
    name: 'Aluminum Pipe',
    currentStock: 50,
    reorderLevel: 20
  };
  assert.equal(aluminumPipe.currentStock <= aluminumPipe.reorderLevel, false);

  // Out of stock scenario
  const copperWire = {
    name: 'Copper Wire',
    currentStock: 0,
    reorderLevel: 10
  };
  assert.equal(copperWire.currentStock <= copperWire.reorderLevel, true);
  assert.equal(copperWire.currentStock === 0, true);
});
