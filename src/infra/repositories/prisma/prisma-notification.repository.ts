import { prisma } from '@/infra/database/prisma';
import { INotificationRepository } from '@/core/ports/notification-repository.port';
import { PlatformNotification } from '@/core/domain/types';

export class PrismaNotificationRepository implements INotificationRepository {
  async getNotifications(userId?: string): Promise<PlatformNotification[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: null },
          ...(userId ? [{ userId }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return notifications.map((n) => ({
      id: n.id,
      type: n.type as any,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt.toISOString(),
      read: n.read,
      linkUrl: n.linkUrl ?? undefined,
    }));
  }

  async createNotification(notification: PlatformNotification, userId?: string): Promise<PlatformNotification> {
    const created = await prisma.notification.create({
      data: {
        id: notification.id,
        userId: userId || null,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read || false,
        linkUrl: notification.linkUrl,
        createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date(),
      },
    });

    return {
      id: created.id,
      type: created.type as any,
      title: created.title,
      message: created.message,
      createdAt: created.createdAt.toISOString(),
      read: created.read,
      linkUrl: created.linkUrl ?? undefined,
    };
  }

  async markAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId?: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: null },
          ...(userId ? [{ userId }] : []),
        ],
      },
      data: { read: true },
    });
  }
}
