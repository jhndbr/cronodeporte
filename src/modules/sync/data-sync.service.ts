import { FileSportRepository } from '@/infra/storage/file-sport-repository';
import { EspnMmaClient } from '@/adapters/espn/espn-mma.client';
import {
  EspnMmaNormalizer,
  EnrichedAthleteData,
  EnrichedBoutOdds,
} from '@/adapters/espn/espn-mma.normalizer';
import { SyncMetadata } from '@/core/ports/repository';
import { UFC_OFFICIAL_RANKINGS } from '@/modules/rankings/ufc-official-rankings.data';

export interface SyncResult {
  success: boolean;
  syncedAt: string;
  nextSyncDue: string;
  source: string;
  eventsCount: number;
  calendarCount: number;
  newsCount: number;
  rankingsCount: number;
  isFresh: boolean;
  error?: string;
}

export class DataSyncService {
  private static instance: DataSyncService;
  private repo: FileSportRepository;
  private espnClient: EspnMmaClient;
  private espnNormalizer: EspnMmaNormalizer;

  // Actualización programada cada 48 horas (2 días). Configurable entre 48h y 72h (2 a 3 días).
  private readonly SYNC_INTERVAL_MS = 48 * 60 * 60 * 1000;
  private isSyncingInProgress = false;

  private constructor() {
    this.repo = FileSportRepository.getInstance();
    this.espnClient = new EspnMmaClient();
    this.espnNormalizer = new EspnMmaNormalizer();
  }

  public static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  /**
   * Determina si han pasado 2 o más días desde la última sincronización
   */
  async isSyncDue(): Promise<boolean> {
    const meta = await this.repo.getSyncMetadata();
    if (!meta || !meta.lastSyncedAt) {
      return true;
    }

    const lastSync = new Date(meta.lastSyncedAt).getTime();
    const elapsed = Date.now() - lastSync;
    return elapsed >= this.SYNC_INTERVAL_MS;
  }

  /**
   * Ejecuta sincronización en segundo plano sin bloquear al usuario
   */
  triggerBackgroundSyncIfDue(): void {
    if (this.isSyncingInProgress) return;

    this.isSyncDue().then((due) => {
      if (due) {
        console.log('[DataSyncService] Datos > 48h. Disparando sincronización en background...');
        this.syncAll({ force: true }).catch((err) => {
          console.warn('[DataSyncService] Falló la sincronización en background:', err);
        });
      }
    }).catch(() => {});
  }

