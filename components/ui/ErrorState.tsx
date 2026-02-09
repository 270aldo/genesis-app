import { Pressable, Text, View } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { GlassCard } from './GlassCard';

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = 'Algo salió mal.', onRetry }: ErrorStateProps) {
  return (
    <GlassCard>
      <View style={{ alignItems: 'center', gap: 12, paddingVertical: 20 }}>
        <AlertCircle size={32} color={GENESIS_COLORS.error} />
        <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', textAlign: 'center' }}>
          {message}
        </Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: GENESIS_COLORS.primaryDim,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <RefreshCw size={14} color={GENESIS_COLORS.primary} />
            <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>
              Reintentar
            </Text>
          </Pressable>
        )}
      </View>
    </GlassCard>
  );
}
