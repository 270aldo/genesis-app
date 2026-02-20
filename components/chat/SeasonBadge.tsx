import { Text, View } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore } from '../../stores';

export function SeasonBadge() {
  const currentWeek = useSeasonStore((s) => s.currentWeek);
  const totalWeeks = useSeasonStore((s) => s.weeks.length || 12);
  const pct = Math.min((currentWeek / totalWeeks) * 100, 100);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: GENESIS_COLORS.surfaceElevated,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: GENESIS_COLORS.borderSubtle,
      }}
    >
      {/* Mini circular progress */}
      <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: GENESIS_COLORS.primary,
            borderTopColor: pct > 25 ? GENESIS_COLORS.primary : 'transparent',
            borderRightColor: pct > 50 ? GENESIS_COLORS.primary : 'transparent',
            borderBottomColor: pct > 75 ? GENESIS_COLORS.primary : 'transparent',
            borderLeftColor: 'transparent',
            transform: [{ rotate: '-90deg' }],
          }}
        />
      </View>
      <Text
        style={{
          color: GENESIS_COLORS.textSecondary,
          fontSize: 11,
          fontFamily: 'JetBrainsMonoMedium',
        }}
      >
        S{currentWeek}/{totalWeeks}
      </Text>
    </View>
  );
}
