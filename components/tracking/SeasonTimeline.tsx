import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { Week } from '../../types';

type SeasonTimelineProps = {
  weeks: Week[];
  currentWeek: number;
};

export function SeasonTimeline({ weeks, currentWeek }: SeasonTimelineProps) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 8 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Season Timeline</Text>
      {weeks.slice(0, 6).map((week) => (
        <View key={week.number} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.colors.textSecondary }}>Week {week.number}</Text>
          <Text style={{ color: week.number === currentWeek ? theme.colors.primary : theme.colors.textTertiary }}>
            {week.phase}
          </Text>
        </View>
      ))}
    </View>
  );
}
