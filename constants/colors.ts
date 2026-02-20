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
  cyan: '#9D4EDD',
  cyanDeep: '#7B2FBE',
  mint: '#00F5AA',

  // Status Semantic
  success: '#00F5AA',
  warning: '#FFD93D',
  error: '#FF6B6B',
  info: '#9D4EDD',

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

  // V2.1 Void System
  void: '#050508',
  voidElevated: '#0A0A10',

  // V2.1 Glass System (fallback for non-iOS-26)
  glassClear: 'rgba(255, 255, 255, 0.06)',
  glassClearBorder: 'rgba(255, 255, 255, 0.08)',
  glassRegular: 'rgba(255, 255, 255, 0.04)',
  glassRegularBorder: 'rgba(255, 255, 255, 0.06)',

  // V2.1 Text
  textGhost: 'rgba(255, 255, 255, 0.15)',

  // V2.1 Agent Colors
  agentTrain: '#6D00FF',
  agentFuel: '#00C853',
  agentMind: '#2196F3',
  agentTrack: '#FF6D00',
  agentVision: '#E91E63',

  // V2.1 Icon defaults
  iconDefault: 'rgba(255, 255, 255, 0.40)',
  iconActive: '#6D00FF',
  iconBright: 'rgba(255, 255, 255, 0.92)',
} as const;

export const MACRO_COLORS = {
  protein: '#FFFFFF',
  carbs: '#00F5AA',
  fat: '#F97316',
} as const;

export const MOOD_COLORS = {
  excellent: '#00F5AA',
  good: '#9D4EDD',
  neutral: '#808080',
  poor: '#FFD93D',
  terrible: '#FF6B6B',
} as const;

export type GenesisColor = keyof typeof GENESIS_COLORS;

export const SEASON_PHASE_COLORS = {
  hypertrophy: '#6D00FF',
  strength: '#6D00FF',
  power: '#9D4EDD',
  deload: '#7C3AED',
} as const;

export const BODY_MAP_COLORS: Record<string, string> = {
  inactive: '#2A2A3E',
  recovered: '#00F5AA',
  active: '#6D00FF',
  soreness: '#FF6B6B',
} as const;

export const MUSCLE_GRADIENTS: Record<string, [string, string]> = {
  chest: ['#6D00FF', '#9D4EDD'],
  back: ['#9D4EDD', '#6D00FF'],
  shoulders: ['#7C3AED', '#9D4EDD'],
  legs: ['#6D00FF', '#9D4EDD'],
  arms: ['#9D4EDD', '#7C3AED'],
  core: ['#9D4EDD', '#6D00FF'],
  full_body: ['#6D00FF', '#9D4EDD'],
} as const;

export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  chest: '#FF4C4C',
  back: '#4C8BFF',
  shoulders: '#F97316',
  legs: '#22C55E',
  arms: '#9D4EDD',
  core: '#FACC15',
  full_body: '#6D00FF',
  // aliases for sub-groups
  triceps: '#9D4EDD', biceps: '#9D4EDD',
  glutes: '#22C55E', quads: '#22C55E', hamstrings: '#22C55E', calves: '#22C55E',
  traps: '#F97316',
};

export function getMuscleGroupColor(group: string): string {
  return MUSCLE_GROUP_COLORS[group.toLowerCase().trim()] ?? '#6D00FF';
}
