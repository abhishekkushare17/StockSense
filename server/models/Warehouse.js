const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Warehouse code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    contactPerson: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
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

// Pre-save hook: auto-fill location if not provided from city/state/address, and sync status
warehouseSchema.pre('save', function (next) {
  if (!this.location || !this.location.trim()) {
    const locParts = [this.city, this.state, this.address].filter(Boolean);
    if (locParts.length > 0) {
      this.location = locParts.join(', ');
    }
  }

  if (this.isModified('status')) {
    this.isActive = this.status === 'active';
  } else if (this.isModified('isActive')) {
    this.status = this.isActive ? 'active' : 'inactive';
  }

  next();
});

warehouseSchema.set('toJSON', { virtuals: true });
warehouseSchema.set('toObject', { virtuals: true });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
