import api from './api';

/**
 * Notification Service
 */
export const notificationService = {
  /**
   * Fetch all notifications with counts and categorised alerts
   */
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data?.data || {
      unreadCount: 0,
      notifications: [],
      alerts: {
        lowStock: [],
        outOfStock: [],
        pendingReceipts: [],
        pendingDeliveries: [],
        transfers: []
      }
    };
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data?.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data?.data;
  }
};

export default notificationService;
