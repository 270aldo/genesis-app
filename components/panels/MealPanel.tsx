import { useCallback, useMemo, useRef } from 'react';
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
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';

import { GlassCard } from '../../components/ui/GlassCard';
import { GENESIS_COLORS, MACRO_COLORS } from '../../constants/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MealPanelProps {
  onClose: () => void;
}

interface MacroInfo {
  label: string;
  current: number;
  target: number;
  color: string;
}

interface MealInfo {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ---------------------------------------------------------------------------
// Mock data (UI shell)
// ---------------------------------------------------------------------------

const MACROS: MacroInfo[] = [
  { label: 'Proteina', current: 120, target: 180, color: MACRO_COLORS.protein },
  { label: 'Carbos', current: 210, target: 300, color: MACRO_COLORS.carbs },
  { label: 'Grasa', current: 55, target: 80, color: MACRO_COLORS.fat },
];

const MEALS: MealInfo[] = [
  { name: 'Desayuno', calories: 520, protein: 35, carbs: 55, fat: 18 },
  { name: 'Almuerzo', calories: 680, protein: 45, carbs: 70, fat: 22 },
  { name: 'Cena', calories: 590, protein: 40, carbs: 50, fat: 20 },
  { name: 'Snacks', calories: 310, protein: 20, carbs: 35, fat: 12 },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MacroBar({ macro }: { macro: MacroInfo }) {
  const progress = Math.min(macro.current / macro.target, 1);

  return (
    <View style={styles.macroItem}>
      <View style={styles.macroLabelRow}>
        <Text style={[styles.macroLabel, { color: macro.color }]}>{macro.label}</Text>
        <Text style={styles.macroValues}>
          {macro.current}/{macro.target}g
        </Text>
      </View>
      <View style={styles.macroTrack}>
        <View
          style={[
            styles.macroFill,
            { width: `${progress * 100}%`, backgroundColor: macro.color },
          ]}
        />
      </View>
    </View>
  );
}

function MealCard({ meal }: { meal: MealInfo }) {
  return (
    <GlassCard className="mb-3">
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
      </View>
      <Text style={styles.mealMacros}>
        P: {meal.protein}g {'  '}C: {meal.carbs}g {'  '}F: {meal.fat}g
      </Text>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MealPanel({ onClose }: MealPanelProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['85%'], []);

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
    onClose();
  }, [onClose]);

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
          <Text style={styles.title}>Plan de Nutrición</Text>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar panel"
          >
            <X size={22} color={GENESIS_COLORS.textSecondary} />
          </Pressable>
        </View>

        {/* ---- Macro summary ---- */}
        <GlassCard className="mb-5" shine>
          <Text style={styles.sectionTitle}>Macros del dia</Text>
          {MACROS.map((macro) => (
            <MacroBar key={macro.label} macro={macro} />
          ))}
        </GlassCard>

        {/* ---- Meal cards ---- */}
        <Text style={styles.sectionTitle}>Comidas</Text>
        {MEALS.map((meal) => (
          <MealCard key={meal.name} meal={meal} />
        ))}

        {/* ---- Log meal button ---- */}
        <View style={styles.buttonWrapper}>
          <Pressable
            onPress={() => {
              // Placeholder — will integrate with Fuel tab logging
            }}
            accessibilityRole="button"
            accessibilityLabel="Loggear comida"
          >
            <LinearGradient
              colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.gradientButtonText}>Loggear comida</Text>
            </LinearGradient>
          </Pressable>
        </View>
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
    marginBottom: 20,
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

  // Section title
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: GENESIS_COLORS.textSecondary,
    marginBottom: 12,
  } satisfies TextStyle,

  // Macro bars
  macroItem: {
    marginBottom: 12,
  } satisfies ViewStyle,

  macroLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  } satisfies ViewStyle,

  macroLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  } satisfies TextStyle,

  macroValues: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: GENESIS_COLORS.textSecondary,
  } satisfies TextStyle,

  macroTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: GENESIS_COLORS.surfaceGlass,
    overflow: 'hidden',
  } satisfies ViewStyle,

  macroFill: {
    height: '100%',
    borderRadius: 3,
  } satisfies ViewStyle,

  // Meal cards
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  } satisfies ViewStyle,

  mealName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: GENESIS_COLORS.textPrimary,
  } satisfies TextStyle,

  mealCalories: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 14,
    color: GENESIS_COLORS.primaryLight,
  } satisfies TextStyle,

  mealMacros: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: GENESIS_COLORS.textSecondary,
  } satisfies TextStyle,

  // Button
  buttonWrapper: {
    marginTop: 8,
  } satisfies ViewStyle,

  gradientButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  gradientButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  } satisfies TextStyle,
});
