import { UfcRankingsCategory, UfcFighterRank } from '@/core/domain/types';

export interface RankingsFilterOptions {
  gender?: 'MALE' | 'FEMALE';
  p4pOnly?: boolean;
  slug?: string;
}

export interface RankingsServiceResponse {
  categories: UfcRankingsCategory[];
  lastUpdated: string;
  source: 'official_verified' | 'cached' | 'espn_live';
}

export type { UfcRankingsCategory, UfcFighterRank };
