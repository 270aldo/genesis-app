import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { WorkoutSession } from '../../types';
import { GlassCard, PillBadge } from '../ui';

type WorkoutCardProps = {
  session: WorkoutSession;
};

export function WorkoutCard({ session }: WorkoutCardProps) {
  return (
    <GlassCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700' }}>Today: Training</Text>
        <PillBadge label={session.completed ? 'Completed' : 'Planned'} variant={session.completed ? 'success' : 'primary'} />
      </View>
      <Text style={{ color: theme.colors.textSecondary }}>{session.exercises.length} exercises · {session.duration} min</Text>
      {session.exercises.slice(0, 3).map((exercise) => (
        <Text key={exercise.id} style={{ color: theme.colors.textPrimary, fontSize: 13 }}>
          • {exercise.name} — {exercise.sets}x{exercise.reps}
        </Text>
      ))}
    </GlassCard>
  );
}
