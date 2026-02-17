import { Text, View } from 'react-native';

type PillVariant = 'default' | 'success' | 'warning' | 'info';

const variantStyles: Record<PillVariant, { bg: string; text: string }> = {
  default: { bg: '#FFFFFF14', text: '#6D00FF' },
  success: { bg: '#00F5AA20', text: '#00F5AA' },
  warning: { bg: '#FFD93D20', text: '#FFD93D' },
  info: { bg: '#6D00FF20', text: '#6D00FF' },
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
