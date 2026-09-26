const mongoose = require('mongoose');
const { DELIVERY_STATUS } = require('../utils/constants');

const deliveryItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    quantityDelivered: {
      type: Number,
      required: [true, 'Delivered quantity is required'],
      min: [1, 'Quantity must be at least 1']
    }
  },
  { _id: true }
);

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
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.DRAFT
    },
    deliveryDate: {
      type: Date,
      default: Date.now
    },
    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dispatching user reference is required']
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

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
