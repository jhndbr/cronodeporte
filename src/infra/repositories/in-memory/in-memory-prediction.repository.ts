import { IPredictionRepository } from '@/core/ports/prediction-repository.port';
import { PredictionTicket } from '@/core/domain/types';

export class InMemoryPredictionRepository implements IPredictionRepository {
  private tickets: Map<string, PredictionTicket> = new Map();

  async createTicket(ticket: PredictionTicket): Promise<PredictionTicket> {
    const copy = JSON.parse(JSON.stringify(ticket));
    this.tickets.set(ticket.id, copy);
    return copy;
  }

  async getTicketById(id: string): Promise<PredictionTicket | null> {
    const ticket = this.tickets.get(id);
    return ticket ? JSON.parse(JSON.stringify(ticket)) : null;
  }

  async getTicketsByUserId(userId: string): Promise<PredictionTicket[]> {
    const result: PredictionTicket[] = [];
    for (const ticket of this.tickets.values()) {
      if (ticket.userId === userId) {
        result.push(JSON.parse(JSON.stringify(ticket)));
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllTickets(): Promise<PredictionTicket[]> {
    return Array.from(this.tickets.values()).map(t => JSON.parse(JSON.stringify(t)));
  }

  async getPendingTickets(): Promise<PredictionTicket[]> {
    const result: PredictionTicket[] = [];
    for (const ticket of this.tickets.values()) {
      if (ticket.status === 'PENDING') {
        result.push(JSON.parse(JSON.stringify(ticket)));
      }
    }
    return result;
  }

  async updateTicket(ticket: PredictionTicket): Promise<PredictionTicket> {
    const copy = JSON.parse(JSON.stringify(ticket));
    this.tickets.set(ticket.id, copy);
    return copy;
  }

  async saveAllTickets(tickets: PredictionTicket[]): Promise<void> {
    for (const ticket of tickets) {
      this.tickets.set(ticket.id, JSON.parse(JSON.stringify(ticket)));
    }
  }

  clear(): void {
    this.tickets.clear();
  }
}
