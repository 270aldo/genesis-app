import { Image, ScrollView, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { ProgressPhoto } from '../../types';

type ProgressPhotosProps = {
  photos: ProgressPhoto[];
};

export function ProgressPhotos({ photos }: ProgressPhotosProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Progress Photos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {photos.map((photo, index) => (
          <View key={photo.id ?? `${photo.date}-${index}`} style={{ width: 120, gap: 4 }}>
            {photo.uri ? (
              <Image source={{ uri: photo.uri }} style={{ width: 120, height: 120, borderRadius: 12 }} />
            ) : (
              <View style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: '#1a1a3e' }} />
            )}
            <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{photo.category}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
