import { IMmaDataNormalizer } from '@/core/ports/normalizer';
import {
  Event,
  Match,
  Participant,
  MatchParticipant,
  EventStatus,
  MatchSegment,
  MatchStatus,
  VictoryMethod,
  Affiliation,
  Organization,
  FighterStats,
  UfcCalendarItem,
  UfcNewsArticle,
  FighterDetailedProfile,
  PastFight,
} from '@/core/domain/types';
import {
  EspnScoreboardResponse,
  EspnCompetition,
  EspnCompetitor,
  EspnNewsResponse,
} from './espn-ufc.types';

export interface EnrichedAthleteData {
  displayHeight?: string;
  displayWeight?: string;
  displayReach?: string;
  stance?: string;
  nickname?: string;
  gender?: 'MALE' | 'FEMALE';
  associationName?: string;
  associationCountry?: string;
  strikingAccuracy?: number;
  significantStrikesLandedPerMin?: number;
  takedownDefense?: number;
  takedownAccuracy?: number;
}

export interface EnrichedBoutOdds {
  awayMoneyLine?: number | string;
  homeMoneyLine?: number | string;
  awayFavorite?: boolean;
  homeFavorite?: boolean;
  providerName?: string;
  overUnder?: number;
  details?: string;
  awayAthleteId?: string;
  homeAthleteId?: string;
}

export const KNOWN_GYMS_MAP: Record<string, { name: string; city: string; country: string; coach?: string }> = {
  'Alex Pereira': { name: 'Teixeira MMA & Fitness', city: 'Danbury, CT', country: 'United States', coach: 'Glover Teixeira' },
  'Magomed Ankalaev': { name: 'Gorets Fight Club', city: 'Makhachkala', country: 'Russia', coach: 'Shamil Alibatitov' },
  'Islam Makhachev': { name: 'Eagles MMA / AKA', city: 'San Jose, CA', country: 'United States', coach: 'Khabib Nurmagomedov / Javier Mendez' },
  'Jon Jones': { name: 'Jackson Wink MMA Academy', city: 'Albuquerque, NM', country: 'United States', coach: 'Greg Jackson / Brandon Gibson' },
  'Ilia Topuria': { name: 'Climent Club', city: 'Alicante', country: 'Spain', coach: 'Jorge & Agustín Climent' },
  'Max Holloway': { name: 'Hawaii Elite MMA', city: 'Waianae, HI', country: 'United States', coach: 'Ivan Flores' },
  'Dricus Du Plessis': { name: 'Team CIT MMA', city: 'Pretoria', country: 'South Africa', coach: 'Morne Visser' },
  'Sean O\'Malley': { name: 'MMA Lab', city: 'Glendale, AZ', country: 'United States', coach: 'Tim Welch' },
  'Merab Dvalishvili': { name: 'Serra-Longo Fight Team', city: 'Long Island, NY', country: 'United States', coach: 'Ray Longo / Matt Serra' },
  'Alexander Volkanovski': { name: 'City Kickboxing / Freestyle MMA', city: 'Auckland', country: 'New Zealand', coach: 'Eugene Bareman' },
  'Israel Adesanya': { name: 'City Kickboxing', city: 'Auckland', country: 'New Zealand', coach: 'Eugene Bareman' },
  'Dan Hooker': { name: 'City Kickboxing', city: 'Auckland', country: 'New Zealand', coach: 'Eugene Bareman' },
  'Salahdine Parnasse': { name: 'Atch Academy', city: 'Paris', country: 'France', coach: 'Stephane Atch' },
  'Dustin Poirier': { name: 'American Top Team (ATT)', city: 'Coconut Creek, FL', country: 'United States', coach: 'Mike Brown' },
  'Justin Gaethje': { name: 'Elevation Fight Team', city: 'Denver, CO', country: 'United States', coach: 'Trevor Wittman' },
  'Kamaru Usman': { name: 'Kill Cliff FC / ONX Sports', city: 'Denver, CO', country: 'United States', coach: 'Trevor Wittman' },
  'Charles Oliveira': { name: 'Chute Boxe Diego Lima', city: 'São Paulo', country: 'Brazil', coach: 'Diego Lima' },
  'Caio Borralho': { name: 'Fighting Nerds', city: 'São Paulo', country: 'Brazil', coach: 'Pablo Sucupira' },
  'Jean Silva': { name: 'Fighting Nerds', city: 'São Paulo', country: 'Brazil', coach: 'Pablo Sucupira' },
  'Mauricio Ruffy': { name: 'Fighting Nerds', city: 'São Paulo', country: 'Brazil', coach: 'Pablo Sucupira' },
  'Carlos Prates': { name: 'Fighting Nerds', city: 'São Paulo', country: 'Brazil', coach: 'Pablo Sucupira' },
  'Gilbert Burns': { name: 'Kill Cliff FC', city: 'Deerfield Beach, FL', country: 'United States', coach: 'Henri Hooft' },
  'Michael Chandler': { name: 'Kill Cliff FC', city: 'Deerfield Beach, FL', country: 'United States', coach: 'Henri Hooft' },
  'Shavkat Rakhmonov': { name: 'Kill Cliff FC / DAR Team', city: 'Almaty', country: 'Kazakhstan', coach: 'Henri Hooft / Eduard Bazrov' },
  'Paddy Pimblett': { name: 'Next Generation MMA', city: 'Liverpool', country: 'United Kingdom', coach: 'Paul Reed' },
  'Khamzat Chimaev': { name: 'Allstars Training Center', city: 'Stockholm', country: 'Sweden', coach: 'Andreas Michael' },
  'Sean Strickland': { name: 'Xtreme Couture', city: 'Las Vegas, NV', country: 'United States', coach: 'Eric Nicksick' },
  'Brandon Moreno': { name: 'Entram Gym / Sayif Saud', city: 'Tijuana', country: 'Mexico', coach: 'Raul Arvizu' },
  'Umar Nurmagomedov': { name: 'Eagles MMA', city: 'Makhachkala', country: 'Russia', coach: 'Khabib Nurmagomedov' },
  'Song Yadong': { name: 'Team Alpha Male', city: 'Sacramento, CA', country: 'United States', coach: 'Urijah Faber' },
};

