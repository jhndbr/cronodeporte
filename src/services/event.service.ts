import { SportsRegistry } from './sports-registry';
import {
  Event,
  Participant,
  Affiliation,
  UfcRankingsCategory,
  UfcNewsArticle,
  UfcCalendarItem,
} from '../core/domain/types';
import { EspnUfcAdapter } from '../adapters/espn/espn-ufc.adapter';

export class EventService {
  private static instance: EventService;
  private registry: SportsRegistry;

  private constructor() {
    this.registry = SportsRegistry.getInstance();
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  private getUfcAdapter(): EspnUfcAdapter {
    return this.registry.getAdapter('ufc') as EspnUfcAdapter;
  }

  /**
   * Obtiene todos los próximos eventos de todos los deportes o filtrado por liga/deporte
   */
  async getUpcomingEvents(filter?: { sport?: string; org?: string }): Promise<Event[]> {
    const adapter = this.registry.getAdapter(filter?.org || 'ufc');
    if (!adapter) {
      return [];
    }

    const events = await adapter.getUpcomingEvents();
    if (filter?.sport) {
      return events.filter((e) => e.sportSlug === filter.sport);
    }
    return events;
  }

  /**
   * Obtiene el próximo evento estelar principal (Next Feature Event)
   */
  async getNextFeaturedEvent(): Promise<Event | null> {
    const events = await this.getUpcomingEvents({ org: 'ufc' });
    const scheduled = events.filter((e) => e.status === 'SCHEDULED' || e.status === 'LIVE');
    return scheduled[0] || events[0] || null;
  }

  /**
   * Obtiene el detalle de un evento por slug o id
   */
  async getEventBySlug(slug: string): Promise<Event | null> {
    const adapter = this.registry.getAdapter('ufc');
    if (!adapter) return null;
    return adapter.getEventDetails(slug);
  }

  /**
   * Obtiene los rankings oficiales de UFC
   */
  async getUfcRankings(): Promise<UfcRankingsCategory[]> {
    const { RankingsService } = await import('../modules/rankings/rankings.service');
    const { categories } = await RankingsService.getInstance().getRankings();
    return categories;
  }

  /**
   * Obtiene las últimas noticias de UFC / MMA
   */
  async getUfcNews(limit: number = 8): Promise<UfcNewsArticle[]> {
    const adapter = this.getUfcAdapter();
    if (!adapter) return [];
    return adapter.getNews(limit);
  }

  /**
   * Obtiene el calendario anual completo de UFC
   */
  async getUfcCalendar(): Promise<UfcCalendarItem[]> {
    const adapter = this.getUfcAdapter();
    if (!adapter) return [];
    return adapter.getCalendarEvents();
  }

  /**
   * Lista todos los gimnasios/training camps descubiertos en las carteleras activas
   */
  async getDiscoveredGyms(): Promise<Affiliation[]> {
    const events = await this.getUpcomingEvents();
    const gymsMap = new Map<string, Affiliation>();

    for (const event of events) {
      for (const match of event.matches) {
        for (const p of match.participants) {
          for (const aff of p.participant.affiliations) {
            if (aff.affiliation && !gymsMap.has(aff.affiliation.id)) {
              gymsMap.set(aff.affiliation.id, aff.affiliation);
            }
          }
        }
      }
    }

    return Array.from(gymsMap.values());
  }

  /**
   * Obtiene todos los peleadores de un gimnasio específico
   */
  async getFightersByGym(gymSlug: string): Promise<Participant[]> {
    const events = await this.getUpcomingEvents();
    const fightersMap = new Map<string, Participant>();

    for (const event of events) {
      for (const match of event.matches) {
        for (const p of match.participants) {
          const hasGym = p.participant.affiliations.some(
            (a) => a.affiliation.slug === gymSlug || a.affiliation.id === gymSlug
          );
          if (hasGym && !fightersMap.has(p.participant.id)) {
            fightersMap.set(p.participant.id, p.participant);
          }
        }
      }
    }

    return Array.from(fightersMap.values());
  }
}

