export const GENESIS_COLORS = {
  // Backgrounds
  bgGradientStart: '#0D0D2B',
  bgGradientEnd: '#1A0A30',

  // Primary
  primary: '#b39aff',
  primaryDeep: '#6c3bff',

  // Semantic
  success: '#22ff73',
  warning: '#F97316',
  error: '#ff6b6b',
  info: '#38bdf8',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#827a89',
  textTertiary: '#6b6b7b',

  // Surfaces (with opacity)
  surfaceGlass: 'rgba(20, 18, 26, 0.7)',
  surfaceElevated: 'rgba(30, 31, 42, 0.8)',

  // Accents
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  shine: 'rgba(255, 255, 255, 0.05)',

  // NGX Violet
  ngxViolet: '#6D00FF',
} as const;

export const MACRO_COLORS = {
  protein: '#38bdf8',
  carbs: '#22ff73',
  fat: '#F97316',
} as const;

export const MOOD_COLORS = {
  excellent: '#22ff73',
  good: '#38bdf8',
  neutral: '#827a89',
  poor: '#F97316',
  terrible: '#ff6b6b',
} as const;

export type GenesisColor = keyof typeof GENESIS_COLORS;
