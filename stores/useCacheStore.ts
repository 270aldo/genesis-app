import { create } from 'zustand';

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

type CacheState = {
  cache: Record<string, CacheEntry>;
  set: (key: string, value: unknown, ttlMs?: number) => void;
  get: <T>(key: string) => T | null;
  remove: (key: string) => void;
  clear: () => void;
  pruneExpired: () => void;
};

const defaultTtl = 5 * 60 * 1000;

export const useCacheStore = create<CacheState>((set, get) => ({
  cache: {},
  set: (key, value, ttlMs = defaultTtl) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          value,
          expiresAt: Date.now() + ttlMs,
        },
      },
    })),
  get: <T,>(key: string) => {
    const entry = get().cache[key];
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      get().remove(key);
      return null;
    }
    return entry.value as T;
  },
  remove: (key) =>
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    }),
  clear: () => set({ cache: {} }),
  pruneExpired: () =>
    set((state) => {
      const now = Date.now();
      const next: Record<string, CacheEntry> = {};
      Object.entries(state.cache).forEach(([key, value]) => {
        if (value.expiresAt > now) next[key] = value;
      });
      return { cache: next };
    }),
}));
