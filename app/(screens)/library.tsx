import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ImageCard } from '../../components/cards';
import { GENESIS_COLORS } from '../../constants/colors';
import { useTrainingStore } from '../../stores/useTrainingStore';
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
  beginner: GENESIS_COLORS.success,
  intermediate: GENESIS_COLORS.warning,
  advanced: GENESIS_COLORS.error,
};

export default function LibraryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const { exerciseCatalog, isCatalogLoading, fetchExerciseCatalog } = useTrainingStore();

  useEffect(() => {
    fetchExerciseCatalog();
  }, []);

  const filtered = useMemo(() => {
    let items = exerciseCatalog;
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
  }, [search, muscleFilter, exerciseCatalog]);

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
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

          {/* Search with focus state */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: GENESIS_COLORS.surfaceCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isFocused ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
              paddingHorizontal: 12,
            }}
          >
            <Search size={16} color={GENESIS_COLORS.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search exercises..."
              placeholderTextColor={GENESIS_COLORS.textMuted}
              style={{ flex: 1, color: '#FFFFFF', fontFamily: 'Inter', fontSize: 14, paddingVertical: 10 }}
            />
          </View>

          {/* Filter pills — pill shape with glow */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {MUSCLE_GROUPS.map((mg) => {
              const active = muscleFilter === mg;
              return (
                <Pressable
                  key={mg}
                  onPress={() => setMuscleFilter(active ? null : mg)}
                  style={[
                    {
                      backgroundColor: active ? GENESIS_COLORS.primary : 'rgba(255,255,255,0.05)',
                      borderRadius: 9999,
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderWidth: 1,
                      borderColor: active ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
                    },
                    active ? {
                      shadowColor: GENESIS_COLORS.primary,
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 4,
                    } : {},
                  ]}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : GENESIS_COLORS.textMuted,
                      fontSize: 10,
                      fontFamily: 'JetBrainsMonoMedium',
                      textTransform: 'uppercase',
                    }}
                  >
                    {mg}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Grid — height 180 */}
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
                height={180}
                onPress={() => router.push(`/(screens)/exercise-detail?id=${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              {isCatalogLoading ? (
                <ActivityIndicator size="large" color={GENESIS_COLORS.primary} />
              ) : (
                <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 14, fontFamily: 'Inter' }}>No exercises found</Text>
              )}
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
