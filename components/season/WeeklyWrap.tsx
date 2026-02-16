import { Pressable, Text, View } from 'react-native';
import { Dumbbell, Utensils, Flame, Trophy } from 'lucide-react-native';
import { GlassCard } from '../ui';
import { GENESIS_COLORS, SEASON_PHASE_COLORS } from '../../constants/colors';
import { useCountUpDisplay } from '../../hooks/useCountUpDisplay';
import { hapticLight } from '../../utils/haptics';

type WeeklyWrapProps = {
  weekNumber: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  nutritionAdherence: number;
  streakDays: number;
  prCount: number;
  nextWeekFocus: string;
  nextWeekPhase?: string;
  onDismiss: () => void;
};

export function WeeklyWrap({
  weekNumber,
  workoutsCompleted,
  workoutsPlanned,
  nutritionAdherence,
  streakDays,
  prCount,
  nextWeekFocus,
  nextWeekPhase,
  onDismiss,
}: WeeklyWrapProps) {
  const workoutsDisplay = useCountUpDisplay(workoutsCompleted);
  const nutritionDisplay = useCountUpDisplay(Math.round(nutritionAdherence));
  const streakDisplay = useCountUpDisplay(streakDays);
  const prDisplay = useCountUpDisplay(prCount);

  const phaseColor = nextWeekPhase
    ? (SEASON_PHASE_COLORS[nextWeekPhase as keyof typeof SEASON_PHASE_COLORS] ?? GENESIS_COLORS.primary)
    : GENESIS_COLORS.primary;

  return (
    <GlassCard shine>
      <View style={{ gap: 14 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
            Resumen Semana {weekNumber}
          </Text>
          <View style={{
            backgroundColor: GENESIS_COLORS.primaryDim,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}>
            <Text style={{ color: GENESIS_COLORS.primary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
              S{weekNumber}/12
            </Text>
          </View>
        </View>

        {/* 2x2 stat grid */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, gap: 10 }}>
            <StatCell
              icon={<Dumbbell size={14} color={GENESIS_COLORS.primary} />}
              value={`${workoutsDisplay}/${workoutsPlanned}`}
              label="Entrenos"
            />
            <StatCell
              icon={<Flame size={14} color="#F97316" />}
              value={`${streakDisplay}d`}
              label="Racha"
            />
          </View>
          <View style={{ flex: 1, gap: 10 }}>
            <StatCell
              icon={<Utensils size={14} color={GENESIS_COLORS.success} />}
              value={`${nutritionDisplay}%`}
              label="Nutrición"
            />
            <StatCell
              icon={<Trophy size={14} color="#FFD700" />}
              value={prDisplay}
              label="PRs"
            />
          </View>
        </View>

        {/* Next week preview */}
        <View style={{
          backgroundColor: phaseColor + '10',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: phaseColor + '30',
          padding: 10,
        }}>
          <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1, marginBottom: 4 }}>
            PRÓXIMA SEMANA
          </Text>
          <Text style={{ color: phaseColor, fontSize: 12, fontFamily: 'InterBold' }}>
            {nextWeekFocus}
          </Text>
        </View>

        {/* Dismiss */}
        <Pressable
          onPress={() => {
            hapticLight();
            onDismiss();
          }}
          style={{
            alignItems: 'center',
            paddingVertical: 8,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
          }}
        >
          <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>
            Entendido
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

function StatCell({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 10,
      padding: 10,
      gap: 4,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'JetBrainsMonoBold' }}>{value}</Text>
      </View>
      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>{label}</Text>
    </View>
  );
}
