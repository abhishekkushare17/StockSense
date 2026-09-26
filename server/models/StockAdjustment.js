const mongoose = require('mongoose');
const { ADJUSTMENT_STATUS } = require('../utils/constants');

const adjustmentItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    oldQuantity: {
      type: Number,
      required: [true, 'Previous quantity is required'],
      min: [0, 'Previous quantity cannot be negative']
    },
    newQuantity: {
      type: Number,
      required: [true, 'New adjusted quantity is required'],
      min: [0, 'New quantity cannot be negative']
    },
    reason: {
      type: String,
      required: [true, 'Adjustment reason is required'],
      trim: true
    }
  },
  { _id: true }
);

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
      enum: Object.values(ADJUSTMENT_STATUS),
      default: ADJUSTMENT_STATUS.DRAFT
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Adjusting user reference is required']
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const StockAdjustment = mongoose.model('StockAdjustment', stockAdjustmentSchema);

module.exports = StockAdjustment;
