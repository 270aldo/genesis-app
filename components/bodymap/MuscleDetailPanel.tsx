import { useCallback, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { GENESIS_COLORS, BODY_MAP_COLORS } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';
import type { MuscleRecoveryInfo } from '../../utils/muscleRecovery';

const STATUS_LABELS: Record<string, string> = {
  inactive: 'Sin actividad reciente',
  recovered: 'Recuperado',
  active: 'Activo recientemente',
  soreness: 'Posible dolor muscular',
};

const STATUS_COLORS: Record<string, string> = {
  inactive: GENESIS_COLORS.textMuted,
  recovered: GENESIS_COLORS.success,
  active: GENESIS_COLORS.primary,
  soreness: GENESIS_COLORS.error,
};

interface MuscleDetailPanelProps {
  muscle: MuscleRecoveryInfo | null;
  onClose: () => void;
}

export function MuscleDetailPanel({ muscle, onClose }: MuscleDetailPanelProps) {
  const translateY = useSharedValue(200);

  useEffect(() => {
    translateY.value = withSpring(muscle ? 0 : 200, { damping: 20, stiffness: 200 });
  }, [muscle, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: translateY.value < 100 ? 1 : 0,
  }));

  const handleClose = useCallback(() => {
    hapticLight();
    onClose();
  }, [onClose]);

  if (!muscle) return null;

  const statusColor = STATUS_COLORS[muscle.status] ?? GENESIS_COLORS.textMuted;
  const statusLabel = STATUS_LABELS[muscle.status] ?? '';
  const daysText = muscle.daysSinceTraining >= 99
    ? 'No registrado'
    : muscle.daysSinceTraining === 0
      ? 'Hoy'
      : `Hace ${muscle.daysSinceTraining} ${muscle.daysSinceTraining === 1 ? 'día' : 'días'}`;

  return (
    <Animated.View
      style={[
        animStyle,
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 20,
        },
      ]}
    >
      <View
        style={{
          backgroundColor: GENESIS_COLORS.surfaceCard,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: GENESIS_COLORS.borderSubtle,
          padding: 16,
          gap: 12,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'InterBold' }}>
            {muscle.muscleGroupLabel}
          </Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <X size={18} color={GENESIS_COLORS.textMuted} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: BODY_MAP_COLORS[muscle.status],
            }}
          />
          <Text style={{ color: statusColor, fontSize: 13, fontFamily: 'InterSemiBold' }}>
            {statusLabel}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium', textTransform: 'uppercase' }}>
              Último entrenamiento
            </Text>
            <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter' }}>
              {daysText}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
