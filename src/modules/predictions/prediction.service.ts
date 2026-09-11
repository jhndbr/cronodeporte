import { IPredictionRepository } from '@/core/ports/prediction-repository.port';
import { PrismaPredictionRepository } from '@/infra/repositories/prisma/prisma-prediction.repository';
import { PredictionTicket, BoutPick, TicketType } from '@/core/domain/types';
import { UserService } from '../users/user.service';
import { PredictionCalculator } from './prediction-calculator';

export class PredictionService {
  private static instance: PredictionService;
  private readonly repo: IPredictionRepository;
  private readonly userService: UserService;

  constructor(repo?: IPredictionRepository, userService?: UserService) {
    this.repo = repo || new PrismaPredictionRepository();
    this.userService = userService || UserService.getInstance();
  }

  public static getInstance(repo?: IPredictionRepository, userService?: UserService): PredictionService {
    if (!PredictionService.instance || repo || userService) {
      PredictionService.instance = new PredictionService(repo, userService);
    }
    return PredictionService.instance;
  }

  async createTicket(params: {
    userId: string;
    type: TicketType;
    picks: Array<{
      matchId: string;
      eventName: string;
      eventDate?: string;
      weightClass?: string;
      selectedSide: 'RED_CORNER' | 'BLUE_CORNER';
      selectedFighterId: string;
      selectedFighterName: string;
      opponentFighterId: string;
      opponentFighterName: string;
    }>;
  }): Promise<PredictionTicket> {
    if (!params.picks || !params.picks.length) {
      throw new Error('Debes incluir al menos una predicción.');
    }

    const ticketPicks: BoutPick[] = params.picks.map((p) => ({
      ...p,
      status: 'PENDING',
    }));

    const points = PredictionCalculator.calculatePoints(params.type, params.picks.length);

    const ticket: PredictionTicket = {
      id: 'tkt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId: params.userId,
      type: params.type,
      picks: ticketPicks,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      pointsAwarded: points,
    };

    const savedTicket = await this.repo.createTicket(ticket);
    const userTickets = await this.repo.getTicketsByUserId(params.userId);
    await this.userService.recalculateUserStatsFromTickets(params.userId, userTickets);

    return savedTicket;
  }

  async getUserTickets(userId: string): Promise<PredictionTicket[]> {
    return this.repo.getTicketsByUserId(userId);
  }

  /**
   * Liquidación automática de combates y boletos pendientes
   */
  async resolveTicketsForMatch(matchId: string, winnerFighterId: string): Promise<{ resolvedCount: number }> {
    const pendingTickets = await this.repo.getPendingTickets();
    const cleanWinner = winnerFighterId.replace('athlete-', '').toLowerCase();
    const affectedUserIds = new Set<string>();
    let resolvedCount = 0;

    for (const ticket of pendingTickets) {
      let matchFound = false;

      for (const pick of ticket.picks) {
        if (pick.matchId === matchId && pick.status === 'PENDING') {
          matchFound = true;
          const cleanPick = pick.selectedFighterId.replace('athlete-', '').toLowerCase();
          pick.status = cleanWinner === cleanPick ? 'CORRECT' : 'INCORRECT';
        }
      }

      if (matchFound) {
        ticket.status = PredictionCalculator.evaluateTicketStatus(ticket.type, ticket.picks);
        await this.repo.updateTicket(ticket);
        affectedUserIds.add(ticket.userId);
        resolvedCount++;
      }
    }

    // Recalcular estadísticas de los usuarios afectados
    for (const userId of affectedUserIds) {
      const tickets = await this.repo.getTicketsByUserId(userId);
      await this.userService.recalculateUserStatsFromTickets(userId, tickets);
    }

    return { resolvedCount };
  }
}
