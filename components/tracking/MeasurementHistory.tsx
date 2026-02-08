import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { Measurement } from '../../types';

type MeasurementHistoryProps = {
  measurements: Measurement[];
};

export function MeasurementHistory({ measurements }: MeasurementHistoryProps) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 6 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Measurements</Text>
      {measurements.slice(-4).map((measurement) => (
        <Text key={measurement.date} style={{ color: theme.colors.textSecondary }}>
          {new Date(measurement.date).toLocaleDateString()} · {measurement.weight} kg
        </Text>
      ))}
    </View>
  );
}
