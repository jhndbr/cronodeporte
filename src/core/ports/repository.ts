import {
  Event,
  UfcCalendarItem,
  UfcNewsArticle,
  UfcRankingsCategory,
} from '../domain/types';

export interface SyncMetadata {
  lastSyncedAt: string; // ISO 8601
  provider: string;     // 'espn' | 'multi'
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
  eventCount: number;
  newsCount: number;
  calendarCount: number;
  rankingsCount: number;
  nextSyncDue: string;  // ISO 8601 (+48h a 72h)
  details?: Record<string, unknown>;
}

export interface ISportRepository {
  // Eventos y peleas
  getEvents(): Promise<Event[]>;
  saveEvents(events: Event[]): Promise<void>;

  // Calendario
  getCalendar(): Promise<UfcCalendarItem[]>;
  saveCalendar(items: UfcCalendarItem[]): Promise<void>;

  // Noticias
  getNews(): Promise<UfcNewsArticle[]>;
  saveNews(articles: UfcNewsArticle[]): Promise<void>;

  // Rankings
  getRankings(): Promise<UfcRankingsCategory[]>;
  saveRankings(categories: UfcRankingsCategory[]): Promise<void>;

  // Metadatos de sincronización
  getSyncMetadata(): Promise<SyncMetadata | null>;
  saveSyncMetadata(meta: SyncMetadata): Promise<void>;

  // Perfiles e historial detallado de peleadores
  getFighterProfile(id: string): Promise<import('../domain/types').FighterDetailedProfile | null>;
  saveFighterProfile(profile: import('../domain/types').FighterDetailedProfile): Promise<void>;
}
