import { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Camera, Trash2 } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticSelection } from '../../utils/haptics';
import type { ProgressPhoto, Week } from '../../types';

const CATEGORIES = ['all', 'front', 'side', 'back', 'other'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  all: 'Todas',
  front: 'Frontal',
  side: 'Lateral',
  back: 'Espalda',
  other: 'Otra',
};

type GalleryItem =
  | { type: 'header'; title: string; key: string }
  | { type: 'photo'; photo: ProgressPhoto; key: string };

interface PhotoGalleryProps {
  photos: ProgressPhoto[];
  weeks: Week[];
  onDeletePhoto?: (id: string, storagePath: string) => void;
}

export function PhotoGallery({ photos, weeks, onDeletePhoto }: PhotoGalleryProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredPhotos = useMemo(() => {
    if (categoryFilter === 'all') return photos;
    return photos.filter((p) => p.category === categoryFilter);
  }, [photos, categoryFilter]);

  // Group photos by training phase using weeks
  const galleryItems = useMemo((): GalleryItem[] => {
    if (filteredPhotos.length === 0) return [];

    const items: GalleryItem[] = [];
    const photosByPhase: Record<string, ProgressPhoto[]> = {};

    for (const photo of filteredPhotos) {
      const photoDate = new Date(photo.date);
      let phaseName = 'Sin fase';

      for (const week of weeks) {
        const start = new Date(week.startDate);
        const end = new Date(week.endDate);
        if (photoDate >= start && photoDate <= end) {
          phaseName = `Sem ${week.number} · ${week.phase.charAt(0).toUpperCase() + week.phase.slice(1)}`;
          break;
        }
      }

      if (!photosByPhase[phaseName]) photosByPhase[phaseName] = [];
      photosByPhase[phaseName].push(photo);
    }

    for (const [phase, phasePhotos] of Object.entries(photosByPhase)) {
      items.push({ type: 'header', title: phase, key: `header-${phase}` });

      // Pad to multiples of 3 for grid layout
      for (const photo of phasePhotos) {
        items.push({ type: 'photo', photo, key: photo.id ?? `photo-${photo.date}` });
      }
    }

    return items;
  }, [filteredPhotos, weeks]);

  return (
    <View style={{ gap: 12 }}>
      {/* Category filter chips */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {CATEGORIES.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => {
                hapticSelection();
                setCategoryFilter(cat);
              }}
              style={{
                backgroundColor: active ? GENESIS_COLORS.primary + '25' : 'rgba(255,255,255,0.05)',
                borderRadius: 9999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: active ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
              }}
            >
              <Text
                style={{
                  color: active ? GENESIS_COLORS.primary : GENESIS_COLORS.textMuted,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  textTransform: 'uppercase',
                }}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 3-column grid with section headers */}
      {galleryItems.length > 0 ? (
        <FlatList
          data={galleryItems}
          keyExtractor={(item) => item.key}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 4 }}
          columnWrapperStyle={{ gap: 4 }}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={{ width: '100%', paddingVertical: 8, paddingTop: 12 }}>
                  <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1, textTransform: 'uppercase' }}>
                    {item.title}
                  </Text>
                </View>
              );
            }

            const photo = item.photo;
            return (
              <View style={{ flex: 1, aspectRatio: 3 / 4, borderRadius: 8, overflow: 'hidden' }}>
                {photo.uri ? (
                  <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View style={{ width: '100%', height: '100%', backgroundColor: GENESIS_COLORS.primary + '10', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={20} color={GENESIS_COLORS.textTertiary} />
                  </View>
                )}

                {/* Category badge */}
                <View style={{ position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                  <Text style={{ color: '#FFF', fontSize: 7, fontFamily: 'JetBrainsMonoMedium', textTransform: 'uppercase' }}>{photo.category}</Text>
                </View>

                {/* Delete button */}
                {photo.id && onDeletePhoto && (
                  <Pressable
                    onPress={() => onDeletePhoto(photo.id!, photo.storagePath)}
                    style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: 3 }}
                    hitSlop={6}
                  >
                    <Trash2 size={10} color="#FF6B6B" />
                  </Pressable>
                )}

                {/* Date */}
                <View style={{ position: 'absolute', bottom: 4, left: 4, right: 4 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 8, fontFamily: 'JetBrainsMonoMedium', textAlign: 'center' }}>
                    {new Date(photo.date).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 13, fontFamily: 'Inter' }}>
            Sin fotos en esta categoría
          </Text>
        </View>
      )}
    </View>
  );
}
