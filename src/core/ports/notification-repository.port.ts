import { PlatformNotification } from '../domain/types';

export interface INotificationRepository {
  getNotifications(userId?: string): Promise<PlatformNotification[]>;
  createNotification(notification: PlatformNotification, userId?: string): Promise<PlatformNotification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId?: string): Promise<void>;
}
