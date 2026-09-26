const mongoose = require('mongoose');
const {
  Product,
  Stock,
  Warehouse,
  StockLedger,
  Receipt,
  Delivery,
  InternalTransfer,
  StockAdjustment,
  Anomaly,
  AuditLog,
  User
} = require('../models');
const { logAudit } = require('../utils/auditLogger');

/**
 * StockSense Inventory Intelligence Service
 * Delivers actionable intelligence, forecasting, risk radar, anomaly detection,
 * what-if simulation, location lookups, and stock math explanations.
 */

// Helper: Calculate daily usage from historical ledger records over a given window (default 14 days)
const calculateProductUsage = async (productId, daysWindow = 14) => {
  const windowStart = new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000);

  // Outflows: DELIVERY, negative ADJUSTMENT, TRANSFER_OUT
  const outflowRecords = await StockLedger.find({
    product: productId,
    createdAt: { $gte: windowStart },
    $or: [
      { operationType: 'DELIVERY' },
      { transactionType: 'DELIVERY' },
      { operationType: 'TRANSFER_OUT' },
      { transactionType: 'TRANSFER_OUT' },
      {
        operationType: 'ADJUSTMENT',
        $or: [{ quantityChange: { $lt: 0 } }, { quantityChanged: { $lt: 0 } }]
      }
    ]
  }).lean();

  const totalOutflow = outflowRecords.reduce((sum, r) => {
    const qty = Math.abs(r.quantityChange ?? r.quantityChanged ?? 0);
    return sum + qty;
  }, 0);

  const measuredDailyUsage = totalOutflow > 0 ? totalOutflow / daysWindow : 0;
  return {
    totalOutflow,
    measuredDailyUsage,
    hasHistoricalOutflow: totalOutflow > 0
  };
};

/**
 * 1. DAILY ACTION CENTER — "What Should I Do Today?"
 */
