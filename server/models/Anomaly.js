const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null
    },
    type: {
      type: String,
      required: true,
      enum: ['MOVEMENT_SPIKE', 'UNUSUAL_ADJUSTMENT', 'SUDDEN_STOCK_DROP', 'DISCREPANCY_DETECTED'],
      default: 'MOVEMENT_SPIKE'
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'WARNING', 'INFO'],
      default: 'WARNING'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    normalBaseline: {
      type: String,
      default: '10–20 units/day'
    },
    detectedValue: {
      type: mongoose.Schema.Types.Mixed,
      default: 0
    },
    reason: {
      type: String,
      default: 'Unusually high stock movement detected.'
    },
    referenceModel: {
      type: String,
      enum: ['StockLedger', 'StockAdjustment', 'Delivery', 'Receipt'],
      default: 'StockLedger'
    },
    referenceId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['OPEN', 'REVIEWED', 'DISMISSED'],
      default: 'OPEN'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

anomalySchema.index({ status: 1, createdAt: -1 });
anomalySchema.index({ product: 1, warehouse: 1 });

const Anomaly = mongoose.model('Anomaly', anomalySchema);

module.exports = Anomaly;
