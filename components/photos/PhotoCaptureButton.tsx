import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticMedium } from '../../utils/haptics';

interface PhotoCaptureButtonProps {
  onPress: () => void;
}

export function PhotoCaptureButton({ onPress }: PhotoCaptureButtonProps) {
  return (
    <Pressable
      onPress={() => {
        hapticMedium();
        onPress();
      }}
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        shadowColor: GENESIS_COLORS.primary,
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Camera size={20} color="#FFFFFF" />
      </LinearGradient>
    </Pressable>
  );
}
