import { IFighterPreviewRepository, IAiFighterAnalysisProvider } from '@/core/ports/ai-fighter-preview.port';
import { PrismaFighterPreviewRepository } from '@/infra/repositories/prisma/prisma-fighter-preview.repository';
import { GeminiAiProvider } from '@/infra/ai/gemini-ai.provider';
import { FighterFightPreview } from '@/core/domain/types';
import { FighterService } from '../fighters/fighter.service';
import { FileSportRepository } from '@/infra/storage/file-sport-repository';

export interface FighterPreviewServiceDeps {
  repo?: IFighterPreviewRepository;
  aiProvider?: IAiFighterAnalysisProvider;
  fighterService?: { getFighterProfile: (id: string) => Promise<any> };
  eventsProvider?: { getEvents: () => Promise<any[]> };
}

export class FighterPreviewService {
  private static instance: FighterPreviewService;
  private readonly repo: IFighterPreviewRepository;
  private readonly aiProvider: IAiFighterAnalysisProvider;
  private readonly fighterService: { getFighterProfile: (id: string) => Promise<any> };
  private readonly eventsProvider: { getEvents: () => Promise<any[]> };

  constructor(deps?: FighterPreviewServiceDeps) {
    this.repo = deps?.repo || new PrismaFighterPreviewRepository();
    this.aiProvider = deps?.aiProvider || new GeminiAiProvider();
    this.fighterService = deps?.fighterService || FighterService.getInstance();
    this.eventsProvider = deps?.eventsProvider || FileSportRepository.getInstance();
  }

  public static getInstance(deps?: FighterPreviewServiceDeps): FighterPreviewService {
    if (!FighterPreviewService.instance || deps) {
      FighterPreviewService.instance = new FighterPreviewService(deps);
    }
    return FighterPreviewService.instance;
  }

  /**
   * Obtiene o genera el análisis semanal con IA '¿Cómo llega a la pelea?'
   */
  async getOrGeneratePreview(params: {
    fighterId: string;
    eventId?: string;
    eventName?: string;
  }): Promise<FighterFightPreview> {
    const cleanFighterId = params.fighterId.replace('athlete-', '');
    const activeEventId = params.eventId || 'current-event';

    // 1. Verificar si ya existe en la caché semanal persistente
    const cached = await this.repo.getPreview(cleanFighterId, activeEventId);
    if (cached) {
      return cached;
    }

    // 2. Obtener datos del peleador e historial para construir contexto de IA
    const profile = await this.fighterService.getFighterProfile(cleanFighterId);
    let opponentName = 'Rival por confirmar';
    let targetEventName = params.eventName || 'Evento UFC';

    try {
      const events = await this.eventsProvider.getEvents();
      for (const ev of events) {
        for (const m of ev.matches || []) {
          const pRed = m.participants?.find((p: any) => p.side === 'RED_CORNER');
          const pBlue = m.participants?.find((p: any) => p.side === 'BLUE_CORNER');
          const redId = pRed?.participant?.id?.replace('athlete-', '');
          const blueId = pBlue?.participant?.id?.replace('athlete-', '');

          if (redId === cleanFighterId) {
            opponentName = pBlue?.participant?.displayName || opponentName;
            targetEventName = ev.name;
            break;
          } else if (blueId === cleanFighterId) {
            opponentName = pRed?.participant?.displayName || opponentName;
            targetEventName = ev.name;
            break;
          }
        }
      }
    } catch {
      // Si el proveedor de eventos no está disponible, continuar con valores predeterminados
    }

    // 3. Generar con el proveedor de IA desacoplado
    const aiOutput = await this.aiProvider.generateAnalysis({
      fighterId: cleanFighterId,
      fighterName: profile?.displayName || params.fighterId,
      opponentName,
      eventName: targetEventName,
      eventId: activeEventId,
      profile,
    });

    const preview: FighterFightPreview = {
      id: 'prev-' + Date.now(),
      fighterId: cleanFighterId,
      eventId: activeEventId,
      fighterName: profile?.displayName || params.fighterId,
      opponentName,
      generatedAt: new Date().toISOString(),
      sourceModel: aiOutput.sourceModel,
      summaryText: aiOutput.summaryText,
      bullets: aiOutput.bullets,
      readinessScore: aiOutput.readinessScore,
      keyFactors: aiOutput.keyFactors,
    };

    // 4. Guardar en persistencia semanal
    await this.repo.savePreview(preview);
    return preview;
  }
}
