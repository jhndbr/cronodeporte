import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PredictionService } from './prediction.service';
import { InMemoryPredictionRepository } from '@/infra/repositories/in-memory/in-memory-prediction.repository';
import { InMemoryUserRepository } from '@/infra/repositories/in-memory/in-memory-user.repository';
import { UserService } from '../users/user.service';

describe('PredictionService (Modulo de Predicciones Desacoplado)', () => {
  let predRepo: InMemoryPredictionRepository;
  let userRepo: InMemoryUserRepository;
  let userService: UserService;
  let predService: PredictionService;
  let testUserId: string;

  beforeEach(async () => {
    predRepo = new InMemoryPredictionRepository();
    userRepo = new InMemoryUserRepository();
    userService = new UserService(userRepo);
    predService = new PredictionService(predRepo, userService);

    const user = await userService.getOrCreateUser({
      name: 'Fanático Apuestas',
      email: 'picks@ufc.com',
    });
    testUserId = user.id;
  });

  test('Debe crear un boleto individual con 10 puntos base', async () => {
    const ticket = await predService.createTicket({
      userId: testUserId,
      type: 'SINGLE',
      picks: [
        {
          matchId: 'match-1',
          eventName: 'UFC 305',
          selectedSide: 'RED_CORNER',
          selectedFighterId: 'athlete-du-plessis',
          selectedFighterName: 'Dricus Du Plessis',
          opponentFighterId: 'athlete-adesanya',
          opponentFighterName: 'Israel Adesanya',
        },
      ],
    });

    assert.ok(ticket.id);
    assert.equal(ticket.type, 'SINGLE');
    assert.equal(ticket.status, 'PENDING');
    assert.equal(ticket.pointsAwarded, 10);
    assert.equal(ticket.picks[0].status, 'PENDING');
  });

  test('Debe calcular puntos exponenciales para combo / parlay de 3 peleas', async () => {
    const ticket = await predService.createTicket({
      userId: testUserId,
      type: 'COMBO',
      picks: [
        {
          matchId: 'm-1',
          eventName: 'UFC París',
          selectedSide: 'RED_CORNER',
          selectedFighterId: 'athlete-hooker',
          selectedFighterName: 'Dan Hooker',
          opponentFighterId: 'athlete-parnasse',
          opponentFighterName: 'Salahdine Parnasse',
        },
        {
          matchId: 'm-2',
          eventName: 'UFC París',
          selectedSide: 'BLUE_CORNER',
          selectedFighterId: 'athlete-imavov',
          selectedFighterName: 'Nassourdine Imavov',
          opponentFighterId: 'athlete-allen',
          opponentFighterName: 'Brendan Allen',
        },
        {
          matchId: 'm-3',
          eventName: 'UFC París',
          selectedSide: 'RED_CORNER',
          selectedFighterId: 'athlete-moicano',
          selectedFighterName: 'Renato Moicano',
          opponentFighterId: 'athlete-saint-denis',
          opponentFighterName: 'Benoit Saint Denis',
        },
      ],
    });

    assert.equal(ticket.type, 'COMBO');
    // 10 * (1.8^3) = 10 * 5.832 = 58
    assert.equal(ticket.pointsAwarded, 58);
  });

  test('Debe rechazar creación de boleto sin picks', async () => {
    await assert.rejects(
      async () => {
        await predService.createTicket({
          userId: testUserId,
          type: 'SINGLE',
          picks: [],
        });
      },
      { message: 'Debes incluir al menos una predicción.' }
    );
  });

  test('Debe resolver un boleto individual a WON cuando gana el peleador elegido', async () => {
    const ticket = await predService.createTicket({
      userId: testUserId,
      type: 'SINGLE',
      picks: [
        {
          matchId: 'match-main-1',
          eventName: 'Noche UFC',
          selectedSide: 'RED_CORNER',
          selectedFighterId: 'athlete-silva',
          selectedFighterName: 'Jean Silva',
          opponentFighterId: 'athlete-delgado',
          opponentFighterName: 'Jose Delgado',
        },
      ],
    });

    const res = await predService.resolveTicketsForMatch('match-main-1', 'athlete-silva');
    assert.equal(res.resolvedCount, 1);

    const refreshed = await predRepo.getTicketById(ticket.id);
    assert.equal(refreshed?.status, 'WON');
    assert.equal(refreshed?.picks[0].status, 'CORRECT');

    // Verificar que las estadísticas del usuario se actualizaron
    const user = await userService.getUser(testUserId);
    assert.equal(user?.stats.correct, 1);
    assert.equal(user?.stats.accuracyRate, 100);
    assert.equal(user?.stats.totalPoints, 10);
  });

  test('Debe marcar un combo como LOST si falla al menos una pelea', async () => {
    const ticket = await predService.createTicket({
      userId: testUserId,
      type: 'COMBO',
      picks: [
        {
          matchId: 'm-combo-1',
          eventName: 'UFC 300',
          selectedSide: 'RED_CORNER',
          selectedFighterId: 'athlete-pereira',
          selectedFighterName: 'Alex Pereira',
          opponentFighterId: 'athlete-hill',
          opponentFighterName: 'Jamahal Hill',
        },
        {
          matchId: 'm-combo-2',
          eventName: 'UFC 300',
          selectedSide: 'RED_CORNER',
          selectedFighterId: 'athlete-gaethje',
          selectedFighterName: 'Justin Gaethje',
          opponentFighterId: 'athlete-holloway',
          opponentFighterName: 'Max Holloway',
        },
      ],
    });

    // Pelea 1: gana Pereira (acierto)
    await predService.resolveTicketsForMatch('m-combo-1', 'athlete-pereira');
    let partial = await predRepo.getTicketById(ticket.id);
    assert.equal(partial?.status, 'PENDING');

    // Pelea 2: gana Holloway (falla Gaethje)
    await predService.resolveTicketsForMatch('m-combo-2', 'athlete-holloway');
    let final = await predRepo.getTicketById(ticket.id);
    assert.equal(final?.status, 'LOST');

    const user = await userService.getUser(testUserId);
    assert.equal(user?.stats.correct, 1);
    assert.equal(user?.stats.incorrect, 1);
    assert.equal(user?.stats.accuracyRate, 50);
  });

  test('Debe marcar un combo como WON cuando se aciertan todas las peleas', async () => {
    const ticket = await predService.createTicket({
      userId: testUserId,
      type: 'COMBO',
      picks: [
        {
          matchId: 'c1',
          eventName: 'UFC 301',
          selectedSide: 'RED_CORNER',
          selectedFighterId: 'athlete-pantoja',
          selectedFighterName: 'Alexandre Pantoja',
          opponentFighterId: 'athlete-erceg',
          opponentFighterName: 'Steve Erceg',
        },
        {
          matchId: 'c2',
          eventName: 'UFC 301',
          selectedSide: 'RED_CORNER',
          selectedFighterId: 'athlete-aldo',
          selectedFighterName: 'Jose Aldo',
          opponentFighterId: 'athlete-martinez',
          opponentFighterName: 'Jonathan Martinez',
        },
      ],
    });

    await predService.resolveTicketsForMatch('c1', 'athlete-pantoja');
    await predService.resolveTicketsForMatch('c2', 'athlete-aldo');

    const final = await predRepo.getTicketById(ticket.id);
    assert.equal(final?.status, 'WON');

    const user = await userService.getUser(testUserId);
    assert.equal(user?.stats.correct, 2);
    assert.equal(user?.stats.incorrect, 0);
    assert.equal(user?.stats.accuracyRate, 100);
    assert.equal(user?.stats.totalPoints, ticket.pointsAwarded);
  });
});
