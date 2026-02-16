import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';
import type { ProgressPhoto } from '../../types';

interface PhotoComparatorProps {
  photoLeft: ProgressPhoto | null;
  photoRight: ProgressPhoto | null;
  onClose: () => void;
}

export function PhotoComparator({ photoLeft, photoRight, onClose }: PhotoComparatorProps) {
  if (!photoLeft || !photoRight) return null;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 100,
      }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'InterBold' }}>Comparar</Text>
          <Pressable
            onPress={() => {
              hapticLight();
              onClose();
            }}
            hitSlop={12}
          >
            <X size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* 50/50 split */}
        <View style={{ flex: 1, flexDirection: 'row', gap: 2 }}>
          {/* Left */}
          <View style={{ flex: 1 }}>
            {photoLeft.uri ? (
              <Image source={{ uri: photoLeft.uri }} style={{ flex: 1 }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, backgroundColor: GENESIS_COLORS.surfaceCard, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 12 }}>Sin imagen</Text>
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'JetBrainsMonoMedium', textAlign: 'center' }}>
                  {formatDate(photoLeft.date)}
                </Text>
              </View>
            </View>
          </View>

          {/* Right */}
          <View style={{ flex: 1 }}>
            {photoRight.uri ? (
              <Image source={{ uri: photoRight.uri }} style={{ flex: 1 }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, backgroundColor: GENESIS_COLORS.surfaceCard, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 12 }}>Sin imagen</Text>
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'JetBrainsMonoMedium', textAlign: 'center' }}>
                  {formatDate(photoRight.date)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
