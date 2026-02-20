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
import { X, Dumbbell, Trophy, Flame, TrendingUp } from 'lucide-react-native';

import { GlassCard } from '../../components/ui/GlassCard';
import { GENESIS_COLORS } from '../../constants/colors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProgressPanelProps {
  onClose: () => void;
}

interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface StrengthEntry {
  exercise: string;
  weight: string;
  trend: 'up' | 'flat';
}

// ---------------------------------------------------------------------------
// Mock data (UI shell)
// ---------------------------------------------------------------------------

const STATS: StatCard[] = [
  {
    label: 'Workouts',
    value: '24',
    icon: <Dumbbell size={20} color={GENESIS_COLORS.primary} />,
  },
  {
    label: 'PRs',
    value: '8',
    icon: <Trophy size={20} color={GENESIS_COLORS.success} />,
  },
  {
    label: 'Streak',
    value: '12 dias',
    icon: <Flame size={20} color={GENESIS_COLORS.warning} />,
  },
];

const STRENGTH_DATA: StrengthEntry[] = [
  { exercise: 'Bench Press', weight: '100 kg', trend: 'up' },
  { exercise: 'Squat', weight: '140 kg', trend: 'up' },
  { exercise: 'Deadlift', weight: '170 kg', trend: 'flat' },
  { exercise: 'OHP', weight: '60 kg', trend: 'up' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProgressPanel({ onClose }: ProgressPanelProps) {
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
          <Text style={styles.title}>Tu Progreso</Text>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar panel"
          >
            <X size={22} color={GENESIS_COLORS.textSecondary} />
          </Pressable>
        </View>

        {/* ---- Stats cards row ---- */}
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <GlassCard key={stat.label} className="flex-1" style={{ minWidth: 0 }}>
              <View style={styles.statContent}>
                {stat.icon}
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* ---- Strength section ---- */}
        <Text style={styles.sectionTitle}>Fuerza</Text>
        {STRENGTH_DATA.map((entry) => (
          <GlassCard key={entry.exercise} className="mb-3">
            <View style={styles.strengthRow}>
              <View style={styles.strengthInfo}>
                <Text style={styles.strengthExercise}>{entry.exercise}</Text>
                <Text style={styles.strengthWeight}>{entry.weight}</Text>
              </View>
              {entry.trend === 'up' && (
                <TrendingUp size={18} color={GENESIS_COLORS.success} />
              )}
            </View>
          </GlassCard>
        ))}

        {/* ---- Body Metrics placeholder ---- */}
        <Text style={styles.sectionTitle}>Body Metrics</Text>
        <GlassCard className="mb-4">
          <View style={styles.placeholderBlock}>
            <Text style={styles.placeholderText}>
              Composicion corporal y medidas estaran disponibles cuando conectes tu bascula
              inteligente o ingreses datos manualmente.
            </Text>
          </View>
        </GlassCard>

        {/* ---- Photo timeline placeholder ---- */}
        <Text style={styles.sectionTitle}>Fotos de progreso</Text>
        <GlassCard>
          <View style={styles.placeholderBlock}>
            <Text style={styles.placeholderText}>
              Tu timeline de fotos aparecera aqui. Sube tu primera foto de progreso desde
              la pantalla Track para comenzar a visualizar tu transformacion.
            </Text>
          </View>
        </GlassCard>
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

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  } satisfies ViewStyle,

  statContent: {
    alignItems: 'center',
    gap: 6,
  } satisfies ViewStyle,

  statValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 22,
    color: GENESIS_COLORS.textPrimary,
  } satisfies TextStyle,

  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: GENESIS_COLORS.textSecondary,
  } satisfies TextStyle,

  // Section title
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: GENESIS_COLORS.textSecondary,
    marginBottom: 12,
  } satisfies TextStyle,

  // Strength entries
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } satisfies ViewStyle,

  strengthInfo: {
    gap: 2,
  } satisfies ViewStyle,

  strengthExercise: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 15,
    color: GENESIS_COLORS.textPrimary,
  } satisfies TextStyle,

  strengthWeight: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: GENESIS_COLORS.primaryLight,
  } satisfies TextStyle,

  // Placeholders
  placeholderBlock: {
    paddingVertical: 8,
  } satisfies ViewStyle,

  placeholderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: GENESIS_COLORS.textMuted,
    lineHeight: 20,
  } satisfies TextStyle,
});
