import { ISportDataProvider } from '../../core/ports/data-provider';
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
  UfcRankingsCategory,
  UfcFighterRank,
  UfcNewsArticle,
  UfcCalendarItem,
} from '../../core/domain/types';
import {
  EspnScoreboardResponse,
  EspnEvent,
  EspnCompetition,
  EspnCompetitor,
  EspnRankingsResponse,
  EspnNewsResponse,
} from './espn-ufc.types';

// Gyms y Camps reconocidos del mundo MMA para enriquecer la abstracción de afiliaciones
const KNOWN_GYMS_MAP: Record<string, { name: string; city: string; country: string; coach?: string }> = {
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

export class EspnUfcAdapter implements ISportDataProvider {
  readonly sportSlug = 'mma';
  readonly organizationSlug = 'ufc';
  
  private readonly baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc';

  public getOrganization(): Organization {
    return {
      id: 'org-ufc',
      sportSlug: 'mma',
      name: 'Ultimate Fighting Championship',
      shortName: 'UFC',
      slug: 'ufc',
      logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png',
      country: 'United States',
      websiteUrl: 'https://www.ufc.com',
    };
  }

  /**
   * Obtiene los eventos programados en el calendario de ESPN
   */
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/scoreboard`, {
        next: { revalidate: 180 }, // Caché de 3 minutos en Next.js
      });

      if (!response.ok) {
        throw new Error(`ESPN API returned ${response.status}: ${response.statusText}`);
      }

      const data: EspnScoreboardResponse = await response.json();
      return this.transformScoreboardToEvents(data);
    } catch (error) {
      console.warn('[EspnUfcAdapter] Fetch failed or offline, returning fallback structured data:', error);
      return this.getFallbackEvents();
    }
  }

  /**
   * Extrae la lista completa de eventos del calendario UFC para toda la temporada
   */
  async getCalendarEvents(): Promise<UfcCalendarItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/scoreboard`, {
        next: { revalidate: 3600 },
      });

      if (!response.ok) throw new Error(`ESPN returned ${response.status}`);
      const data: EspnScoreboardResponse = await response.json();
      const rawCalendar = data.leagues?.[0]?.calendar || [];

      if (rawCalendar.length === 0) {
        return this.getFallbackCalendar();
      }

      return rawCalendar.map((item, idx) => {
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
          location: 'T-Mobile Arena / UFC APEX',
        };
      });
    } catch (err) {
      console.warn('[EspnUfcAdapter] getCalendarEvents fallback:', err);
      return this.getFallbackCalendar();
    }
  }

  /**
   * Extrae el Ranking Oficial de la UFC por divisiones (Pound for Pound, Heavyweight, Lightweight, etc.)
   */
  async getRankings(): Promise<UfcRankingsCategory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/rankings`, {
        next: { revalidate: 3600 },
      });

      if (!response.ok) throw new Error(`ESPN Rankings returned ${response.status}`);
      const data: EspnRankingsResponse = await response.json();

      if (!data.rankings || data.rankings.length === 0) {
        return this.getFallbackRankings();
      }

      // Separar los campeones de las categorías
      const championsMap = new Map<string, UfcFighterRank>();
      const divisionsList: Array<{ name: string; type: string; ranks: UfcFighterRank[] }> = [];

      for (const cat of data.rankings) {
        const isChampCategory = cat.type.endsWith('-champions');
        const fighters: UfcFighterRank[] = cat.ranks.map((r) => ({
          rank: r.current,
          isChampion: !!r.hasAccolade || isChampCategory,
          defenses: r.defenses,
          trend: r.trend || '-',
          recordSummary: r.recordSummary || '0-0-0',
          fighterId: r.athlete?.id || 'unknown',
          displayName: r.athlete?.displayName || 'Fighter',
          nickname: r.athlete?.nickname,
          headshotUrl: r.athlete?.headshot || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png',
          flagUrl: r.athlete?.flag,
          countryCode: r.athlete?.citizenshipCountry,
          age: r.athlete?.age,
          espnLink: r.athlete?.links?.[0]?.href,
        }));

        if (isChampCategory) {
          const divisionBaseType = cat.type.replace('-champions', '');
          if (fighters[0]) {
            championsMap.set(divisionBaseType, fighters[0]);
          }
        } else {
          divisionsList.push({
            name: cat.name,
            type: cat.type,
            ranks: fighters,
          });
        }
      }

      const categories: UfcRankingsCategory[] = divisionsList.map((div) => {
        const isP4P = div.type.includes('pound-for-pound');
        const isFemale = div.type.includes('women');
        const champion = championsMap.get(div.type);

        return {
          id: `rank-${div.type}`,
          name: div.name.replace(/\s*\(.*?\)/g, '').replace(' Rankings', ''),
          slug: div.type,
          gender: isFemale ? 'FEMALE' : 'MALE',
          isP4P,
          weightClass: div.name.match(/\((.*?)\)/)?.[1],
          champion,
          fighters: div.ranks,
        };
      });

      return categories;
    } catch (err) {
      console.warn('[EspnUfcAdapter] getRankings fallback:', err);
      return this.getFallbackRankings();
    }
  }

  /**
   * Extrae las últimas noticias de UFC / MMA en tiempo real
   */
  async getNews(limit: number = 8): Promise<UfcNewsArticle[]> {
    try {
      const response = await fetch(`${this.baseUrl}/news`, {
        next: { revalidate: 600 },
      });

      if (!response.ok) throw new Error(`ESPN News returned ${response.status}`);
      const data: EspnNewsResponse = await response.json();

      if (!data.articles || data.articles.length === 0) {
        return this.getFallbackNews();
      }

      return data.articles.slice(0, limit).map((a, idx) => ({
        id: `news-${a.id || idx}`,
        headline: a.headline,
        description: a.description || '',
        publishedAt: a.published,
        imageUrl: a.images?.[0]?.url || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
        sourceUrl: a.links?.web?.href || 'https://www.espn.com/mma/',
        category: a.categories?.[0]?.description || 'UFC News',
      }));
    } catch (err) {
      console.warn('[EspnUfcAdapter] getNews fallback:', err);
      return this.getFallbackNews();
    }
  }

  /**
   * Obtiene los detalles y cartelera completa de un evento específico
   */
  async getEventDetails(eventIdOrSlug: string): Promise<Event | null> {
    const allEvents = await this.getUpcomingEvents();
    const found = allEvents.find(
      (e) => e.id === eventIdOrSlug || e.slug === eventIdOrSlug || e.externalSource?.externalId === eventIdOrSlug
    );

    if (found) return found;

    // Si no está en el scoreboard inmediato, intentar buscar en histórico
    const recent = await this.getRecentEvents(10);
    return recent.find(
      (e) => e.id === eventIdOrSlug || e.slug === eventIdOrSlug || e.externalSource?.externalId === eventIdOrSlug
    ) || null;
  }

  /**
   * Eventos pasados recientes
   */
  async getRecentEvents(limit: number = 5): Promise<Event[]> {
    const fallback = this.getFallbackEvents();
    return fallback.slice(0, limit);
  }

  /**
   * Transforma el Scoreboard crudo de ESPN a nuestro modelo de dominio canónico
   */
  private transformScoreboardToEvents(data: EspnScoreboardResponse): Event[] {
    const canonicalEvents: Event[] = [];

    if (!data.events || data.events.length === 0) {
      return this.getFallbackEvents();
    }

    for (const espnEvent of data.events) {
      const isEventLive = espnEvent.status?.type?.state === 'in';
      const isEventFinished = espnEvent.status?.type?.completed || espnEvent.status?.type?.state === 'post';
      
      let eventStatus: EventStatus = 'SCHEDULED';
      if (isEventLive) eventStatus = 'LIVE';
      else if (isEventFinished) eventStatus = 'FINISHED';

      // En ESPN MMA, a menudo las peleas vienen en orden cronológico ascendente (de Early Prelims a Main Event).
      // Si la última pelea contiene los nombres del título del evento, invertimos para poner el Main Event arriba.
      const rawCompetitions = [...(espnEvent.competitions || [])];
      
      let sortedCompetitions = rawCompetitions;
      if (rawCompetitions.length > 1) {
        const lastComp = rawCompetitions[rawCompetitions.length - 1];
        const lastCompAthletes = lastComp.competitors?.map(c => c.athlete?.displayName || '').join(' ');
        const eventName = espnEvent.name.toLowerCase();
        
        // Si el nombre del evento coincide con los atletas de la última pelea, la lista viene invertida
        const lastCompMatchesEventTitle = lastComp.competitors?.some(c => 
          eventName.includes((c.athlete?.lastName || c.athlete?.displayName || '').toLowerCase())
        );

        if (lastCompMatchesEventTitle) {
          sortedCompetitions = rawCompetitions.reverse();
        }
      }

      const matches: Match[] = [];
      sortedCompetitions.forEach((comp, idx) => {
        const match = this.transformCompetitionToMatch(comp, espnEvent.id, idx, sortedCompetitions.length);
        if (match) {
          matches.push(match);
        }
      });

      // Extraer ubicación del primer combate disponible
      const firstVenue = sortedCompetitions[0]?.venue;

      const event: Event = {
        id: `ufc-event-${espnEvent.id}`,
        organizationSlug: this.organizationSlug,
        organization: this.getOrganization(),
        sportSlug: this.sportSlug,
        name: espnEvent.name,
        shortName: espnEvent.shortName || espnEvent.name,
        slug: this.slugify(espnEvent.name),
        startDate: espnEvent.date,
        status: eventStatus,
        venueName: firstVenue?.fullName || 'T-Mobile Arena',
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

    // Si solo hay un evento o está finalizado, concatenamos los eventos futuros del fallback/calendario
    const fallback = this.getFallbackEvents();
    for (const fbEvent of fallback) {
      if (!canonicalEvents.some(e => e.slug === fbEvent.slug || e.shortName === fbEvent.shortName)) {
        canonicalEvents.push(fbEvent);
      }
    }

    return canonicalEvents;
  }

  /**
   * Transforma una competición individual (combate) de ESPN a nuestro objeto `Match`
   */
  private transformCompetitionToMatch(
    comp: EspnCompetition,
    eventId: string,
    index: number,
    totalCompetitions: number
  ): Match | null {
    if (!comp.competitors || comp.competitors.length < 2) {
      return null;
    }

    const redComp = comp.competitors[0];
    const blueComp = comp.competitors[1];

    const redParticipant = this.transformCompetitorToParticipant(redComp);
    const blueParticipant = this.transformCompetitorToParticipant(blueComp);

    const isMainEvent = index === 0;
    const isCoMain = index === 1;
    let segment: MatchSegment = 'MAIN_CARD';
    
    if (index >= 5 && index < 9) {
      segment = 'PRELIMS';
    } else if (index >= 9) {
      segment = 'EARLY_PRELIMS';
    }

    // Identificar estatus de la pelea
    let status: MatchStatus = 'SCHEDULED';
    if (comp.status?.type?.state === 'in') status = 'IN_PROGRESS';
    if (comp.status?.type?.completed || comp.status?.type?.state === 'post') status = 'FINISHED';

    // Determinar ganador
    let winnerId: string | undefined;
    if (redComp.winner) winnerId = redParticipant.id;
    if (blueComp.winner) winnerId = blueParticipant.id;

    // Extraer notas (ej. "Light Heavyweight Bout", "UFC Title Fight")
    const headline = comp.notes?.[0]?.headline || '';
    const isTitleFight = headline.toLowerCase().includes('title');
    const weightClass = this.extractWeightClass(headline) || 'Catchweight';

    // Extraer momios (Odds) si existen
    const espnOdd = comp.odds?.[0];
    let redOddAmerican = '-110';
    let blueOddAmerican = '-110';
    if (espnOdd?.homeTeamOdds?.moneyLine) {
      redOddAmerican = (espnOdd.homeTeamOdds.moneyLine > 0 ? '+' : '') + espnOdd.homeTeamOdds.moneyLine;
    }
    if (espnOdd?.awayTeamOdds?.moneyLine) {
      blueOddAmerican = (espnOdd.awayTeamOdds.moneyLine > 0 ? '+' : '') + espnOdd.awayTeamOdds.moneyLine;
    }

    const redMatchParticipant: MatchParticipant = {
      participant: redParticipant,
      side: 'RED_CORNER',
      isWinner: redComp.winner,
      isFavorite: espnOdd?.homeTeamOdds?.favorite,
      currentOdd: {
        american: redOddAmerican,
        decimal: this.americanToDecimal(redOddAmerican),
      },
    };

    const blueMatchParticipant: MatchParticipant = {
      participant: blueParticipant,
      side: 'BLUE_CORNER',
      isWinner: blueComp.winner,
      isFavorite: espnOdd?.awayTeamOdds?.favorite,
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
      orderIndex: index,
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

  /**
   * Normaliza un atleta de ESPN al modelo de Participante
   */
  private transformCompetitorToParticipant(comp: EspnCompetitor): Participant {
    const athlete = comp.athlete;
    const displayName = athlete.displayName || `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim();
    const recordSummary = comp.records?.[0]?.summary || athlete.record || '0-0-0';
    const parsedRecord = this.parseRecord(recordSummary);

    // Identificar gimnasio o training camp asociado
    const knownGym = KNOWN_GYMS_MAP[displayName];
    const affiliations = [];

    if (knownGym) {
      const gymAffiliation: Affiliation = {
        id: `gym-${this.slugify(knownGym.name)}`,
        name: knownGym.name,
        slug: this.slugify(knownGym.name),
        type: 'TRAINING_CAMP',
        city: knownGym.city,
        country: knownGym.country,
        headCoach: knownGym.coach,
      };
      affiliations.push({
        affiliation: gymAffiliation,
        role: 'Fighter',
        isPrimary: true,
      });
    }

    const stats: FighterStats = {
      wins: parsedRecord.wins,
      losses: parsedRecord.losses,
      draws: parsedRecord.draws,
      height: athlete.displayHeight || '5\' 11"',
      weight: athlete.displayWeight || '155 lbs',
      reach: '74 in',
      stance: 'Orthodox',
    };

    return {
      id: `athlete-${athlete.id || comp.id}`,
      sportSlug: this.sportSlug,
      type: 'ATHLETE',
      firstName: athlete.fullName?.split(' ')[0],
      lastName: athlete.fullName?.split(' ').slice(1).join(' '),
      displayName,
      nickname: athlete.nickname,
      slug: this.slugify(displayName),
      country: athlete.birthPlace?.country || athlete.citizenship || 'Unknown',
      countryFlagCode: athlete.flag?.rel?.[0],
      avatarUrl: athlete.headshot?.href || 'https://a.espncdn.com/i/headshots/mma/players/full/default.png',
      gender: 'MALE',
      affiliations,
      stats,
    };
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

  private extractWeightClass(headline: string): string {
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
   * Datos semilla / fallback enriquecidos para desarrollo y resiliencia offline
   */
  getFallbackEvents(): Event[] {
    return [
      {
        id: 'ufc-event-313',
        organizationSlug: 'ufc',
        organization: this.getOrganization(),
        sportSlug: 'mma',
        name: 'UFC 313: Pereira vs. Ankalaev',
        shortName: 'UFC 313',
        slug: 'ufc-313-pereira-vs-ankalaev',
        startDate: '2025-03-08T22:00:00.000Z',
        status: 'SCHEDULED',
        venueName: 'T-Mobile Arena',
        city: 'Las Vegas',
        country: 'United States',
        posterUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
        matches: [
          {
            id: 'bout-ufc-313-main',
            eventId: 'ufc-event-313',
            title: 'Alex Pereira vs Magomed Ankalaev',
            segment: 'MAIN_CARD',
            orderIndex: 0,
            weightClass: 'Light Heavyweight (205 lbs)',
            isTitleFight: true,
            isMainEvent: true,
            isCoMain: false,
            roundsMax: 5,
            status: 'SCHEDULED',
            scheduledTime: '2025-03-09T04:30:00.000Z',
            participants: [
              {
                side: 'RED_CORNER',
                isFavorite: true,
                currentOdd: { american: '-135', decimal: 1.74 },
                participant: {
                  id: 'athlete-alex-pereira',
                  sportSlug: 'mma',
                  type: 'ATHLETE',
                  firstName: 'Alex',
                  lastName: 'Pereira',
                  displayName: 'Alex Pereira',
                  nickname: 'Poatan',
                  slug: 'alex-pereira',
                  country: 'Brazil',
                  countryFlagCode: 'br',
                  avatarUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4285680.png',
                  gender: 'MALE',
                  affiliations: [
                    {
                      affiliation: {
                        id: 'gym-teixeira-mma',
                        name: 'Teixeira MMA & Fitness',
                        slug: 'teixeira-mma-fitness',
                        type: 'TRAINING_CAMP',
                        city: 'Danbury, CT',
                        country: 'United States',
                        headCoach: 'Glover Teixeira',
                        description: 'Academia de alto rendimiento liderada por el ex-campeón Glover Teixeira.'
                      },
                      role: 'Reigning Light Heavyweight Champion',
                      isPrimary: true,
                    }
                  ],
                  stats: {
                    wins: 12,
                    losses: 2,
                    draws: 0,
                    koWins: 10,
                    subWins: 0,
                    height: '6\' 4"',
                    weight: '205 lbs',
                    reach: '79 in',
                    stance: 'Orthodox',
                    strikingAccuracy: 63,
                    takedownDefense: 74,
                  }
                }
              },
              {
                side: 'BLUE_CORNER',
                isFavorite: false,
                currentOdd: { american: '+115', decimal: 2.15 },
                participant: {
                  id: 'athlete-magomed-ankalaev',
                  sportSlug: 'mma',
                  type: 'ATHLETE',
                  firstName: 'Magomed',
                  lastName: 'Ankalaev',
                  displayName: 'Magomed Ankalaev',
                  slug: 'magomed-ankalaev',
                  country: 'Russia',
                  countryFlagCode: 'ru',
                  avatarUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4285679.png',
                  gender: 'MALE',
                  affiliations: [
                    {
                      affiliation: {
                        id: 'gym-gorets-fc',
                        name: 'Gorets Fight Club',
                        slug: 'gorets-fight-club',
                        type: 'TRAINING_CAMP',
                        city: 'Makhachkala, Dagestan',
                        country: 'Russia',
                        headCoach: 'Shamil Alibatitov',
                        description: 'Club histórico de lucha y combate en Daguestán.'
                      },
                      role: '#1 Ranked Contender',
                      isPrimary: true,
                    }
                  ],
                  stats: {
                    wins: 19,
                    losses: 1,
                    draws: 1,
                    koWins: 10,
                    subWins: 0,
                    height: '6\' 3"',
                    weight: '205 lbs',
                    reach: '75 in',
                    stance: 'Southpaw',
                    strikingAccuracy: 53,
                    takedownDefense: 86,
                  }
                }
              }
            ]
          },
          {
            id: 'bout-ufc-313-co-main',
            eventId: 'ufc-event-313',
            title: 'Justin Gaethje vs Dan Hooker',
            segment: 'MAIN_CARD',
            orderIndex: 1,
            weightClass: 'Lightweight (155 lbs)',
            isTitleFight: false,
            isMainEvent: false,
            isCoMain: true,
            roundsMax: 3,
            status: 'SCHEDULED',
            scheduledTime: '2025-03-09T04:00:00.000Z',
            participants: [
              {
                side: 'RED_CORNER',
                isFavorite: true,
                currentOdd: { american: '-180', decimal: 1.55 },
                participant: {
                  id: 'athlete-justin-gaethje',
                  sportSlug: 'mma',
                  type: 'ATHLETE',
                  displayName: 'Justin Gaethje',
                  nickname: 'The Highlight',
                  slug: 'justin-gaethje',
                  country: 'United States',
                  countryFlagCode: 'us',
                  avatarUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3022677.png',
                  affiliations: [
                    {
                      affiliation: {
                        id: 'gym-elevation-fight-team',
                        name: 'Elevation Fight Team',
                        slug: 'elevation-fight-team',
                        type: 'TRAINING_CAMP',
                        city: 'Denver, CO',
                        country: 'United States',
                        headCoach: 'Trevor Wittman',
                      },
                      role: 'Contender',
                      isPrimary: true,
                    }
                  ],
                  stats: { wins: 25, losses: 5, draws: 0, height: '5\' 11"', weight: '155 lbs', reach: '70 in' }
                }
              },
              {
                side: 'BLUE_CORNER',
                isFavorite: false,
                currentOdd: { american: '+150', decimal: 2.50 },
                participant: {
                  id: 'athlete-dan-hooker',
                  sportSlug: 'mma',
                  type: 'ATHLETE',
                  displayName: 'Dan Hooker',
                  nickname: 'The Hangman',
                  slug: 'dan-hooker',
                  country: 'New Zealand',
                  countryFlagCode: 'nz',
                  avatarUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3041927.png',
                  affiliations: [
                    {
                      affiliation: {
                        id: 'gym-city-kickboxing',
                        name: 'City Kickboxing',
                        slug: 'city-kickboxing',
                        type: 'TRAINING_CAMP',
                        city: 'Auckland',
                        country: 'New Zealand',
                        headCoach: 'Eugene Bareman',
                      },
                      role: 'Contender',
                      isPrimary: true,
                    }
                  ],
                  stats: { wins: 24, losses: 12, draws: 0, height: '6\' 0"', weight: '155 lbs', reach: '75 in' }
                }
              }
            ]
          },
          {
            id: 'bout-ufc-313-fighting-nerds',
            eventId: 'ufc-event-313',
            title: 'Caio Borralho vs Nassourdine Imavov',
            segment: 'MAIN_CARD',
            orderIndex: 2,
            weightClass: 'Middleweight (185 lbs)',
            isTitleFight: false,
            isMainEvent: false,
            isCoMain: false,
            roundsMax: 3,
            status: 'SCHEDULED',
            scheduledTime: '2025-03-09T03:30:00.000Z',
            participants: [
              {
                side: 'RED_CORNER',
                isFavorite: true,
                currentOdd: { american: '-165', decimal: 1.60 },
                participant: {
                  id: 'athlete-caio-borralho',
                  sportSlug: 'mma',
                  type: 'ATHLETE',
                  displayName: 'Caio Borralho',
                  nickname: 'The Natural',
                  slug: 'caio-borralho',
                  country: 'Brazil',
                  countryFlagCode: 'br',
                  avatarUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4884242.png',
                  affiliations: [
                    {
                      affiliation: {
                        id: 'gym-fighting-nerds',
                        name: 'Fighting Nerds',
                        slug: 'fighting-nerds',
                        type: 'TRAINING_CAMP',
                        city: 'São Paulo',
                        country: 'Brazil',
                        headCoach: 'Pablo Sucupira',
                        description: 'El campamento revelación de MMA que revolucionó la UFC en 2024.'
                      },
                      role: 'Top Contender',
                      isPrimary: true,
                    }
                  ],
                  stats: { wins: 17, losses: 1, draws: 0, height: '6\' 1"', weight: '185 lbs', reach: '75 in' }
                }
              },
              {
                side: 'BLUE_CORNER',
                isFavorite: false,
                currentOdd: { american: '+140', decimal: 2.40 },
                participant: {
                  id: 'athlete-nassourdine-imavov',
                  sportSlug: 'mma',
                  type: 'ATHLETE',
                  displayName: 'Nassourdine Imavov',
                  nickname: 'Russian Sniper',
                  slug: 'nassourdine-imavov',
                  country: 'France',
                  countryFlagCode: 'fr',
                  avatarUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4687595.png',
                  affiliations: [
                    {
                      affiliation: {
                        id: 'gym-mma-factory',
                        name: 'MMA Factory Paris',
                        slug: 'mma-factory-paris',
                        type: 'TRAINING_CAMP',
                        city: 'Paris',
                        country: 'France',
                        headCoach: 'Fernand Lopez',
                      },
                      role: 'Contender',
                      isPrimary: true,
                    }
                  ],
                  stats: { wins: 15, losses: 4, draws: 0, height: '6\' 3"', weight: '185 lbs', reach: '75 in' }
                }
              }
            ]
          }
        ]
      },
      {
        id: 'ufc-event-314',
        organizationSlug: 'ufc',
        organization: this.getOrganization(),
        sportSlug: 'mma',
        name: 'UFC 314: Topuria vs. Volkanovski 2',
        shortName: 'UFC 314',
        slug: 'ufc-314-topuria-vs-volkanovski-2',
        startDate: '2025-04-12T22:00:00.000Z',
        status: 'SCHEDULED',
        venueName: 'WiZink Center / Santiago Bernabéu',
        city: 'Madrid',
        country: 'Spain',
        posterUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
        matches: []
      }
    ];
  }

  getFallbackCalendar(): UfcCalendarItem[] {
    return [
      { id: 'cal-313', label: 'UFC 313: Pereira vs. Ankalaev', startDate: '2025-03-08T22:00:00.000Z', isPPV: true, isFightNight: false, isContenderSeries: false, location: 'T-Mobile Arena, Las Vegas' },
      { id: 'cal-fn-london', label: 'UFC Fight Night: Edwards vs. Brady', startDate: '2025-03-22T19:00:00.000Z', isPPV: false, isFightNight: true, isContenderSeries: false, location: 'O2 Arena, London' },
      { id: 'cal-314', label: 'UFC 314: Topuria vs. Volkanovski 2', startDate: '2025-04-12T22:00:00.000Z', isPPV: true, isFightNight: false, isContenderSeries: false, location: 'WiZink Center, Madrid' },
      { id: 'cal-fn-apex', label: 'UFC Fight Night: Moreno vs. Erceg', startDate: '2025-04-26T21:00:00.000Z', isPPV: false, isFightNight: true, isContenderSeries: false, location: 'UFC APEX, Las Vegas' },
      { id: 'cal-315', label: 'UFC 315: Makhachev vs. Tsarukyan 2', startDate: '2025-05-17T22:00:00.000Z', isPPV: true, isFightNight: false, isContenderSeries: false, location: 'Prudential Center, Newark' },
      { id: 'cal-316', label: 'UFC 316: Jones vs. Aspinall', startDate: '2025-06-28T22:00:00.000Z', isPPV: true, isFightNight: false, isContenderSeries: false, location: 'Madison Square Garden, New York' },
    ];
  }

  getFallbackRankings(): UfcRankingsCategory[] {
    return [
      {
        id: 'rank-pound-for-pound',
        name: "Men's Pound for Pound",
        slug: 'pound-for-pound',
        gender: 'MALE',
        isP4P: true,
        fighters: [
          { rank: 1, isChampion: true, recordSummary: '27-1-0', fighterId: '4285680', displayName: 'Islam Makhachev', nickname: 'The Eagle', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3902098.png', countryCode: 'RUS' },
          { rank: 2, isChampion: true, recordSummary: '12-2-0', fighterId: '4285680', displayName: 'Alex Pereira', nickname: 'Poatan', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4285680.png', countryCode: 'BRA' },
          { rank: 3, isChampion: true, recordSummary: '28-1-0', fighterId: '2335639', displayName: 'Jon Jones', nickname: 'Bones', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/2335639.png', countryCode: 'USA' },
          { rank: 4, isChampion: true, recordSummary: '16-0-0', fighterId: '4685375', displayName: 'Ilia Topuria', nickname: 'El Matador', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4685375.png', countryCode: 'ESP' },
          { rank: 5, isChampion: true, recordSummary: '22-2-0', fighterId: '4419579', displayName: 'Dricus Du Plessis', nickname: 'Stillknocks', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4419579.png', countryCode: 'RSA' },
          { rank: 6, isChampion: true, recordSummary: '18-4-0', fighterId: '4239276', displayName: 'Merab Dvalishvili', nickname: 'The Machine', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4239276.png', countryCode: 'GEO' },
          { rank: 7, isChampion: true, recordSummary: '27-4-0', fighterId: '3021976', displayName: 'Max Holloway', nickname: 'Blessed', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3021976.png', countryCode: 'USA' },
          { rank: 8, isChampion: true, recordSummary: '26-4-0', fighterId: '3096334', displayName: 'Alexander Volkanovski', nickname: 'The Great', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3096334.png', countryCode: 'AUS' },
        ]
      },
      {
        id: 'rank-light-heavyweight',
        name: 'Light Heavyweight',
        slug: 'light-heavyweight',
        gender: 'MALE',
        isP4P: false,
        weightClass: '205 lbs',
        champion: { rank: 0, isChampion: true, defenses: 3, recordSummary: '12-2-0', fighterId: '4285680', displayName: 'Alex Pereira', nickname: 'Poatan', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4285680.png', countryCode: 'BRA' },
        fighters: [
          { rank: 1, isChampion: false, recordSummary: '19-1-1', fighterId: '4285679', displayName: 'Magomed Ankalaev', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4285679.png', countryCode: 'RUS' },
          { rank: 2, isChampion: false, recordSummary: '30-10-0', fighterId: '2983196', displayName: 'Jan Blachowicz', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/2983196.png', countryCode: 'POL' },
          { rank: 3, isChampion: false, recordSummary: '30-5-1', fighterId: '3946271', displayName: 'Jiri Prochazka', nickname: 'BJP', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3946271.png', countryCode: 'CZE' },
          { rank: 4, isChampion: false, recordSummary: '18-4-0', fighterId: '4338942', displayName: 'Jamahal Hill', nickname: 'Sweet Dreams', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4338942.png', countryCode: 'USA' },
          { rank: 5, isChampion: false, recordSummary: '17-4-0', fighterId: '4285681', displayName: 'Aleksandar Rakic', nickname: 'Rocket', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4285681.png', countryCode: 'AUT' },
        ]
      },
      {
        id: 'rank-lightweight',
        name: 'Lightweight',
        slug: 'lightweight',
        gender: 'MALE',
        isP4P: false,
        weightClass: '155 lbs',
        champion: { rank: 0, isChampion: true, defenses: 4, recordSummary: '27-1-0', fighterId: '3902098', displayName: 'Islam Makhachev', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3902098.png', countryCode: 'RUS' },
        fighters: [
          { rank: 1, isChampion: false, recordSummary: '22-3-0', fighterId: '4350760', displayName: 'Arman Tsarukyan', nickname: 'Ahalkalakets', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4350760.png', countryCode: 'ARM' },
          { rank: 2, isChampion: false, recordSummary: '35-10-0', fighterId: '2504169', displayName: 'Charles Oliveira', nickname: 'do Bronx', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/2504169.png', countryCode: 'BRA' },
          { rank: 3, isChampion: false, recordSummary: '25-5-0', fighterId: '3022677', displayName: 'Justin Gaethje', nickname: 'The Highlight', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3022677.png', countryCode: 'USA' },
          { rank: 4, isChampion: false, recordSummary: '30-9-0', fighterId: '2511634', displayName: 'Dustin Poirier', nickname: 'The Diamond', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/2511634.png', countryCode: 'USA' },
          { rank: 5, isChampion: false, recordSummary: '24-12-0', fighterId: '3041927', displayName: 'Dan Hooker', nickname: 'The Hangman', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3041927.png', countryCode: 'NZL' },
          { rank: 6, isChampion: false, recordSummary: '22-3-0', fighterId: '4285683', displayName: 'Paddy Pimblett', nickname: 'The Baddy', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4285683.png', countryCode: 'GBR' },
        ]
      },
      {
        id: 'rank-featherweight',
        name: 'Featherweight',
        slug: 'featherweight',
        gender: 'MALE',
        isP4P: false,
        weightClass: '145 lbs',
        champion: { rank: 0, isChampion: true, defenses: 1, recordSummary: '16-0-0', fighterId: '4685375', displayName: 'Ilia Topuria', nickname: 'El Matador', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4685375.png', countryCode: 'ESP' },
        fighters: [
          { rank: 1, isChampion: false, recordSummary: '26-4-0', fighterId: '3096334', displayName: 'Alexander Volkanovski', nickname: 'The Great', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3096334.png', countryCode: 'AUS' },
          { rank: 2, isChampion: false, recordSummary: '27-4-0', fighterId: '3021976', displayName: 'Max Holloway', nickname: 'Blessed', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3021976.png', countryCode: 'USA' },
          { rank: 3, isChampion: false, recordSummary: '26-6-0', fighterId: '4396582', displayName: 'Diego Lopes', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4396582.png', countryCode: 'BRA' },
          { rank: 4, isChampion: false, recordSummary: '19-4-0', fighterId: '4285684', displayName: 'Yair Rodriguez', nickname: 'El Pantera', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4285684.png', countryCode: 'MEX' },
          { rank: 5, isChampion: false, recordSummary: '18-4-0', fighterId: '3153839', displayName: 'Brian Ortega', nickname: 'T-City', headshotUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/3153839.png', countryCode: 'USA' },
        ]
      }
    ];
  }

  getFallbackNews(): UfcNewsArticle[] {
    return [
      {
        id: 'news-1',
        headline: "UFC confirma el regreso a Europa: Próxima cartelera estelar con defensas de título",
        description: "Dana White anunció el calendario oficial de eventos internacionales con paradas en Madrid, Londres y Abu Dhabi.",
        publishedAt: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
        sourceUrl: 'https://www.espn.com/mma/',
        category: 'UFC PPV',
      },
      {
        id: 'news-2',
        headline: "Pereira vs. Ankalaev: El choque de estilos que define la cima de las 205 libras",
        description: "Análisis técnico y estadísticas avanzadas del poder de nocaut de Poatan frente a la lucha daguestaní de Ankalaev.",
        publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        sourceUrl: 'https://www.espn.com/mma/',
        category: 'Análisis',
      },
      {
        id: 'news-3',
        headline: "Fighting Nerds: El campamento brasileño que transformó la estrategia en el octágono",
        description: "Conoce el método de entrenamiento liderado por Pablo Sucupira y sus peleadores en ascenso en el ranking mundial.",
        publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        sourceUrl: 'https://www.espn.com/mma/',
        category: 'Training Camps',
      },
      {
        id: 'news-4',
        headline: "Movimientos en el Ranking Libra por Libra tras la última noche de peleas",
        description: "Revisa los cambios oficiales en las divisiones de peso ligero y peso pluma según el panel oficial de votación.",
        publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80',
        sourceUrl: 'https://www.espn.com/mma/',
        category: 'Rankings',
      }
    ];
  }
}

