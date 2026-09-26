const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// Allow Admin and Inventory Manager to view full audit logs
router.get('/', auditLogController.getAuditLogs);

module.exports = router;
