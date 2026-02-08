import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type HeaderBarProps = {
  title: string;
  subtitle?: string;
};

export function HeaderBar({ title, subtitle }: HeaderBarProps) {
  return (
    <View style={{ paddingHorizontal: theme.spacing.screenPad, paddingTop: 12, paddingBottom: 8, gap: 4 }}>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: '700' }}>{title}</Text>
      {subtitle ? <Text style={{ color: theme.colors.textSecondary }}>{subtitle}</Text> : null}
    </View>
  );
}
