import { apiClient } from './apiClient';
import { AppNotification } from '../../types';

export const notificationApi = {
  async getNotifications(): Promise<AppNotification[]> {
    const raw = await apiClient<any[]>('/notifications');
    return (raw || []).map((n: any) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type || 'info',
      read: !!n.read,
      link: n.link,
      createdAt: n.createdAt,
    }));
  },

  async getUnreadCount(): Promise<number> {
    const raw = await apiClient<{ unreadCount: number }>('/notifications/unread-count');
    return raw?.unreadCount ?? 0;
  },

  async markAsRead(id: string): Promise<AppNotification> {
    const raw = await apiClient<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return {
      id: raw.id,
      userId: raw.userId,
      title: raw.title,
      message: raw.message,
      type: raw.type || 'info',
      read: !!raw.read,
      link: raw.link,
      createdAt: raw.createdAt,
    };
  },

  async markAllAsRead(): Promise<void> {
    await apiClient('/notifications/read-all', {
      method: 'PATCH',
    });
  },
};
