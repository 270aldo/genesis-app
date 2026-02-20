import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Effect = 'clear' | 'regular';

type LiquidGlassCardProps = PropsWithChildren<{
  effect?: Effect;
  borderRadius?: number;
  style?: ViewStyle;
}>;

const EFFECT_STYLES: Record<Effect, { colors: [string, string]; borderColor: string }> = {
  clear: {
    colors: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)'],
    borderColor: 'rgba(255,255,255,0.10)',
  },
  regular: {
    colors: ['rgba(255,255,255,0.05)', 'rgba(109,0,255,0.04)'],
    borderColor: 'rgba(255,255,255,0.08)',
  },
};

export function LiquidGlassCard({
  children,
  effect = 'clear',
  borderRadius = 16,
  style,
}: LiquidGlassCardProps) {
  const { colors, borderColor } = EFFECT_STYLES[effect];

  return (
    <View style={[{ borderRadius, borderWidth: 1, borderColor, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
