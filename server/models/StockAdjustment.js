const mongoose = require('mongoose');
const { ALL_OPERATION_STATUSES } = require('../utils/constants');

const adjustmentItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    oldQuantity: {
      type: Number,
      required: [true, 'Recorded quantity is required'],
      min: [0, 'Recorded quantity cannot be negative']
    },
    recordedQuantity: {
      type: Number,
      default: function () {
        return this.oldQuantity;
      },
      min: [0, 'Recorded quantity cannot be negative']
    },
    newQuantity: {
      type: Number,
      required: [true, 'Physical counted quantity is required'],
      min: [0, 'Physical counted quantity cannot be negative']
    },
    physicalQuantity: {
      type: Number,
      default: function () {
        return this.newQuantity;
      },
      min: [0, 'Physical counted quantity cannot be negative']
    },
    difference: {
      type: Number,
      default: function () {
        const p = this.physicalQuantity !== undefined ? this.physicalQuantity : this.newQuantity;
        const r = this.recordedQuantity !== undefined ? this.recordedQuantity : this.oldQuantity;
        if (p !== undefined && r !== undefined) {
          return p - r;
        }
        return 0;
      }
    },
    reason: {
      type: String,
      required: [true, 'Adjustment reason is required'],
      trim: true
    }
  },
  { _id: true }
);

adjustmentItemSchema.pre('validate', function () {
  if (this.oldQuantity !== undefined && this.recordedQuantity === undefined) {
    this.recordedQuantity = this.oldQuantity;
  }
  if (this.recordedQuantity !== undefined && this.oldQuantity === undefined) {
    this.oldQuantity = this.recordedQuantity;
  }

  if (this.newQuantity !== undefined && this.physicalQuantity === undefined) {
    this.physicalQuantity = this.newQuantity;
  }
  if (this.physicalQuantity !== undefined && this.newQuantity === undefined) {
    this.newQuantity = this.physicalQuantity;
  }

  if (this.newQuantity !== undefined && this.oldQuantity !== undefined) {
    this.difference = this.newQuantity - this.oldQuantity;
  }
});

const stockAdjustmentSchema = new mongoose.Schema(
  {
    adjustmentNumber: {
      type: String,
      required: [true, 'Adjustment number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse reference is required']
    },
    items: {
      type: [adjustmentItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Adjustment must contain at least one item'
      }
    },
    status: {
      type: String,
      enum: ALL_OPERATION_STATUSES,
      default: 'Draft'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    adjustedBy: {
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

stockAdjustmentSchema.pre('validate', function () {
  if (this.createdBy && !this.adjustedBy) this.adjustedBy = this.createdBy;
  if (this.adjustedBy && !this.createdBy) this.createdBy = this.adjustedBy;

  if (this.items && Array.isArray(this.items)) {
    for (const item of this.items) {
      if (item.oldQuantity !== undefined && item.recordedQuantity === undefined) {
        item.recordedQuantity = item.oldQuantity;
      }
      if (item.recordedQuantity !== undefined && item.oldQuantity === undefined) {
        item.oldQuantity = item.recordedQuantity;
      }
      if (item.newQuantity !== undefined && item.physicalQuantity === undefined) {
        item.physicalQuantity = item.newQuantity;
      }
      if (item.physicalQuantity !== undefined && item.newQuantity === undefined) {
        item.newQuantity = item.physicalQuantity;
      }
      if (item.newQuantity !== undefined && item.oldQuantity !== undefined) {
        item.difference = item.newQuantity - item.oldQuantity;
      }
    }
  }
});

stockAdjustmentSchema.virtual('products').get(function () {
  return this.items;
});

stockAdjustmentSchema.set('toJSON', { virtuals: true });
stockAdjustmentSchema.set('toObject', { virtuals: true });

const StockAdjustment = mongoose.model('StockAdjustment', stockAdjustmentSchema);

module.exports = StockAdjustment;
