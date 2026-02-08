import { Pressable, Text, View } from 'react-native';
import { PHASE_CONFIG } from '../../data';
import type { PhaseType, Week } from '../../types';

type SeasonHeaderProps = {
  seasonNumber: number;
  currentWeek: number;
  currentPhase: PhaseType;
  weeks: Week[];
  totalWeeks?: number;
  onPress?: () => void;
};

export function SeasonHeader({
  seasonNumber,
  currentWeek,
  currentPhase,
  weeks,
  totalWeeks = 12,
  onPress,
}: SeasonHeaderProps) {
  const config = PHASE_CONFIG[currentPhase];

  return (
    <Pressable onPress={onPress} style={{ gap: 10 }}>
      {/* Phase Label */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: config.color }} />
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
          SEASON {seasonNumber} · SEMANA {currentWeek} · {config.label.toUpperCase()}
        </Text>
      </View>

      {/* Week Progress Bar */}
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {Array.from({ length: totalWeeks }).map((_, i) => {
          const weekNum = i + 1;
          const week = weeks[i];
          const isCurrent = weekNum === currentWeek;
          const isCompleted = week?.completed ?? false;
          const weekPhase = week?.phase as PhaseType | undefined;
          const weekColor = weekPhase ? PHASE_CONFIG[weekPhase]?.color ?? '#FFFFFF14' : '#FFFFFF14';

          return (
            <View
              key={`week-${i}`}
              style={{
                flex: 1,
                height: isCurrent ? 6 : 4,
                borderRadius: 3,
                backgroundColor: isCompleted
                  ? weekColor
                  : isCurrent
                    ? config.color
                    : 'rgba(255, 255, 255, 0.08)',
                opacity: isCompleted || isCurrent ? 1 : 0.4,
              }}
            />
          );
        })}
      </View>
    </Pressable>
  );
}
