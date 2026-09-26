import api from './api';

export const auditLogService = {
  /**
   * Get paginated audit logs with optional filters
   */
  async getAuditLogs(params = {}) {
    const response = await api.get('/audit-logs', { params });
    return response.data?.data || { logs: [], pagination: {} };
  }
};

export default auditLogService;
