import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ImageCard } from '../../components/cards';
import { MOCK_EXERCISE_LIBRARY } from '../../data';
import type { ExerciseLibraryItem } from '../../types';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'] as const;
const MUSCLE_MAP: Record<string, ExerciseLibraryItem['muscleGroup']> = {
  Chest: 'chest',
  Back: 'back',
  Shoulders: 'shoulders',
  Legs: 'legs',
  Arms: 'arms',
  Core: 'core',
  'Full Body': 'full_body',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#22ff73',
  intermediate: '#F97316',
  advanced: '#ff6b6b',
};

export default function LibraryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = MOCK_EXERCISE_LIBRARY;
    if (muscleFilter) {
      const mapped = MUSCLE_MAP[muscleFilter];
      items = items.filter((e) => e.muscleGroup === mapped);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (e) => e.name.toLowerCase().includes(q) || e.muscleGroup.includes(q) || e.equipment.includes(q),
      );
    }
    return items;
  }, [search, muscleFilter]);

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <ArrowLeft size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'InterBold' }}>
              Exercise Library
            </Text>
          </View>

          {/* Search */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              paddingHorizontal: 12,
            }}
          >
            <Search size={16} color="#827a89" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search exercises..."
              placeholderTextColor="#827a89"
              style={{ flex: 1, color: '#FFFFFF', fontFamily: 'Inter', fontSize: 14, paddingVertical: 10 }}
            />
          </View>

          {/* Filter pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {MUSCLE_GROUPS.map((mg) => {
              const active = muscleFilter === mg;
              return (
                <Pressable
                  key={mg}
                  onPress={() => setMuscleFilter(active ? null : mg)}
                  style={{
                    backgroundColor: active ? '#6c3bff' : 'rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderWidth: 1,
                    borderColor: active ? '#6c3bff' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : '#b39aff',
                      fontSize: 12,
                      fontFamily: 'JetBrainsMonoMedium',
                    }}
                  >
                    {mg}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Grid */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ImageCard
                imageUrl={item.imageUrl}
                title={item.name}
                badge={item.equipment}
                badgeColor={DIFFICULTY_COLORS[item.difficulty]}
                height={160}
                onPress={() => router.push(`/(screens)/exercise-detail?id=${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ color: '#827a89', fontSize: 14, fontFamily: 'Inter' }}>No exercises found</Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
