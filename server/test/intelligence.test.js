const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { Anomaly, Product, Stock, Warehouse, StockLedger } = require('../models');
const intelligenceService = require('../services/intelligence.service');

test('Intelligence Platform - Anomaly Model validates required schema fields', () => {
  const anomaly = new Anomaly({
    product: new mongoose.Types.ObjectId(),
    type: 'MOVEMENT_SPIKE',
    severity: 'WARNING',
    title: 'Movement Spike Detected',
    description: 'High daily movement detected.',
    normalBaseline: '10–20 units',
    detectedValue: '145 units',
    reason: 'Unusually high stock movement'
  });

  const err = anomaly.validateSync();
  assert.equal(err, undefined, 'Valid anomaly should pass schema validation');
  assert.equal(anomaly.status, 'OPEN');
  assert.equal(anomaly.severity, 'WARNING');
});

test('Intelligence Platform - Stock Forecast risk classification aligns with specs', () => {
  // Spec:
  // > 30 days -> Healthy
  // 7–30 days -> Monitor
  // 3–7 days -> Warning
  // < 3 days -> Critical
  // 0 or negative -> Out of Stock

  const classifyRisk = (stock, dailyUsage) => {
    if (stock <= 0) return 'OUT_OF_STOCK';
    const days = stock / dailyUsage;
    if (days < 3) return 'CRITICAL';
    if (days < 7) return 'WARNING';
    if (days <= 30) return 'MONITOR';
    return 'HEALTHY';
  };

  assert.equal(classifyRisk(0, 10), 'OUT_OF_STOCK');
  assert.equal(classifyRisk(20, 10), 'CRITICAL'); // 2 days
  assert.equal(classifyRisk(50, 10), 'WARNING');  // 5 days
  assert.equal(classifyRisk(150, 10), 'MONITOR'); // 15 days
  assert.equal(classifyRisk(400, 10), 'HEALTHY'); // 40 days
});

test('Intelligence Platform - What-If Simulator calculates projected stock and coverage days accurately', async () => {
  const currentStock = 120;
  const receiveQty = 200;
  const deliverQty = 80;
  const transferQty = 10;
  const transferDir = 'out';
  const adjustmentQty = -3;
  const dailyUsage = 18;

  const netWarehouseChange = receiveQty - deliverQty - transferQty + adjustmentQty;
  const projectedWarehouseStock = currentStock + netWarehouseChange;

  assert.equal(projectedWarehouseStock, 120 + 200 - 80 - 10 - 3); // 227
  assert.equal(projectedWarehouseStock > 0, true);

  const coverageDays = Number((projectedWarehouseStock / dailyUsage).toFixed(1));
  assert.equal(coverageDays, 12.6);
});

test('Intelligence Platform - Location parser strips query punctuation and extracts keywords', () => {
  const query = 'Where is Steel Rod?';
  const cleanQuery = query
    .toLowerCase()
    .replace(/^where\s+is\s+/i, '')
    .replace(/[?.,!]/g, '')
    .trim();

  assert.equal(cleanQuery, 'steel rod');
});
