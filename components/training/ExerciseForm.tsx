import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import type { Exercise, ExerciseSet } from '../../types';

type ExerciseFormProps = {
  exercises: Exercise[];
  currentExerciseIndex?: number;
  onToggle: (id: string) => void;
  onLogSet?: (exerciseId: string, setNumber: number, data: { actualReps: number; actualWeight: number; rpe?: number }) => void;
  onSkipSet?: (exerciseId: string, setNumber: number) => void;
};

function SetRow({
  exerciseSet,
  exerciseId,
  onLog,
  onSkip,
}: {
  exerciseSet: ExerciseSet;
  exerciseId: string;
  onLog?: (exerciseId: string, setNumber: number, data: { actualReps: number; actualWeight: number; rpe?: number }) => void;
  onSkip?: (exerciseId: string, setNumber: number) => void;
}) {
  const [weight, setWeight] = useState(String(exerciseSet.targetWeight));
  const [reps, setReps] = useState(String(exerciseSet.targetReps));
  const [rpe, setRpe] = useState('');

  if (exerciseSet.completed) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, opacity: 0.6 }}>
        <Check size={14} color={theme.colors.success} />
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>
          Set {exerciseSet.setNumber}: {exerciseSet.actualWeight ?? exerciseSet.targetWeight}kg × {exerciseSet.actualReps ?? exerciseSet.targetReps}
          {exerciseSet.rpe ? ` @RPE ${exerciseSet.rpe}` : ''}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 6, paddingVertical: 6 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
        SET {exerciseSet.setNumber}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: theme.colors.textTertiary, fontSize: 9 }}>KG</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 8,
              padding: 8,
              color: theme.colors.textPrimary,
              fontSize: 14,
              fontFamily: 'JetBrainsMonoMedium',
              textAlign: 'center',
            }}
          />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: theme.colors.textTertiary, fontSize: 9 }}>REPS</Text>
          <TextInput
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 8,
              padding: 8,
              color: theme.colors.textPrimary,
              fontSize: 14,
              fontFamily: 'JetBrainsMonoMedium',
              textAlign: 'center',
            }}
          />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: theme.colors.textTertiary, fontSize: 9 }}>RPE</Text>
          <TextInput
            value={rpe}
            onChangeText={setRpe}
            keyboardType="numeric"
            placeholder="—"
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 8,
              padding: 8,
              color: theme.colors.textPrimary,
              fontSize: 14,
              fontFamily: 'JetBrainsMonoMedium',
              textAlign: 'center',
            }}
          />
        </View>
        <Pressable
          onPress={() => {
            const w = parseFloat(weight) || exerciseSet.targetWeight;
            const r = parseInt(reps, 10) || exerciseSet.targetReps;
            const rpeVal = rpe ? parseInt(rpe, 10) : undefined;
            onLog?.(exerciseId, exerciseSet.setNumber, { actualWeight: w, actualReps: r, rpe: rpeVal });
          }}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

function calculateVolume(exercise: Exercise): number {
  return (exercise.exerciseSets ?? [])
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + (s.actualWeight ?? s.targetWeight) * (s.actualReps ?? s.targetReps), 0);
}

export function ExerciseForm({ exercises, currentExerciseIndex = 0, onToggle, onLogSet, onSkipSet }: ExerciseFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // If exerciseSets exist, use enhanced mode
  const hasSetData = exercises.some((ex) => ex.exerciseSets && ex.exerciseSets.length > 0);

  if (!hasSetData) {
    // Original simple mode
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

  return (
    <View style={{ gap: 8 }}>
      {exercises.map((exercise, index) => {
        const isActive = index === currentExerciseIndex;
        const isCompleted = exercise.completed;
        const isUpcoming = index > currentExerciseIndex && !isCompleted;
        const isExpanded = expandedId === exercise.id || isActive;
        const volume = calculateVolume(exercise);
        const completedSets = (exercise.exerciseSets ?? []).filter((s) => s.completed).length;
        const totalSets = exercise.exerciseSets?.length ?? exercise.sets;

        return (
          <Pressable
            key={exercise.id}
            onPress={() => {
              if (isActive) return;
              setExpandedId(expandedId === exercise.id ? null : exercise.id);
            }}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isActive
                ? `${theme.colors.primary}66`
                : isCompleted
                  ? `${theme.colors.success}44`
                  : theme.colors.borderSubtle,
              padding: 12,
              backgroundColor: isCompleted
                ? `${theme.colors.success}15`
                : isActive
                  ? `${theme.colors.primary}10`
                  : theme.colors.surface,
              gap: 8,
              opacity: isUpcoming ? 0.5 : 1,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {isCompleted && <Check size={14} color={theme.colors.success} />}
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 14 }}>
                    {exercise.name}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  {completedSets}/{totalSets} sets
                  {isCompleted && volume > 0 ? ` · ${volume.toLocaleString()}kg vol` : ` · ${exercise.weight}${exercise.unit}`}
                </Text>
              </View>
              {!isActive && (isExpanded ? <ChevronUp size={16} color={theme.colors.textTertiary} /> : <ChevronDown size={16} color={theme.colors.textTertiary} />)}
            </View>

            {/* Expanded set rows */}
            {isExpanded && (
              <View style={{ gap: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: theme.colors.borderSubtle }}>
                {(exercise.exerciseSets ?? []).map((exerciseSet) => (
                  <SetRow
                    key={exerciseSet.setNumber}
                    exerciseSet={exerciseSet}
                    exerciseId={exercise.id}
                    onLog={onLogSet}
                    onSkip={onSkipSet}
                  />
                ))}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
