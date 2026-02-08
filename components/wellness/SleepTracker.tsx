import { Pressable, Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type SleepTrackerProps = {
  hours: number;
  onAdjust: (next: number) => void;
};

export function SleepTracker({ hours, onAdjust }: SleepTrackerProps) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 8 }}>
      <Text style={{ color: theme.colors.textSecondary }}>Sleep Hours</Text>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: '700' }}>{hours.toFixed(1)} h</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={() => onAdjust(Math.max(0, hours - 0.5))} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: `${theme.colors.warning}22` }}>
          <Text style={{ color: theme.colors.warning, fontWeight: '700' }}>-0.5</Text>
        </Pressable>
        <Pressable onPress={() => onAdjust(hours + 0.5)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: `${theme.colors.success}22` }}>
          <Text style={{ color: theme.colors.success, fontWeight: '700' }}>+0.5</Text>
        </Pressable>
      </View>
    </View>
  );
}