const getDailyActions = async (user = null) => {
  // Determine time-of-day greeting
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17) timeOfDay = 'evening';

  const userName = user?.name ? user.name.split(' ')[0] : 'Inventory Lead';

  // Gather current database state concurrently
  const [
    products,
    pendingReceipts,
    pendingDeliveries,
    pendingTransfers,
    openAnomalies
  ] = await Promise.all([
    Product.find({ status: 'active' }).populate('category', 'name').lean(),
    Receipt.find({ status: { $in: ['Draft', 'Waiting'] } })
      .populate('warehouse', 'name code')
      .sort({ createdAt: -1 })
      .lean(),
    Delivery.find({ status: { $in: ['Draft', 'Waiting', 'Ready'] } })
      .populate('warehouse', 'name code')
      .sort({ createdAt: -1 })
      .lean(),
    InternalTransfer.find({ status: { $in: ['Pending', 'In Transit'] } })
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .sort({ createdAt: -1 })
      .lean(),
    Anomaly.find({ status: 'OPEN' })
      .populate('product', 'name sku')
      .populate('warehouse', 'name code')
      .sort({ createdAt: -1 })
      .lean()
  ]);

  // Aggregate stock per product
  const productIds = products.map((p) => p._id);
  const stockRecords = await Stock.find({ product: { $in: productIds } }).lean();

  const stockMap = {};
  for (const s of stockRecords) {
    const pId = s.product.toString();
    stockMap[pId] = (stockMap[pId] || 0) + (s.quantity || 0);
  }

  const actions = [];
  let outOfStockCount = 0;
  let reorderNeededCount = 0;

  // Process products for out-of-stock and reorder actions
  for (const prod of products) {
    const currentStock = stockMap[prod._id.toString()] || 0;
    const reorderLevel = prod.reorderLevel || 10;

    if (currentStock === 0) {
      outOfStockCount++;
      const suggestedReorder = reorderLevel * 2 || 50;
      actions.push({
        id: `act-oos-${prod._id}`,
        category: 'OUT_OF_STOCK',
        severity: 'CRITICAL',
        badge: 'Out of Stock',
        badgeColor: 'red',
        icon: 'AlertOctagon',
        title: `${prod.name}`,
        subtitle: `SKU: ${prod.sku} • Current Stock: 0 ${prod.unitOfMeasure || 'units'}`,
        description: `Product is completely depleted. Reorder ${suggestedReorder} units immediately to prevent customer disruption.`,
        suggestedQty: suggestedReorder,
        actionLabel: `Reorder ${suggestedReorder} units`,
        targetUrl: `/receipts?action=create&sku=${encodeURIComponent(prod.sku)}`,
        product: {
          _id: prod._id,
          name: prod.name,
          sku: prod.sku,
          unitOfMeasure: prod.unitOfMeasure
        }
      });
    } else if (currentStock <= reorderLevel) {
      reorderNeededCount++;
      const suggestedReorder = Math.max(reorderLevel * 2 - currentStock, reorderLevel);
      const isCritical = currentStock < reorderLevel / 2;
      actions.push({
        id: `act-reorder-${prod._id}`,
        category: 'REORDER_NEEDED',
        severity: isCritical ? 'CRITICAL' : 'WARNING',
        badge: isCritical ? 'Stock Critically Low' : 'Needs Reordering',
        badgeColor: isCritical ? 'red' : 'orange',
        icon: 'AlertTriangle',
        title: `${prod.name}`,
        subtitle: `SKU: ${prod.sku} • Stock: ${currentStock} / Reorder: ${reorderLevel}`,
        description: `Current stock (${currentStock}) is below reorder threshold (${reorderLevel}). Recommended replenishment: ${suggestedReorder} units.`,
        suggestedQty: suggestedReorder,
        actionLabel: `Reorder ${suggestedReorder} units`,
        targetUrl: `/receipts?action=create&sku=${encodeURIComponent(prod.sku)}`,
        product: {
          _id: prod._id,
          name: prod.name,
          sku: prod.sku,
          unitOfMeasure: prod.unitOfMeasure
        }
      });
    }
  }

  // Process pending deliveries
  for (const del of pendingDeliveries.slice(0, 5)) {
    actions.push({
      id: `act-del-${del._id}`,
      category: 'PENDING_DELIVERY',
      severity: 'INFO',
      badge: 'Delivery Pending',
      badgeColor: 'blue',
      icon: 'Truck',
      title: `Delivery #${del.deliveryNumber || 'DEL'}`,
      subtitle: `Customer: ${del.customerName || 'Standard Order'} • Warehouse: ${del.warehouse?.name || 'Main'}`,
      description: `Delivery order is currently in ${del.status} status and ready for warehouse pick, pack, or final dispatch validation.`,
      actionLabel: 'Process Delivery',
      targetUrl: `/deliveries`,
      metadata: { deliveryId: del._id, deliveryNumber: del.deliveryNumber }
    });
  }

  // Process scheduled transfers
  for (const trf of pendingTransfers.slice(0, 5)) {
    actions.push({
      id: `act-trf-${trf._id}`,
      category: 'SCHEDULED_TRANSFER',
      severity: 'SUCCESS',
      badge: 'Transfer Scheduled',
      badgeColor: 'green',
      icon: 'ArrowRightLeft',
      title: `Transfer #${trf.transferNumber || 'TRF'}`,
      subtitle: `${trf.fromWarehouse?.name || 'Warehouse A'} → ${trf.toWarehouse?.name || 'Warehouse B'}`,
      description: `Inter-warehouse transfer is ${trf.status}. Verify transit goods and mark completion upon arrival.`,
      actionLabel: 'View Transfer',
      targetUrl: `/transfers`,
      metadata: { transferId: trf._id, transferNumber: trf.transferNumber }
    });
  }

  // Process open anomalies
  for (const anom of openAnomalies.slice(0, 3)) {
    actions.push({
      id: `act-anom-${anom._id}`,
      category: 'ANOMALY_DETECTED',
      severity: 'WARNING',
      badge: 'Anomaly Alert',
      badgeColor: 'orange',
      icon: 'Search',
      title: `${anom.product?.name || 'Product'} — ${anom.title}`,
      subtitle: `Detected: ${anom.detectedValue} (Normal: ${anom.normalBaseline})`,
      description: anom.reason || 'Unusual inventory movement pattern detected.',
      actionLabel: 'Review Anomaly',
      targetUrl: `/anomalies`,
      metadata: { anomalyId: anom._id }
    });
  }

  // Prioritize critical and high urgency actions
  const severityRank = { CRITICAL: 1, WARNING: 2, INFO: 3, SUCCESS: 4 };
  actions.sort((a, b) => (severityRank[a.severity] || 5) - (severityRank[b.severity] || 5));

  return {
    greeting: `Good ${timeOfDay}, ${userName} 👋`,
    totalActionsCount: actions.length,
    summary: {
      outOfStockCount,
      reorderNeededCount,
      pendingDeliveriesCount: pendingDeliveries.length,
      scheduledTransfersCount: pendingTransfers.length,
      anomaliesCount: openAnomalies.length
    },
    actions
  };
};

/**
 * 2. STOCK FORECAST
 * Calculates estimated stockout date and risk classification from historical usage
 */
