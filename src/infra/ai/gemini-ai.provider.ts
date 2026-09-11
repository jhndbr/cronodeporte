import { IAiFighterAnalysisProvider, FighterAnalysisContext, FighterAnalysisOutput } from '@/core/ports/ai-fighter-preview.port';
import { AnalyticalRulesAiProvider } from './analytical-rules-ai.provider';

export class GeminiAiProvider implements IAiFighterAnalysisProvider {
  private readonly apiKey?: string;
  private readonly fallbackProvider: AnalyticalRulesAiProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    this.fallbackProvider = new AnalyticalRulesAiProvider();
  }

  async generateAnalysis(context: FighterAnalysisContext): Promise<FighterAnalysisOutput> {
    if (!this.apiKey) {
      return this.fallbackProvider.generateAnalysis(context);
    }

    try {
      const prompt =
        'Eres un analista experto de artes marciales mixtas de la UFC. ' +
        'Genera un análisis conciso y profesional en ESPAÑOL sobre cómo llega el peleador ' +
        context.fighterName +
        ' a su combate en ' +
        context.eventName +
        ' contra ' +
        context.opponentName +
        '. ' +
        'Récord: ' +
        (context.profile?.record?.wins || 0) +
        'V - ' +
        (context.profile?.record?.losses || 0) +
        'D. ' +
        'Gimnasio: ' +
        (context.profile?.gym || 'Élite') +
        '. ' +
        'Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura: ' +
        '{ "summaryText": "Texto conciso evaluando su momento, inactividad o aviso tardío", "bullets": ["Punto 1", "Punto 2", "Punto 3"], "readinessScore": 85, "keyFactors": { "inactivityTime": "6 meses", "campStatus": "Campamento completo", "isShortNotice": false, "recentStreak": "Racha ganadora", "physicalCondition": "Excelente estado" } }';

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (!response.ok) {
        console.warn(`[GeminiAiProvider] Gemini API error: ${response.statusText}, delegating to analytical engine.`);
        return this.fallbackProvider.generateAnalysis(context);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return this.fallbackProvider.generateAnalysis(context);
      }

      const parsed = JSON.parse(rawText);
      return {
        summaryText: parsed.summaryText,
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
        readinessScore: typeof parsed.readinessScore === 'number' ? parsed.readinessScore : 85,
        keyFactors: parsed.keyFactors || { isShortNotice: false },
        sourceModel: 'google-gemini-1.5-flash',
      };
    } catch (err) {
      console.warn('[GeminiAiProvider] Exception while contacting Gemini, using fallback:', err);
      return this.fallbackProvider.generateAnalysis(context);
    }
  }
}