  /**
   * Sincroniza y guarda en disco la información de ESPN con enriquecimiento de estadísticas reales y cuotas
   */
  async syncAll(options?: { force?: boolean; scope?: 'all' | 'events' | 'news' | 'calendar' | 'rankings' }): Promise<SyncResult> {
    const force = options?.force ?? false;
    const scope = options?.scope ?? 'all';

    const isDue = await this.isSyncDue();
    if (!force && !isDue) {
      const existingMeta = await this.repo.getSyncMetadata();
      const currentEvents = await this.repo.getEvents();
      const currentNews = await this.repo.getNews();
      const currentCal = await this.repo.getCalendar();
      const currentRank = await this.repo.getRankings();

      return {
        success: true,
        syncedAt: existingMeta?.lastSyncedAt || new Date().toISOString(),
        nextSyncDue: existingMeta?.nextSyncDue || new Date(Date.now() + this.SYNC_INTERVAL_MS).toISOString(),
        source: 'local_persisted_storage',
        eventsCount: currentEvents.length,
        calendarCount: currentCal.length,
        newsCount: currentNews.length,
        rankingsCount: currentRank.length,
        isFresh: false,
      };
    }

    this.isSyncingInProgress = true;
    const syncTimestamp = new Date().toISOString();
    const nextDueTimestamp = new Date(Date.now() + this.SYNC_INTERVAL_MS).toISOString();

    let eventsCount = 0;
    let calendarCount = 0;
    let newsCount = 0;
    let rankingsCount = 0;

    try {
      // 1. Sincronizar Eventos y Calendario con Enriquecimiento Real (Cuotas DraftKings y Estadísticas Atletas)
      if (scope === 'all' || scope === 'events' || scope === 'calendar') {
        try {
          const rawScoreboard = await this.espnClient.fetchScoreboard('ufc');

          if (scope === 'all' || scope === 'events') {
            const enrichment = await this.fetchEventEnrichment(rawScoreboard);
            const normalizedEvents = this.espnNormalizer.normalizeEvents(rawScoreboard, enrichment);

            if (normalizedEvents.length > 0) {
              await this.repo.saveEvents(normalizedEvents);
              eventsCount = normalizedEvents.length;

              // Pre-calentar perfiles e historiales de los peleadores en segundo plano
              this.prewarmFighterHistories(normalizedEvents).catch(() => {});
            }
          }

          if (scope === 'all' || scope === 'calendar') {
            const normalizedCal = this.espnNormalizer.normalizeCalendar(rawScoreboard);
            if (normalizedCal.length > 0) {
              await this.repo.saveCalendar(normalizedCal);
              calendarCount = normalizedCal.length;
            }
          }
        } catch (scoreboardErr) {
          console.warn('[DataSyncService] Error descargando scoreboard de ESPN:', scoreboardErr);
        }
      }

      // 2. Sincronizar Noticias desde ESPN News
      if (scope === 'all' || scope === 'news') {
        try {
          const rawNews = await this.espnClient.fetchNews('ufc', 12);
          const normalizedNews = this.espnNormalizer.normalizeNews(rawNews, 10);
          if (normalizedNews.length > 0) {
            await this.repo.saveNews(normalizedNews);
            newsCount = normalizedNews.length;
          }
        } catch (newsErr) {
          console.warn('[DataSyncService] Error descargando noticias de ESPN:', newsErr);
        }
      }

      // 3. Sincronizar Rankings (UFC Dataset oficial verificado)
      if (scope === 'all' || scope === 'rankings') {
        await this.repo.saveRankings(UFC_OFFICIAL_RANKINGS);
        rankingsCount = UFC_OFFICIAL_RANKINGS.length;
      }

      // 4. Guardar metadatos de sincronización
      const metadata: SyncMetadata = {
        lastSyncedAt: syncTimestamp,
        provider: 'espn',
        status: 'SUCCESS',
        eventCount: eventsCount,
        newsCount: newsCount,
        calendarCount: calendarCount,
        rankingsCount: rankingsCount,
        nextSyncDue: nextDueTimestamp,
      };

      await this.repo.saveSyncMetadata(metadata);

      return {
        success: true,
        syncedAt: syncTimestamp,
        nextSyncDue: nextDueTimestamp,
        source: 'api_synced_and_persisted',
        eventsCount,
        calendarCount,
        newsCount,
        rankingsCount,
        isFresh: true,
      };
    } catch (error) {
      console.error('[DataSyncService] Error fatal en syncAll:', error);
      return {
        success: false,
        syncedAt: syncTimestamp,
        nextSyncDue: nextDueTimestamp,
        source: 'error_fallback',
        eventsCount,
        calendarCount,
        newsCount,
        rankingsCount,
        isFresh: false,
        error: error instanceof Error ? error.message : 'Error desconocido de sincronización',
      };
    } finally {
      this.isSyncingInProgress = false;
    }
  }

