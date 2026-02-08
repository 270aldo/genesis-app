import { Text, View } from 'react-native';

type PillVariant = 'default' | 'success' | 'warning' | 'info';

const variantStyles: Record<PillVariant, { bg: string; text: string }> = {
  default: { bg: '#FFFFFF14', text: '#b39aff' },
  success: { bg: '#22ff7320', text: '#22ff73' },
  warning: { bg: '#F9731620', text: '#F97316' },
  info: { bg: '#38bdf820', text: '#38bdf8' },
};

type PillProps = {
  label: string;
  variant?: PillVariant;
};

export function Pill({ label, variant = 'default' }: PillProps) {
  const colors = variantStyles[variant];
  return (
    <View className="rounded-[12px] px-3 py-1.5" style={{ backgroundColor: colors.bg }}>
      <Text className="font-jetbrains-medium text-[11px]" style={{ color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}
