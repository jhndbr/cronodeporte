import { prisma } from '@/infra/database/prisma';
import { IFighterPreviewRepository } from '@/core/ports/ai-fighter-preview.port';
import { FighterFightPreview } from '@/core/domain/types';

export class PrismaFighterPreviewRepository implements IFighterPreviewRepository {
  async getPreview(fighterId: string, eventId: string): Promise<FighterFightPreview | null> {
    const cleanId = fighterId.replace('athlete-', '');
    const found = await prisma.fighterPreview.findUnique({
      where: {
        fighterId_eventId: {
          fighterId: cleanId,
          eventId,
        },
      },
    });

    if (!found) return null;

    // Verificar si es menor a 7 días
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const isFresh = Date.now() - new Date(found.generatedAt).getTime() < oneWeekMs;
    if (!isFresh) return null;

    return this.mapToDomain(found);
  }

  async savePreview(preview: FighterFightPreview): Promise<void> {
    const cleanId = preview.fighterId.replace('athlete-', '');
    await prisma.fighterPreview.upsert({
      where: {
        fighterId_eventId: {
          fighterId: cleanId,
          eventId: preview.eventId,
        },
      },
      update: {
        fighterName: preview.fighterName,
        opponentName: preview.opponentName,
        sourceModel: preview.sourceModel,
        summaryText: preview.summaryText,
        bulletsJson: JSON.stringify(preview.bullets),
        readinessScore: preview.readinessScore ?? 85,
        keyFactorsJson: JSON.stringify(preview.keyFactors),
        generatedAt: new Date(),
      },
      create: {
        id: preview.id,
        fighterId: cleanId,
        eventId: preview.eventId,
        fighterName: preview.fighterName,
        opponentName: preview.opponentName,
        sourceModel: preview.sourceModel,
        summaryText: preview.summaryText,
        bulletsJson: JSON.stringify(preview.bullets),
        readinessScore: preview.readinessScore ?? 85,
        keyFactorsJson: JSON.stringify(preview.keyFactors),
        generatedAt: preview.generatedAt ? new Date(preview.generatedAt) : new Date(),
      },
    });
  }

  async getAllPreviews(): Promise<FighterFightPreview[]> {
    const all = await prisma.fighterPreview.findMany();
    return all.map((p) => this.mapToDomain(p));
  }

  private mapToDomain(row: any): FighterFightPreview {
    let bullets: string[] = [];
    let keyFactors: any = {};
    try {
      bullets = JSON.parse(row.bulletsJson);
    } catch {}
    try {
      keyFactors = JSON.parse(row.keyFactorsJson);
    } catch {}

    return {
      id: row.id,
      fighterId: row.fighterId,
      eventId: row.eventId,
      fighterName: row.fighterName,
      opponentName: row.opponentName,
      generatedAt: row.generatedAt.toISOString(),
      sourceModel: row.sourceModel,
      summaryText: row.summaryText,
      bullets,
      readinessScore: row.readinessScore,
      keyFactors,
    };
  }
}
