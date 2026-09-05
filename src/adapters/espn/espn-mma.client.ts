import { EspnScoreboardResponse, EspnNewsResponse } from './espn-ufc.types';

/**
 * Cliente HTTP puro para la API de ESPN MMA.
 * Documentación de referencia en: api-doc/mma.md y api-doc/_global.md
 */
export class EspnMmaClient {
  private readonly siteBaseUrl = 'https://site.api.espn.com/apis/site/v2/sports/mma';
  private readonly coreV2BaseUrl = 'https://sports.core.api.espn.com/v2/sports/mma';

  /**
   * Obtiene la cartelera/scoreboard cruda de una liga MMA (ufc, pfl, bellator)
   * Soporta fechas específicas en formato YYYYMMDD (ej. 20241026 para UFC 308)
   */
  async fetchScoreboard(league: string = 'ufc', dateStr?: string): Promise<EspnScoreboardResponse> {
    const query = dateStr ? `?dates=${dateStr}` : '';
    const url = `${this.siteBaseUrl}/${league}/scoreboard${query}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cronodeporte/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`[EspnMmaClient] Error fetching scoreboard (${league}): ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene las noticias crudas de una liga MMA
   */
  async fetchNews(league: string = 'ufc', limit: number = 10): Promise<EspnNewsResponse> {
    const url = `${this.siteBaseUrl}/${league}/news?limit=${limit}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cronodeporte/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`[EspnMmaClient] Error fetching news (${league}): ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene la metadata completa de un evento desde Core v2 (con lista de peleas y enlaces $ref de cuotas y atletas)
   * Referencia: api-doc/mma.md -> Core v2 API Endpoints: events/{id}
   */
  async fetchCoreEvent(eventId: string, league: string = 'ufc'): Promise<Record<string, unknown> | null> {
    const url = `${this.coreV2BaseUrl}/leagues/${league}/events/${eventId}?lang=en&region=us`;
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Cronodeporte/1.0' },
      });
      if (!response.ok) return null;
      return response.json();
    } catch (err) {
      console.warn(`[EspnMmaClient] Error fetching core event ${eventId}:`, err);
      return null;
    }
  }

  /**
   * Obtiene las cuotas oficiales (ej. DraftKings) de una pelea mediante su $ref
   */
  async fetchOddsFromRef(oddsRefUrl: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await fetch(oddsRefUrl, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Cronodeporte/1.0' },
      });
      if (!response.ok) return null;
      return response.json();
    } catch (err) {
      return null;
    }
  }

  /**
   * Obtiene el perfil físico y biográfico completo de un atleta desde Core v2
   * Referencia: api-doc/mma.md -> Athlete Sub-Resources
   */
  async fetchAthleteProfile(athleteRefOrId: string): Promise<Record<string, unknown> | null> {
    const url = athleteRefOrId.startsWith('http')
      ? athleteRefOrId
      : `${this.coreV2BaseUrl}/athletes/${athleteRefOrId}?lang=en&region=us`;

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Cronodeporte/1.0' },
      });
      if (!response.ok) return null;
      return response.json();
    } catch (err) {
      return null;
    }
  }

  /**
   * Obtiene estadísticas avanzadas de combate (precisión, golpes significativos, derribos)
   */
  async fetchAthleteStats(athleteRefOrId: string): Promise<Record<string, unknown> | null> {
    const baseUrl = athleteRefOrId.startsWith('http')
      ? athleteRefOrId.split('?')[0] + '/statistics?lang=en&region=us'
      : `${this.coreV2BaseUrl}/athletes/${athleteRefOrId}/statistics?lang=en&region=us`;

    try {
      const response = await fetch(baseUrl, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Cronodeporte/1.0' },
      });
      if (!response.ok) return null;
      return response.json();
    } catch (err) {
      return null;
    }
  }
}
