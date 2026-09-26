const mongoose = require('mongoose');
const { TRANSACTION_TYPES } = require('../utils/constants');

const stockLedgerSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse reference is required']
    },
    transactionType: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: Object.values(TRANSACTION_TYPES)
    },
    referenceNumber: {
      type: String,
      required: [true, 'Reference number is required'],
      trim: true
    },
    quantityChanged: {
      type: Number,
      required: [true, 'Quantity changed is required']
    },
    balanceAfter: {
      type: Number,
      required: [true, 'Balance after transaction is required'],
      min: [0, 'Balance after transaction cannot be negative']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    notes: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

// Indexes for high performance ledger queries
stockLedgerSchema.index({ product: 1, warehouse: 1, timestamp: -1 });
stockLedgerSchema.index({ referenceNumber: 1 });

const StockLedger = mongoose.model('StockLedger', stockLedgerSchema);

module.exports = StockLedger;