export class EspnMmaNormalizer implements IMmaDataNormalizer {
  private readonly defaultOrg: Organization = {
    id: 'org-ufc',
    sportSlug: 'mma',
    name: 'Ultimate Fighting Championship',
    shortName: 'UFC',
    slug: 'ufc',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png',
    country: 'United States',
    websiteUrl: 'https://www.ufc.com',
  };

  /**
   * Normaliza eventos con soporte opcional de enriquecimiento (cuotas reales y perfiles de atletas).
   */
  normalizeEvents(
    raw: EspnScoreboardResponse,
    enrichment?: {
      oddsByCompId?: Map<string, EnrichedBoutOdds>;
      athleteProfilesByIdOrName?: Map<string, EnrichedAthleteData>;
    }
  ): Event[] {
    const canonicalEvents: Event[] = [];

    if (!raw.events || raw.events.length === 0) {
      return [];
    }

    for (const espnEvent of raw.events) {
      const isEventLive = espnEvent.status?.type?.state === 'in';
      const isEventFinished = espnEvent.status?.type?.completed || espnEvent.status?.type?.state === 'post';

      let eventStatus: EventStatus = 'SCHEDULED';
      if (isEventLive) eventStatus = 'LIVE';
      else if (isEventFinished) eventStatus = 'FINISHED';

      const rawCompetitions = [...(espnEvent.competitions || [])];
      const total = rawCompetitions.length;
      if (total === 0) continue;

      const lowerEventName = espnEvent.name.toLowerCase();
      let mainEventIndexInRaw = -1;

      for (let i = 0; i < total; i++) {
        const comp = rawCompetitions[i];
        const hasMainAthlete = comp.competitors?.some((c) => {
          const name = (c.athlete?.displayName || '').toLowerCase();
          const lastName = (c.athlete?.lastName || name.split(' ').pop() || '').toLowerCase();
          return lastName.length > 2 && lowerEventName.includes(lastName);
        });
        if (hasMainAthlete) {
          mainEventIndexInRaw = i;
          break;
        }
      }

      if (mainEventIndexInRaw === -1) {
        mainEventIndexInRaw = total - 1;
      }

      let chronologicalCompetitions: EspnCompetition[];
      if (mainEventIndexInRaw === 0 && total > 1) {
        chronologicalCompetitions = [...rawCompetitions].reverse();
      } else {
        chronologicalCompetitions = rawCompetitions;
      }

      const n = chronologicalCompetitions.length;
      const matches: Match[] = [];

      chronologicalCompetitions.forEach((comp, idx) => {
        const isMainEvent = idx === n - 1;
        const isCoMain = idx === n - 2 && n > 1;

        let segment: MatchSegment = 'MAIN_CARD';
        const distanceFromEnd = n - 1 - idx;

        if (distanceFromEnd >= 5 && distanceFromEnd < 9) {
          segment = 'PRELIMS';
        } else if (distanceFromEnd >= 9) {
          segment = 'EARLY_PRELIMS';
        }

        const enrichedOdds = enrichment?.oddsByCompId?.get(comp.id) ||
                             enrichment?.oddsByCompId?.get(String(idx));

        const match = this.transformCompetitionToMatch(
          comp,
          espnEvent.id,
          idx,
          isMainEvent,
          isCoMain,
          segment,
          enrichedOdds,
          enrichment?.athleteProfilesByIdOrName
        );

        if (match) {
          matches.push(match);
        }
      });

      const firstVenue = rawCompetitions[0]?.venue;

      const event: Event = {
        id: `ufc-event-${espnEvent.id}`,
        organizationSlug: 'ufc',
        organization: this.defaultOrg,
        sportSlug: 'mma',
        name: espnEvent.name,
        shortName: espnEvent.shortName || espnEvent.name,
        slug: this.slugify(espnEvent.name),
        startDate: espnEvent.date,
        status: eventStatus,
        venueName: firstVenue?.fullName || 'UFC APEX / Arena',
        city: firstVenue?.address?.city || 'Las Vegas',
        country: firstVenue?.address?.country || 'United States',
        matches,
        externalSource: {
          provider: 'espn',
          externalId: espnEvent.id,
          lastSyncedAt: new Date().toISOString(),
        },
      };

      canonicalEvents.push(event);
    }

    return canonicalEvents;
  }

