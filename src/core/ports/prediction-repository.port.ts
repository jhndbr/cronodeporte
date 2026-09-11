import { PredictionTicket } from '../domain/types';

export interface IPredictionRepository {
  createTicket(ticket: PredictionTicket): Promise<PredictionTicket>;
  getTicketById(id: string): Promise<PredictionTicket | null>;
  getTicketsByUserId(userId: string): Promise<PredictionTicket[]>;
  getAllTickets(): Promise<PredictionTicket[]>;
  getPendingTickets(): Promise<PredictionTicket[]>;
  updateTicket(ticket: PredictionTicket): Promise<PredictionTicket>;
  saveAllTickets(tickets: PredictionTicket[]): Promise<void>;
}
