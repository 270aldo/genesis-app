import type { ReactNode } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

type ColorVariant = 'purple' | 'green' | 'orange' | 'blue' | 'red';

const variantColors: Record<ColorVariant, { border: string; shadow: string; iconBg: string; iconColor: string }> = {
  purple: { border: '#6D00FF', shadow: '#6D00FF', iconBg: 'rgba(109, 0, 255, 0.1)', iconColor: '#6D00FF' },
  green: { border: '#00F5AA', shadow: '#00F5AA', iconBg: '#00F5AA20', iconColor: '#00F5AA' },
  orange: { border: '#F97316', shadow: '#F97316', iconBg: '#F9731620', iconColor: '#F97316' },
  blue: { border: '#00D4FF', shadow: '#00D4FF', iconBg: '#00D4FF20', iconColor: '#00D4FF' },
  red: { border: '#FF6B6B', shadow: '#FF6B6B', iconBg: '#FF6B6B20', iconColor: '#FF6B6B' },
};

type ListItemCardProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  variant?: ColorVariant;
  right?: ReactNode;
  onPress?: () => void;
};

export function ListItemCard({ icon, title, subtitle, variant = 'purple', right, onPress }: ListItemCardProps) {
  const colors = variantColors[variant];

  const cardStyle: ViewStyle = {
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-[16px] border border-[#FFFFFF14] bg-[#0A0A0AD9] p-4"
      style={cardStyle}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-[12px]"
        style={{ backgroundColor: colors.iconBg }}
      >
        {icon}
      </View>
      <View className="flex-1 gap-1">
        <Text className="font-jetbrains-bold text-[13px] text-white">{title}</Text>
        <Text className="font-inter text-[11px]" style={{ color: 'rgba(192, 192, 192, 0.60)' }}>{subtitle}</Text>
      </View>
      {right ?? <ChevronRight size={16} color="rgba(255, 255, 255, 0.40)" />}
    </Pressable>
  );
}
