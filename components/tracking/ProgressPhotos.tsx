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
        {photos.map((photo) => (
          <View key={`${photo.date}-${photo.angle}`} style={{ width: 120, gap: 4 }}>
            <Image source={{ uri: photo.url }} style={{ width: 120, height: 120, borderRadius: 12 }} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{photo.angle}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
