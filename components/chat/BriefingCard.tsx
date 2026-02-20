import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Calendar, Dumbbell, Flame, Heart } from 'lucide-react-native';

import { GlassCard } from '../ui/GlassCard';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuthStore, useSeasonStore, useTrainingStore } from '../../stores';
import { useNutritionStore } from '../../stores/useNutritionStore';
import { useTrackStore } from '../../stores/useTrackStore';

// ── Helpers ──

/** Returns a time-appropriate Spanish greeting. */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Capitalises the first letter of a phase string for display. */
function formatPhase(phase: string): string {
  if (!phase) return '';
  return phase.charAt(0).toUpperCase() + phase.slice(1);
}

// ── Constants ──

const DIVIDER_COLOR = 'rgba(255,255,255,0.06)';
const ICON_SIZE = 16;
const ICON_COLOR = GENESIS_COLORS.primaryLight;

// ── Component ──

export function BriefingCard() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Store reads (read-only, no mutations)
  const userName = useAuthStore((s) => s.user?.name ?? 'Athlete');
  const currentWeek = useSeasonStore((s) => s.currentWeek);
  const currentPhase = useSeasonStore((s) => s.currentPhase);
  const todayPlan = useTrainingStore((s) => s.todayPlan);

  // Nutrition — read primitives, compute inline (Zustand pattern)
  const meals = useNutritionStore((s) => s.meals);
  const dailyGoal = useNutritionStore((s) => s.dailyGoal);
  const consumedKcal = useMemo(() => {
    return meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  }, [meals]);
  const targetKcal = dailyGoal ?? 2400;
  const kcalLabel = `${consumedKcal.toLocaleString()}/${targetKcal.toLocaleString()} kcal`;

  // Streak
  const streak = useTrackStore((s) => s.streak);

  // Derived values
  const workoutLabel = todayPlan?.name ?? 'Día de descanso';
  const recoveryLabel = '— Recovery';

  const toggle = () => setIsCollapsed((prev) => !prev);

  // ── Collapsed view ──

  if (isCollapsed) {
    return (
      <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel="Expandir briefing">
        <GlassCard className="mb-3" shine>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Calendar size={ICON_SIZE} color={ICON_COLOR} />
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: 13,
                color: GENESIS_COLORS.textSecondary,
                flex: 1,
              }}
              numberOfLines={1}
            >
              Semana {currentWeek} · {workoutLabel} · {kcalLabel}{streak > 0 ? ` · 🔥${streak}` : ''}
            </Text>
          </View>
        </GlassCard>
      </Pressable>
    );
  }

  // ── Expanded view ──

  return (
    <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel="Colapsar briefing">
      <GlassCard className="mb-3" shine>
        {/* Header */}
        <Text
          style={{
            fontFamily: 'JetBrainsMonoBold',
            fontSize: 18,
            color: GENESIS_COLORS.textPrimary,
            marginBottom: 4,
          }}
        >
          {getGreeting()}, {userName}
        </Text>

        {/* Season info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Calendar size={ICON_SIZE} color={ICON_COLOR} />
          <Text
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: GENESIS_COLORS.textSecondary,
            }}
          >
            Semana {currentWeek}/12 · {formatPhase(currentPhase)}
          </Text>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: DIVIDER_COLOR, marginBottom: 12 }} />

        {/* Workout row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Dumbbell size={ICON_SIZE} color={ICON_COLOR} />
          <Text
            style={{
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: '500',
              color: GENESIS_COLORS.textPrimary,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {workoutLabel}
          </Text>
        </View>

        {/* Nutrition row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Flame size={ICON_SIZE} color={ICON_COLOR} />
          <Text
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: GENESIS_COLORS.textSecondary,
            }}
          >
            {kcalLabel}
          </Text>
        </View>

        {/* Recovery row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Heart size={ICON_SIZE} color={ICON_COLOR} />
          <Text
            style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: GENESIS_COLORS.textSecondary,
            }}
          >
            {recoveryLabel}
          </Text>
        </View>

        {/* Streak row — only show if streak >= 1 */}
        {streak > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <Text style={{ fontSize: ICON_SIZE }}>🔥</Text>
            <Text
              style={{
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: '500',
                color: GENESIS_COLORS.primary,
              }}
            >
              {streak} días de racha
            </Text>
          </View>
        )}
      </GlassCard>
    </Pressable>
  );
}
