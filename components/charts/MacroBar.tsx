import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { ProgressBar } from '../ui';

type MacroBarProps = {
  label: string;
  value: number;
  target: number;
  color: string;
};

export function MacroBar({ label, value, target, color }: MacroBarProps) {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: theme.colors.textPrimary, fontSize: 12 }}>{value}/{target}</Text>
      </View>
      <ProgressBar value={value} max={target} color={color} />
    </View>
  );
}
