import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type CircularProgressProps = {
  value: number;
  label?: string;
};

export function CircularProgress({ value, label = 'Progress' }: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 96, height: 96 }}>
      <View
        style={{
          position: 'absolute',
          width: 96,
          height: 96,
          borderRadius: 48,
          borderWidth: 8,
          borderColor: `${theme.colors.primary}33`,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 96,
          height: 96,
          borderRadius: 48,
          borderWidth: 8,
          borderTopColor: theme.colors.primary,
          borderRightColor: clamped > 25 ? theme.colors.primary : `${theme.colors.primary}22`,
          borderBottomColor: clamped > 50 ? theme.colors.primary : `${theme.colors.primary}22`,
          borderLeftColor: clamped > 75 ? theme.colors.primary : `${theme.colors.primary}22`,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 20 }}>{clamped}%</Text>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{label}</Text>
    </View>
  );
}
