import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useTrainingStore } from '../../stores';
import { hapticSelection } from '../../utils/haptics';

type QuickActionsBarProps = {
  onSend: (text: string) => void;
};

type PillContext = {
  todayPlan: any | null;
  hasCompletedWorkout: boolean;
};

/** Returns contextual quick-action pills based on time of day AND training state. */
function getContextualPills(ctx: PillContext): string[] {
  const hour = new Date().getHours();
  const isRestDay = !ctx.todayPlan;
  const didTrain = ctx.hasCompletedWorkout;

  // Morning (6-10)
  if (hour >= 6 && hour < 11) {
    const base = ['☀️ Mi briefing', '📋 Check-in'];
    if (isRestDay) return [...base, '🫁 Breathwork', '📚 LOGOS'];
    return [...base, '🏋️ ¿Qué entreno hoy?', '🫁 Breathwork'];
  }

  // Pre-workout window (11-13) — only if training day & not yet trained
  if (hour >= 11 && hour < 13 && !isRestDay && !didTrain) {
    return ['⏱ Empezar workout', '🔥 Calentamiento', '🍌 ¿Qué como antes?'];
  }

  // Midday (11-15) — rest day or already trained
  if (hour >= 11 && hour < 15) {
    if (didTrain) return ['📊 Resumen del workout', '🍽 ¿Qué como ahora?', '🧊 Recovery tips'];
    return ['🍽 Loggear comida', '💧 Registrar agua', '📷 Escanear comida'];
  }

  // Afternoon (15-17)
  if (hour >= 15 && hour < 17) {
    return ['🍽 Loggear comida', '💧 Registrar agua', '📷 Escanear comida'];
  }

  // Late afternoon/Evening (17-20)
  if (hour >= 17 && hour < 20) {
    if (didTrain) return ['📊 Resumen del workout', '🍽 ¿Qué como ahora?', '🧊 Recovery tips'];
    if (!isRestDay && !didTrain) return ['⏱ Empezar workout', '🍽 Loggear comida', '💧 Registrar agua'];
    return ['📈 ¿Cómo voy?', '🍽 Loggear comida', '💧 Registrar agua'];
  }

  // Evening (20-23)
  if (hour >= 20 && hour < 23) {
    return ['📊 Resumen del día', '🧘 Meditación', '🌙 Rutina de sueño'];
  }

  // Late night (23-6)
  return ['🌙 Rutina de sueño', '🧘 Meditación', '📊 Resumen del día'];
}

const ALWAYS_PILLS = ['📈 ¿Cómo voy?', '🏆 PRs', '📚 LOGOS'] as const;

export function QuickActionsBar({ onSend }: QuickActionsBarProps) {
  const todayPlan = useTrainingStore((s) => s.todayPlan);
  // TODO: wire to real state when store tracks workout completion
  const hasCompletedWorkout = false;

  const pills = useMemo(() => {
    const contextual = getContextualPills({ todayPlan, hasCompletedWorkout });
    const contextualSet = new Set(contextual);
    const deduped = ALWAYS_PILLS.filter((p) => !contextualSet.has(p));
    return [...contextual, ...deduped];
  }, [todayPlan, hasCompletedWorkout]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 6 }}
    >
      {pills.map((pill) => (
        <Pressable
          key={pill}
          onPress={() => {
            hapticSelection();
            onSend(pill);
          }}
          style={({ pressed }) => ({
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: pressed
              ? 'rgba(109, 0, 255, 0.15)'
              : 'rgba(255, 255, 255, 0.04)',
            borderWidth: 1,
            borderColor: pressed
              ? 'rgba(109, 0, 255, 0.5)'
              : 'rgba(109, 0, 255, 0.2)',
            shadowColor: '#6D00FF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: pressed ? 0.2 : 0.05,
            shadowRadius: 8,
            elevation: pressed ? 3 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel={pill}
        >
          <Text
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.8)',
              letterSpacing: 0.2,
            }}
          >
            {pill}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
