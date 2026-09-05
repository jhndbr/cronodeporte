import { ICacheProvider, CacheEntry } from '@/core/ports/cache-provider';

export const CACHE_TTL = {
  RANKINGS: 24 * 60 * 60,       // 24 horas (cambian semanalmente)
  CALENDAR: 12 * 60 * 60,       // 12 horas (fechas anuales)
  NEWS: 60 * 60,                // 1 hora
  SCHEDULED_EVENTS: 15 * 60,    // 15 minutos
  LIVE_EVENTS: 30,              // 30 segundos
} as const;

export class SmartCache implements ICacheProvider {
  private static instance: SmartCache;
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private inFlightPromises: Map<string, Promise<unknown>> = new Map();

  private constructor() {}

  public static getInstance(): SmartCache {
    if (!SmartCache.instance) {
      SmartCache.instance = new SmartCache();
    }
    return SmartCache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const isExpired = Date.now() - entry.cachedAt > entry.ttlMs;
    if (isExpired) {
      return null;
    }
    return entry.data;
  }

  async getWithStale<T>(key: string): Promise<{ data: T; isStale: boolean } | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const isStale = Date.now() - entry.cachedAt > entry.ttlMs;
    return {
      data: entry.data,
      isStale,
    };
  }

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      data,
      cachedAt: Date.now(),
      ttlMs: ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * Patrón Stale-While-Revalidate con Request Deduplication:
   * 1. Si la entrada está fresca, retorna inmediatamente.
   * 2. Si la entrada está vencida (stale), retorna los datos viejos inmediatamente
   *    y dispara la actualización en segundo plano (cero espera para el usuario).
   * 3. Deduplica llamadas concurrentes a la misma clave externa.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number,
    fallbackValue?: T
  ): Promise<T> {
    const cached = await this.getWithStale<T>(key);

    if (cached && !cached.isStale) {
      return cached.data;
    }

    // Si tenemos datos en caché aunque estén 'stale', los devolvemos y revalidamos en background
    if (cached && cached.isStale) {
      this.revalidateInBackground(key, fetcher, ttlSeconds).catch((err) => {
        console.warn(`[SmartCache] Background revalidation failed for ${key}:`, err);
      });
      return cached.data;
    }

    // Si no tenemos nada en caché, debemos ejecutar el fetcher (con deduplicación)
    return this.executeWithDeduplication(key, fetcher, ttlSeconds, fallbackValue);
  }

  private async executeWithDeduplication<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number,
    fallbackValue?: T
  ): Promise<T> {
    if (this.inFlightPromises.has(key)) {
      return this.inFlightPromises.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const freshData = await fetcher();
        if (freshData !== undefined && freshData !== null) {
          await this.set(key, freshData, ttlSeconds);
        }
        return freshData;
      } catch (error) {
        console.error(`[SmartCache] Error fetching fresh data for ${key}:`, error);
        if (fallbackValue !== undefined) {
          console.warn(`[SmartCache] Using fallback value for ${key}`);
          return fallbackValue;
        }
        throw error;
      } finally {
        this.inFlightPromises.delete(key);
      }
    })();

    this.inFlightPromises.set(key, promise);
    return promise;
  }

  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<void> {
    if (this.inFlightPromises.has(key)) return;

    try {
      const freshData = await fetcher();
      if (freshData !== undefined && freshData !== null) {
        await this.set(key, freshData, ttlSeconds);
      }
    } finally {
      this.inFlightPromises.delete(key);
    }
  }
}
