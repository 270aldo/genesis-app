import { Pressable, Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type WaterTrackerProps = {
  current: number;
  target: number;
  onAdd: () => void;
};

export function WaterTracker({ current, target, onAdd }: WaterTrackerProps) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 6 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Water</Text>
      <Text style={{ color: theme.colors.textSecondary }}>{current}/{target} cups</Text>
      <Pressable onPress={onAdd} style={{ borderRadius: 10, paddingVertical: 8, alignItems: 'center', backgroundColor: `${theme.colors.info}22` }}>
        <Text style={{ color: theme.colors.info, fontWeight: '700' }}>+1 cup</Text>
      </Pressable>
    </View>
  );
}