  normalizeCalendar(raw: EspnScoreboardResponse): UfcCalendarItem[] {
    const rawCalendar = raw.leagues?.[0]?.calendar || [];
    const now = new Date();

    const futureRaw = rawCalendar.filter((item) => {
      const itemDate = new Date(item.startDate);
      return itemDate.getTime() >= now.getTime() - 12 * 3600 * 1000;
    });

    return futureRaw.map((item, idx) => {
      const label = item.label || `UFC Event #${idx + 1}`;
      const isPPV = /UFC\s+\d+/i.test(label);
      const isFightNight = /Fight Night/i.test(label);
      const isContenderSeries = /Contender/i.test(label) || /DWCS/i.test(label);

      return {
        id: `cal-${idx}-${item.startDate}`,
        label,
        startDate: item.startDate,
        endDate: item.endDate,
        isPPV,
        isFightNight,
        isContenderSeries,
        location: isPPV ? 'T-Mobile Arena, Las Vegas' : 'UFC APEX, Las Vegas',
      };
    });
  }

  normalizeNews(raw: EspnNewsResponse, limit: number = 8): UfcNewsArticle[] {
    if (!raw.articles || raw.articles.length === 0) {
      return [];
    }

    return raw.articles.slice(0, limit).map((a, idx) => ({
      id: `news-${a.id || idx}`,
      headline: a.headline,
      description: a.description || '',
      publishedAt: a.published,
      imageUrl: a.images?.[0]?.url || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
      sourceUrl: a.links?.web?.href || 'https://www.espn.com/mma/',
      category: a.categories?.[0]?.description || 'UFC News',
    }));
  }

