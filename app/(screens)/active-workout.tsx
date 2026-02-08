import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pause, Play, ArrowLeft } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useSeasonStore, useTrainingStore } from '../../stores';
import { ExerciseForm } from '../../components/training/ExerciseForm';
import { RestTimer } from '../../components/training/RestTimer';
import { WorkoutComplete } from '../../components/training/WorkoutComplete';
import { PHASE_CONFIG } from '../../data';
import { detectPersonalRecords } from '../../utils/prDetection';
import type { DetectedPR } from '../../utils/prDetection';
import type { PhaseType } from '../../types';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { currentPhase } = useSeasonStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  const {
    currentSession,
    workoutStatus,
    elapsedSeconds,
    currentExerciseIndex,
    isRestTimerActive,
    restTimeRemaining,
    logSet,
    skipSet,
    advanceToNextExercise,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    tickElapsed,
    resetWorkout,
    startRestTimer,
  } = useTrainingStore();

  const [detectedPRs, setDetectedPRs] = useState<DetectedPR[]>([]);
  const [showComplete, setShowComplete] = useState(false);

  // Elapsed time ticker
  useEffect(() => {
    if (workoutStatus !== 'active') return;
    const handle = setInterval(() => tickElapsed(), 1000);
    return () => clearInterval(handle);
  }, [workoutStatus, tickElapsed]);

  // Show completion overlay when workout finishes
  useEffect(() => {
    if (workoutStatus === 'completed') {
      setShowComplete(true);
    }
  }, [workoutStatus]);

  if (!currentSession) {
    return (
      <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary }}>No active workout</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16, padding: 12 }}>
            <Text style={{ color: theme.colors.primary }}>Go Back</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const currentExercise = currentSession.exercises[currentExerciseIndex];
  const completedSets = (currentExercise?.exerciseSets ?? []).filter((s) => s.completed).length;
  const totalSets = currentExercise?.exerciseSets?.length ?? currentExercise?.sets ?? 0;
  const allExercisesDone = currentSession.exercises.every((ex) => ex.completed);

  const handleLogSet = (exerciseId: string, setNumber: number, data: { actualReps: number; actualWeight: number; rpe?: number }) => {
    logSet(exerciseId, setNumber, data);
    // Auto-start rest timer
    startRestTimer(phaseConfig.restSeconds);
  };

  const handleFinish = async () => {
    // Detect PRs before finishing
    const prs = detectPersonalRecords(currentSession.exercises, {});
    setDetectedPRs(prs);
    await finishWorkout();
  };

  const handleDismiss = () => {
    setShowComplete(false);
    resetWorkout();
    router.back();
  };

  // Auto-advance to next exercise when current is completed
  useEffect(() => {
    if (currentExercise?.completed && currentExerciseIndex < currentSession.exercises.length - 1) {
      advanceToNextExercise();
    }
  }, [currentExercise?.completed, currentExerciseIndex, currentSession.exercises.length, advanceToNextExercise]);

  // Completion overlay
  if (showComplete) {
    return (
      <WorkoutComplete
        session={currentSession}
        prs={detectedPRs}
        onDismiss={handleDismiss}
      />
    );
  }

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderSubtle,
        }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontFamily: 'InterBold' }}>
              {currentSession.exercises[0]?.name ? 'Active Workout' : 'Workout'}
            </Text>
            <Text style={{ color: phaseConfig.accentColor, fontSize: 22, fontFamily: 'JetBrainsMonoBold' }}>
              {minutes}:{secs.toString().padStart(2, '0')}
            </Text>
          </View>

          <Pressable
            onPress={workoutStatus === 'paused' ? resumeWorkout : pauseWorkout}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: workoutStatus === 'paused' ? `${theme.colors.success}22` : `${theme.colors.warning}22`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {workoutStatus === 'paused'
              ? <Play size={16} color={theme.colors.success} />
              : <Pause size={16} color={theme.colors.warning} />}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Current exercise info */}
          {currentExercise && (
            <View style={{
              backgroundColor: `${phaseConfig.color}15`,
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: `${phaseConfig.color}33`,
              gap: 4,
            }}>
              <Text style={{ color: phaseConfig.accentColor, fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
                CURRENT EXERCISE
              </Text>
              <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontFamily: 'InterBold' }}>
                {currentExercise.name}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                Set {completedSets + 1} of {totalSets} · {currentExercise.weight}{currentExercise.unit}
              </Text>
            </View>
          )}

          {/* Rest Timer */}
          {(isRestTimerActive || restTimeRemaining > 0) && (
            <RestTimer defaultDuration={phaseConfig.restSeconds} />
          )}

          {/* Exercise Form */}
          <ExerciseForm
            exercises={currentSession.exercises}
            currentExerciseIndex={currentExerciseIndex}
            onToggle={() => {}}
            onLogSet={handleLogSet}
            onSkipSet={skipSet}
          />
        </ScrollView>

        {/* Footer — Finish button */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 34,
          paddingTop: 12,
        }}>
          <Pressable
            onPress={handleFinish}
            style={{ opacity: allExercisesDone ? 1 : 0.5 }}
          >
            <LinearGradient
              colors={allExercisesDone ? ['#22ff73', '#16a34a'] : ['#6D00FF', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: allExercisesDone ? '#0D0D2B' : '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>
                {allExercisesDone ? 'FINISH WORKOUT' : 'FINISH EARLY'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
