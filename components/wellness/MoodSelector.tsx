import { Pressable, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { WellnessCheckIn } from '../../types';

const moods: WellnessCheckIn['mood'][] = ['excellent', 'good', 'neutral', 'poor', 'terrible'];

type MoodSelectorProps = {
  value: WellnessCheckIn['mood'];
  onChange: (mood: WellnessCheckIn['mood']) => void;
};

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: theme.colors.textSecondary }}>Mood</Text>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {moods.map((mood) => (
          <Pressable
            key={mood}
            onPress={() => onChange(mood)}
            style={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: value === mood ? `${theme.colors.primary}AA` : theme.colors.borderSubtle,
              backgroundColor: value === mood ? `${theme.colors.primary}22` : theme.colors.surface,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: theme.colors.textPrimary, textTransform: 'capitalize' }}>{mood}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