  private transformCompetitionToMatch(
    comp: EspnCompetition,
    eventId: string,
    orderIndex: number,
    isMainEvent: boolean,
    isCoMain: boolean,
    segment: MatchSegment,
    enrichedOdds?: EnrichedBoutOdds,
    athleteProfiles?: Map<string, EnrichedAthleteData>
  ): Match | null {
    if (!comp.competitors || comp.competitors.length < 2) {
      return null;
    }

    const redComp = comp.competitors[0];
    const blueComp = comp.competitors[1];

    const redParticipant = this.transformCompetitorToParticipant(redComp, athleteProfiles);
    const blueParticipant = this.transformCompetitorToParticipant(blueComp, athleteProfiles);

    let status: MatchStatus = 'SCHEDULED';
    if (comp.status?.type?.state === 'in') status = 'IN_PROGRESS';
    if (comp.status?.type?.completed || comp.status?.type?.state === 'post') status = 'FINISHED';

    let winnerId: string | undefined;
    if (redComp.winner) winnerId = redParticipant.id;
    if (blueComp.winner) winnerId = blueParticipant.id;

    const headline = comp.notes?.[0]?.headline || '';
    const isTitleFight = headline.toLowerCase().includes('title');
    const weightClass = this.extractWeightClass(headline, redParticipant, blueParticipant);

    // --- PROCESAMIENTO PRECISO DE CUOTAS (DraftKings o Scoreboard) ---
    const espnOdd = comp.odds?.[0];
    let redOddAmerican = '-115';
    let blueOddAmerican = '-105';
    let redIsFavorite = false;
    let blueIsFavorite = false;

    if (enrichedOdds) {
      // Si tenemos cuotas enriquecidas de DraftKings / Core API
      const redAthleteId = this.getAthleteId(redComp);
      const blueAthleteId = this.getAthleteId(blueComp);

      if (enrichedOdds.homeAthleteId && redAthleteId && (enrichedOdds.homeAthleteId === redAthleteId || redAthleteId.includes(enrichedOdds.homeAthleteId))) {
        redOddAmerican = this.formatAmericanOdd(enrichedOdds.homeMoneyLine ?? '-115');
        blueOddAmerican = this.formatAmericanOdd(enrichedOdds.awayMoneyLine ?? '-105');
        redIsFavorite = !!enrichedOdds.homeFavorite;
        blueIsFavorite = !!enrichedOdds.awayFavorite;
      } else if (enrichedOdds.awayAthleteId && redAthleteId && (enrichedOdds.awayAthleteId === redAthleteId || redAthleteId.includes(enrichedOdds.awayAthleteId))) {
        redOddAmerican = this.formatAmericanOdd(enrichedOdds.awayMoneyLine ?? '-115');
        blueOddAmerican = this.formatAmericanOdd(enrichedOdds.homeMoneyLine ?? '-105');
        redIsFavorite = !!enrichedOdds.awayFavorite;
        blueIsFavorite = !!enrichedOdds.homeFavorite;
      } else {
        // Asignación secuencial (Away = rojo/visitante o Home = azul/local)
        redOddAmerican = this.formatAmericanOdd(enrichedOdds.awayMoneyLine ?? '-115');
        blueOddAmerican = this.formatAmericanOdd(enrichedOdds.homeMoneyLine ?? '-105');
        redIsFavorite = !!enrichedOdds.awayFavorite;
        blueIsFavorite = !!enrichedOdds.homeFavorite;
      }
    } else if (espnOdd?.homeTeamOdds?.moneyLine || espnOdd?.awayTeamOdds?.moneyLine) {
      if (espnOdd.homeTeamOdds?.moneyLine) {
        redOddAmerican = (espnOdd.homeTeamOdds.moneyLine > 0 ? '+' : '') + espnOdd.homeTeamOdds.moneyLine;
        redIsFavorite = !!espnOdd.homeTeamOdds.favorite;
      }
      if (espnOdd.awayTeamOdds?.moneyLine) {
        blueOddAmerican = (espnOdd.awayTeamOdds.moneyLine > 0 ? '+' : '') + espnOdd.awayTeamOdds.moneyLine;
        blueIsFavorite = !!espnOdd.awayTeamOdds.favorite;
      }
    }

    const redMatchParticipant: MatchParticipant = {
      participant: redParticipant,
      side: 'RED_CORNER',
      isWinner: redComp.winner,
      isFavorite: redIsFavorite,
      currentOdd: {
        american: redOddAmerican,
        decimal: this.americanToDecimal(redOddAmerican),
      },
    };

    const blueMatchParticipant: MatchParticipant = {
      participant: blueParticipant,
      side: 'BLUE_CORNER',
      isWinner: blueComp.winner,
      isFavorite: blueIsFavorite,
      currentOdd: {
        american: blueOddAmerican,
        decimal: this.americanToDecimal(blueOddAmerican),
      },
    };

    return {
      id: `bout-${comp.id}`,
      eventId: `ufc-event-${eventId}`,
      title: `${redParticipant.displayName} vs ${blueParticipant.displayName}`,
      segment,
      orderIndex,
      weightClass,
      isTitleFight,
      isMainEvent,
      isCoMain,
      roundsMax: isTitleFight || isMainEvent ? 5 : 3,
      status,
      scheduledTime: comp.date,
      victoryMethod: this.parseVictoryMethod(comp.status?.type?.detail || ''),
      victoryDetails: comp.status?.type?.detail,
      winnerId,
      participants: [redMatchParticipant, blueMatchParticipant],
    };
  }

