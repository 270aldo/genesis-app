import { Pressable, Text, View } from 'react-native';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';

type WellnessIndicatorProps = {
  score: number;
  mood?: string;
  hasCheckedIn: boolean;
  onCheckInPress?: () => void;
};

function getScoreColor(score: number): string {
  if (score < 40) return GENESIS_COLORS.error;
  if (score < 60) return GENESIS_COLORS.warning;
  if (score < 80) return GENESIS_COLORS.cyan;
  return GENESIS_COLORS.success;
}

function getScoreLabel(score: number): string {
  if (score < 40) return 'Bajo';
  if (score < 60) return 'Regular';
  if (score < 80) return 'Bien';
  return 'Excelente';
}

export function WellnessIndicator({ score, mood, hasCheckedIn, onCheckInPress }: WellnessIndicatorProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  if (!hasCheckedIn) {
    return (
      <Pressable
        onPress={onCheckInPress}
        style={{
          height: 48,
          backgroundColor: GENESIS_COLORS.surfaceCard,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: GENESIS_COLORS.borderSubtle,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          gap: 10,
        }}
      >
        <AlertCircle size={16} color={GENESIS_COLORS.warning} />
        <Text style={{
          flex: 1,
          color: GENESIS_COLORS.textSecondary,
          fontSize: 12,
          fontFamily: 'Inter',
        }}>
          Check-in pendiente
        </Text>
        <Text style={{
          color: GENESIS_COLORS.primary,
          fontSize: 11,
          fontFamily: 'JetBrainsMonoSemiBold',
        }}>
          REGISTRAR
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={{
      height: 48,
      backgroundColor: GENESIS_COLORS.surfaceCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: `${color}33`,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      gap: 10,
    }}>
      <CheckCircle size={16} color={color} />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>
          {score}
        </Text>
        <Text style={{ color, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
          {label}
        </Text>
      </View>
      {mood && (
        <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 11, fontFamily: 'Inter' }}>
          {mood}
        </Text>
      )}
    </View>
  );
}
