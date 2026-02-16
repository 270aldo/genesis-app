import { Text, View } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';

type CoachReviewBadgeProps = {
  visible: boolean;
};

export function CoachReviewBadge({ visible }: CoachReviewBadgeProps) {
  if (!visible) return null;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: GENESIS_COLORS.success + '15',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignSelf: 'flex-start',
    }}>
      <CheckCircle size={14} color={GENESIS_COLORS.success} />
      <Text style={{ color: GENESIS_COLORS.success, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
        Revisado por Coach
      </Text>
    </View>
  );
}
