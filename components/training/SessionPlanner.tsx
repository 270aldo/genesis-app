import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { WorkoutSession } from '../../types';

type SessionPlannerProps = {
  sessions: WorkoutSession[];
};

export function SessionPlanner({ sessions }: SessionPlannerProps) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 8 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Upcoming Sessions</Text>
      {sessions.slice(0, 3).map((session) => (
        <Text key={session.id} style={{ color: theme.colors.textSecondary }}>
          • {new Date(session.date).toLocaleDateString()} · {session.duration} min
        </Text>
      ))}
    </View>
  );
}
