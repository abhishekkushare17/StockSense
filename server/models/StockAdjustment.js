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
      min: [0, 'Recorded quantity cannot be negative']
    },
    newQuantity: {
      type: Number,
      required: [true, 'Physical counted quantity is required'],
      min: [0, 'Physical counted quantity cannot be negative']
    },
    physicalQuantity: {
      type: Number,
      min: [0, 'Physical counted quantity cannot be negative']
    },
    difference: {
      type: Number
    },
    reason: {
      type: String,
      required: [true, 'Adjustment reason is required'],
      trim: true
    }
  },
  { _id: true }
);

adjustmentItemSchema.pre('validate', function (next) {
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

  next();
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

stockAdjustmentSchema.pre('validate', function (next) {
  if (this.createdBy && !this.adjustedBy) this.adjustedBy = this.createdBy;
  if (this.adjustedBy && !this.createdBy) this.createdBy = this.adjustedBy;
  next();
});

stockAdjustmentSchema.virtual('products').get(function () {
  return this.items;
});

stockAdjustmentSchema.set('toJSON', { virtuals: true });
stockAdjustmentSchema.set('toObject', { virtuals: true });

const StockAdjustment = mongoose.model('StockAdjustment', stockAdjustmentSchema);

module.exports = StockAdjustment;