  private transformCompetitorToParticipant(
    comp: EspnCompetitor,
    athleteProfiles?: Map<string, EnrichedAthleteData>
  ): Participant {
    const athlete = comp.athlete;
    const displayName = athlete.displayName || `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim();
    const athleteId = this.getAthleteId(comp);

    // Buscar si tenemos el perfil enriquecido de Core v2
    const enriched = athleteProfiles?.get(athleteId) ||
                     athleteProfiles?.get(displayName) ||
                     athleteProfiles?.get(this.slugify(displayName));

    const recordSummary = comp.records?.[0]?.summary || athlete.record || '0-0-0';
    const parsedRecord = this.parseRecord(recordSummary);

    // Asociación/Gimnasio: 1. Enriquecido desde API Core v2 -> 2. Mapa local -> 3. Independiente
    const affiliations: Array<{ affiliation: Affiliation; role?: string; isPrimary: boolean }> = [];
    const knownGym = KNOWN_GYMS_MAP[displayName];

    if (enriched?.associationName) {
      affiliations.push({
        affiliation: {
          id: `gym-${this.slugify(enriched.associationName)}`,
          name: enriched.associationName,
          slug: this.slugify(enriched.associationName),
          type: 'TRAINING_CAMP',
          country: enriched.associationCountry || 'Global',
        },
        role: 'Fighter',
        isPrimary: true,
      });
    } else if (knownGym) {
      affiliations.push({
        affiliation: {
          id: `gym-${this.slugify(knownGym.name)}`,
          name: knownGym.name,
          slug: this.slugify(knownGym.name),
          type: 'TRAINING_CAMP',
          city: knownGym.city,
          country: knownGym.country,
          headCoach: knownGym.coach,
        },
        role: 'Fighter',
        isPrimary: true,
      });
    }

    const stats: FighterStats = {
      wins: parsedRecord.wins,
      losses: parsedRecord.losses,
      draws: parsedRecord.draws,
      height: enriched?.displayHeight || athlete.displayHeight || '5\' 10"',
      weight: enriched?.displayWeight || athlete.displayWeight || '155 lbs',
      reach: enriched?.displayReach || '72 in',
      stance: (enriched?.stance as any) || 'Orthodox',
      strikingAccuracy: enriched?.strikingAccuracy,
      significantStrikesLandedPerMin: enriched?.significantStrikesLandedPerMin,
      takedownDefense: enriched?.takedownDefense,
    };

    const headshotHref = athlete.headshot?.href;
    const avatarUrl = headshotHref || (athleteId ? `https://a.espncdn.com/i/headshots/mma/players/full/${athleteId}.png` : undefined);

    return {
      id: `athlete-${athleteId || this.slugify(displayName)}`,
      sportSlug: 'mma',
      type: 'ATHLETE',
      firstName: athlete.fullName?.split(' ')[0],
      lastName: athlete.fullName?.split(' ').slice(1).join(' '),
      displayName,
      nickname: enriched?.nickname || athlete.nickname,
      slug: this.slugify(displayName),
      country: athlete.birthPlace?.country || athlete.citizenship || 'Unknown',
      countryFlagCode: athlete.flag?.rel?.[0],
      avatarUrl,
      gender: enriched?.gender || 'MALE',
      affiliations,
      stats,
    };
  }