const getStockForecast = async (queryParams = {}) => {
  const { category, search, risk } = queryParams;

  const productFilter = { status: 'active' };
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    productFilter.category = category;
  }

  const products = await Product.find(productFilter)
    .populate('category', 'name code')
    .sort({ name: 1 })
    .lean();

  const productIds = products.map((p) => p._id);
  const stockRecords = await Stock.find({ product: { $in: productIds } })
    .populate('warehouse', 'name code')
    .lean();

  // Group stocks by product
  const stockByProduct = {};
  for (const s of stockRecords) {
    const pid = s.product.toString();
    if (!stockByProduct[pid]) stockByProduct[pid] = [];
    stockByProduct[pid].push(s);
  }

  const forecasts = [];

  for (const prod of products) {
    const pIdStr = prod._id.toString();
    const stocks = stockByProduct[pIdStr] || [];
    const currentStock = stocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const reorderLevel = prod.reorderLevel || 10;

    // Calculate historical daily usage from ledger
    const usage = await calculateProductUsage(prod._id, 14);
    let avgDailyUsage = usage.measuredDailyUsage;

    // If no recent recorded outflow, use deterministic baseline based on reorder cadence
    let isEstimatedBaseline = false;
    if (avgDailyUsage <= 0) {
      avgDailyUsage = Math.max(0.5, Number((reorderLevel / 14).toFixed(1)));
      isEstimatedBaseline = true;
    } else {
      avgDailyUsage = Number(avgDailyUsage.toFixed(1));
    }

    // daysRemaining calculation
    let daysRemaining = 0;
    if (currentStock > 0 && avgDailyUsage > 0) {
      daysRemaining = Number((currentStock / avgDailyUsage).toFixed(1));
    }

    // Risk classification according to specification:
    // > 30 days -> Healthy (🟢)
    // 7–30 days -> Monitor (🔵)
    // 3–7 days -> Warning (🟠)
    // < 3 days -> Critical (🔴)
    // 0 or negative -> Out of Stock (🔴)
    let riskClassification = 'HEALTHY';
    let riskLabel = 'Healthy';
    let riskColor = 'green';

    if (currentStock === 0) {
      riskClassification = 'OUT_OF_STOCK';
      riskLabel = 'Out of Stock';
      riskColor = 'red';
      daysRemaining = 0;
    } else if (daysRemaining < 3) {
      riskClassification = 'CRITICAL';
      riskLabel = 'Critical';
      riskColor = 'red';
    } else if (daysRemaining < 7) {
      riskClassification = 'WARNING';
      riskLabel = 'Warning';
      riskColor = 'orange';
    } else if (daysRemaining <= 30) {
      riskClassification = 'MONITOR';
      riskLabel = 'Monitor';
      riskColor = 'blue';
    } else {
      riskClassification = 'HEALTHY';
      riskLabel = 'Healthy';
      riskColor = 'green';
    }

    // Calculate runout date
    const runoutDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);

    // Coverage percentage for progress bar (capped at 100% for 30+ days)
    const coveragePercentage = Math.min(100, Math.round((daysRemaining / 30) * 100));

    forecasts.push({
      productId: prod._id,
      name: prod.name,
      sku: prod.sku,
      category: prod.category?.name || 'General',
      unitOfMeasure: prod.unitOfMeasure || 'units',
      currentStock,
      reorderLevel,
      averageDailyUsage: avgDailyUsage,
      isEstimatedBaseline,
      daysRemaining,
      estimatedRunoutDate: runoutDate.toISOString(),
      riskClassification,
      riskLabel,
      riskColor,
      coveragePercentage,
      warehouses: stocks.map((s) => ({
        warehouseId: s.warehouse?._id,
        warehouseName: s.warehouse?.name || 'Warehouse',
        warehouseCode: s.warehouse?.code || '',
        quantity: s.quantity,
        locationBin: s.locationBin || '-'
      }))
    });
  }

  // Filter by search or risk if provided
  let filtered = forecasts;
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (f) => f.name.toLowerCase().includes(q) || f.sku.toLowerCase().includes(q)
    );
  }
  if (risk && risk.trim()) {
    const rKey = risk.trim().toUpperCase();
    filtered = filtered.filter((f) => f.riskClassification === rKey);
  }

  // Sort: Out of Stock & Critical first
  const sortWeight = { OUT_OF_STOCK: 1, CRITICAL: 2, WARNING: 3, MONITOR: 4, HEALTHY: 5 };
  filtered.sort((a, b) => (sortWeight[a.riskClassification] || 6) - (sortWeight[b.riskClassification] || 6));

  return filtered;
};

/**
 * 3. INVENTORY RISK RADAR
 * Identifies issues across Stock Risk, Delivery Risk, Transfer Risk, and Low Risk
 */
const getRiskRadar = async () => {
  const [forecasts, pendingDeliveries, pendingTransfers] = await Promise.all([
    getStockForecast(),
    Delivery.find({ status: { $in: ['Draft', 'Waiting', 'Ready'] } })
      .populate('warehouse', 'name code')
      .populate('items.product', 'name sku reorderLevel')
      .lean(),
    InternalTransfer.find({ status: { $in: ['Pending', 'In Transit'] } })
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('items.product', 'name sku')
      .lean()
  ]);

  // 1. Stock Risk: Products in Out of Stock or Critical or Warning
  const stockRiskItems = forecasts.filter(
    (f) => f.riskClassification === 'OUT_OF_STOCK' || f.riskClassification === 'CRITICAL' || f.riskClassification === 'WARNING'
  );

  // 2. Delivery Risk: Deliveries with potential stock shortages or pending validation
  const deliveryRiskItems = [];
  const stockByProdId = {};
  for (const f of forecasts) {
    stockByProdId[f.productId.toString()] = f.currentStock;
  }

  for (const del of pendingDeliveries) {
    let hasShortageRisk = false;
    const riskyProducts = [];

    for (const item of del.items || []) {
      const prodId = item.product?._id?.toString() || item.product?.toString();
      const currentAvail = stockByProdId[prodId] ?? 0;
      const orderQty = item.quantity || 0;

      if (currentAvail < orderQty) {
        hasShortageRisk = true;
        riskyProducts.push({
          name: item.product?.name || 'Product',
          sku: item.product?.sku || '',
          required: orderQty,
          available: currentAvail
        });
      }
    }

    deliveryRiskItems.push({
      deliveryId: del._id,
      deliveryNumber: del.deliveryNumber || 'DEL',
      customerName: del.customerName || 'General Client',
      warehouse: del.warehouse?.name || 'Warehouse',
      status: del.status,
      hasShortageRisk,
      riskyProducts,
      riskLevel: hasShortageRisk ? 'HIGH' : 'MEDIUM',
      reason: hasShortageRisk
        ? 'Insufficient warehouse stock to fulfill delivery items'
        : 'Outbound order pending pick/pack validation'
    });
  }

  // 3. Transfer Risk: Transfers delayed or where source warehouse is near depletion
  const transferRiskItems = [];
  for (const trf of pendingTransfers) {
    const hoursElapsed = Math.round(
      (Date.now() - new Date(trf.createdAt).getTime()) / (1000 * 60 * 60)
    );
    const isDelayed = hoursElapsed > 24;

    transferRiskItems.push({
      transferId: trf._id,
      transferNumber: trf.transferNumber || 'TRF',
      fromWarehouse: trf.fromWarehouse?.name || 'Origin',
      toWarehouse: trf.toWarehouse?.name || 'Destination',
      status: trf.status,
      hoursElapsed,
      isDelayed,
      riskLevel: isDelayed ? 'HIGH' : 'MEDIUM',
      reason: isDelayed
        ? `In-transit for ${hoursElapsed} hours without confirmed receipt`
        : `Transfer pending transit verification`
    });
  }

  // 4. Low Risk: Products running healthy (> 30 days coverage)
  const lowRiskItems = forecasts.filter(
    (f) => f.riskClassification === 'HEALTHY' || f.riskClassification === 'MONITOR'
  );

  return {
    categories: {
      stockRisk: {
        title: 'Stock Risk',
        count: stockRiskItems.length,
        severity: stockRiskItems.some((i) => i.riskClassification === 'OUT_OF_STOCK' || i.riskClassification === 'CRITICAL')
          ? 'CRITICAL'
          : 'WARNING',
        color: 'rose',
        items: stockRiskItems
      },
      deliveryRisk: {
        title: 'Delivery Risk',
        count: deliveryRiskItems.length,
        severity: deliveryRiskItems.some((d) => d.hasShortageRisk) ? 'HIGH' : 'MEDIUM',
        color: 'purple',
        items: deliveryRiskItems
      },
      transferRisk: {
        title: 'Transfer Risk',
        count: transferRiskItems.length,
        severity: transferRiskItems.some((t) => t.isDelayed) ? 'HIGH' : 'MEDIUM',
        color: 'amber',
        items: transferRiskItems
      },
      lowRisk: {
        title: 'Low Risk',
        count: lowRiskItems.length,
        severity: 'HEALTHY',
        color: 'emerald',
        items: lowRiskItems
      }
    },
    totalIssuesCount: stockRiskItems.length + deliveryRiskItems.length + transferRiskItems.length
  };
};

