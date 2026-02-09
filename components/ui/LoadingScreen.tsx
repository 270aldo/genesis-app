import { ActivityIndicator, Text, View } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <ActivityIndicator size="large" color={GENESIS_COLORS.primary} />
      <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>
        {message}
      </Text>
    </View>
  );
}
