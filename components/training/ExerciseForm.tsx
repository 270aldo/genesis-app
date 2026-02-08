import { Pressable, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { Exercise } from '../../types';

type ExerciseFormProps = {
  exercises: Exercise[];
  onToggle: (id: string) => void;
};

export function ExerciseForm({ exercises, onToggle }: ExerciseFormProps) {
  return (
    <View style={{ gap: 8 }}>
      {exercises.map((exercise) => (
        <Pressable
          key={exercise.id}
          onPress={() => onToggle(exercise.id)}
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            padding: 12,
            backgroundColor: exercise.completed ? `${theme.colors.success}22` : theme.colors.surface,
            gap: 2,
          }}
        >
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{exercise.name}</Text>
          <Text style={{ color: theme.colors.textSecondary }}>{exercise.sets}x{exercise.reps} @ {exercise.weight}{exercise.unit}</Text>
        </Pressable>
      ))}
    </View>
  );
}
