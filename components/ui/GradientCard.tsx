import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientCardProps = PropsWithChildren<{
  className?: string;
  style?: ViewStyle;
}>;

export function GradientCard({ children, className = '', style }: GradientCardProps) {
  return (
    <LinearGradient
      colors={['#9D4EDD', '#6D00FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: 16, padding: 1 }, style]}
    >
      <View
        className={`relative overflow-hidden rounded-[15px] bg-[#1e1f2aCC] p-4 ${className}`}
        style={{ shadowColor: '#6D00FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 16 }}
      >
        <View className="absolute left-0 right-0 top-0 h-[1px] bg-[#FFFFFF0D]" />
        {children}
      </View>
    </LinearGradient>
  );
}
