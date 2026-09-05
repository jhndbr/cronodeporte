import { FileSportRepository } from '@/infra/storage/file-sport-repository';
import { EspnMmaClient } from '@/adapters/espn/espn-mma.client';
import { EspnMmaNormalizer } from '@/adapters/espn/espn-mma.normalizer';
import { FighterDetailedProfile } from '@/core/domain/types';

export class FighterService {
  private static instance: FighterService;
  private repo: FileSportRepository;
  private espnClient: EspnMmaClient;
  private espnNormalizer: EspnMmaNormalizer;

  private constructor() {
    this.repo = FileSportRepository.getInstance();
    this.espnClient = new EspnMmaClient();
    this.espnNormalizer = new EspnMmaNormalizer();
  }

  public static getInstance(): FighterService {
    if (!FighterService.instance) {
      FighterService.instance = new FighterService();
    }
    return FighterService.instance;
  }

  /**
   * Obtiene el perfil detallado y el historial completo de combates de un peleador.
   * Lee primero de la persistencia en disco y si no existe lo consulta en ESPN Core v2.
   */
  async getFighterProfile(fighterIdOrSlug: string): Promise<FighterDetailedProfile | null> {
    const cleanId = fighterIdOrSlug.replace('athlete-', '');

    // 1. Verificar persistencia local
    const cached = await this.repo.getFighterProfile(cleanId);
    if (cached) {
      return cached;
    }

    // 2. Si no está en caché directa, buscar en events.json para asegurar el ID numérico de ESPN
    let espnAthleteId = cleanId;
    const events = await this.repo.getEvents();
    for (const ev of events) {
      for (const m of ev.matches) {
        for (const p of m.participants) {
          if (
            p.participant.id === fighterIdOrSlug ||
            p.participant.slug === cleanId ||
            p.participant.displayName.toLowerCase() === cleanId.toLowerCase()
          ) {
            espnAthleteId = p.participant.id.replace('athlete-', '');
            break;
          }
        }
      }
    }

    // 3. Consultar perfil en ESPN Core v2
    try {
      const athleteUrl = `http://sports.core.api.espn.com/v2/sports/mma/athletes/${espnAthleteId}?lang=en&region=us`;
      const athleteData: any = await this.espnClient.fetchAthleteProfile(athleteUrl);
      if (!athleteData) return null;

      // Consultar desglose de récords (victorias por KO, Sumisión, etc.)
      const recordsUrl = `http://sports.core.api.espn.com/v2/sports/mma/athletes/${espnAthleteId}/records?lang=en&region=us`;
      const recordsBreakdown: Record<string, number> = {};
      try {
        const rRes = await fetch(recordsUrl, { headers: { 'Accept': 'application/json' } });
        if (rRes.ok) {
          const rData = await rRes.json();
          const statsList = rData.items?.[0]?.stats || [];
          for (const s of statsList) {
            recordsBreakdown[s.name] = s.value;
          }
        }
      } catch {}

      // Consultar historial de peleas (eventlog)
      const eventlogUrl = `http://sports.core.api.espn.com/v2/sports/mma/athletes/${espnAthleteId}/eventlog?lang=en&region=us`;
      const rawRecentFights: Array<{
        comp: any;
        event: any;
        status: any;
        opponentAthlete: any;
        isWinner: boolean;
      }> = [];

      try {
        const logRes = await fetch(eventlogUrl, { headers: { 'Accept': 'application/json' } });
        if (logRes.ok) {
          const logData = await logRes.json();
          const playedItems = (logData.events?.items || []).filter((it: any) => it.played);
          // Tomar los 8 combates más recientes
          const topFights = playedItems.slice(0, 8);

          const parsedFights = await Promise.allSettled(
            topFights.map(async (item: any) => {
              // 1. Fetch competición y evento en paralelo
              const [compRes, eventRes] = await Promise.all([
                fetch(item.competition.$ref),
                item.event?.$ref ? fetch(item.event.$ref) : Promise.resolve(null),
              ]);

              const comp: any = await compRes.json();
              let event: any = null;
              if (eventRes && eventRes.ok) {
                event = await eventRes.json();
              }

              // 2. Fetch estado detallado del combate (técnica, asalto, tiempo)
              let status: any = null;
              if (comp.status?.$ref) {
                const sRes = await fetch(comp.status.$ref);
                if (sRes.ok) {
                  status = await sRes.json();
                }
              }

              // 3. Identificar rival y ganador
              let isWinner = false;
              let opponentAthlete: any = null;

              for (const cRef of comp.competitors || []) {
                const cRes = await fetch(cRef.$ref);
                const c: any = await cRes.json();
                const aId = c.athlete?.$ref?.split('/').pop()?.split('?')[0];

                if (aId === espnAthleteId) {
                  isWinner = !!c.winner;
                } else {
                  try {
                    const aRes = await fetch(c.athlete.$ref);
                    if (aRes.ok) {
                      opponentAthlete = await aRes.json();
                    }
                  } catch {}
                }
              }

              return {
                comp,
                event,
                status,
                opponentAthlete,
                isWinner,
              };
            })
          );

          for (const res of parsedFights) {
            if (res.status === 'fulfilled' && res.value) {
              rawRecentFights.push(res.value);
            }
          }
        }
      } catch (err) {
        console.warn('[FighterService] Error cargando eventlog:', err);
      }

      // Normalizar desacopladamente mediante EspnMmaNormalizer
      const profile = this.espnNormalizer.normalizeFighterProfile(
        espnAthleteId,
        athleteData,
        recordsBreakdown,
        rawRecentFights
      );

      // Guardar en la persistencia local duradera
      await this.repo.saveFighterProfile(profile);
      return profile;
    } catch (err) {
      console.error('[FighterService] Error obteniendo perfil de atleta:', err);
      return null;
    }
  }
}
