export interface EspnAthlete {
  id: string;
  uid?: string;
  guid?: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  shortName?: string;
  fullName?: string;
  nickname?: string;
  headshot?: {
    href: string;
    alt?: string;
  };
  flag?: {
    href: string;
    alt?: string;
    rel?: string[];
  };
  displayWeight?: string;
  displayHeight?: string;
  age?: number;
  dateOfBirth?: string;
  birthPlace?: {
    city?: string;
    state?: string;
    country?: string;
  };
  citizenship?: string;
  record?: string;
  statistics?: Array<{
    name: string;
    displayValue: string;
    label?: string;
  }>;
}

export interface EspnCompetitor {
  id: string;
  uid: string;
  type: string;
  order: number;
  winner?: boolean;
  athlete: EspnAthlete;
  records?: Array<{
    name?: string;
    type?: string;
    summary: string;
    displayValue?: string;
  }>;
  curatedRank?: {
    current: number;
  };
  linescores?: Array<{
    value: number;
    displayValue?: string;
  }>;
}

export interface EspnCompetition {
  id: string;
  uid: string;
  date: string;
  attendance?: number;
  type?: {
    id: string;
    text: string;
    abbreviation?: string;
  };
  status: {
    clock?: number;
    displayClock?: string;
    period?: number;
    type: {
      id: string;
      name: string;
      state: 'pre' | 'in' | 'post';
      completed: boolean;
      description: string;
      detail?: string;
      shortDetail?: string;
    };
  };
  competitors: EspnCompetitor[];
  venue?: {
    id?: string;
    fullName?: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  notes?: Array<{
    type?: string;
    headline: string;
  }>;
  odds?: Array<{
    provider: {
      id: string;
      name: string;
      priority: number;
    };
    details?: string;
    overUnder?: number;
    spread?: number;
    awayTeamOdds?: {
      moneyLine?: number;
      favorite?: boolean;
    };
    homeTeamOdds?: {
      moneyLine?: number;
      favorite?: boolean;
    };
  }>;
  format?: {
    regulation?: {
      periods: number;
    };
  };
}

export interface EspnEvent {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season?: {
    year: number;
    type: number;
  };
  status: {
    clock?: number;
    displayClock?: string;
    period?: number;
    type: {
      id: string;
      name: string;
      state: 'pre' | 'in' | 'post';
      completed: boolean;
      description: string;
      detail?: string;
    };
  };
  competitions: EspnCompetition[];
}

export interface EspnScoreboardResponse {
  leagues: Array<{
    id: string;
    uid: string;
    name: string;
    abbreviation: string;
    slug: string;
    season?: {
      year: number;
      startDate: string;
      endDate: string;
      displayName: string;
    };
    calendar?: Array<{
      label: string;
      value: string;
      startDate: string;
      endDate: string;
      event?: {
        $ref: string;
      };
      entries?: Array<{
        label: string;
        alternateLabel?: string;
        detail?: string;
        value: string;
        startDate: string;
        endDate: string;
      }>;
    }>;
  }>;
  events: EspnEvent[];
}

export interface EspnRankItem {
  current: number;
  hasAccolade?: boolean;
  defenses?: number;
  trend?: string;
  recordSummary?: string;
  athlete: {
    id: string;
    uid?: string;
    firstName?: string;
    lastName?: string;
    displayName: string;
    nickname?: string;
    flag?: string;
    headshot?: string;
    age?: number;
    citizenshipCountry?: string;
    links?: Array<{
      href: string;
      text: string;
    }>;
  };
}

export interface EspnRankingCategory {
  name: string;
  type: string;
  shortName?: string;
  ranks: EspnRankItem[];
}

export interface EspnRankingsResponse {
  rankings: EspnRankingCategory[];
  availableRankings?: Array<{
    name: string;
    type: string;
  }>;
}

export interface EspnNewsArticle {
  id?: number | string;
  headline: string;
  description: string;
  published: string;
  type?: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    caption?: string;
    alt?: string;
  }>;
  links?: {
    web?: {
      href: string;
    };
  };
  categories?: Array<{
    description: string;
    type: string;
  }>;
}

export interface EspnNewsResponse {
  header?: string;
  articles: EspnNewsArticle[];
}

