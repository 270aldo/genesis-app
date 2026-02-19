import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pause, Play, ArrowLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
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
import { getExerciseImage } from '../../utils/exerciseImages';
import { hapticLight, hapticMedium, hapticHeavy, hapticNotificationSuccess } from '../../utils/haptics';
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
    addSet,
    advanceToNextExercise,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    tickElapsed,
    resetWorkout,
    startRestTimer,
    getPreviousExerciseData,
  } = useTrainingStore();

  const previousData = getPreviousExerciseData();

  const [detectedPRs, setDetectedPRs] = useState<DetectedPR[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const [showPRCelebration, setShowPRCelebration] = useState(false);
  const [prSetNumbers, setPrSetNumbers] = useState<Record<string, number[]>>({});
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

  // ALL hooks must be above early returns (Rules of Hooks)
  const handleLogSet = useCallback((exerciseId: string, setNumber: number, data: { actualReps: number; actualWeight: number; rpe?: number }) => {
    hapticNotificationSuccess();
    logSet(exerciseId, setNumber, data);
    startRestTimer(phaseConfig.restSeconds);

    // Real-time PR detection: compare against previous session data
    const prevSets = previousData[exerciseId];
    if (prevSets && prevSets.length > 0) {
      const prevMaxWeight = Math.max(...prevSets.map((s) => s.weight));
      if (data.actualWeight > prevMaxWeight) {
        hapticHeavy();
        setPrSetNumbers((prev) => ({
          ...prev,
          [exerciseId]: [...(prev[exerciseId] ?? []), setNumber],
        }));
      }
    }
  }, [logSet, startRestTimer, phaseConfig.restSeconds, previousData]);

  const handleFinish = useCallback(async () => {
    if (!currentSession) return;
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

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    advanceToNextExercise();
  }, [advanceToNextExercise]);

  // Show transition overlay before auto-advancing to next exercise
  useEffect(() => {
    if (!currentSession) return;
    const currentExerciseForTransition = currentSession.exercises[currentExerciseIndex];
    if (currentExerciseForTransition?.completed && currentExerciseIndex < currentSession.exercises.length - 1) {
      const nextEx = currentSession.exercises[currentExerciseIndex + 1];
      setTransitionExercise({ name: nextEx.name, number: currentExerciseIndex + 2 });
      setShowTransition(true);
    }
  }, [currentSession, currentExerciseIndex]);

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

  const handleFinishPress = () => {
    if (allExercisesDone) {
      handleFinish();
      return;
    }
    Alert.alert(
      '¿Terminar sesión?',
      'Aún tienes ejercicios pendientes. ¿Seguro que deseas terminar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Terminar', style: 'destructive', onPress: handleFinish },
      ],
    );
  };

  const handleDismiss = () => {
    setShowComplete(false);
    resetWorkout();
    router.back();
  };

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
        workoutName={currentSession.workoutName ?? 'Sesion Activa'}
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
              {currentSession.workoutName ?? 'Sesion Activa'}
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
          {/* Current exercise info — image background */}
          {currentExercise && (
            <View style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: GENESIS_COLORS.primary + '66',
              overflow: 'hidden',
            }}>
              <Image
                source={{ uri: getExerciseImage(currentExercise.name) }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                contentFit="cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']}
                style={{ padding: 14, gap: 4 }}
              >
                {/* Muscle group badge — look up from exercise catalog */}
                {(() => {
                  const catalogEntry = exerciseCatalog.find((e) => e.name === currentExercise.name);
                  if (!catalogEntry) return null;
                  return (
                    <View style={{ position: 'absolute', top: 10, right: 10 }}>
                      <View style={{
                        backgroundColor: GENESIS_COLORS.primary + '30',
                        borderRadius: 9999,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderWidth: 1,
                        borderColor: GENESIS_COLORS.primary + '50',
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 9,
                          fontFamily: 'JetBrainsMonoSemiBold',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}>
                          {catalogEntry.muscleGroup.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
                  CURRENT EXERCISE
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>
                  {currentExercise.name}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  Set <Text style={{ color: phaseConfig.accentColor, fontFamily: 'JetBrainsMonoBold' }}>{completedSets + 1}</Text> of {totalSets} · {currentExercise.weight}{currentExercise.unit}
                </Text>
                {/* Progress bar */}
                <View style={{ height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 6 }}>
                  <View style={{
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: phaseConfig.accentColor,
                    width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%`,
                  }} />
                </View>
                {/* Video CTA pill */}
                {currentExercise?.videoUrl && (
                  <Pressable
                    onPress={() => router.push(`/(modals)/exercise-video?url=${encodeURIComponent(currentExercise.videoUrl!)}`)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      gap: 6,
                      marginTop: 8,
                      height: 36,
                      paddingHorizontal: 14,
                      backgroundColor: GENESIS_COLORS.primary + '20',
                      borderRadius: 9999,
                      borderWidth: 1,
                      borderColor: GENESIS_COLORS.primary + '40',
                    }}
                  >
                    <Play size={14} color={GENESIS_COLORS.primary} fill={GENESIS_COLORS.primary} />
                    <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold' }}>
                      VER DEMO
                    </Text>
                  </Pressable>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Exercise Form */}
          <ExerciseForm
            exercises={currentSession.exercises}
            currentExerciseIndex={currentExerciseIndex}
            onToggle={() => {}}
            onLogSet={handleLogSet}
            onSkipSet={skipSet}
            onAddSet={addSet}
            previousData={previousData}
            phaseColor={phaseConfig.accentColor}
            prSetNumbers={prSetNumbers}
          />

          {/* Form Cues */}
          {currentExercise && (
            <FormCues
              cues={exerciseCatalog.find((e) => e.name === currentExercise.name)?.formCues ?? []}
            />
          )}
        </ScrollView>

        {/* Floating Rest Timer */}
        {(isRestTimerActive || restTimeRemaining > 0) && (
          <View style={{
            position: 'absolute',
            bottom: 90,
            left: 20,
            right: 20,
            zIndex: 10,
          }}>
            <EnhancedRestTimer
              seconds={phaseConfig.restSeconds}
              phaseColor={phaseConfig.accentColor}
              phaseLabel={phase}
              compact={true}
              isPaused={workoutStatus === 'paused'}
              onComplete={() => {
                hapticMedium();
                useTrainingStore.setState({ restTimeRemaining: 0, isRestTimerActive: false });
              }}
              onSkip={() => {
                useTrainingStore.setState({ restTimeRemaining: 0, isRestTimerActive: false });
              }}
              onAddTime={() => {
                useTrainingStore.setState((s: any) => ({ restTimeRemaining: s.restTimeRemaining + 30 }));
              }}
            />
          </View>
        )}

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
            onPress={handleFinishPress}
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
            totalSets={currentSession.exercises[transitionExercise.number - 1]?.sets ?? 0}
            phaseColor={phaseConfig.accentColor}
            onComplete={handleTransitionComplete}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
