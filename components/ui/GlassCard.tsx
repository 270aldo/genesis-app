import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';

type ShadowVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

const shadowStyles: Record<ShadowVariant, ViewStyle> = {
  primary: { shadowColor: '#6c3bff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  success: { shadowColor: '#22ff73', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  warning: { shadowColor: '#F97316', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  error: { shadowColor: '#ff6b6b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  info: { shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
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
      className={`relative overflow-hidden rounded-[16px] border border-[#FFFFFF14] bg-[#14121aB3] p-4 ${className}`}
      style={[shadowStyles[shadow], style]}
    >
      {shine && (
        <View className="absolute left-0 right-0 top-0 h-[1px] rounded-t-[16px] bg-[#FFFFFF0D]" />
      )}
      {children}
    </View>
  );
}
