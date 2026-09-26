const { AuditLog } = require('../models');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get paginated & filtered audit logs
 * GET /api/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      user,
      action,
      module: moduleFilter,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};

    if (user) {
      query.user = user;
    }

    if (action) {
      query.action = action;
    }

    if (moduleFilter) {
      query.$or = [{ module: moduleFilter }, { entityType: moduleFilter }];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { action: regex },
        { module: regex },
        { recordId: regex }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return successResponse(
      res,
      'Audit logs retrieved successfully',
      {
        logs,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};
