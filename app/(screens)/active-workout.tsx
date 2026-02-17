import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pause, Play, ArrowLeft } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GENESIS_COLORS } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useSeasonStore, useTrainingStore } from '../../stores';
import { ExerciseForm } from '../../components/training/ExerciseForm';
import { EnhancedRestTimer } from '../../components/training/EnhancedRestTimer';
import { PostWorkoutSummary } from '../../components/training/PostWorkoutSummary';
import { ExerciseTransition } from '../../components/training/ExerciseTransition';
import { FormCues } from '../../components/training/FormCues';
import { PRCelebration } from '../../components/training/PRCelebration';
import { PHASE_CONFIG } from '../../data';
import { detectPersonalRecords } from '../../utils/prDetection';
import { hapticLight, hapticMedium } from '../../utils/haptics';
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
  const [showPRCelebration, setShowPRCelebration] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionExercise, setTransitionExercise] = useState({ name: '', number: 0 });

  // Exercise catalog for form cues lookup
  const exerciseCatalog = useTrainingStore((s) => s.exerciseCatalog);

  // Timer glow animation
  const timerGlow = useSharedValue(0.3);
  useEffect(() => {
    if (workoutStatus === 'active') {
      timerGlow.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 }),
        ),
        -1,
        true,
      );
    }
  }, [workoutStatus]);
  const timerGlowStyle = useAnimatedStyle(() => ({
    textShadowColor: phaseConfig.accentColor,
    textShadowRadius: timerGlow.value * 12,
  }));

  // Elapsed time ticker
  useEffect(() => {
    if (workoutStatus !== 'active') return;
    const handle = setInterval(() => tickElapsed(), 1000);
    return () => clearInterval(handle);
  }, [workoutStatus, tickElapsed]);

  // Show PR celebration or completion overlay when workout finishes
  useEffect(() => {
    if (workoutStatus === 'completed') {
      if (detectedPRs.length > 0) {
        setShowPRCelebration(true);
      } else {
        setShowComplete(true);
      }
    }
  }, [workoutStatus]);

  if (!currentSession) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
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

  const handleLogSet = useCallback((exerciseId: string, setNumber: number, data: { actualReps: number; actualWeight: number; rpe?: number }) => {
    hapticMedium();
    logSet(exerciseId, setNumber, data);
    // Auto-start rest timer
    startRestTimer(phaseConfig.restSeconds);
  }, [logSet, startRestTimer, phaseConfig.restSeconds]);

  const handleFinish = useCallback(async () => {
    // Fetch existing PRs for comparison
    const exerciseIds = currentSession.exercises.map((e) => e.id);
    const { fetchExistingPRMap, getCurrentUserId } = await import('../../services/supabaseQueries');
    const userId = getCurrentUserId();
    const existingRecords = userId ? await fetchExistingPRMap(userId, exerciseIds) : {};

    const prs = detectPersonalRecords(currentSession.exercises, existingRecords);
    setDetectedPRs(prs);
    await finishWorkout(prs);

    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`genesis_workoutDone_${today}`, 'true');
  }, [currentSession, finishWorkout]);

  const handleDismiss = () => {
    setShowComplete(false);
    resetWorkout();
    router.back();
  };

  // Show transition overlay before auto-advancing to next exercise
  useEffect(() => {
    if (currentExercise?.completed && currentExerciseIndex < currentSession.exercises.length - 1) {
      const nextEx = currentSession.exercises[currentExerciseIndex + 1];
      setTransitionExercise({ name: nextEx.name, number: currentExerciseIndex + 2 });
      setShowTransition(true);
    }
  }, [currentExercise?.completed, currentExerciseIndex, currentSession.exercises.length]);

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    advanceToNextExercise();
  }, [advanceToNextExercise]);

  // PR Celebration overlay
  if (showPRCelebration && detectedPRs.length > 0) {
    const firstPR = detectedPRs[0];
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
        <PRCelebration
          visible={showPRCelebration}
          exerciseName={firstPR.exerciseName}
          record={firstPR}
          onDismiss={() => {
            setShowPRCelebration(false);
            setShowComplete(true);
          }}
        />
      </LinearGradient>
    );
  }

  // Completion overlay — compute summary stats
  if (showComplete) {
    const completedExercises = currentSession.exercises.filter((ex) => ex.completed).length;
    const summaryTotalSets = currentSession.exercises.reduce(
      (sum, ex) => sum + (ex.exerciseSets?.filter((s) => s.completed).length ?? 0),
      0,
    );
    const summaryTotalVolume = currentSession.exercises.reduce((sum, ex) => {
      if (!ex.exerciseSets) return sum + (ex.completed ? ex.sets * ex.reps * ex.weight : 0);
      return sum + ex.exerciseSets
        .filter((s) => s.completed)
        .reduce((setSum, s) => setSum + (s.actualWeight ?? s.targetWeight) * (s.actualReps ?? s.targetReps), 0);
    }, 0);

    return (
      <PostWorkoutSummary
        workoutName={currentSession.exercises[0]?.name ? 'Active Workout' : 'Workout'}
        duration={Math.round(elapsedSeconds / 60)}
        exercisesCompleted={completedExercises}
        totalSets={summaryTotalSets}
        totalVolume={summaryTotalVolume}
        prs={detectedPRs}
        phaseColor={phaseConfig.accentColor}
        coachReviewed={false}
        onClose={handleDismiss}
      />
    );
  }

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
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
            <Animated.Text style={[{ color: phaseConfig.accentColor, fontSize: 22, fontFamily: 'JetBrainsMonoBold' }, timerGlowStyle]}>
              {minutes}:{secs.toString().padStart(2, '0')}
            </Animated.Text>
          </View>

          <Pressable
            onPress={() => {
              hapticLight();
              workoutStatus === 'paused' ? resumeWorkout() : pauseWorkout();
            }}
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
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
                CURRENT EXERCISE
              </Text>
              <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontFamily: 'InterBold' }}>
                {currentExercise.name}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                Set {completedSets + 1} of {totalSets} · {currentExercise.weight}{currentExercise.unit}
              </Text>
              {currentExercise?.videoUrl && (
                <Pressable
                  onPress={() => router.push(`/(modals)/exercise-video?url=${encodeURIComponent(currentExercise.videoUrl!)}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
                >
                  <Play size={12} color={GENESIS_COLORS.primary} />
                  <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                    Ver demo
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Enhanced Rest Timer */}
          {(isRestTimerActive || restTimeRemaining > 0) && (
            <EnhancedRestTimer
              seconds={phaseConfig.restSeconds}
              phaseColor={phaseConfig.accentColor}
              phaseLabel={phase}
              onComplete={() => {
                hapticMedium();
                useTrainingStore.setState({ restTimeRemaining: 0, isRestTimerActive: false });
              }}
              onSkip={() => {
                useTrainingStore.setState({ restTimeRemaining: 0, isRestTimerActive: false });
              }}
            />
          )}

          {/* Exercise Form */}
          <ExerciseForm
            exercises={currentSession.exercises}
            currentExerciseIndex={currentExerciseIndex}
            onToggle={() => {}}
            onLogSet={handleLogSet}
            onSkipSet={skipSet}
          />

          {/* Form Cues */}
          {currentExercise && (
            <FormCues
              cues={exerciseCatalog.find((e) => e.name === currentExercise.name)?.formCues ?? []}
            />
          )}
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
              colors={allExercisesDone ? [GENESIS_COLORS.success, '#16a34a'] : [GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>
                {allExercisesDone ? 'FINISH WORKOUT' : 'FINISH EARLY'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
        {/* Exercise Transition Overlay */}
        {showTransition && (
          <ExerciseTransition
            exerciseName={transitionExercise.name}
            exerciseNumber={transitionExercise.number}
            totalExercises={currentSession.exercises.length}
            phaseColor={phaseConfig.accentColor}
            onComplete={handleTransitionComplete}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
