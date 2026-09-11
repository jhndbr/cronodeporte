import { FighterFightPreview, FighterDetailedProfile } from '../domain/types';

export interface FighterAnalysisContext {
  fighterId: string;
  fighterName: string;
  opponentName: string;
  eventName: string;
  eventId: string;
  profile?: FighterDetailedProfile | null;
}

export interface FighterAnalysisOutput {
  summaryText: string;
  bullets: string[];
  readinessScore: number;
  keyFactors: {
    inactivityTime?: string;
    campStatus?: string;
    isShortNotice: boolean;
    recentStreak?: string;
    physicalCondition?: string;
  };
  sourceModel: string;
}

export interface IAiFighterAnalysisProvider {
  generateAnalysis(context: FighterAnalysisContext): Promise<FighterAnalysisOutput>;
}

export interface IFighterPreviewRepository {
  getPreview(fighterId: string, eventId: string): Promise<FighterFightPreview | null>;
  savePreview(preview: FighterFightPreview): Promise<void>;
  getAllPreviews(): Promise<FighterFightPreview[]>;
}
