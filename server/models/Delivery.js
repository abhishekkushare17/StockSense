const mongoose = require('mongoose');
const { ALL_OPERATION_STATUSES } = require('../utils/constants');

const deliveryItemSchema = new mongoose.Schema(
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
    quantityDelivered: {
      type: Number,
      min: [1, 'Quantity must be at least 1']
    }
  },
  { _id: true }
);

deliveryItemSchema.pre('validate', function (next) {
  if (this.quantity && !this.quantityDelivered) this.quantityDelivered = this.quantity;
  if (this.quantityDelivered && !this.quantity) this.quantity = this.quantityDelivered;
  next();
});

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: {
      type: String,
      required: [true, 'Delivery number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customer: {
      type: String,
      trim: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Source warehouse is required']
    },
    items: {
      type: [deliveryItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'Delivery order must contain at least one item'
      }
    },
    status: {
      type: String,
      enum: ALL_OPERATION_STATUSES,
      default: 'Draft'
    },
    deliveryDate: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dispatchedBy: {
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

deliverySchema.pre('validate', function (next) {
  if (this.customerName && !this.customer) this.customer = this.customerName;
  if (this.customer && !this.customerName) this.customerName = this.customer;
  if (this.createdBy && !this.dispatchedBy) this.dispatchedBy = this.createdBy;
  if (this.dispatchedBy && !this.createdBy) this.createdBy = this.dispatchedBy;
  next();
});

deliverySchema.virtual('products').get(function () {
  return this.items;
});

deliverySchema.set('toJSON', { virtuals: true });
deliverySchema.set('toObject', { virtuals: true });

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
