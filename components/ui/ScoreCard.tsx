import type { ReactNode } from 'react';
import { Text, View, type ViewStyle } from 'react-native';

type ScoreCardProps = {
  icon: ReactNode;
  value: string | number;
  label: string;
  iconBgColor?: string;
  style?: ViewStyle;
};

export function ScoreCard({ icon, value, label, iconBgColor = 'rgba(109, 0, 255, 0.1)', style }: ScoreCardProps) {
  return (
    <View
      className="flex-1 items-center gap-2 rounded-[16px] border border-[#FFFFFF14] bg-[#0A0A0AD9] p-4"
      style={[{ shadowColor: '#6D00FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }, style]}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBgColor }}
      >
        {icon}
      </View>
      <Text className="font-inter-bold text-[28px] text-white">{value}</Text>
      <Text className="font-jetbrains-medium text-[11px]" style={{ color: 'rgba(192, 192, 192, 0.60)' }}>{label}</Text>
    </View>
  );
}
