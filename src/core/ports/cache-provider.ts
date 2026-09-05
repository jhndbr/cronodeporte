export interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
  isStale?: boolean;
}

export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  getWithStale<T>(key: string): Promise<{ data: T; isStale: boolean } | null>;
  set<T>(key: string, data: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
