import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NotificationService } from './notification.service';
import { InMemoryNotificationRepository } from '@/infra/repositories/in-memory/in-memory-notification.repository';

describe('NotificationService (Modulo de Notificaciones Desacoplado)', () => {
  let notifRepo: InMemoryNotificationRepository;
  let service: NotificationService;

  beforeEach(() => {
    notifRepo = new InMemoryNotificationRepository();
    const mockSportRepo = {
      getEvents: async () => [
        {
          id: 'ufc-300',
          name: 'UFC 300: Pereira vs. Hill',
          matches: [
            {
              isMainEvent: true,
              participants: [
                { side: 'RED_CORNER', participant: { displayName: 'Alex Pereira' } },
                { side: 'BLUE_CORNER', participant: { displayName: 'Jamahal Hill' } },
              ],
            },
          ],
        },
      ],
      getCalendar: async () => [
        { id: 'c1', label: 'UFC 300' },
        { id: 'c2', label: 'UFC 301', location: 'Rio de Janeiro' },
      ],
    };

    service = new NotificationService(notifRepo, mockSportRepo);
  });

  test('Debe generar y persistir notificaciones de eventos próximos si no existen', async () => {
    const notifs = await service.getNotifications('test-user');
    assert.ok(notifs.length >= 2);

    const mainEventNotif = notifs.find((n) => n.type === 'EVENT_STARTING');
    assert.ok(mainEventNotif);
    assert.match(mainEventNotif.message, /Alex Pereira vs Jamahal Hill/);
  });

  test('Debe marcar notificaciones como leídas', async () => {
    const notifs = await service.getNotifications('test-user');
    const first = notifs[0];

    await service.markAsRead(first.id);
    const updated = await service.getNotifications('test-user');
    const updatedFirst = updated.find((n) => n.id === first.id);
    assert.equal(updatedFirst?.read, true);
  });
});
