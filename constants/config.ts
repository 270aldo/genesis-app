export const APP_CONFIG = {
  name: 'NGX GENESIS',
  version: '1.0.0',
  scheme: 'genesis',

  api: {
    bffUrl: process.env.EXPO_PUBLIC_BFF_URL ?? 'http://localhost:8000',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },

  defaults: {
    dailyCalorieGoal: 2200,
    waterTargetCups: 8,
    waterCupMl: 250,
    restTimerDefault: 90,
  },

  cache: {
    defaultTtlMs: 5 * 60 * 1000,
    maxEntries: 100,
  },

  pagination: {
    defaultPageSize: 20,
  },
} as const;