  private getAthleteId(comp: EspnCompetitor): string {
    if (comp.athlete?.id) return String(comp.athlete.id);
    if (comp.id) return String(comp.id);
    if (comp.uid && comp.uid.includes('~a:')) return comp.uid.split('~a:')[1];
    return '';
  }

  private formatAmericanOdd(odd: number | string): string {
    const n = typeof odd === 'number' ? odd : parseInt(odd, 10);
    if (isNaN(n)) return '-115';
    return (n > 0 ? '+' : '') + n;
  }

  private parseRecord(recordStr: string): { wins: number; losses: number; draws: number } {
    const parts = recordStr.split('-').map(Number);
    return {
      wins: isNaN(parts[0]) ? 0 : parts[0],
      losses: isNaN(parts[1]) ? 0 : parts[1],
      draws: isNaN(parts[2]) ? 0 : parts[2],
    };
  }

  private parseVictoryMethod(detail: string): VictoryMethod | undefined {
    const d = detail.toLowerCase();
    if (d.includes('ko') || d.includes('tko')) return 'KO_TKO';
    if (d.includes('sub')) return 'SUBMISSION';
    if (d.includes('unanimous')) return 'DECISION_UNANIMOUS';
    if (d.includes('split')) return 'DECISION_SPLIT';
    if (d.includes('majority')) return 'DECISION_MAJORITY';
    if (d.includes('draw')) return 'DRAW';
    if (d.includes('no contest')) return 'NO_CONTEST';
    return undefined;
  }

  private extractWeightClass(headline: string, red?: Participant, blue?: Participant): string {
    const lower = headline.toLowerCase();
    if (lower.includes('heavyweight') && !lower.includes('light')) return 'Heavyweight (265 lbs)';
    if (lower.includes('light heavyweight')) return 'Light Heavyweight (205 lbs)';
    if (lower.includes('middleweight')) return 'Middleweight (185 lbs)';
    if (lower.includes('welterweight')) return 'Welterweight (170 lbs)';
    if (lower.includes('lightweight')) return 'Lightweight (155 lbs)';
    if (lower.includes('featherweight')) return 'Featherweight (145 lbs)';
    if (lower.includes('bantamweight')) return 'Bantamweight (135 lbs)';
    if (lower.includes('flyweight')) return 'Flyweight (125 lbs)';
    if (lower.includes('strawweight')) return 'Strawweight (115 lbs)';

    // Deducir por el peso del atleta si está disponible
    const redWeight = (red?.stats as FighterStats | undefined)?.weight;
    if (redWeight) {
      const num = parseInt(redWeight, 10);
      if (num >= 206) return 'Heavyweight (265 lbs)';
      if (num >= 186) return 'Light Heavyweight (205 lbs)';
      if (num >= 171) return 'Middleweight (185 lbs)';
      if (num >= 156) return 'Welterweight (170 lbs)';
      if (num >= 146) return 'Lightweight (155 lbs)';
      if (num >= 136) return 'Featherweight (145 lbs)';
      if (num >= 126) return 'Bantamweight (135 lbs)';
      if (num >= 116) return 'Flyweight (125 lbs)';
      if (num <= 115) return 'Strawweight (115 lbs)';
    }

    return headline || 'Main Bout';
  }

