import { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, ChevronRight } from 'lucide-react-native';

import { GlassCard } from '../../components/ui/GlassCard';
import { GENESIS_COLORS } from '../../constants/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkoutPanelProps {
  onClose: () => void;
}

interface CompletedSet {
  weight: number;
  reps: number;
  rpe: number;
}

// ---------------------------------------------------------------------------
// Mock exercise data (UI shell)
// ---------------------------------------------------------------------------

const EXERCISES = [
  { name: 'Bench Press', sets: 4 },
  { name: 'Incline DB Press', sets: 3 },
  { name: 'Cable Flyes', sets: 3 },
  { name: 'Tricep Pushdown', sets: 3 },
  { name: 'Overhead Tricep Ext.', sets: 3 },
] as const;

const RPE_OPTIONS = [6, 7, 8, 9, 10] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkoutPanel({ onClose }: WorkoutPanelProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['95%'], []);

  // Local state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [selectedRpe, setSelectedRpe] = useState<number>(8);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);

  const currentExercise = EXERCISES[currentExerciseIndex];
  const currentSetNumber = completedSets.length + 1;

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleLogSet = useCallback(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (Number.isNaN(w) || Number.isNaN(r)) return;

    setCompletedSets((prev) => [...prev, { weight: w, reps: r, rpe: selectedRpe }]);
    setWeight('');
    setReps('');
  }, [weight, reps, selectedRpe]);

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < EXERCISES.length - 1) {
      setCurrentExerciseIndex((i) => i + 1);
      setCompletedSets([]);
      setWeight('');
      setReps('');
      setSelectedRpe(8);
    }
  }, [currentExerciseIndex]);

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
    onClose();
  }, [onClose]);

  // ------------------------------------------------------------------
  // Backdrop
  // ------------------------------------------------------------------

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        pressBehavior="close"
      />
    ),
    [],
  );

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* ---- Header ---- */}
        <View style={styles.header}>
          <Text style={styles.title}>Workout Activo</Text>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar panel"
          >
            <X size={22} color={GENESIS_COLORS.textSecondary} />
          </Pressable>
        </View>

        {/* ---- Exercise progress indicator ---- */}
        <Text style={styles.exerciseProgress}>
          Ejercicio {currentExerciseIndex + 1}/{EXERCISES.length}
        </Text>

        {/* ---- Current exercise card ---- */}
        <GlassCard className="mb-4" shine>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.setCounter}>
            Set {currentSetNumber}/{currentExercise.sets}
          </Text>
        </GlassCard>

        {/* ---- Input row: Weight / Reps ---- */}
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Peso (kg)</Text>
            <BottomSheetTextInput
              style={styles.textInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              placeholderTextColor={GENESIS_COLORS.textMuted}
              keyboardType="numeric"
              accessibilityLabel="Peso en kilogramos"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <BottomSheetTextInput
              style={styles.textInput}
              value={reps}
              onChangeText={setReps}
              placeholder="0"
              placeholderTextColor={GENESIS_COLORS.textMuted}
              keyboardType="numeric"
              accessibilityLabel="Numero de repeticiones"
            />
          </View>
        </View>

        {/* ---- RPE selector ---- */}
        <Text style={styles.inputLabel}>RPE</Text>
        <View style={styles.rpeRow}>
          {RPE_OPTIONS.map((rpe) => {
            const isActive = rpe === selectedRpe;
            return (
              <Pressable
                key={rpe}
                onPress={() => setSelectedRpe(rpe)}
                style={[styles.rpeButton, isActive && styles.rpeButtonActive]}
                accessibilityRole="button"
                accessibilityLabel={`RPE ${rpe}`}
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.rpeText, isActive && styles.rpeTextActive]}>
                  {rpe}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ---- Log Set button ---- */}
        <Pressable onPress={handleLogSet} accessibilityRole="button" accessibilityLabel="Registrar set">
          <LinearGradient
            colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.gradientButtonText}>Log Set</Text>
          </LinearGradient>
        </Pressable>

        {/* ---- Completed sets ---- */}
        {completedSets.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.completedTitle}>Sets completados</Text>
            {completedSets.map((set, idx) => (
              <View key={`set-${idx}`} style={styles.completedRow}>
                <Check size={16} color={GENESIS_COLORS.success} />
                <Text style={styles.completedText}>
                  Set {idx + 1}: {set.weight} kg x {set.reps} reps @ RPE {set.rpe}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ---- Next exercise button ---- */}
        {currentExerciseIndex < EXERCISES.length - 1 && (
          <Pressable
            onPress={handleNextExercise}
            style={styles.nextExerciseButton}
            accessibilityRole="button"
            accessibilityLabel="Siguiente ejercicio"
          >
            <Text style={styles.nextExerciseText}>Siguiente ejercicio</Text>
            <ChevronRight size={18} color={GENESIS_COLORS.primary} />
          </Pressable>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#0D0D2B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  } satisfies ViewStyle,

  handleIndicator: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 40,
  } satisfies ViewStyle,

  container: {
    flex: 1,
  } satisfies ViewStyle,

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  } satisfies ViewStyle,

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  } satisfies ViewStyle,

  title: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 22,
    color: GENESIS_COLORS.textPrimary,
  } satisfies TextStyle,

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GENESIS_COLORS.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  exerciseProgress: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: GENESIS_COLORS.textSecondary,
    marginBottom: 16,
  } satisfies TextStyle,

  // Current exercise
  exerciseName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 20,
    color: GENESIS_COLORS.textPrimary,
    marginBottom: 4,
  } satisfies TextStyle,

  setCounter: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: GENESIS_COLORS.primaryLight,
  } satisfies TextStyle,

  // Inputs
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  } satisfies ViewStyle,

  inputGroup: {
    flex: 1,
  } satisfies ViewStyle,

  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: GENESIS_COLORS.textSecondary,
    marginBottom: 8,
  } satisfies TextStyle,

  textInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GENESIS_COLORS.borderSubtle,
    backgroundColor: GENESIS_COLORS.surfaceCard,
    color: GENESIS_COLORS.textPrimary,
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: 12,
  } satisfies TextStyle,

  // RPE
  rpeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  } satisfies ViewStyle,

  rpeButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GENESIS_COLORS.borderSubtle,
    backgroundColor: GENESIS_COLORS.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  rpeButtonActive: {
    borderColor: GENESIS_COLORS.primary,
    backgroundColor: GENESIS_COLORS.primaryDim,
  } satisfies ViewStyle,

  rpeText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: GENESIS_COLORS.textSecondary,
  } satisfies TextStyle,

  rpeTextActive: {
    color: GENESIS_COLORS.primary,
  } satisfies TextStyle,

  // Gradient button
  gradientButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  } satisfies ViewStyle,

  gradientButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  } satisfies TextStyle,

  // Completed sets
  completedSection: {
    marginBottom: 24,
  } satisfies ViewStyle,

  completedTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: GENESIS_COLORS.textSecondary,
    marginBottom: 12,
  } satisfies TextStyle,

  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GENESIS_COLORS.borderSubtle,
  } satisfies ViewStyle,

  completedText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: GENESIS_COLORS.textPrimary,
  } satisfies TextStyle,

  // Next exercise
  nextExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GENESIS_COLORS.borderActive,
    backgroundColor: GENESIS_COLORS.primaryDim,
  } satisfies ViewStyle,

  nextExerciseText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: GENESIS_COLORS.primary,
  } satisfies TextStyle,
});
