import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useTrainingStore } from '../../stores';
import { hapticSelection } from '../../utils/haptics';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

type QuickActionsBarProps = { onSend: (text: string) => void };

function getContextualPills(todayPlan: any, hasCompleted: boolean): string[] {
  const h = new Date().getHours();
  const rest = !todayPlan;

  // Morning (6-11)
  if (h >= 6 && h < 11) {
    return rest
      ? ['☀️ Mi briefing', '📋 Check-in', '🍳 ¿Qué desayuno?', '🫁 Breathwork', '📊 ¿Cómo voy?', '📚 LOGOS']
      : ['☀️ Mi briefing', '📋 Check-in', '🏋️ Entreno de hoy', '🍳 ¿Qué desayuno?', '🫁 Breathwork', '📊 ¿Cómo voy?'];
  }

  // Pre-workout (11-13, not rest, not completed)
  if (h >= 11 && h < 13 && !rest && !hasCompleted) {
    return ['⏱ Empezar workout', '🔥 Calentamiento', '🍌 Pre-entreno', '💧 Registrar agua', '📊 ¿Cómo voy?'];
  }

  // Midday (11-15)
  if (h >= 11 && h < 15) {
    return hasCompleted
      ? ['📊 Resumen workout', '🍽 ¿Qué como?', '🧊 Recovery', '💧 Registrar agua', '📈 Mi progreso']
      : ['🍽 Loggear comida', '💧 Registrar agua', '📷 Escanear comida', '📊 ¿Cómo voy?', '🧠 Tip del día'];
  }

  // Afternoon (15-20)
  if (h >= 15 && h < 20) {
    if (hasCompleted) return ['📊 Resumen workout', '🍽 ¿Qué como?', '🧊 Recovery', '💧 Agua', '📈 Mi progreso'];
    if (!rest && !hasCompleted) return ['⏱ Empezar workout', '🍽 Loggear comida', '💧 Registrar agua', '📊 ¿Cómo voy?'];
    return ['📈 ¿Cómo voy?', '🍽 Loggear comida', '💧 Registrar agua', '🧠 Tip del día', '📋 Check-in'];
  }

  // Night (20+)
  return ['📊 Resumen del día', '🍽 ¿Qué ceno?', '🧘 Meditación', '🌙 Rutina de sueño', '💧 Agua total', '📋 Check-in'];
}

export function QuickActionsBar({ onSend }: QuickActionsBarProps) {
  const todayPlan = useTrainingStore((s) => s.todayPlan);
  const pills = useMemo(() => getContextualPills(todayPlan, false), [todayPlan]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}
    >
      {pills.map((pill) => (
        <Pressable key={pill} onPress={() => { hapticSelection(); onSend(pill); }}>
          <LiquidGlassCard effect="clear" borderRadius={20}>
            <View style={{ paddingHorizontal: 14, paddingVertical: 9 }}>
              <Text style={{
                fontFamily: 'Inter',
                fontSize: 12,
                fontWeight: '500',
                color: GENESIS_COLORS.textSecondary,
              }}>
                {pill}
              </Text>
            </View>
          </LiquidGlassCard>
        </Pressable>
      ))}
    </ScrollView>
  );
}