  private americanToDecimal(americanStr: string): number {
    const num = parseInt(americanStr, 10);
    if (isNaN(num)) return 1.9;
    if (num > 0) {
      return Number(((num / 100) + 1).toFixed(2));
    } else {
      return Number(((100 / Math.abs(num)) + 1).toFixed(2));
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  /**
   * Normaliza el perfil completo y el historial detallado de peleas de un atleta.
   */
  normalizeFighterProfile(
    athleteId: string,
    athleteData: any,
    recordsBreakdown: Record<string, number>,
    rawRecentFights: Array<{
      comp: any;
      event: any;
      status: any;
      opponentAthlete: any;
      isWinner: boolean;
    }>
  ): FighterDetailedProfile {
    const wins = recordsBreakdown.wins ?? 0;
    const losses = recordsBreakdown.losses ?? 0;
    const draws = recordsBreakdown.draws ?? 0;
    const koWins = recordsBreakdown.tkos ?? recordsBreakdown.tkoWins ?? 0;
    const koLosses = recordsBreakdown.tkoLosses ?? recordsBreakdown.tkolosses ?? 0;
    const subWins = recordsBreakdown.submissions ?? recordsBreakdown.subWins ?? 0;
    const subLosses = recordsBreakdown.submissionLosses ?? recordsBreakdown.submissionlosses ?? 0;

    const decWins = Math.max(0, wins - (koWins + subWins));
    const decLosses = Math.max(0, losses - (koLosses + subLosses));

    const recentFights: PastFight[] = rawRecentFights.map((f) => {
      const comp = f.comp;
      const status = f.status;
      const event = f.event;
      const opponent = f.opponentAthlete;

      let method = 'Decision';
      let methodDetail = '';
      let round = status?.period || comp.status?.period;
      let time = status?.displayClock || comp.status?.displayClock;

      if (status?.result?.displayName) {
        method = status.result.displayName;
        const dispDesc = status.result.displayDescription || '';
        const targetDesc = status.result.target?.displayDescription || '';
        if (dispDesc && targetDesc && !dispDesc.toLowerCase().includes(targetDesc.toLowerCase())) {
          methodDetail = `${dispDesc} (${targetDesc})`;
        } else {
          methodDetail = dispDesc || targetDesc;
        }
      } else if (comp.status?.type?.detail) {
        method = comp.status.type.detail;
      }

      return {
        id: `past-fight-${comp.id}`,
        eventName: event?.name || comp.description || 'UFC Event',
        eventDate: comp.date,
        opponentId: opponent?.id,
        opponentName: opponent?.displayName || opponent?.fullName || 'Oponente',
        opponentAvatarUrl: opponent?.headshot?.href || (opponent?.id ? `https://a.espncdn.com/i/headshots/mma/players/full/${opponent.id}.png` : undefined),
        isWinner: f.isWinner,
        method,
        methodDetail: methodDetail || undefined,
        round,
        time,
      };
    });

    return {
      id: athleteId,
      displayName: athleteData.displayName || athleteData.fullName || 'Fighter',
      nickname: athleteData.nickname,
      avatarUrl: athleteData.headshot?.href || `https://a.espncdn.com/i/headshots/mma/players/full/${athleteId}.png`,
      country: athleteData.citizenship || athleteData.citizenshipCountry?.abbreviation || 'Global',
      countryFlagCode: athleteData.flag?.rel?.[0],
      weightClass: athleteData.weightClass?.text,
      gender: athleteData.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
      height: athleteData.displayHeight,
      weight: athleteData.displayWeight,
      reach: athleteData.displayReach || (athleteData.reach ? `${athleteData.reach}"` : undefined),
      stance: athleteData.stance?.text,
      age: athleteData.age,
      gym: athleteData.association?.name,
      record: {
        wins,
        losses,
        draws,
        koWins,
        koLosses,
        subWins,
        subLosses,
        decWins,
        decLosses,
      },
      recentFights,
    };
  }
}
