import { Event, Participant, Affiliation, Sport, Organization } from '../domain/types';

export interface ISportDataProvider {
  readonly sportSlug: string;
  readonly organizationSlug: string;
  
  /**
   * Obtiene los próximos eventos programados
   */
  getUpcomingEvents(): Promise<Event[]>;

  /**
   * Obtiene un evento por su ID o Slug con su cartelera completa
   */
  getEventDetails(eventIdOrSlug: string): Promise<Event | null>;

  /**
   * Obtiene eventos recientes pasados para histórico y estadísticas
   */
  getRecentEvents?(limit?: number): Promise<Event[]>;

  /**
   * Obtiene la ficha técnica de un participante (atleta o equipo)
   */
  getParticipantProfile?(participantId: string): Promise<Participant | null>;
}
