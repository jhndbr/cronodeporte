import { IAiFighterAnalysisProvider, FighterAnalysisContext, FighterAnalysisOutput } from '@/core/ports/ai-fighter-preview.port';

export class AnalyticalRulesAiProvider implements IAiFighterAnalysisProvider {
  async generateAnalysis(context: FighterAnalysisContext): Promise<FighterAnalysisOutput> {
    const prof = context.profile;
    const wins = prof?.record?.wins || 0;
    const losses = prof?.record?.losses || 0;
    const koWins = prof?.record?.koWins || 0;
    const subWins = prof?.record?.subWins || 0;
    const totalWins = wins > 0 ? wins : 1;
    const finishPercent = Math.round(((koWins + subWins) / totalWins) * 100);

    const pastFights = prof?.recentFights || [];
    const lastFight = pastFights[0];
    let inactivityText = 'Activo en los últimos 6 meses';
    if (lastFight?.eventDate) {
      const months = Math.round((Date.now() - new Date(lastFight.eventDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      if (months > 10) inactivityText = `${months} meses sin competir en el octágono`;
    }

    const readinessScore = Math.min(95, Math.max(70, 75 + Math.round(finishPercent / 5) - (losses > 5 ? 5 : 0)));

    return {
      summaryText: `${context.fighterName} se presenta a este compromiso en ${context.eventName} ante ${context.opponentName} con un récord de ${wins}-${losses}. Con una efectividad de definición del ${finishPercent}%, llega con campamento estructurado para capitalizar sus fortalezas y dominar la distancia.`,
      bullets: [
        `Peligro de finalización: Acumula ${koWins} nocauts y ${subWins} sumisiones en su historial profesional.`,
        `Estado de actividad: ${inactivityText}, sosteniendo consistencia competitiva.`,
        `Enfoque táctico: Preparación orientada a neutralizar el alcance de ${context.opponentName} e imponer el ritmo.`,
      ],
      readinessScore,
      keyFactors: {
        inactivityTime: inactivityText,
        campStatus: prof?.gym ? `Campamento en ${prof.gym}` : 'Campamento completo de alto rendimiento',
        isShortNotice: false,
        recentStreak: wins > losses ? 'Racha positiva en la división' : 'En busca de consolidación estelar',
        physicalCondition: 'Acondicionamiento físico óptimo para los asaltos reglamentarios',
      },
      sourceModel: 'analytical-rules-engine',
    };
  }
}
