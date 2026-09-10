import { FileSportRepository } from '@/infra/storage/file-sport-repository';
import { PlatformNotification } from '@/core/domain/types';

export class NotificationService {
  private static instance: NotificationService;
  private repo: FileSportRepository;

  private constructor() {
    this.repo = FileSportRepository.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Genera las notificaciones dinámicas del sistema basadas en eventos próximos y en vivo
   */
  async getNotifications(): Promise<PlatformNotification[]> {
    const events = await this.repo.getEvents();
    const calendar = await this.repo.getCalendar();
    const notifications: PlatformNotification[] = [];

    // 1. Notificación de evento en curso o estelar
    if (events.length > 0) {
      const activeEvent = events[0];
      const mainBout = activeEvent.matches.find(m => m.isMainEvent) || activeEvent.matches[0];
      const red = mainBout?.participants.find(p => p.side === 'RED_CORNER')?.participant.displayName;
      const blue = mainBout?.participants.find(p => p.side === 'BLUE_CORNER')?.participant.displayName;

      notifications.push({
        id: 'notif-event-active',
        type: 'EVENT_STARTING',
        title: '🔥 Próximo Combate Estelar UFC',
        message: activeEvent.name + ': ' + (red && blue ? red + ' vs ' + blue : 'Cartelera oficial confirmada') + '. ¡Haz tus predicciones!',
        createdAt: new Date().toISOString(),
        read: false,
        linkUrl: '#fightcard',
      });
    }

    // 2. Notificaciones de calendario futuro
    if (calendar.length > 1) {
      const nextCal = calendar[1];
      notifications.push({
        id: 'notif-cal-' + nextCal.id,
        type: 'NEXT_EVENT',
        title: '📅 En el radar: ' + nextCal.label,
        message: 'Evento programado en ' + (nextCal.location || 'Sede oficial UFC') + '. Cartelera en conformación.',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        read: false,
        linkUrl: '#calendario',
      });
    }

    // 3. Notificación de sistema de predicciones
    notifications.push({
      id: 'notif-predictions-launch',
      type: 'PREDICTION_RESOLVED',
      title: '🎯 Simulador de Apuestas Activo',
      message: 'Elige ganadores por pelea individual o arma tu combo/parlay en la cartelera para sumar puntos y subir en el ranking.',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      read: true,
      linkUrl: '#fightcard',
    });

    return notifications;
  }
}
