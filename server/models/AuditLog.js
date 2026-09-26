const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      trim: true
    },
    entityType: {
      type: String,
      trim: true
    },
    recordId: {
      type: String,
      trim: true
    },
    entityId: {
      type: String,
      trim: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ recordId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
