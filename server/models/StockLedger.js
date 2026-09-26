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
    operationType: {
      type: String,
      required: [true, 'Operation type is required'],
      enum: Object.values(TRANSACTION_TYPES)
    },
    transactionType: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES)
    },
    referenceId: {
      type: String,
      required: [true, 'Reference ID / document number is required'],
      trim: true
    },
    referenceNumber: {
      type: String,
      trim: true
    },
    quantityBefore: {
      type: Number,
      required: true,
      default: 0
    },
    quantityChange: {
      type: Number,
      required: [true, 'Quantity change is required']
    },
    quantityChanged: {
      type: Number
    },
    quantityAfter: {
      type: Number,
      required: [true, 'Quantity after transaction is required'],
      min: [0, 'Quantity after transaction cannot be negative']
    },
    balanceAfter: {
      type: Number,
      min: [0, 'Balance after transaction cannot be negative']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
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

// Pre-save synchronization of legacy/new field names
stockLedgerSchema.pre('save', function (next) {
  if (this.operationType && !this.transactionType) this.transactionType = this.operationType;
  if (this.transactionType && !this.operationType) this.operationType = this.transactionType;

  if (this.referenceId && !this.referenceNumber) this.referenceNumber = this.referenceId;
  if (this.referenceNumber && !this.referenceId) this.referenceId = this.referenceNumber;

  if (this.quantityChange !== undefined && this.quantityChanged === undefined) {
    this.quantityChanged = this.quantityChange;
  }
  if (this.quantityChanged !== undefined && this.quantityChange === undefined) {
    this.quantityChange = this.quantityChanged;
  }

  if (this.quantityAfter !== undefined && this.balanceAfter === undefined) {
    this.balanceAfter = this.quantityAfter;
  }
  if (this.balanceAfter !== undefined && this.quantityAfter === undefined) {
    this.quantityAfter = this.balanceAfter;
  }

  if (this.createdBy && !this.user) this.user = this.createdBy;
  if (this.user && !this.createdBy) this.createdBy = this.user;

  next();
});

// Indexes for high performance ledger queries
stockLedgerSchema.index({ product: 1, warehouse: 1, timestamp: -1 });
stockLedgerSchema.index({ referenceId: 1 });
stockLedgerSchema.index({ referenceNumber: 1 });

stockLedgerSchema.set('toJSON', { virtuals: true });
stockLedgerSchema.set('toObject', { virtuals: true });

const StockLedger = mongoose.model('StockLedger', stockLedgerSchema);

module.exports = StockLedger;
