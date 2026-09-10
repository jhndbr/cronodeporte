import fs from 'fs/promises';
import path from 'path';
import { ISportRepository, SyncMetadata } from '@/core/ports/repository';
import {
  Event,
  UfcCalendarItem,
  UfcNewsArticle,
  UfcRankingsCategory,
} from '@/core/domain/types';
import { UFC_OFFICIAL_RANKINGS } from '@/modules/rankings/ufc-official-rankings.data';

export class FileSportRepository implements ISportRepository {
  private static instance: FileSportRepository;
  private readonly storageDir: string;

  private constructor() {
    this.storageDir = path.join(process.cwd(), 'data', 'sports-store');
  }

  public static getInstance(): FileSportRepository {
    if (!FileSportRepository.instance) {
      FileSportRepository.instance = new FileSportRepository();
    }
    return FileSportRepository.instance;
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch {
      // Ignorar si ya existe
    }
  }

  private getFilePath(filename: string): string {
    return path.join(this.storageDir, filename);
  }

  private async readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
    await this.ensureStorageDir();
    const filePath = this.getFilePath(filename);

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch {
      // Si el archivo no existe o está corrupto, guardamos y retornamos el valor inicial
      await this.writeJsonFile(filename, defaultValue);
      return defaultValue;
    }
  }

  private async writeJsonFile<T>(filename: string, data: T): Promise<void> {
    await this.ensureStorageDir();
    const filePath = this.getFilePath(filename);
    const tempPath = `${filePath}.tmp.${Date.now()}`;

    try {
      const jsonContent = JSON.stringify(data, null, 2);
      await fs.writeFile(tempPath, jsonContent, 'utf-8');
      await fs.rename(tempPath, filePath);
    } catch (err) {
      console.error(`[FileSportRepository] Error writing file ${filename}:`, err);
      // Fallback a escritura directa si rename falla en algún sistema de archivos
      try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      } catch (directErr) {
        console.error(`[FileSportRepository] Critical write failure ${filename}:`, directErr);
      }
    }
  }

  // --- EVENTOS ---

  async getEvents(): Promise<Event[]> {
    return this.readJsonFile<Event[]>('events.json', this.getDefaultSeedEvents());
  }

  async saveEvents(events: Event[]): Promise<void> {
    if (!events || events.length === 0) return;
    await this.writeJsonFile('events.json', events);
  }

  // --- CALENDARIO ---

  async getCalendar(): Promise<UfcCalendarItem[]> {
    return this.readJsonFile<UfcCalendarItem[]>('calendar.json', this.getDefaultSeedCalendar());
  }

  async saveCalendar(items: UfcCalendarItem[]): Promise<void> {
    if (!items || items.length === 0) return;
    await this.writeJsonFile('calendar.json', items);
  }

  // --- NOTICIAS ---

  async getNews(): Promise<UfcNewsArticle[]> {
    return this.readJsonFile<UfcNewsArticle[]>('news.json', this.getDefaultSeedNews());
  }

  async saveNews(articles: UfcNewsArticle[]): Promise<void> {
    if (!articles || articles.length === 0) return;
    await this.writeJsonFile('news.json', articles);
  }

  // --- RANKINGS ---

  async getRankings(): Promise<UfcRankingsCategory[]> {
    return this.readJsonFile<UfcRankingsCategory[]>('rankings.json', UFC_OFFICIAL_RANKINGS);
  }

  async saveRankings(categories: UfcRankingsCategory[]): Promise<void> {
    if (!categories || categories.length === 0) return;
    await this.writeJsonFile('rankings.json', categories);
  }

  // --- METADATOS DE SINCRONIZACIÓN ---

  async getSyncMetadata(): Promise<SyncMetadata | null> {
    await this.ensureStorageDir();
    const filePath = this.getFilePath('sync-metadata.json');

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as SyncMetadata;
    } catch {
      return null;
    }
  }

  async saveSyncMetadata(meta: SyncMetadata): Promise<void> {
    await this.writeJsonFile('sync-metadata.json', meta);
  }

  // --- PERFILES DETALLADOS E HISTORIAL DE PELEADORES ---

  async getFighterProfile(id: string): Promise<import('@/core/domain/types').FighterDetailedProfile | null> {
    const fightersDir = path.join(this.storageDir, 'fighters');
    try {
      await fs.mkdir(fightersDir, { recursive: true });
      const filePath = path.join(fightersDir, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async saveFighterProfile(profile: import('@/core/domain/types').FighterDetailedProfile): Promise<void> {
    const fightersDir = path.join(this.storageDir, 'fighters');
    await fs.mkdir(fightersDir, { recursive: true });
    const filePath = path.join(fightersDir, `${profile.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf-8');
  }

  // --- SEEDS INICIALES (Fallback seguro en caso de inicio sin internet) ---

  private getDefaultSeedEvents(): Event[] {
    return [
      {
        id: 'ufc-fn-hooker-parnasse',
        organizationSlug: 'ufc',
        organization: {
          id: 'org-ufc',
          sportSlug: 'mma',
          name: 'Ultimate Fighting Championship',
          shortName: 'UFC',
          slug: 'ufc',
          logoUrl: 'https://a.espncdn.com/i/teamlogos/leagues/500/mma.png',
          country: 'United States',
          websiteUrl: 'https://www.ufc.com',
        },
        sportSlug: 'mma',
        name: 'UFC Fight Night: Hooker vs. Parnasse',
        shortName: 'UFC Fight Night',
        slug: 'ufc-fn-hooker-vs-parnasse',
        startDate: '2026-09-05T19:00:00.000Z',
        status: 'SCHEDULED',
        venueName: 'Accor Arena',
        city: 'Paris',
        country: 'France',
        matches: [
          {
            id: 'bout-main-hooker-parnasse',
            eventId: 'ufc-fn-hooker-parnasse',
            title: 'Dan Hooker vs Salahdine Parnasse',
            segment: 'MAIN_CARD',
            orderIndex: 13,
            weightClass: 'Lightweight (155 lbs)',
            isTitleFight: false,
            isMainEvent: true,
            isCoMain: false,
            roundsMax: 5,
            status: 'SCHEDULED',
            participants: [
              {
                side: 'RED_CORNER',
                isFavorite: false,
                currentOdd: { american: '+130', decimal: 2.30 },
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
                      role: 'Top Contender',
                      isPrimary: true,
                    }
                  ],
                  stats: { wins: 24, losses: 12, draws: 0, height: '6\' 0"', weight: '155 lbs', reach: '75 in', stance: 'Switch', strikingAccuracy: 50, takedownDefense: 80 }
                }
              },
              {
                side: 'BLUE_CORNER',
                isFavorite: true,
                currentOdd: { american: '-155', decimal: 1.65 },
                participant: {
                  id: 'athlete-salahdine-parnasse',
                  sportSlug: 'mma',
                  type: 'ATHLETE',
                  displayName: 'Salahdine Parnasse',
                  nickname: 'Super',
                  slug: 'salahdine-parnasse',
                  country: 'France',
                  countryFlagCode: 'fr',
                  avatarUrl: 'https://a.espncdn.com/i/headshots/mma/players/full/4687595.png',
                  affiliations: [
                    {
                      affiliation: {
                        id: 'gym-atch-academy',
                        name: 'Atch Academy',
                        slug: 'atch-academy',
                        type: 'TRAINING_CAMP',
                        city: 'Paris',
                        country: 'France',
                        headCoach: 'Stephane Atch',
                      },
                      role: 'French Phenom',
                      isPrimary: true,
                    }
                  ],
                  stats: { wins: 19, losses: 2, draws: 0, height: '5\' 10"', weight: '155 lbs', reach: '73 in', stance: 'Southpaw', strikingAccuracy: 58, takedownDefense: 85 }
                }
              }
            ]
          }
        ]
      }
    ];
  }

  private getDefaultSeedCalendar(): UfcCalendarItem[] {
    return [
      { id: 'cal-fn-paris', label: 'UFC Fight Night: Hooker vs. Parnasse', startDate: '2026-09-05T19:00:00.000Z', isPPV: false, isFightNight: true, isContenderSeries: false, location: 'Accor Arena, Paris' },
      { id: 'cal-noche-ufc', label: 'Noche UFC: Silva vs. Delgado', startDate: '2026-09-12T21:00:00.000Z', isPPV: false, isFightNight: true, isContenderSeries: false, location: 'Sphere, Las Vegas' },
      { id: 'cal-331', label: 'UFC 331: Van vs. Pantoja 2', startDate: '2026-09-20T00:00:00.000Z', isPPV: true, isFightNight: false, isContenderSeries: false, location: 'T-Mobile Arena, Las Vegas' },
      { id: 'cal-fn-rosas', label: 'UFC Fight Night: Rosas Jr. vs. Barcelos', startDate: '2026-09-26T22:00:00.000Z', isPPV: false, isFightNight: true, isContenderSeries: false, location: 'UFC APEX, Las Vegas' },
      { id: 'cal-332', label: 'UFC 332: Makhachev vs. Tsarukyan 2', startDate: '2026-10-04T00:00:00.000Z', isPPV: true, isFightNight: false, isContenderSeries: false, location: 'Etihad Arena, Abu Dhabi' },
      { id: 'cal-333', label: 'UFC 333: Jones vs. Aspinall', startDate: '2026-11-14T23:00:00.000Z', isPPV: true, isFightNight: false, isContenderSeries: false, location: 'Madison Square Garden, New York' },
    ];
  }

  private getDefaultSeedNews(): UfcNewsArticle[] {
    return [
      {
        id: 'news-1',
        headline: 'Hooker vs. Parnasse: Choque estelar de peso ligero en el corazón de París',
        description: 'El veterano neozelandés Dan Hooker se enfrenta al fenómeno francés Salahdine Parnasse en un combate que definirá al próximo retador.',
        publishedAt: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
        sourceUrl: 'https://www.espn.com/mma/',
        category: 'UFC Main Event',
      },
      {
        id: 'news-2',
        headline: 'UFC 331 confirmado: Revancha por el título mundial de peso mosca',
        description: 'Alexandre Pantoja defenderá nuevamente su corona en Las Vegas frente al contendiente número uno en una cartelera llena de figuras.',
        publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        sourceUrl: 'https://www.espn.com/mma/',
        category: 'UFC PPV',
      },
      {
        id: 'news-3',
        headline: 'Rankings Oficiales UFC: Movimientos destacados en el Libra por Libra',
        description: 'El veterano panel de votantes actualiza las posiciones mundiales tras las últimas carteleras.',
        publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        sourceUrl: 'https://www.espn.com/mma/',
        category: 'Rankings',
      }
    ];
  }

  // =========================================================================
  // USUARIOS & PREDICCIONES
  // =========================================================================

  async getUsers(): Promise<import('@/core/domain/types').UserProfile[]> {
    return this.readJsonFile<import('@/core/domain/types').UserProfile[]>('users.json', []);
  }

  async saveUsers(users: import('@/core/domain/types').UserProfile[]): Promise<void> {
    await this.writeJsonFile('users.json', users);
  }

  async getUserById(id: string): Promise<import('@/core/domain/types').UserProfile | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  async saveUser(user: import('@/core/domain/types').UserProfile): Promise<void> {
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    await this.saveUsers(users);
  }

  async getPredictionTickets(): Promise<import('@/core/domain/types').PredictionTicket[]> {
    return this.readJsonFile<import('@/core/domain/types').PredictionTicket[]>('prediction-tickets.json', []);
  }

  async savePredictionTickets(tickets: import('@/core/domain/types').PredictionTicket[]): Promise<void> {
    await this.writeJsonFile('prediction-tickets.json', tickets);
  }

  async getTicketsByUserId(userId: string): Promise<import('@/core/domain/types').PredictionTicket[]> {
    const tickets = await this.getPredictionTickets();
    return tickets.filter((t) => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async savePredictionTicket(ticket: import('@/core/domain/types').PredictionTicket): Promise<void> {
    const tickets = await this.getPredictionTickets();
    tickets.unshift(ticket);
    await this.savePredictionTickets(tickets);
  }

  // =========================================================================
  // ANÁLISIS DE IA "¿CÓMO LLEGA A LA PELEA?" (Caché semanal persistente)
  // =========================================================================

  async getFighterPreviews(): Promise<import('@/core/domain/types').FighterFightPreview[]> {
    return this.readJsonFile<import('@/core/domain/types').FighterFightPreview[]>('fighter-previews.json', []);
  }

  async getFighterPreview(fighterId: string, eventId: string): Promise<import('@/core/domain/types').FighterFightPreview | null> {
    const cleanId = fighterId.replace('athlete-', '');
    const previews = await this.getFighterPreviews();
    const found = previews.find((p) => p.fighterId.replace('athlete-', '') === cleanId && p.eventId === eventId);
    if (!found) return null;

    // Verificar si tiene menos de 7 días de antigüedad
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const isStillFresh = Date.now() - new Date(found.generatedAt).getTime() < oneWeekMs;
    return isStillFresh ? found : null;
  }

  async saveFighterPreview(preview: import('@/core/domain/types').FighterFightPreview): Promise<void> {
    const previews = await this.getFighterPreviews();
    const cleanId = preview.fighterId.replace('athlete-', '');
    const idx = previews.findIndex((p) => p.fighterId.replace('athlete-', '') === cleanId && p.eventId === preview.eventId);
    if (idx >= 0) {
      previews[idx] = preview;
    } else {
      previews.unshift(preview);
    }
    await this.writeJsonFile('fighter-previews.json', previews);
  }
}

