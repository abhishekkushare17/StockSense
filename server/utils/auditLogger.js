const { AuditLog } = require('../models');

/**
 * Audit Logger utility
 * Logs system actions asynchronously without blocking the primary request thread.
 */
const logAudit = async ({
  user,
  action,
  module,
  entityType,
  recordId,
  entityId,
  oldValue = null,
  newValue = null,
  details = {},
  ipAddress = ''
}) => {
  try {
    const userId = user?._id || user?.id || (typeof user === 'string' ? user : null);
    await AuditLog.create({
      user: userId,
      action,
      module: module || entityType || 'System',
      entityType: entityType || module || 'General',
      recordId: recordId || entityId || '',
      entityId: entityId || recordId || '',
      oldValue,
      newValue,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

module.exports = {
  logAudit
};
