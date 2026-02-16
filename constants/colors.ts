export const GENESIS_COLORS = {
  // Brand Core
  primary: '#6D00FF',
  primaryLight: '#9D4EDD',
  primaryDark: '#4A00B0',
  primaryDim: 'rgba(109, 0, 255, 0.1)',
  primaryGlass: 'rgba(109, 0, 255, 0.25)',

  // Chrome Metallic
  chrome: '#C0C0C0',
  chromeLight: '#E8E8E8',
  chromeDark: '#808080',
  chromeDarker: '#404040',

  // Accents
  cyan: '#00E5FF',
  cyanDeep: '#00BBD4',
  mint: '#00F5AA',

  // Status Semantic
  success: '#00F5AA',
  warning: '#FFD93D',
  error: '#FF6B6B',
  info: '#00D4FF',

  // Backgrounds
  bgGradientStart: '#151226',
  bgGradientMid: '#050507',
  bgGradientEnd: '#000000',
  bgVoid: '#050505',

  // Surfaces
  surfaceCard: 'rgba(10, 10, 10, 0.85)',
  surfaceElevated: 'rgba(20, 20, 25, 0.6)',
  surfaceGlass: 'rgba(20, 20, 25, 0.4)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.60)',
  textTertiary: 'rgba(192, 192, 192, 0.60)',
  textMuted: 'rgba(255, 255, 255, 0.40)',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(109, 0, 255, 0.4)',
} as const;

export const MACRO_COLORS = {
  protein: '#38bdf8',
  carbs: '#00F5AA',
  fat: '#F97316',
} as const;

export const MOOD_COLORS = {
  excellent: '#00F5AA',
  good: '#00D4FF',
  neutral: '#808080',
  poor: '#FFD93D',
  terrible: '#FF6B6B',
} as const;

export type GenesisColor = keyof typeof GENESIS_COLORS;

export const SEASON_PHASE_COLORS = {
  hypertrophy: '#00D4FF',
  strength: '#6D00FF',
  power: '#FFD93D',
  deload: '#00F5AA',
} as const;

export const BODY_MAP_COLORS: Record<string, string> = {
  inactive: '#2A2A3E',
  recovered: '#00F5AA',
  active: '#6D00FF',
  soreness: '#FF6B6B',
} as const;

export const MUSCLE_GRADIENTS: Record<string, [string, string]> = {
  chest: ['#6D00FF', '#9D4EDD'],
  back: ['#00D4FF', '#38bdf8'],
  shoulders: ['#F97316', '#fb923c'],
  legs: ['#00F5AA', '#34d399'],
  arms: ['#FFD93D', '#fbbf24'],
  core: ['#FF6B6B', '#f87171'],
  full_body: ['#6D00FF', '#00D4FF'],
} as const;
