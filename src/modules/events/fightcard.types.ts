import { Match, MatchSegment, Event } from '@/core/domain/types';

export type FightCardSortOrder = 'CHRONOLOGICAL' | 'MAIN_EVENT_FIRST';

export interface FightCardSegmentGroup {
  segment: MatchSegment;
  label: string;
  badgeColor: string;
  matches: Match[];
}

export interface FightCardViewData {
  event: Event;
  segments: FightCardSegmentGroup[];
  totalMatches: number;
  mainEvent?: Match;
  coMainEvent?: Match;
}
