import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight, Sun, Sunset, Moon } from 'lucide-react-native';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuthStore, useSeasonStore, useTrainingStore } from '../../stores';
import { useNutritionStore } from '../../stores/useNutritionStore';
import { useTrackStore } from '../../stores/useTrackStore';

function getGreeting(): { text: string; Icon: React.ElementType } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Buenos días', Icon: Sun };
  if (h < 19) return { text: 'Buenas tardes', Icon: Sunset };
  return { text: 'Buenas noches', Icon: Moon };
}

type BriefingCardProps = {
  /** Start collapsed when used inside active conversation */
  defaultExpanded?: boolean;
};

export function BriefingCard({ defaultExpanded = true }: BriefingCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const userName = useAuthStore((s) => s.user?.name ?? 'Athlete');
  const currentWeek = useSeasonStore((s) => s.currentWeek);
  const currentPhase = useSeasonStore((s) => s.currentPhase);
  const todayPlan = useTrainingStore((s) => s.todayPlan);
  const meals = useNutritionStore((s) => s.meals);
  const dailyGoal = useNutritionStore((s) => s.dailyGoal);
  const streak = useTrackStore((s) => s.streak);

  const consumedKcal = useMemo(() => meals.reduce((sum, m) => sum + (m.calories || 0), 0), [meals]);
  const kcalStr = consumedKcal.toLocaleString();
  const workoutLabel = todayPlan?.name ?? 'Día de descanso';
  const { text: greeting, Icon: GreetingIcon } = getGreeting();

  // ── COLLAPSED ──
  if (!expanded) {
    return (
      <Pressable onPress={() => setExpanded(true)}>
        <LiquidGlassCard effect="regular" borderRadius={16}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingHorizontal: 18 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#FFFFFF' }}>
              {greeting}, {userName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 11, color: GENESIS_COLORS.textSecondary }}>
                {kcalStr} kcal
              </Text>
              {streak > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GENESIS_COLORS.primary }} />
                  <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 11, fontWeight: '600', color: GENESIS_COLORS.primary }}>
                    {streak}
                  </Text>
                </View>
              )}
              <ChevronRight size={14} color={GENESIS_COLORS.textGhost} />
            </View>
          </View>
        </LiquidGlassCard>
      </Pressable>
    );
  }

  // ── EXPANDED ──
  return (
    <Pressable onPress={() => setExpanded(false)}>
      <LiquidGlassCard effect="regular" borderRadius={18}>
        <View style={{ padding: 18 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <GreetingIcon size={14} color={GENESIS_COLORS.iconDefault} />
              <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', color: GENESIS_COLORS.textSecondary }}>
                {greeting}
              </Text>
            </View>
            <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost }}>
              Hoy · {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {/* Body text */}
          <Text style={{ fontFamily: 'Inter', fontSize: 14, lineHeight: 21, color: GENESIS_COLORS.textSecondary, marginBottom: 14 }}>
            {workoutLabel}. Semana {currentWeek}/12{currentPhase ? ` — ${currentPhase}` : ''}.{streak >= 3 ? ` Llevas ${streak} días seguidos.` : ''}
          </Text>

          {/* 3 metric boxes — HORIZONTAL */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <MetricBox value={kcalStr} label="kcal hoy" />
            <MetricBox value="—" label="sueño" />
            <MetricBox value={streak > 0 ? String(streak) : '—'} label="racha" highlight={streak >= 3} />
          </View>
        </View>
      </LiquidGlassCard>
    </Pressable>
  );
}

function MetricBox({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <View style={{
      flex: 1,
      padding: 10,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.04)',
      alignItems: 'center',
    }}>
      <Text style={{
        fontFamily: 'JetBrainsMono',
        fontSize: 18,
        fontWeight: '600',
        color: highlight ? GENESIS_COLORS.primary : '#FFFFFF',
      }}>
        {value}
      </Text>
      <Text style={{ fontFamily: 'Inter', fontSize: 10, color: GENESIS_COLORS.textTertiary, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}
