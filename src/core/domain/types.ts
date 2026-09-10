/**
 * Modelo de Dominio Extensible para Cronoporte
 * Abstracción unificada para deportes de combate, individuales y de equipo.
 */

export type SportType = 'INDIVIDUAL' | 'TEAM';

export interface Sport {
  id: string;
  slug: string; // 'mma' | 'boxing' | 'football' | 'tennis' | 'basketball'
  name: string;
  type: SportType;
  iconName?: string;
  metadata?: {
    defaultRounds?: number;
    roundDurationMinutes?: number;
    weightClasses?: string[];
    scoringSystem?: string;
  };
}

export interface Organization {
  id: string;
  sportSlug: string;
  name: string; // ej. 'Ultimate Fighting Championship'
  shortName: string; // ej. 'UFC'
  slug: string; // ej. 'ufc'
  logoUrl?: string;
  country?: string;
  websiteUrl?: string;
}

export type AffiliationType = 
  | 'GYM' 
  | 'TRAINING_CAMP' 
  | 'ACADEMY' 
  | 'DOJO' 
  | 'CLUB' 
  | 'NATIONAL_TEAM';

export interface Affiliation {
  id: string;
  name: string; // ej. 'American Top Team', 'Chute Boxe Academy', 'Real Madrid CF'
  slug: string;
  type: AffiliationType;
  city?: string;
  country?: string;
  headCoach?: string;
  notableMembers?: string[];
  logoUrl?: string;
  description?: string;
}

export type ParticipantType = 'ATHLETE' | 'TEAM';

export interface ParticipantAffiliation {
  affiliation: Affiliation;
  role?: string; // ej. 'Fighter', 'Captain', 'Striking Coach'
  isPrimary: boolean;
  sinceYear?: number;
}

export interface FighterStats {
  wins: number;
  losses: number;
  draws: number;
  noContests?: number;
  koWins?: number;
  subWins?: number;
  decWins?: number;
  height?: string; // '6\' 4"' or '193 cm'
  weight?: string; // '205 lbs' or '93 kg'
  reach?: string; // '79 in' or '200 cm'
  legReach?: string;
  stance?: 'Orthodox' | 'Southpaw' | 'Switch';
  strikingAccuracy?: number; // ej. 62 (%)
  takedownDefense?: number; // ej. 74 (%)
  significantStrikesLandedPerMin?: number;
}

export interface PastFight {
  id: string;
  eventName: string;
  eventDate: string;
  opponentId?: string;
  opponentName: string;
  opponentAvatarUrl?: string;
  isWinner: boolean;
  method: string;        // 'KO/TKO', 'Submission', 'Decision - Unanimous', etc.
  methodDetail?: string;  // 'Punches', 'Rear Naked Choke', etc.
  round?: number;
  time?: string;
}

export interface FighterDetailedProfile {
  id: string;
  displayName: string;
  nickname?: string;
  avatarUrl?: string;
  country?: string;
  countryFlagCode?: string;
  weightClass?: string;
  gender?: 'MALE' | 'FEMALE';
  height?: string;
  weight?: string;
  reach?: string;
  stance?: string;
  age?: number;
  gym?: string;
  record: {
    wins: number;
    losses: number;
    draws: number;
    koWins?: number;
    koLosses?: number;
    subWins?: number;
    subLosses?: number;
    decWins?: number;
    decLosses?: number;
  };
  stats?: {
    strikingAccuracy?: number;
    significantStrikesPerMin?: number;
    takedownDefense?: number;
    takedownAccuracy?: number;
  };
  recentFights: PastFight[];
}

export interface TeamStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor?: number;
  goalsAgainst?: number;
}

export interface Participant {
  id: string;
  sportSlug: string;
  type: ParticipantType;
  firstName?: string;
  lastName?: string;
  displayName: string; // ej. 'Alex Pereira' o 'Flamengo'
  nickname?: string; // ej. 'Poatan'
  slug: string; // ej. 'alex-pereira'
  country?: string;
  countryFlagCode?: string;
  avatarUrl?: string;
  gender?: 'MALE' | 'FEMALE';
  affiliations: ParticipantAffiliation[];
  stats: FighterStats | TeamStats | Record<string, unknown>;
}

export type EventStatus = 
  | 'SCHEDULED' 
  | 'LIVE' 
  | 'FINISHED' 
  | 'POSTPONED' 
  | 'CANCELLED';

export type MatchSegment = 
  | 'MAIN_CARD' 
  | 'PRELIMS' 
  | 'EARLY_PRELIMS' 
  | 'CO_MAIN' 
  | 'MAIN_EVENT'
  | 'GROUP_STAGE'
  | 'KNOCKOUT';

export type MatchStatus = 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'FINISHED' 
  | 'CANCELLED';

export type VictoryMethod = 
  | 'KO_TKO' 
  | 'SUBMISSION' 
  | 'DECISION_UNANIMOUS' 
  | 'DECISION_SPLIT' 
  | 'DECISION_MAJORITY' 
  | 'DRAW' 
  | 'NO_CONTEST' 
  | 'DISQUALIFICATION'
  | 'POINTS'
  | 'PENALTIES';

export interface MatchParticipant {
  participant: Participant;
  side: 'RED_CORNER' | 'BLUE_CORNER' | 'HOME' | 'AWAY';
  isWinner?: boolean;
  isFavorite?: boolean;
  currentOdd?: {
    american: string; // ej. '-150' o '+130'
    decimal: number;  // ej. 1.67 o 2.30
  };
  scoreDetails?: Record<string, unknown>;
}

