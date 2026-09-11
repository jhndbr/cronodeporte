import { IFighterPreviewRepository } from '@/core/ports/ai-fighter-preview.port';
import { FighterFightPreview } from '@/core/domain/types';

export class InMemoryFighterPreviewRepository implements IFighterPreviewRepository {
  private previews: Map<string, FighterFightPreview> = new Map();

  private makeKey(fighterId: string, eventId: string): string {
    const cleanId = fighterId.replace('athlete-', '');
    return `${cleanId}:${eventId}`;
  }

  async getPreview(fighterId: string, eventId: string): Promise<FighterFightPreview | null> {
    const key = this.makeKey(fighterId, eventId);
    const item = this.previews.get(key);
    if (!item) return null;

    // Verificar frescura semanal (7 días)
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const isFresh = Date.now() - new Date(item.generatedAt).getTime() < oneWeekMs;
    return isFresh ? JSON.parse(JSON.stringify(item)) : null;
  }

  async savePreview(preview: FighterFightPreview): Promise<void> {
    const key = this.makeKey(preview.fighterId, preview.eventId);
    this.previews.set(key, JSON.parse(JSON.stringify(preview)));
  }

  async getAllPreviews(): Promise<FighterFightPreview[]> {
    return Array.from(this.previews.values()).map((p) => JSON.parse(JSON.stringify(p)));
  }

  clear(): void {
    this.previews.clear();
  }
}
