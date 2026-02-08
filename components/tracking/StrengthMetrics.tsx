import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type StrengthMetricsProps = {
  metrics: Record<string, number>;
};

export function StrengthMetrics({ metrics }: StrengthMetricsProps) {
  const entries = Object.entries(metrics);

  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 6 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Strength Metrics</Text>
      {entries.length === 0 ? (
        <Text style={{ color: theme.colors.textSecondary }}>No records yet.</Text>
      ) : (
        entries.map(([key, value]) => (
          <Text key={key} style={{ color: theme.colors.textSecondary }}>
            {key}: {value}
          </Text>
        ))
      )}
    </View>
  );
}
