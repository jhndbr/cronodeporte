import { INotificationRepository } from '@/core/ports/notification-repository.port';
import { PlatformNotification } from '@/core/domain/types';

export class InMemoryNotificationRepository implements INotificationRepository {
  private notifications: Map<string, { notification: PlatformNotification; userId?: string }> = new Map();

  async getNotifications(userId?: string): Promise<PlatformNotification[]> {
    const result: PlatformNotification[] = [];
    for (const item of this.notifications.values()) {
      if (!item.userId || item.userId === userId) {
        result.push(JSON.parse(JSON.stringify(item.notification)));
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notification: PlatformNotification, userId?: string): Promise<PlatformNotification> {
    const copy = JSON.parse(JSON.stringify(notification));
    this.notifications.set(notification.id, { notification: copy, userId });
    return copy;
  }

  async markAsRead(id: string): Promise<void> {
    const item = this.notifications.get(id);
    if (item) {
      item.notification.read = true;
    }
  }

  async markAllAsRead(userId?: string): Promise<void> {
    for (const item of this.notifications.values()) {
      if (!item.userId || item.userId === userId) {
        item.notification.read = true;
      }
    }
  }

  clear(): void {
    this.notifications.clear();
  }
}
