import { FileSportRepository } from '@/infra/storage/file-sport-repository';
import { PredictionTicket, BoutPick, TicketType } from '@/core/domain/types';
import { UserService } from '../users/user.service';

export class PredictionService {
  private static instance: PredictionService;
  private repo: FileSportRepository;
  private userService: UserService;

  private constructor() {
    this.repo = FileSportRepository.getInstance();
    this.userService = UserService.getInstance();
  }

  public static getInstance(): PredictionService {
    if (!PredictionService.instance) {
      PredictionService.instance = new PredictionService();
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
    if (!params.picks.length) {
      throw new Error('Debes incluir al menos una predicción.');
    }

    const ticketPicks: BoutPick[] = params.picks.map((p) => ({
      ...p,
      status: 'PENDING',
    }));

    // Si es combo, multiplicador de puntos exponencial (ej: 2 peleas = 30 pts, 3 = 60 pts, 4 = 120 pts)
    const points = params.type === 'COMBO'
      ? Math.round(10 * Math.pow(1.8, params.picks.length))
      : 10 * params.picks.length;

    const ticket: PredictionTicket = {
      id: 'tkt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId: params.userId,
      type: params.type,
      picks: ticketPicks,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      pointsAwarded: points,
    };

    await this.repo.savePredictionTicket(ticket);
    await this.userService.updateUserStats(params.userId);

    return ticket;
  }

  async getUserTickets(userId: string): Promise<PredictionTicket[]> {
    return this.repo.getTicketsByUserId(userId);
  }

  /**
   * Liquidación automática de predicciones cotejando con el resultado oficial del evento
   */
  async resolveTicketsForMatch(matchId: string, winnerFighterId: string): Promise<void> {
    const tickets = await this.repo.getPredictionTickets();
    let changed = false;

    for (const ticket of tickets) {
      if (ticket.status !== 'PENDING') continue;

      let matchFound = false;
      let allResolved = true;
      let hasLoss = false;

      for (const pick of ticket.picks) {
        if (pick.matchId === matchId && pick.status === 'PENDING') {
          matchFound = true;
          const cleanWinner = winnerFighterId.replace('athlete-', '');
          const cleanPick = pick.selectedFighterId.replace('athlete-', '');

          if (cleanWinner === cleanPick) {
            pick.status = 'CORRECT';
          } else {
            pick.status = 'INCORRECT';
          }
        }

        if (pick.status === 'PENDING') allResolved = false;
        if (pick.status === 'INCORRECT') hasLoss = true;
      }

      if (matchFound) {
        changed = true;
        if (ticket.type === 'SINGLE') {
          // En individual, si tiene un solo pick resuelto
          const singlePick = ticket.picks[0];
          if (singlePick.status === 'CORRECT') ticket.status = 'WON';
          else if (singlePick.status === 'INCORRECT') ticket.status = 'LOST';
        } else {
          // En combo / parlay: si falla una sola, el combo está perdido
          if (hasLoss) {
            ticket.status = 'LOST';
          } else if (allResolved) {
            ticket.status = 'WON';
          }
        }
      }
    }

    if (changed) {
      await this.repo.savePredictionTickets(tickets);
    }
  }
}
