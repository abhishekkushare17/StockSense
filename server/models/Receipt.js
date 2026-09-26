const mongoose = require('mongoose');
const { RECEIPT_STATUS } = require('../utils/constants');

const receiptItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantityReceived: {
      type: Number,
      required: [true, 'Received quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitCost: {
      type: Number,
      default: 0,
      min: [0, 'Unit cost cannot be negative']
    }
  },
  { _id: true }
);

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Target warehouse is required']
    },
    items: {
      type: [receiptItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Receipt must contain at least one item'
      }
    },
    status: {
      type: String,
      enum: Object.values(RECEIPT_STATUS),
      default: RECEIPT_STATUS.DRAFT
    },
    receivedDate: {
      type: Date,
      default: Date.now
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiving user reference is required']
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

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
