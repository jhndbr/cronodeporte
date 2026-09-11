import { IAiFighterAnalysisProvider, FighterAnalysisContext, FighterAnalysisOutput } from '@/core/ports/ai-fighter-preview.port';

export class MockAiProvider implements IAiFighterAnalysisProvider {
  public callCount = 0;
  public lastContext?: FighterAnalysisContext;
  public mockResponse?: FighterAnalysisOutput;
  public shouldFail = false;

  async generateAnalysis(context: FighterAnalysisContext): Promise<FighterAnalysisOutput> {
    this.callCount++;
    this.lastContext = context;

    if (this.shouldFail) {
      throw new Error('Simulated AI Provider Failure');
    }

    if (this.mockResponse) {
      return this.mockResponse;
    }

    return {
      summaryText: `Análisis simulado para ${context.fighterName} ante ${context.opponentName}`,
      bullets: ['Fortaleza en el striking', 'Defensa de derribo superior', 'Preparación completa'],
      readinessScore: 88,
      keyFactors: {
        inactivityTime: '3 meses',
        campStatus: 'Campamento en Gimnasio Pro',
        isShortNotice: false,
        recentStreak: '3 victorias seguidas',
        physicalCondition: 'Óptima',
      },
      sourceModel: 'mock-ai-provider',
    };
  }
}