export interface Match {
  id: string;
  eventId: string;
  title: string; // ej. "Alex Pereira vs Magomed Ankalaev"
  segment: MatchSegment;
  orderIndex: number;
  weightClass?: string; // ej. 'Light Heavyweight'
  isTitleFight: boolean;
  isMainEvent: boolean;
  isCoMain: boolean;
  roundsMax: number;
  status: MatchStatus;
  scheduledTime?: string;
  
  // Resultados si finalizó
  victoryMethod?: VictoryMethod;
  victoryDetails?: string; // ej. "Punch at 3:04 in Round 2"
  victoryRound?: number;
  victoryTime?: string;
  winnerId?: string;

  participants: MatchParticipant[];
  bettingMarkets?: BettingMarket[];
}

export interface BettingOdd {
  bookmaker: string; // 'DraftKings', 'BetMGM', 'Bovada'
  participantId: string;
  americanOdd: string;
  decimalOdd: number;
  lastUpdated: string;
}

export interface BettingMarket {
  id: string;
  matchId: string;
  marketType: 'MONEYLINE' | 'OVER_UNDER_ROUNDS' | 'METHOD_OF_VICTORY';
  marketName: string;
  odds: BettingOdd[];
}

export interface Event {
  id: string;
  organizationSlug: string; // 'ufc', 'one', etc.
  organization?: Organization;
  sportSlug: string; // 'mma', 'boxing'
  name: string; // ej. 'UFC 313: Pereira vs. Ankalaev'
  shortName: string; // ej. 'UFC 313'
  slug: string;
  startDate: string; // ISO 8601
  endDate?: string;
  status: EventStatus;
  venueName?: string; // ej. 'T-Mobile Arena'
  city?: string; // ej. 'Las Vegas'
  country?: string; // ej. 'United States'
  posterUrl?: string;
  matches: Match[];
  externalSource?: {
    provider: 'espn' | 'odds_api' | 'manual';
    externalId: string;
    lastSyncedAt: string;
  };
}

export interface UfcFighterRank {
  rank: number;
  isChampion: boolean;
  defenses?: number;
  trend?: string;
  recordSummary: string;
  fighterId: string;
  displayName: string;
  nickname?: string;
  headshotUrl?: string;
  flagUrl?: string;
  countryCode?: string;
  age?: number;
  espnLink?: string;
}

export interface UfcRankingsCategory {
  id: string;
  name: string;
  slug: string;
  gender: 'MALE' | 'FEMALE';
  isP4P: boolean;
  weightClass?: string;
  champion?: UfcFighterRank;
  fighters: UfcFighterRank[];
}

export interface UfcNewsArticle {
  id: string;
  headline: string;
  description: string;
  publishedAt: string;
  imageUrl?: string;
  sourceUrl?: string;
  category?: string;
}

export interface UfcCalendarItem {
  id: string;
  label: string;
  startDate: string;
  endDate?: string;
  isPPV: boolean;
  isFightNight: boolean;
  isContenderSeries: boolean;
  location?: string;
  espnEventId?: string;
}

// ==========================================
// USUARIOS, AUTENTICACIÓN Y PREDICCIONES
// ==========================================

export interface UserStats {
  totalPredictions: number;
  correct: number;
  incorrect: number;
  pending: number;
  accuracyRate: number; // Porcentaje (0-100)
  totalPoints: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  provider: 'google' | 'guest' | 'credentials';
  createdAt: string;
  stats: UserStats;
}

export interface BoutPick {
  matchId: string;
  eventName: string;
  eventDate?: string;
  weightClass?: string;
  selectedSide: 'RED_CORNER' | 'BLUE_CORNER';
  selectedFighterId: string;
  selectedFighterName: string;
  opponentFighterId: string;
  opponentFighterName: string;
  status: 'PENDING' | 'CORRECT' | 'INCORRECT' | 'CANCELLED';
}

export type TicketType = 'SINGLE' | 'COMBO';

export interface PredictionTicket {
  id: string;
  userId: string;
  type: TicketType;
  picks: BoutPick[];
  createdAt: string;
  status: 'PENDING' | 'WON' | 'LOST' | 'VOID';
  pointsAwarded?: number;
}

// ==========================================
// ANÁLISIS DE IA "¿CÓMO LLEGA A LA PELEA?"
// ==========================================

export interface FighterFightPreview {
  id: string;
  fighterId: string;
  eventId: string;
  fighterName: string;
  opponentName: string;
  generatedAt: string; // ISO 8601
  sourceModel: string; // 'google-gemini' | 'gemini-1.5-flash' | 'statistical-engine'
  summaryText: string;
  bullets: string[];
  readinessScore?: number; // ej. 85 / 100
  keyFactors: {
    inactivityTime?: string; // ej. "1 año y 2 meses"
    campStatus?: string; // "Campamento completo en Chute Boxe"
    isShortNotice: boolean;
    recentStreak?: string; // "3 victorias consecutivas por KO"
    physicalCondition?: string;
  };
}

// ==========================================
// NOTIFICACIONES DE LA PLATAFORMA
// ==========================================

export interface PlatformNotification {
  id: string;
  type: 'EVENT_STARTING' | 'NEXT_EVENT' | 'PREDICTION_RESOLVED' | 'NEWS_ALERT';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  linkUrl?: string;
  metadata?: Record<string, unknown>;
}

