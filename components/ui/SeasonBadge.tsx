import { Text, View } from 'react-native';
import { SEASON_PHASE_COLORS } from '../../constants/colors';

interface SeasonBadgeProps {
  seasonNumber: number;
  currentWeek: number;
  phaseName: string;
}

export function SeasonBadge({ seasonNumber, currentWeek, phaseName }: SeasonBadgeProps) {
  const phaseKey = phaseName.toLowerCase() as keyof typeof SEASON_PHASE_COLORS;
  const phaseColor = SEASON_PHASE_COLORS[phaseKey] ?? SEASON_PHASE_COLORS.hypertrophy;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: phaseColor + '20',
        borderRadius: 9999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: phaseColor + '40',
      }}
    >
      <Text
        style={{
          color: phaseColor,
          fontSize: 10,
          fontFamily: 'JetBrainsMonoSemiBold',
          letterSpacing: 0.5,
        }}
      >
        S{seasonNumber} · Sem {currentWeek} · {phaseName.charAt(0).toUpperCase() + phaseName.slice(1)}
      </Text>
    </View>
  );
}
