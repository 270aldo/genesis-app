import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type StreakCounterProps = {
  days: number;
};

export function StreakCounter({ days }: StreakCounterProps) {
  return (
    <View
      style={{
        borderRadius: theme.radius.card,
        backgroundColor: `${theme.colors.success}22`,
        borderColor: `${theme.colors.success}66`,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: theme.colors.success, fontSize: 11, fontWeight: '600' }}>STREAK</Text>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 22, fontWeight: '700' }}>{days} días</Text>
    </View>
  );
}
