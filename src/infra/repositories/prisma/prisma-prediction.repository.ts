import { prisma } from '@/infra/database/prisma';
import { IPredictionRepository } from '@/core/ports/prediction-repository.port';
import { PredictionTicket, BoutPick } from '@/core/domain/types';

export class PrismaPredictionRepository implements IPredictionRepository {
  async createTicket(ticket: PredictionTicket): Promise<PredictionTicket> {
    const created = await prisma.predictionTicket.create({
      data: {
        id: ticket.id,
        userId: ticket.userId,
        type: ticket.type,
        status: ticket.status,
        pointsAwarded: ticket.pointsAwarded ?? 10,
        createdAt: ticket.createdAt ? new Date(ticket.createdAt) : new Date(),
        picks: {
          create: ticket.picks.map((p) => ({
            matchId: p.matchId,
            eventName: p.eventName,
            eventDate: p.eventDate,
            weightClass: p.weightClass,
            selectedSide: p.selectedSide,
            selectedFighterId: p.selectedFighterId,
            selectedFighterName: p.selectedFighterName,
            opponentFighterId: p.opponentFighterId,
            opponentFighterName: p.opponentFighterName,
            status: p.status,
          })),
        },
      },
      include: { picks: true },
    });

    return this.mapToDomain(created);
  }

  async getTicketById(id: string): Promise<PredictionTicket | null> {
    const ticket = await prisma.predictionTicket.findUnique({
      where: { id },
      include: { picks: true },
    });
    return ticket ? this.mapToDomain(ticket) : null;
  }

  async getTicketsByUserId(userId: string): Promise<PredictionTicket[]> {
    const tickets = await prisma.predictionTicket.findMany({
      where: { userId },
      include: { picks: true },
      orderBy: { createdAt: 'desc' },
    });
    return tickets.map((t) => this.mapToDomain(t));
  }

  async getAllTickets(): Promise<PredictionTicket[]> {
    const tickets = await prisma.predictionTicket.findMany({
      include: { picks: true },
      orderBy: { createdAt: 'desc' },
    });
    return tickets.map((t) => this.mapToDomain(t));
  }

  async getPendingTickets(): Promise<PredictionTicket[]> {
    const tickets = await prisma.predictionTicket.findMany({
      where: { status: 'PENDING' },
      include: { picks: true },
    });
    return tickets.map((t) => this.mapToDomain(t));
  }

  async updateTicket(ticket: PredictionTicket): Promise<PredictionTicket> {
    // Actualizar boleto y picks
    await prisma.$transaction(async (tx) => {
      await tx.predictionTicket.update({
        where: { id: ticket.id },
        data: {
          status: ticket.status,
          pointsAwarded: ticket.pointsAwarded,
        },
      });

      for (const pick of ticket.picks) {
        await tx.boutPick.updateMany({
          where: {
            ticketId: ticket.id,
            matchId: pick.matchId,
          },
          data: {
            status: pick.status,
          },
        });
      }
    });

    const refreshed = await this.getTicketById(ticket.id);
    return refreshed || ticket;
  }

  async saveAllTickets(tickets: PredictionTicket[]): Promise<void> {
    for (const ticket of tickets) {
      await this.updateTicket(ticket);
    }
  }

  private mapToDomain(t: any): PredictionTicket {
    return {
      id: t.id,
      userId: t.userId,
      type: t.type as 'SINGLE' | 'COMBO',
      status: t.status as 'PENDING' | 'WON' | 'LOST' | 'VOID',
      pointsAwarded: t.pointsAwarded,
      createdAt: t.createdAt.toISOString(),
      picks: (t.picks || []).map((p: any) => ({
        matchId: p.matchId,
        eventName: p.eventName,
        eventDate: p.eventDate ?? undefined,
        weightClass: p.weightClass ?? undefined,
        selectedSide: p.selectedSide as 'RED_CORNER' | 'BLUE_CORNER',
        selectedFighterId: p.selectedFighterId,
        selectedFighterName: p.selectedFighterName,
        opponentFighterId: p.opponentFighterId,
        opponentFighterName: p.opponentFighterName,
        status: p.status as 'PENDING' | 'CORRECT' | 'INCORRECT' | 'CANCELLED',
      })),
    };
  }
}
