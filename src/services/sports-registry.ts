import { ISportDataProvider } from '../core/ports/data-provider';
import { EspnUfcAdapter } from '../adapters/espn/espn-ufc.adapter';
import { Sport, Organization, Event, Affiliation, Participant } from '../core/domain/types';

export class SportsRegistry {
  private static instance: SportsRegistry;
  private adapters: Map<string, ISportDataProvider> = new Map();
  private sports: Sport[] = [];
  private organizations: Organization[] = [];

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): SportsRegistry {
    if (!SportsRegistry.instance) {
      SportsRegistry.instance = new SportsRegistry();
    }
    return SportsRegistry.instance;
  }

  private registerDefaults() {
    // 1. Deportes soportados
    this.sports = [
      {
        id: 'sport-mma',
        slug: 'mma',
        name: 'MMA (Artes Marciales Mixtas)',
        type: 'INDIVIDUAL',
        iconName: 'Swords',
        metadata: {
          defaultRounds: 3,
          roundDurationMinutes: 5,
          weightClasses: [
            'Flyweight',
            'Bantamweight',
            'Featherweight',
            'Lightweight',
            'Welterweight',
            'Middleweight',
            'Light Heavyweight',
            'Heavyweight',
          ],
        },
      },
      {
        id: 'sport-boxing',
        slug: 'boxing',
        name: 'Boxeo Profesional',
        type: 'INDIVIDUAL',
        iconName: 'ShieldAlert',
        metadata: {
          defaultRounds: 10,
          roundDurationMinutes: 3,
        },
      },
      {
        id: 'sport-football',
        slug: 'football',
        name: 'Fútbol (Soccer)',
        type: 'TEAM',
        iconName: 'Trophy',
      },
      {
        id: 'sport-tennis',
        slug: 'tennis',
        name: 'Tenis',
        type: 'INDIVIDUAL',
        iconName: 'Activity',
      },
    ];

    // 2. Ligas / Organizaciones
    this.organizations = [
      {
        id: 'org-ufc',
        sportSlug: 'mma',
        name: 'Ultimate Fighting Championship',
        shortName: 'UFC',
        slug: 'ufc',
        logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png',
        country: 'United States',
      },
      {
        id: 'org-one',
        sportSlug: 'mma',
        name: 'ONE Championship',
        shortName: 'ONE',
        slug: 'one-fc',
        country: 'Singapore',
      },
      {
        id: 'org-wbc',
        sportSlug: 'boxing',
        name: 'World Boxing Council',
        shortName: 'WBC',
        slug: 'wbc',
      },
      {
        id: 'org-premier',
        sportSlug: 'football',
        name: 'Premier League',
        shortName: 'EPL',
        slug: 'premier-league',
        country: 'England',
      },
    ];

    // 3. Registrar Adaptador Inicial (UFC ESPN)
    const ufcAdapter = new EspnUfcAdapter();
    this.registerAdapter('mma:ufc', ufcAdapter);
    this.registerAdapter('ufc', ufcAdapter);
  }

  public registerAdapter(key: string, adapter: ISportDataProvider) {
    this.adapters.set(key, adapter);
  }

  public getAdapter(key: string): ISportDataProvider | undefined {
    return this.adapters.get(key);
  }

  public getAllSports(): Sport[] {
    return this.sports;
  }

  public getSportBySlug(slug: string): Sport | undefined {
    return this.sports.find((s) => s.slug === slug);
  }

  public getOrganizationsBySport(sportSlug: string): Organization[] {
    return this.organizations.filter((o) => o.sportSlug === sportSlug);
  }
}
