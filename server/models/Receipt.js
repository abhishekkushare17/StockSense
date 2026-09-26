const mongoose = require('mongoose');
const { ALL_OPERATION_STATUSES } = require('../utils/constants');

const receiptItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    quantityReceived: {
      type: Number,
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

receiptItemSchema.pre('validate', function (next) {
  if (this.quantity && !this.quantityReceived) this.quantityReceived = this.quantity;
  if (this.quantityReceived && !this.quantity) this.quantity = this.quantityReceived;
  next();
});

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    supplier: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true
    },
    supplierName: {
      type: String,
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
      enum: ALL_OPERATION_STATUSES,
      default: 'Draft'
    },
    receivedDate: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    receivedBy: {
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

receiptSchema.pre('validate', function (next) {
  if (this.supplier && !this.supplierName) this.supplierName = this.supplier;
  if (this.supplierName && !this.supplier) this.supplier = this.supplierName;
  if (this.createdBy && !this.receivedBy) this.receivedBy = this.createdBy;
  if (this.receivedBy && !this.createdBy) this.createdBy = this.receivedBy;
  next();
});

receiptSchema.virtual('products').get(function () {
  return this.items;
});

receiptSchema.set('toJSON', { virtuals: true });
receiptSchema.set('toObject', { virtuals: true });

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
