import { View } from 'react-native';
import { theme } from '../../constants/theme';

export function SkeletonCard() {
  return (
    <View
      style={{
        borderRadius: 16,
        padding: 16,
        backgroundColor: theme.colors.surface,
        gap: 8,
      }}
    >
      <View style={{ height: 12, width: '40%', borderRadius: 6, backgroundColor: theme.colors.shine }} />
      <View style={{ height: 22, width: '70%', borderRadius: 6, backgroundColor: theme.colors.shine }} />
      <View style={{ height: 10, width: '90%', borderRadius: 6, backgroundColor: theme.colors.shine }} />
    </View>
  );
}
