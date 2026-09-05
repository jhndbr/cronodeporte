import {
  Event,
  UfcCalendarItem,
  UfcNewsArticle,
  UfcRankingsCategory,
} from '../domain/types';
import { EspnScoreboardResponse, EspnNewsResponse } from '@/adapters/espn/espn-ufc.types';

export interface IDataNormalizer<TRawScoreboard, TRawNews = unknown> {
  normalizeEvents(raw: TRawScoreboard): Event[];
  normalizeCalendar(raw: TRawScoreboard): UfcCalendarItem[];
  normalizeNews(raw: TRawNews): UfcNewsArticle[];
  normalizeRankings?(raw: unknown): UfcRankingsCategory[];
}

export type IMmaDataNormalizer = IDataNormalizer<EspnScoreboardResponse, EspnNewsResponse>;
