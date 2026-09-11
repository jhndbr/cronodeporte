import { INotificationRepository } from '@/core/ports/notification-repository.port';
import { PrismaNotificationRepository } from '@/infra/repositories/prisma/prisma-notification.repository';
import { PlatformNotification } from '@/core/domain/types';
import { FileSportRepository } from '@/infra/storage/file-sport-repository';

export class NotificationService {
  private static instance: NotificationService;
  private readonly notificationRepo: INotificationRepository;
  private readonly sportRepo: { getEvents: () => Promise<any[]>; getCalendar: () => Promise<any[]> };

  constructor(
    notificationRepo?: INotificationRepository,
    sportRepo?: { getEvents: () => Promise<any[]>; getCalendar: () => Promise<any[]> }
  ) {
    this.notificationRepo = notificationRepo || new PrismaNotificationRepository();
    this.sportRepo = sportRepo || FileSportRepository.getInstance();
  }

  public static getInstance(
    notificationRepo?: INotificationRepository,
    sportRepo?: { getEvents: () => Promise<any[]>; getCalendar: () => Promise<any[]> }
  ): NotificationService {
    if (!NotificationService.instance || notificationRepo || sportRepo) {
      NotificationService.instance = new NotificationService(notificationRepo, sportRepo);
    }
    return NotificationService.instance;
  }

  /**
   * Obtiene notificaciones persistidas y genera dinámicamente las basadas en eventos
   */
  async getNotifications(userId?: string): Promise<PlatformNotification[]> {
    const persisted = await this.notificationRepo.getNotifications(userId);
    if (persisted.length > 0) {
      return persisted;
    }

    // Si no hay notificaciones en la base de datos, generar dinámicas y sembrarlas
    const dynamicNotifs: PlatformNotification[] = [];

    try {
      const events = await this.sportRepo.getEvents();
      const calendar = await this.sportRepo.getCalendar();

      if (events.length > 0) {
        const activeEvent = events[0];
        const mainBout = activeEvent.matches?.find((m: any) => m.isMainEvent) || activeEvent.matches?.[0];
        const red = mainBout?.participants?.find((p: any) => p.side === 'RED_CORNER')?.participant?.displayName;
        const blue = mainBout?.participants?.find((p: any) => p.side === 'BLUE_CORNER')?.participant?.displayName;

        dynamicNotifs.push({
          id: 'notif-event-active',
          type: 'EVENT_STARTING',
          title: '🔥 Próximo Combate Estelar UFC',
          message:
            activeEvent.name +
            ': ' +
            (red && blue ? red + ' vs ' + blue : 'Cartelera oficial confirmada') +
            '. ¡Haz tus predicciones!',
          createdAt: new Date().toISOString(),
          read: false,
          linkUrl: '#fightcard',
        });
      }

      if (calendar.length > 1) {
        const nextCal = calendar[1];
        dynamicNotifs.push({
          id: 'notif-cal-' + nextCal.id,
          type: 'NEXT_EVENT',
          title: '📅 En el radar: ' + nextCal.label,
          message: 'Evento programado en ' + (nextCal.location || 'Sede oficial UFC') + '. Cartelera en conformación.',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          read: false,
          linkUrl: '#calendario',
        });
      }
    } catch {
      // Continuar con notificaciones mínimas
    }

    dynamicNotifs.push({
      id: 'notif-predictions-launch',
      type: 'PREDICTION_RESOLVED',
      title: '🎯 Simulador de Predicciones Activo',
      message: 'Elige ganadores por pelea individual o arma tu combo en la cartelera para sumar puntos y subir en el ranking.',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      read: true,
      linkUrl: '#fightcard',
    });

    for (const notif of dynamicNotifs) {
      await this.notificationRepo.createNotification(notif, userId);
    }

    return this.notificationRepo.getNotifications(userId);
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationRepo.markAsRead(id);
  }

  async markAllAsRead(userId?: string): Promise<void> {
    await this.notificationRepo.markAllAsRead(userId);
  }
}
