const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'SKU (Stock Keeping Unit) is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required']
    },
    unitOfMeasure: {
      type: String,
      required: [true, 'Unit of measure is required'],
      default: 'pcs',
      trim: true
    },
    minStockLevel: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock level cannot be negative']
    },
    maxStockLevel: {
      type: Number,
      default: 0,
      min: [0, 'Maximum stock level cannot be negative']
    },
    reorderPoint: {
      type: Number,
      default: 0,
      min: [0, 'Reorder point cannot be negative']
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'Cost price cannot be negative']
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: [0, 'Selling price cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
