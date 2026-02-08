import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { WorkoutSession } from '../../types';

type WorkoutSummaryProps = {
  session: WorkoutSession | null;
};

export function WorkoutSummary({ session }: WorkoutSummaryProps) {
  if (!session) {
    return (
      <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12 }}>
        <Text style={{ color: theme.colors.textSecondary }}>No active session.</Text>
      </View>
    );
  }

  const completed = session.exercises.filter((exercise) => exercise.completed).length;

  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 4 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Workout Summary</Text>
      <Text style={{ color: theme.colors.textSecondary }}>{completed}/{session.exercises.length} exercises completed</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Duration: {session.duration} min</Text>
    </View>
  );
}
