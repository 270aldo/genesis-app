import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type RecoveryCardProps = {
  recommendations: string[];
};

export function RecoveryCard({ recommendations }: RecoveryCardProps) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 6 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Recovery recommendations</Text>
      {recommendations.map((item) => (
        <Text key={item} style={{ color: theme.colors.textSecondary }}>
          • {item}
        </Text>
      ))}
    </View>
  );
}
