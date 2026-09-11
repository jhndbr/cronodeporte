import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { UserService } from './user.service';
import { InMemoryUserRepository } from '@/infra/repositories/in-memory/in-memory-user.repository';
import { PredictionTicket } from '@/core/domain/types';

describe('UserService (Modulo de Usuarios Desacoplado)', () => {
  let userRepo: InMemoryUserRepository;
  let userService: UserService;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    userService = new UserService(userRepo);
  });

  test('Debe crear un nuevo usuario con estadísticas iniciales en cero', async () => {
    const user = await userService.getOrCreateUser({
      name: 'Jon Jones',
      email: 'bones@ufc.com',
    });

    assert.ok(user.id);
    assert.equal(user.name, 'Jon Jones');
    assert.equal(user.email, 'bones@ufc.com');
    assert.equal(user.stats.totalPredictions, 0);
    assert.equal(user.stats.totalPoints, 0);
  });

  test('Debe devolver el usuario existente si ya coincide por email', async () => {
    const u1 = await userService.getOrCreateUser({
      name: 'Charles Oliveira',
      email: 'do.bronxs@ufc.com',
    });

    const u2 = await userService.getOrCreateUser({
      name: 'Charles do Bronx',
      email: 'do.bronxs@ufc.com',
    });

    assert.equal(u1.id, u2.id);
  });

  test('Debe recalcular estadísticas de usuario adecuadamente a partir de boletos', async () => {
    const user = await userService.getOrCreateUser({
      name: 'Dustin Poirier',
      email: 'diamond@ufc.com',
    });

    const mockTickets: PredictionTicket[] = [
      {
        id: 't-1',
        userId: user.id,
        type: 'SINGLE',
        status: 'WON',
        pointsAwarded: 10,
        createdAt: new Date().toISOString(),
        picks: [
          {
            matchId: 'm-1',
            eventName: 'UFC 300',
            selectedSide: 'RED_CORNER',
            selectedFighterId: 'f-1',
            selectedFighterName: 'Poirier',
            opponentFighterId: 'f-2',
            opponentFighterName: 'Saint Denis',
            status: 'CORRECT',
          },
        ],
      },
      {
        id: 't-2',
        userId: user.id,
        type: 'SINGLE',
        status: 'LOST',
        pointsAwarded: 10,
        createdAt: new Date().toISOString(),
        picks: [
          {
            matchId: 'm-2',
            eventName: 'UFC 302',
            selectedSide: 'BLUE_CORNER',
            selectedFighterId: 'f-1',
            selectedFighterName: 'Poirier',
            opponentFighterId: 'f-3',
            opponentFighterName: 'Makhachev',
            status: 'INCORRECT',
          },
        ],
      },
    ];

    const updatedStats = await userService.recalculateUserStatsFromTickets(user.id, mockTickets);
    assert.ok(updatedStats);
    assert.equal(updatedStats?.totalPredictions, 2);
    assert.equal(updatedStats?.correct, 1);
    assert.equal(updatedStats?.incorrect, 1);
    assert.equal(updatedStats?.accuracyRate, 50); // 1 de 2 = 50%
    assert.equal(updatedStats?.totalPoints, 10);
  });
});
