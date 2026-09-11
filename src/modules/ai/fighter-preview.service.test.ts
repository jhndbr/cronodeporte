import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FighterPreviewService } from './fighter-preview.service';
import { InMemoryFighterPreviewRepository } from '@/infra/repositories/in-memory/in-memory-fighter-preview.repository';
import { MockAiProvider } from '@/infra/ai/mock-ai.provider';
import { FighterFightPreview } from '@/core/domain/types';

describe('FighterPreviewService (Modulo de IA Desacoplado)', () => {
  let previewRepo: InMemoryFighterPreviewRepository;
  let mockAi: MockAiProvider;
  let service: FighterPreviewService;

  beforeEach(() => {
    previewRepo = new InMemoryFighterPreviewRepository();
    mockAi = new MockAiProvider();

    const mockFighterService = {
      getFighterProfile: async (id: string) => ({
        id,
        displayName: 'Ilia Topuria',
        gym: 'Climent Club',
        record: { wins: 15, losses: 0, draws: 0, koWins: 5, subWins: 8 },
      }),
    };

    const mockEventsProvider = {
      getEvents: async () => [
        {
          id: 'ufc-308',
          name: 'UFC 308: Topuria vs. Holloway',
          matches: [
            {
              id: 'bout-topuria-holloway',
              participants: [
                { side: 'RED_CORNER', participant: { id: 'athlete-topuria', displayName: 'Ilia Topuria' } },
                { side: 'BLUE_CORNER', participant: { id: 'athlete-holloway', displayName: 'Max Holloway' } },
              ],
            },
          ],
        },
      ],
    };

    service = new FighterPreviewService({
      repo: previewRepo,
      aiProvider: mockAi,
      fighterService: mockFighterService,
      eventsProvider: mockEventsProvider,
    });
  });

  test('Debe generar análisis con IA cuando no está en caché y guardarlo en el repositorio', async () => {
    const preview = await service.getOrGeneratePreview({
      fighterId: 'athlete-topuria',
      eventId: 'ufc-308',
    });

    assert.ok(preview);
    assert.equal(preview.fighterName, 'Ilia Topuria');
    assert.equal(preview.opponentName, 'Max Holloway');
    assert.equal(preview.sourceModel, 'mock-ai-provider');
    assert.equal(mockAi.callCount, 1);

    // Verificar que quedó persistido en el repositorio
    const inRepo = await previewRepo.getPreview('topuria', 'ufc-308');
    assert.ok(inRepo);
    assert.equal(inRepo?.fighterName, 'Ilia Topuria');
  });

  test('Debe retornar directamente desde la caché sin invocar a la IA si ya existe y está vigente', async () => {
    const existingPreview: FighterFightPreview = {
      id: 'prev-existing',
      fighterId: 'topuria',
      eventId: 'ufc-308',
      fighterName: 'Ilia Topuria',
      opponentName: 'Max Holloway',
      generatedAt: new Date().toISOString(),
      sourceModel: 'cached-model',
      summaryText: 'Análisis previamente almacenado en caché',
      bullets: ['Punto 1'],
      readinessScore: 92,
      keyFactors: { isShortNotice: false },
    };

    await previewRepo.savePreview(existingPreview);

    const result = await service.getOrGeneratePreview({
      fighterId: 'athlete-topuria',
      eventId: 'ufc-308',
    });

    assert.equal(result.id, 'prev-existing');
    assert.equal(result.summaryText, 'Análisis previamente almacenado en caché');
    // El proveedor de IA NO debió ser invocado
    assert.equal(mockAi.callCount, 0);
  });
});
