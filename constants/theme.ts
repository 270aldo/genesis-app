/**
 * Legacy barrel — re-exports from the new split constant files.
 * New code should import directly from colors, shadows, animations, etc.
 */
export { GENESIS_COLORS, MACRO_COLORS, MOOD_COLORS } from './colors';
export { GLASS_SHADOWS } from './shadows';
export { ANIMATION_DURATIONS, ANIMATION_EASING } from './animations';
export { DEEP_LINK_SCHEMA, LINKING_CONFIG } from './deeplinks';
export { WIDGET_REGISTRY, TOUCHPOINTS } from './widgetRegistry';
export { APP_CONFIG } from './config';

import { GENESIS_COLORS } from './colors';
import { GLASS_SHADOWS } from './shadows';

/** @deprecated Import from constants/colors, constants/shadows, etc. instead */
export const theme = {
  colors: {
    bgStart: GENESIS_COLORS.bgGradientStart,
    bgEnd: GENESIS_COLORS.bgGradientEnd,
    primary: GENESIS_COLORS.primary,
    primaryLight: GENESIS_COLORS.primaryLight,
    primaryDark: GENESIS_COLORS.primaryDark,
    primaryDim: GENESIS_COLORS.primaryDim,
    primaryGlass: GENESIS_COLORS.primaryGlass,
    success: GENESIS_COLORS.success,
    warning: GENESIS_COLORS.warning,
    error: GENESIS_COLORS.error,
    info: GENESIS_COLORS.info,
    textPrimary: GENESIS_COLORS.textPrimary,
    textSecondary: GENESIS_COLORS.textSecondary,
    textTertiary: GENESIS_COLORS.textTertiary,
    textMuted: GENESIS_COLORS.textMuted,
    surface: GENESIS_COLORS.surfaceGlass,
    surfaceCard: GENESIS_COLORS.surfaceCard,
    surfaceElevated: GENESIS_COLORS.surfaceElevated,
    borderSubtle: GENESIS_COLORS.borderSubtle,
    borderActive: GENESIS_COLORS.borderActive,
    chrome: GENESIS_COLORS.chrome,
    cyan: GENESIS_COLORS.cyan,
    mint: GENESIS_COLORS.mint,
    shine: 'rgba(255, 255, 255, 0.05)' as const,
  },
  radius: {
    card: 16,
    pill: 12,
    button: 14,
    bar: 6,
    full: 9999,
  },
  spacing: {
    screenPad: 20,
    sectionGap: 24,
    cardPad: 16,
    cardGap: 12,
    itemGap: 12,
    innerGap: 8,
    micro: 4,
  },
  shadows: {
    glowPrimary: GLASS_SHADOWS.primary.shadowColor,
    glowSuccess: GLASS_SHADOWS.success.shadowColor,
    glowWarning: GLASS_SHADOWS.warning.shadowColor,
    glowError: GLASS_SHADOWS.error.shadowColor,
    glowInfo: GLASS_SHADOWS.info.shadowColor,
  },
} as const;

export type Theme = typeof theme;
