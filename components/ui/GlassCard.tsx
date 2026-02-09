import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';

type ShadowVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

const shadowStyles: Record<ShadowVariant, ViewStyle> = {
  primary: { shadowColor: '#6D00FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  success: { shadowColor: '#00F5AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  warning: { shadowColor: '#F97316', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  error: { shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  info: { shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
};

type GlassCardProps = PropsWithChildren<{
  className?: string;
  shadow?: ShadowVariant;
  shine?: boolean;
  style?: ViewStyle;
}>;

export function GlassCard({ children, className = '', shadow = 'primary', shine = false, style }: GlassCardProps) {
  return (
    <View
      className={`relative overflow-hidden rounded-[16px] border border-[#FFFFFF14] bg-[#0A0A0AD9] p-4 ${className}`}
      style={[shadowStyles[shadow], style]}
    >
      {shine && (
        <View className="absolute left-0 right-0 top-0 h-[1px] rounded-t-[16px] bg-[#FFFFFF0D]" />
      )}
      {children}
    </View>
  );
}
