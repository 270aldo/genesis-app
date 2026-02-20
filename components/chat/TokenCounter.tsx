import { Text, View } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';

type TokenCounterProps = {
  used?: number;
  total?: number;
};

export function TokenCounter({ used = 47, total = 60 }: TokenCounterProps) {
  const pct = Math.min((used / total) * 100, 100);

  return (
    <View
      style={{
        backgroundColor: GENESIS_COLORS.surfaceElevated,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: GENESIS_COLORS.borderSubtle,
      }}
    >
      <Text
        style={{
          color: GENESIS_COLORS.textSecondary,
          fontSize: 11,
          fontFamily: 'JetBrainsMonoMedium',
          letterSpacing: 1,
        }}
      >
        CREDITOS PREMIUM
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <Text
          style={{
            color: GENESIS_COLORS.textPrimary,
            fontSize: 20,
            fontFamily: 'JetBrainsMonoBold',
          }}
        >
          {used}
        </Text>
        <Text
          style={{
            color: GENESIS_COLORS.textMuted,
            fontSize: 14,
            fontFamily: 'JetBrainsMonoMedium',
          }}
        >
          /{total}
        </Text>
      </View>
      <View
        style={{
          height: 3,
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 2,
          marginTop: 8,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: GENESIS_COLORS.primary,
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  );
}
