import type { ReactNode } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

type ColorVariant = 'purple' | 'green' | 'orange' | 'blue' | 'red';

const variantColors: Record<ColorVariant, { border: string; shadow: string; iconBg: string; iconColor: string }> = {
  purple: { border: '#6c3bff', shadow: '#6c3bff', iconBg: '#6c3bff20', iconColor: '#6c3bff' },
  green: { border: '#22ff73', shadow: '#22ff73', iconBg: '#22ff7320', iconColor: '#22ff73' },
  orange: { border: '#F97316', shadow: '#F97316', iconBg: '#F9731620', iconColor: '#F97316' },
  blue: { border: '#38bdf8', shadow: '#38bdf8', iconBg: '#38bdf820', iconColor: '#38bdf8' },
  red: { border: '#ff6b6b', shadow: '#ff6b6b', iconBg: '#ff6b6b20', iconColor: '#ff6b6b' },
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
      className="flex-row items-center gap-3 rounded-[16px] border border-[#FFFFFF14] bg-[#14121aB3] p-4"
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
        <Text className="font-inter text-[11px] text-[#827a89]">{subtitle}</Text>
      </View>
      {right ?? <ChevronRight size={16} color="#6b6b7b" />}
    </Pressable>
  );
}
