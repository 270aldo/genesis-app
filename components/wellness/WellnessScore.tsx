import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { CircularProgress } from '../ui';

type WellnessScoreProps = {
  score: number;
};

export function WellnessScore({ score }: WellnessScoreProps) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, alignItems: 'center', gap: 8 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Wellness Score</Text>
      <CircularProgress value={score} label="Recovery" />
    </View>
  );
}