  /**
   * Enriquecimiento concurrente y eficiente de cuotas oficiales y perfiles de atletas desde Core v2.
   * Se ejecuta solo una vez cada 2-3 días durante la sincronización.
   */
  private async fetchEventEnrichment(rawScoreboard: any): Promise<{
    oddsByCompId: Map<string, EnrichedBoutOdds>;
    athleteProfilesByIdOrName: Map<string, EnrichedAthleteData>;
  }> {
    const oddsByCompId = new Map<string, EnrichedBoutOdds>();
    const athleteProfilesByIdOrName = new Map<string, EnrichedAthleteData>();

    const firstEvent = rawScoreboard.events?.[0];
    if (!firstEvent?.id) {
      return { oddsByCompId, athleteProfilesByIdOrName };
    }

    try {
      const coreEvent: any = await this.espnClient.fetchCoreEvent(firstEvent.id);
      const competitions = coreEvent?.competitions || [];

      // 1. Obtener cuotas reales de cada pelea en paralelo
      const oddsPromises = competitions.map(async (comp: any, idx: number) => {
        const oddsRef = comp.odds?.$ref;
        if (!oddsRef) return;

        const oddsData: any = await this.espnClient.fetchOddsFromRef(oddsRef);
        const item = oddsData?.items?.[0];
        if (!item) return;

        const awayAthleteRef = item.awayAthleteOdds?.athlete?.$ref || '';
        const homeAthleteRef = item.homeAthleteOdds?.athlete?.$ref || '';

        const awayAthleteId = awayAthleteRef.split('/').pop()?.split('?')[0];
        const homeAthleteId = homeAthleteRef.split('/').pop()?.split('?')[0];

        const enrichedOdds: EnrichedBoutOdds = {
          awayMoneyLine: item.awayAthleteOdds?.moneyLine,
          homeMoneyLine: item.homeAthleteOdds?.moneyLine,
          awayFavorite: item.awayAthleteOdds?.favorite,
          homeFavorite: item.homeAthleteOdds?.favorite,
          providerName: item.provider?.name || 'DraftKings',
          overUnder: item.overUnder,
          details: item.details,
          awayAthleteId,
          homeAthleteId,
        };

        if (comp.id) oddsByCompId.set(String(comp.id), enrichedOdds);
        oddsByCompId.set(String(idx), enrichedOdds);
      });

      // 2. Obtener lista de URLs de atletas de todas las peleas
      const athleteRefUrls = new Set<string>();
      for (const comp of competitions) {
        if (Array.isArray(comp.competitors)) {
          for (const c of comp.competitors) {
            if (c.athlete?.$ref) {
              athleteRefUrls.add(c.athlete.$ref);
            }
          }
        }
      }

      // 3. Consultar atletas en paralelo
      const athletePromises = Array.from(athleteRefUrls).map(async (athleteUrl) => {
        const athleteData: any = await this.espnClient.fetchAthleteProfile(athleteUrl);
        if (!athleteData) return;

        const athleteId = String(athleteData.id);
        const displayName = athleteData.displayName || athleteData.fullName || '';

        // Consultar estadísticas avanzadas si existen
        let strikingAccuracy: number | undefined;
        let significantStrikesLandedPerMin: number | undefined;
        let takedownDefense: number | undefined;

        try {
          const statsData: any = await this.espnClient.fetchAthleteStats(athleteUrl);
          const generalStats = statsData?.splits?.categories?.[0]?.stats;
          if (Array.isArray(generalStats)) {
            const accStat = generalStats.find((s: any) => s.name === 'strikeAccuracy');
            const lpmStat = generalStats.find((s: any) => s.name === 'strikeLPM');
            const tkStat = generalStats.find((s: any) => s.name === 'takedownAccuracy');

            if (accStat?.value) strikingAccuracy = Math.round(Number(accStat.value));
            if (lpmStat?.value) significantStrikesLandedPerMin = Number(lpmStat.value);
            if (tkStat?.value) takedownDefense = Math.round(Number(tkStat.value));
          }
        } catch {
          // Si no tiene estadísticas avanzadas, continúa sin error
        }

        const enrichedProfile: EnrichedAthleteData = {
          displayHeight: athleteData.displayHeight,
          displayWeight: athleteData.displayWeight,
          displayReach: athleteData.displayReach || (athleteData.reach ? `${athleteData.reach}"` : undefined),
          stance: athleteData.stance?.text,
          nickname: athleteData.nickname,
          gender: athleteData.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
          associationName: athleteData.association?.name,
          associationCountry: athleteData.association?.location?.country,
          strikingAccuracy,
          significantStrikesLandedPerMin,
          takedownDefense,
        };

        athleteProfilesByIdOrName.set(athleteId, enrichedProfile);
        if (displayName) {
          athleteProfilesByIdOrName.set(displayName, enrichedProfile);
        }
      });

      await Promise.allSettled([...oddsPromises, ...athletePromises]);
    } catch (err) {
      console.warn('[DataSyncService] Advertencia durante enriquecimiento de evento:', err);
    }

    return { oddsByCompId, athleteProfilesByIdOrName };
  }

  /**
   * Pre-carga y persiste en disco los historiales completos de los peleadores del evento activo.
   */
  private async prewarmFighterHistories(events: any[]): Promise<void> {
    try {
      const { FighterService } = await import('@/modules/fighters/fighter.service');
      const fighterService = FighterService.getInstance();
      const athleteIds = new Set<string>();

      for (const ev of events) {
        for (const m of ev.matches || []) {
          for (const p of m.participants || []) {
            if (p.participant?.id) {
              athleteIds.add(p.participant.id.replace('athlete-', ''));
            }
          }
        }
      }

      await Promise.allSettled(
        Array.from(athleteIds).map((id) => fighterService.getFighterProfile(id))
      );
    } catch (err) {
      console.warn('[DataSyncService] Pre-warming fighter histories warning:', err);
    }
  }
}
