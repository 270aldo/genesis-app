export const GLASS_SHADOWS = {
  primary: {
    shadowColor: '#6D00FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  success: {
    shadowColor: '#00F5AA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  warning: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  error: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  info: {
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

export type GlassShadowType = keyof typeof GLASS_SHADOWS;