/**
 * 4. INVENTORY ANOMALY DETECTION
 * Rule-based anomaly scanner detecting volume spikes, adjustment floods, and erratic fluctuations
 */
const getAnomalies = async (statusFilter = 'ALL') => {
  // 1. Scan recent ledger activity for new rule-based anomalies
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const products = await Product.find({ status: 'active' }).lean();

  for (const prod of products) {
    // Check daily movement spike vs 7-day average
    const recent24hRecords = await StockLedger.find({
      product: prod._id,
      createdAt: { $gte: oneDayAgo }
    }).lean();

    const recent24hMovement = recent24hRecords.reduce(
      (sum, r) => sum + Math.abs(r.quantityChange ?? r.quantityChanged ?? 0),
      0
    );

    const past7dRecords = await StockLedger.find({
      product: prod._id,
      createdAt: { $gte: sevenDaysAgo, $lt: oneDayAgo }
    }).lean();

    const past7dMovement = past7dRecords.reduce(
      (sum, r) => sum + Math.abs(r.quantityChange ?? r.quantityChanged ?? 0),
      0
    );
    const avgDailyPastMovement = past7dMovement > 0 ? past7dMovement / 6 : 15; // baseline

    // Rule 1: Movement spike (today's movement > 3x average and > 25 units)
    if (recent24hMovement > avgDailyPastMovement * 3 && recent24hMovement >= 25) {
      const existing = await Anomaly.findOne({
        product: prod._id,
        type: 'MOVEMENT_SPIKE',
        createdAt: { $gte: oneDayAgo }
      });

      if (!existing) {
        await Anomaly.create({
          product: prod._id,
          warehouse: recent24hRecords[0]?.warehouse || null,
          type: 'MOVEMENT_SPIKE',
          severity: recent24hMovement > 100 ? 'CRITICAL' : 'WARNING',
          title: `Unusual Movement Spike on ${prod.name}`,
          description: `Today's movement of ${recent24hMovement} units significantly exceeds the normal daily average of ${Math.round(avgDailyPastMovement)} units.`,
          normalBaseline: `${Math.max(5, Math.round(avgDailyPastMovement * 0.7))}–${Math.round(avgDailyPastMovement * 1.3)} units/day`,
          detectedValue: `${recent24hMovement} units today`,
          reason: 'Sudden high velocity outbound or redistribution movement detected.',
          referenceModel: 'StockLedger',
          referenceId: recent24hRecords[0]?._id?.toString() || '',
          status: 'OPEN'
        });
      }
    }
  }

  // Rule 2: Check for abnormal adjustment frequency (e.g. > 2 adjustments today)
  const recentAdjustments = await StockAdjustment.find({
    createdAt: { $gte: oneDayAgo }
  })
    .populate('warehouse', 'name code')
    .lean();

  if (recentAdjustments.length >= 3) {
    const existing = await Anomaly.findOne({
      type: 'UNUSUAL_ADJUSTMENT',
      createdAt: { $gte: oneDayAgo }
    });

    if (!existing && products.length > 0) {
      await Anomaly.create({
        product: products[0]._id,
        warehouse: recentAdjustments[0].warehouse?._id || null,
        type: 'UNUSUAL_ADJUSTMENT',
        severity: 'WARNING',
        title: `High Physical Adjustment Frequency`,
        description: `Normally 0–2 adjustments/week occur. System recorded ${recentAdjustments.length} physical adjustments in the last 24 hours.`,
        normalBaseline: '0–2 adjustments/week',
        detectedValue: `${recentAdjustments.length} adjustments today`,
        reason: 'Frequent manual stock adjustments indicate potential inventory leakage or audit corrections.',
        referenceModel: 'StockAdjustment',
        referenceId: recentAdjustments[0]._id.toString(),
        status: 'OPEN'
      });
    }
  }

  // Build query
  const query = {};
  if (statusFilter && statusFilter !== 'ALL') {
    query.status = statusFilter.toUpperCase();
  }

  return await Anomaly.find(query)
    .populate('product', 'name sku unitOfMeasure reorderLevel')
    .populate('warehouse', 'name code')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Review an Anomaly
 */
const reviewAnomaly = async (anomalyId, reviewData, userId = null) => {
  if (!mongoose.Types.ObjectId.isValid(anomalyId)) {
    const error = new Error('Invalid Anomaly ID');
    error.statusCode = 400;
    throw error;
  }

  const { status = 'REVIEWED', reviewNotes = '' } = reviewData;

  const anomaly = await Anomaly.findByIdAndUpdate(
    anomalyId,
    {
      status,
      reviewedBy: userId,
      reviewedAt: new Date(),
      reviewNotes
    },
    { new: true }
  )
    .populate('product', 'name sku')
    .populate('warehouse', 'name code')
    .populate('reviewedBy', 'name email');

  if (!anomaly) {
    const error = new Error('Anomaly record not found');
    error.statusCode = 404;
    throw error;
  }

  if (userId) {
    await logAudit({
      user: userId,
      action: 'REVIEW_ANOMALY',
      module: 'INTELLIGENCE',
      entityType: 'Anomaly',
      recordId: anomalyId,
      details: { status, reviewNotes, title: anomaly.title }
    });
  }

  return anomaly;
};

/**
 * 5. WHAT-IF INVENTORY SIMULATOR
 * Calculates projected stock and coverage dynamically without mutating database
 */
const simulateInventory = async (data) => {
  const {
    productId,
    warehouseId,
    receiveQty = 0,
    deliverQty = 0,
    transferQty = 0,
    transferDirection = 'out', // 'in' or 'out'
    adjustmentQty = 0 // can be positive or negative
  } = data;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error('A valid product ID is required for simulation');
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // Get current stock across all facilities
  const allStocks = await Stock.find({ product: productId })
    .populate('warehouse', 'name code')
    .lean();

  const totalCurrentStock = allStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Target warehouse current stock
  let targetWhStock = 0;
  let warehouseObj = null;
  if (warehouseId && mongoose.Types.ObjectId.isValid(warehouseId)) {
    const whStock = allStocks.find(
      (s) => s.warehouse?._id?.toString() === warehouseId.toString()
    );
    targetWhStock = whStock?.quantity || 0;
    warehouseObj = whStock?.warehouse || null;
  } else if (allStocks.length > 0) {
    targetWhStock = allStocks[0].quantity;
    warehouseObj = allStocks[0].warehouse;
  }

  const rQty = Math.max(0, Number(receiveQty) || 0);
  const dQty = Math.max(0, Number(deliverQty) || 0);
  const tQty = Math.max(0, Number(transferQty) || 0);
  const adjQty = Number(adjustmentQty) || 0;

  // Calculate net changes
  const transferDelta = transferDirection === 'in' ? tQty : -tQty;
  const netDelta = rQty - dQty + transferDelta + adjQty;

  const projectedWarehouseStock = targetWhStock + netDelta;
  const projectedTotalStock = totalCurrentStock + rQty - dQty + adjQty; // internal transfers don't change global total stock

  // Determine usage and forecast coverage
  const usage = await calculateProductUsage(productId, 14);
  const dailyRate = usage.measuredDailyUsage > 0
    ? usage.measuredDailyUsage
    : Math.max(0.5, (product.reorderLevel || 10) / 14);

  const projectedDaysCoverage = projectedTotalStock > 0 && dailyRate > 0
    ? Number((projectedTotalStock / dailyRate).toFixed(1))
    : 0;

  // Projected Risk evaluation
  let projectedRisk = 'HEALTHY';
  let projectedRiskLabel = 'Low Risk';
  let projectedRiskColor = 'green';

  if (projectedWarehouseStock < 0 || projectedTotalStock < 0) {
    projectedRisk = 'NEGATIVE_DEFICIT';
    projectedRiskLabel = 'Deficit / Invalid Action';
    projectedRiskColor = 'red';
  } else if (projectedTotalStock === 0) {
    projectedRisk = 'OUT_OF_STOCK';
    projectedRiskLabel = 'Out of Stock';
    projectedRiskColor = 'red';
  } else if (projectedDaysCoverage < 3) {
    projectedRisk = 'CRITICAL';
    projectedRiskLabel = 'Critical Runout Risk';
    projectedRiskColor = 'red';
  } else if (projectedDaysCoverage < 7) {
    projectedRisk = 'WARNING';
    projectedRiskLabel = 'Moderate Stockout Risk';
    projectedRiskColor = 'orange';
  } else if (projectedDaysCoverage <= 30) {
    projectedRisk = 'MONITOR';
    projectedRiskLabel = 'Balanced Buffer';
    projectedRiskColor = 'blue';
  } else {
    projectedRisk = 'HEALTHY';
    projectedRiskLabel = 'Optimal Buffer';
    projectedRiskColor = 'green';
  }

  return {
    product: {
      _id: product._id,
      name: product.name,
      sku: product.sku,
      unitOfMeasure: product.unitOfMeasure || 'units',
      reorderLevel: product.reorderLevel || 10
    },
    warehouse: warehouseObj
      ? { _id: warehouseObj._id, name: warehouseObj.name, code: warehouseObj.code }
      : null,
    current: {
      warehouseStock: targetWhStock,
      totalSystemStock: totalCurrentStock
    },
    simulationInputs: {
      receiveQty: rQty,
      deliverQty: dQty,
      transferQty: tQty,
      transferDirection,
      adjustmentQty: adjQty
    },
    projected: {
      warehouseStock: projectedWarehouseStock,
      totalSystemStock: projectedTotalStock,
      netChange: netDelta,
      coverageDays: projectedDaysCoverage,
      riskClassification: projectedRisk,
      riskLabel: projectedRiskLabel,
      riskColor: projectedRiskColor
    }
  };
};

/**
 * Apply Simulation to Inventory Transactionally
 */
const applySimulation = async (data, userId = null) => {
  const sim = await simulateInventory(data);

  if (sim.projected.warehouseStock < 0) {
    const error = new Error('Cannot apply simulation: Resulting stock would fall below 0');
    error.statusCode = 400;
    throw error;
  }

  const {
    productId,
    warehouseId,
    receiveQty = 0,
    deliverQty = 0,
    transferQty = 0,
    transferDirection = 'out',
    adjustmentQty = 0,
    targetWarehouseId = null,
    notes = 'Applied from What-If Inventory Simulator'
  } = data;

  const appliedTransactions = [];

  // 1. Apply Inbound Receive
  if (receiveQty > 0) {
    const receiptNumber = `REC-SIM-${Date.now().toString().slice(-6)}`;
    const receipt = await Receipt.create({
      receiptNumber,
      supplier: 'Simulated Replenishment',
      warehouse: warehouseId,
      items: [{ product: productId, quantity: receiveQty }],
      status: 'Done',
      receivedDate: new Date(),
      notes
    });

    // Update Stock
    let stock = await Stock.findOne({ product: productId, warehouse: warehouseId });
    const qtyBefore = stock ? stock.quantity : 0;
    const qtyAfter = qtyBefore + receiveQty;

    if (stock) {
      stock.quantity = qtyAfter;
      await stock.save();
    } else {
      stock = await Stock.create({
        product: productId,
        warehouse: warehouseId,
        quantity: qtyAfter,
        locationBin: 'SIM-BIN-01'
      });
    }

    // Ledger
    await StockLedger.create({
      product: productId,
      warehouse: warehouseId,
      operationType: 'RECEIPT',
      transactionType: 'RECEIPT',
      referenceId: receiptNumber,
      referenceNumber: receiptNumber,
      quantityBefore: qtyBefore,
      quantityChange: receiveQty,
      quantityChanged: receiveQty,
      quantityAfter: qtyAfter,
      balanceAfter: qtyAfter,
      createdBy: userId,
      user: userId,
      notes: `Simulator receive: +${receiveQty}`
    });

    appliedTransactions.push({ type: 'RECEIPT', quantity: receiveQty, reference: receiptNumber });
  }

  // 2. Apply Outbound Delivery
  if (deliverQty > 0) {
    const deliveryNumber = `DEL-SIM-${Date.now().toString().slice(-6)}`;
    const delivery = await Delivery.create({
      deliveryNumber,
      customerName: 'Simulated Order Customer',
      warehouse: warehouseId,
      items: [{ product: productId, quantity: deliverQty }],
      status: 'Done',
      deliveryDate: new Date(),
      notes
    });

    let stock = await Stock.findOne({ product: productId, warehouse: warehouseId });
    const qtyBefore = stock ? stock.quantity : 0;
    const qtyAfter = Math.max(0, qtyBefore - deliverQty);

    if (stock) {
      stock.quantity = qtyAfter;
      await stock.save();
    }

    await StockLedger.create({
      product: productId,
      warehouse: warehouseId,
      operationType: 'DELIVERY',
      transactionType: 'DELIVERY',
      referenceId: deliveryNumber,
      referenceNumber: deliveryNumber,
      quantityBefore: qtyBefore,
      quantityChange: -deliverQty,
      quantityChanged: -deliverQty,
      quantityAfter: qtyAfter,
      balanceAfter: qtyAfter,
      createdBy: userId,
      user: userId,
      notes: `Simulator delivery: -${deliverQty}`
    });

    appliedTransactions.push({ type: 'DELIVERY', quantity: -deliverQty, reference: deliveryNumber });
  }

  // 3. Apply Adjustment
  if (adjustmentQty !== 0) {
    const adjustmentNumber = `ADJ-SIM-${Date.now().toString().slice(-6)}`;
    let stock = await Stock.findOne({ product: productId, warehouse: warehouseId });
    const qtyBefore = stock ? stock.quantity : 0;
    const qtyAfter = Math.max(0, qtyBefore + adjustmentQty);

    if (stock) {
      stock.quantity = qtyAfter;
      await stock.save();
    }

    await StockAdjustment.create({
      adjustmentNumber,
      warehouse: warehouseId,
      product: productId,
      recordedQuantity: qtyBefore,
      physicalQuantity: qtyAfter,
      difference: adjustmentQty,
      reason: 'Physical count discrepancy applied via Simulator',
      status: 'Done',
      adjustedBy: userId
    });

    await StockLedger.create({
      product: productId,
      warehouse: warehouseId,
      operationType: 'ADJUSTMENT',
      transactionType: 'ADJUSTMENT',
      referenceId: adjustmentNumber,
      referenceNumber: adjustmentNumber,
      quantityBefore: qtyBefore,
      quantityChange: adjustmentQty,
      quantityChanged: adjustmentQty,
      quantityAfter: qtyAfter,
      balanceAfter: qtyAfter,
      createdBy: userId,
      user: userId,
      notes: `Simulator adjustment: ${adjustmentQty > 0 ? '+' : ''}${adjustmentQty}`
    });

    appliedTransactions.push({ type: 'ADJUSTMENT', quantity: adjustmentQty, reference: adjustmentNumber });
  }

  // 4. Apply Internal Transfer
  if (transferQty > 0 && targetWarehouseId) {
    const transferNumber = `TRF-SIM-${Date.now().toString().slice(-6)}`;
    const sourceWh = transferDirection === 'in' ? targetWarehouseId : warehouseId;
    const destWh = transferDirection === 'in' ? warehouseId : targetWarehouseId;

    let srcStock = await Stock.findOne({ product: productId, warehouse: sourceWh });
    let dstStock = await Stock.findOne({ product: productId, warehouse: destWh });

    const srcBefore = srcStock ? srcStock.quantity : 0;
    const dstBefore = dstStock ? dstStock.quantity : 0;

    const srcAfter = Math.max(0, srcBefore - transferQty);
    const dstAfter = dstBefore + transferQty;

    if (srcStock) {
      srcStock.quantity = srcAfter;
      await srcStock.save();
    }
    if (dstStock) {
      dstStock.quantity = dstAfter;
      await dstStock.save();
    } else {
      await Stock.create({
        product: productId,
        warehouse: destWh,
        quantity: dstAfter,
        locationBin: 'TRANSFER-BAY'
      });
    }

    await InternalTransfer.create({
      transferNumber,
      fromWarehouse: sourceWh,
      toWarehouse: destWh,
      items: [{ product: productId, quantity: transferQty }],
      status: 'Done',
      notes
    });

    // Ledger for source
    await StockLedger.create({
      product: productId,
      warehouse: sourceWh,
      operationType: 'TRANSFER_OUT',
      transactionType: 'TRANSFER_OUT',
      referenceId: transferNumber,
      referenceNumber: transferNumber,
      quantityBefore: srcBefore,
      quantityChange: -transferQty,
      quantityChanged: -transferQty,
      quantityAfter: srcAfter,
      balanceAfter: srcAfter,
      createdBy: userId,
      user: userId,
      notes: `Transfer out to destination warehouse`
    });

    // Ledger for destination
    await StockLedger.create({
      product: productId,
      warehouse: destWh,
      operationType: 'TRANSFER_IN',
      transactionType: 'TRANSFER_IN',
      referenceId: transferNumber,
      referenceNumber: transferNumber,
      quantityBefore: dstBefore,
      quantityChange: transferQty,
      quantityChanged: transferQty,
      quantityAfter: dstAfter,
      balanceAfter: dstAfter,
      createdBy: userId,
      user: userId,
      notes: `Transfer in from origin warehouse`
    });

    appliedTransactions.push({ type: 'TRANSFER', quantity: transferQty, reference: transferNumber });
  }

  // Audit Log
  if (userId) {
    await logAudit({
      user: userId,
      action: 'APPLY_SIMULATION',
      module: 'SIMULATOR',
      entityType: 'Product',
      recordId: productId,
      details: { appliedTransactions, simulation: sim.projected }
    });
  }

  return {
    success: true,
    message: 'Simulation applied to actual inventory records successfully',
    appliedTransactions,
    confirmedStock: sim.projected.warehouseStock
  };
};

/**
 * 6. FIND MY STOCK — Smart Location Search
 * Searches: "Where is Steel Rod?", SKU, or product name
 */
const findStockLocations = async (query = '') => {
  const cleanQuery = query
    .toLowerCase()
    .replace(/^where\s+is\s+/i, '')
    .replace(/[?.,!]/g, '')
    .trim();

  // Search product
  const products = await Product.find({
    status: 'active',
    $or: [
      { name: { $regex: cleanQuery, $options: 'i' } },
      { sku: { $regex: cleanQuery, $options: 'i' } },
      { description: { $regex: cleanQuery, $options: 'i' } }
    ]
  })
    .populate('category', 'name code')
    .lean();

  if (products.length === 0) {
    return {
      query,
      found: false,
      message: `No matching product located for "${query}".`,
      results: []
    };
  }

  const results = [];

  for (const prod of products) {
    const stockEntries = await Stock.find({ product: prod._id })
      .populate('warehouse', 'name code location city contactPerson phone')
      .lean();

    const totalStock = stockEntries.reduce((sum, s) => sum + (s.quantity || 0), 0);

    const locations = stockEntries.map((s) => {
      const bin = s.locationBin || 'General Floor';
      // Parse Rack/Bay from bin string if formatted like "Rack A2 - Bay 03"
      let rack = 'Floor';
      let bay = 'Standard';
      if (bin.includes('Rack')) {
        const parts = bin.split('-');
        rack = parts[0]?.trim() || 'Rack Area';
        bay = parts[1]?.trim() || 'Bay Storage';
      }

      return {
        warehouseId: s.warehouse?._id,
        warehouseName: s.warehouse?.name || 'Central Facility',
        warehouseCode: s.warehouse?.code || '',
        location: s.warehouse?.location || '',
        city: s.warehouse?.city || '',
        locationBin: bin,
        rack,
        bay,
        quantity: s.quantity,
        reservedQuantity: s.reservedQuantity || 0,
        availableQuantity: Math.max(0, s.quantity - (s.reservedQuantity || 0))
      };
    });

    results.push({
      product: {
        _id: prod._id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category?.name || 'General',
        unitOfMeasure: prod.unitOfMeasure || 'units',
        reorderLevel: prod.reorderLevel || 10
      },
      totalStock,
      locations
    });
  }

  return {
    query,
    found: true,
    matchCount: results.length,
    results
  };
};

/**
 * 7. EXPLAIN THIS STOCK NUMBER
 * Builds transparent math explanation from actual stock ledger transaction timeline
 */
const explainStockNumber = async (productId, warehouseId = null) => {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error('A valid product ID is required');
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId)
    .populate('category', 'name code')
    .lean();

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const ledgerFilter = { product: productId };
  if (warehouseId && mongoose.Types.ObjectId.isValid(warehouseId)) {
    ledgerFilter.warehouse = warehouseId;
  }

  const ledgerEntries = await StockLedger.find(ledgerFilter)
    .populate('warehouse', 'name code')
    .populate('user', 'name role')
    .sort({ createdAt: 1 }) // Chronological order
    .lean();

  // Baseline / Starting Stock
  let startingStock = 0;
  let totalReceipts = 0;
  let totalDeliveries = 0;
  let totalAdjustmentsPositive = 0;
  let totalAdjustmentsNegative = 0;
  let totalTransfersIn = 0;
  let totalTransfersOut = 0;

  if (ledgerEntries.length > 0) {
    // If the earliest ledger entry is an INIT receipt, that establishes baseline
    const firstEntry = ledgerEntries[0];
    startingStock = firstEntry.quantityBefore || 0;
  }

  const timeline = [];

  for (const entry of ledgerEntries) {
    const change = entry.quantityChange ?? entry.quantityChanged ?? 0;
    const op = (entry.operationType || entry.transactionType || '').toUpperCase();

    if (op === 'RECEIPT') {
      totalReceipts += Math.abs(change);
    } else if (op === 'DELIVERY') {
      totalDeliveries += Math.abs(change);
    } else if (op === 'ADJUSTMENT') {
      if (change > 0) totalAdjustmentsPositive += change;
      else totalAdjustmentsNegative += Math.abs(change);
    } else if (op === 'TRANSFER_IN') {
      totalTransfersIn += Math.abs(change);
    } else if (op === 'TRANSFER_OUT') {
      totalTransfersOut += Math.abs(change);
    }

    timeline.push({
      id: entry._id,
      timestamp: entry.createdAt,
      operation: op,
      referenceNumber: entry.referenceNumber || entry.referenceId || 'N/A',
      change,
      quantityBefore: entry.quantityBefore,
      quantityAfter: entry.quantityAfter ?? entry.balanceAfter,
      warehouseName: entry.warehouse?.name || 'Warehouse',
      userName: entry.user?.name || 'System',
      notes: entry.notes || ''
    });
  }

  // Calculate current stock from DB
  const stockFilter = { product: productId };
  if (warehouseId && mongoose.Types.ObjectId.isValid(warehouseId)) {
    stockFilter.warehouse = warehouseId;
  }
  const currentStocks = await Stock.find(stockFilter).lean();
  const currentStock = currentStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Net Discrepancy Adjustments
  const netAdjustment = totalAdjustmentsPositive - totalAdjustmentsNegative;

  return {
    product: {
      _id: product._id,
      name: product.name,
      sku: product.sku,
      unitOfMeasure: product.unitOfMeasure || 'units',
      category: product.category?.name || 'General'
    },
    warehouse: warehouseId ? { _id: warehouseId } : null,
    currentStock,
    explanation: {
      startingStock,
      receipts: totalReceipts,
      deliveries: totalDeliveries,
      adjustmentsPositive: totalAdjustmentsPositive,
      adjustmentsNegative: totalAdjustmentsNegative,
      netAdjustment,
      transfersIn: totalTransfersIn,
      transfersOut: totalTransfersOut,
      formulaDisplay: `Starting (${startingStock}) + Receipts (${totalReceipts}) - Deliveries (${totalDeliveries}) ${
        netAdjustment >= 0 ? `+ Adjustments (${netAdjustment})` : `- Adjustments (${Math.abs(netAdjustment)})`
      } ${
        totalTransfersIn > 0 ? `+ Transfers In (${totalTransfersIn})` : ''
      } ${
        totalTransfersOut > 0 ? `- Transfers Out (${totalTransfersOut})` : ''
      } = ${currentStock}`
    },
    timeline
  };
};

module.exports = {
  getDailyActions,
  getStockForecast,
  getRiskRadar,
  getAnomalies,
  reviewAnomaly,
  simulateInventory,
  applySimulation,
  findStockLocations,
  explainStockNumber
};
