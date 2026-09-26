const mongoose = require('mongoose');
const { ALL_OPERATION_STATUSES } = require('../utils/constants');

const transferItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Transfer quantity is required'],
      min: [1, 'Transfer quantity must be at least 1']
    }
  },
  { _id: true }
);

const internalTransferSchema = new mongoose.Schema(
  {
    transferNumber: {
      type: String,
      required: [true, 'Transfer number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    sourceWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Source warehouse is required']
    },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Destination warehouse is required']
    },
    items: {
      type: [transferItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Transfer must contain at least one item'
      }
    },
    status: {
      type: String,
      enum: ALL_OPERATION_STATUSES,
      default: 'Draft'
    },
    transferDate: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Validate source and destination are different
internalTransferSchema.pre('validate', function (next) {
  if (
    this.sourceWarehouse &&
    this.destinationWarehouse &&
    this.sourceWarehouse.toString() === this.destinationWarehouse.toString()
  ) {
    this.invalidate('destinationWarehouse', 'Source and destination warehouses cannot be the same');
  }

  if (this.createdBy && !this.initiatedBy) this.initiatedBy = this.createdBy;
  if (this.initiatedBy && !this.createdBy) this.createdBy = this.initiatedBy;

  next();
});

internalTransferSchema.virtual('products').get(function () {
  return this.items;
});

internalTransferSchema.set('toJSON', { virtuals: true });
internalTransferSchema.set('toObject', { virtuals: true });

const InternalTransfer = mongoose.model('InternalTransfer', internalTransferSchema);

module.exports = InternalTransfer;
