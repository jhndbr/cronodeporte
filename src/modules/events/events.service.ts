import { SmartCache, CACHE_TTL } from '@/infra/cache/smart-cache';
import { EventService } from '@/services/event.service';
import { Event, Match, MatchSegment } from '@/core/domain/types';
import { FightCardSegmentGroup, FightCardSortOrder } from './fightcard.types';

export class EventsService {
  private static instance: EventsService;
  private cache: SmartCache;
  private legacyEventService: EventService;
  private readonly CACHE_KEY_FEATURED = 'ufc:featured_event';

  private constructor() {
    this.cache = SmartCache.getInstance();
    this.legacyEventService = EventService.getInstance();
  }

  public static getInstance(): EventsService {
    if (!EventsService.instance) {
      EventsService.instance = new EventsService();
    }
    return EventsService.instance;
  }

  /**
   * Obtiene el evento destacado actual con caché inteligente (15 min o 30 seg si está LIVE)
   */
  async getFeaturedEvent(): Promise<Event | null> {
    return this.cache.fetchWithCache<Event | null>(
      this.CACHE_KEY_FEATURED,
      async () => {
        const events = await this.legacyEventService.getUpcomingEvents({ org: 'ufc' });
        const now = Date.now();
        // Buscar el primer evento que sea futuro o esté en vivo hoy
        const upcoming = events.find((e) => {
          const t = new Date(e.startDate).getTime();
          return t >= now - 12 * 3600 * 1000 || e.status === 'LIVE';
        });
        return upcoming || events[0] || null;
      },
      CACHE_TTL.SCHEDULED_EVENTS
    );
  }

  /**
   * Retorna siempre el combate estelar principal (Main Event) de una lista de peleas
   */
  getMainEvent(matches: Match[]): Match | null {
    if (!matches || matches.length === 0) return null;
    return matches.find((m) => m.isMainEvent) || matches[matches.length - 1] || matches[0];
  }

  /**
   * Organiza los combates en orden cronológico estricto (de Preliminares a Estelares)
   * o con la estelar primero.
   */
  getSortedMatches(matches: Match[], order: FightCardSortOrder = 'CHRONOLOGICAL'): Match[] {
    if (!matches || matches.length === 0) return [];

    // Verificamos si la lista ya viene ordenada con el Main Event al final
    const mainEventIndex = matches.findIndex((m) => m.isMainEvent);

    let chronologicalMatches: Match[];
    if (mainEventIndex === 0 && matches.length > 1) {
      // Si el Main Event está en la posición 0, la lista está invertida (Estelar primero)
      chronologicalMatches = [...matches].reverse();
    } else {
      // Ordenamos por orderIndex ascendente
      chronologicalMatches = [...matches].sort((a, b) => a.orderIndex - b.orderIndex);
    }

    if (order === 'MAIN_EVENT_FIRST') {
      return [...chronologicalMatches].reverse();
    }

    return chronologicalMatches;
  }

  /**
   * Agrupa los combates por segmento (Early Prelims, Prelims, Cartelera Estelar)
   */
  groupMatchesBySegment(matches: Match[], order: FightCardSortOrder = 'CHRONOLOGICAL'): FightCardSegmentGroup[] {
    const sorted = this.getSortedMatches(matches, order);

    const mainCardMatches = sorted.filter((m) => m.segment === 'MAIN_CARD' || m.isMainEvent || m.isCoMain);
    const prelimsMatches = sorted.filter((m) => m.segment === 'PRELIMS');
    const earlyPrelimsMatches = sorted.filter((m) => m.segment === 'EARLY_PRELIMS');

    const groups: FightCardSegmentGroup[] = [];

    if (order === 'CHRONOLOGICAL') {
      if (earlyPrelimsMatches.length > 0) {
        groups.push({
          segment: 'EARLY_PRELIMS',
          label: 'Primeras Preliminares (Early Prelims)',
          badgeColor: '#939599',
          matches: earlyPrelimsMatches,
        });
      }
      if (prelimsMatches.length > 0) {
        groups.push({
          segment: 'PRELIMS',
          label: 'Cartelera Preliminar (Prelims)',
          badgeColor: '#2BCFCE',
          matches: prelimsMatches,
        });
      }
      if (mainCardMatches.length > 0) {
        groups.push({
          segment: 'MAIN_CARD',
          label: 'Cartelera Estelar (Main Card)',
          badgeColor: '#EC4D25',
          matches: mainCardMatches,
        });
      }
    } else {
      if (mainCardMatches.length > 0) {
        groups.push({
          segment: 'MAIN_CARD',
          label: 'Cartelera Estelar (Main Card)',
          badgeColor: '#EC4D25',
          matches: mainCardMatches,
        });
      }
      if (prelimsMatches.length > 0) {
        groups.push({
          segment: 'PRELIMS',
          label: 'Cartelera Preliminar (Prelims)',
          badgeColor: '#2BCFCE',
          matches: prelimsMatches,
        });
      }
      if (earlyPrelimsMatches.length > 0) {
        groups.push({
          segment: 'EARLY_PRELIMS',
          label: 'Primeras Preliminares (Early Prelims)',
          badgeColor: '#939599',
          matches: earlyPrelimsMatches,
        });
      }
    }

    return groups;
  }

  /**
   * Invalida la caché del evento destacado
   */
  async invalidateCache(): Promise<void> {
    await this.cache.delete(this.CACHE_KEY_FEATURED);
  }
}
