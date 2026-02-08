import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ImageCard } from '../../components/cards';
import { MOCK_EDUCATION, PHASE_CONFIG } from '../../data';
import { useSeasonStore } from '../../stores';
import type { PhaseType } from '../../types';

const CATEGORIES = ['Training', 'Nutrition', 'Recovery', 'Mindset', 'Science'] as const;
const CATEGORY_MAP: Record<string, string> = {
  Training: 'training',
  Nutrition: 'nutrition',
  Recovery: 'recovery',
  Mindset: 'mindset',
  Science: 'science',
};

const TYPE_LABELS: Record<string, string> = {
  micro_lesson: 'Micro Lesson',
  video_course: 'Video Course',
  deep_dive: 'Deep Dive',
  genesis_explains: 'GENESIS Explains',
};

export default function EducationScreen() {
  const router = useRouter();
  const { currentPhase } = useSeasonStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = MOCK_EDUCATION;
    if (categoryFilter) {
      const mapped = CATEGORY_MAP[categoryFilter];
      items = items.filter((e) => e.category === mapped);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (e) => e.title.toLowerCase().includes(q) || e.subtitle.toLowerCase().includes(q),
      );
    }
    return items;
  }, [search, categoryFilter]);

  // Featured: first phase-relevant item
  const featured = useMemo(() => {
    return filtered.find((e) => e.relevantPhases.includes(phase)) ?? filtered[0];
  }, [filtered, phase]);

  const rest = useMemo(() => {
    return filtered.filter((e) => e.id !== featured?.id);
  }, [filtered, featured]);

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <ArrowLeft size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'InterBold' }}>
              GENESIS Academy
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
              placeholder="Search content..."
              placeholderTextColor="#827a89"
              style={{ flex: 1, color: '#FFFFFF', fontFamily: 'Inter', fontSize: 14, paddingVertical: 10 }}
            />
          </View>

          {/* Category pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CATEGORIES.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategoryFilter(active ? null : cat)}
                  style={{
                    backgroundColor: active ? phaseConfig.color : 'rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderWidth: 1,
                    borderColor: active ? phaseConfig.color : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : phaseConfig.accentColor,
                      fontSize: 12,
                      fontFamily: 'JetBrainsMonoMedium',
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Featured */}
          {featured && (
            <ImageCard
              imageUrl={featured.imageUrl}
              title={featured.title}
              subtitle={featured.subtitle}
              badge={featured.duration}
              badgeColor={phaseConfig.color}
              height={200}
              onPress={() => router.push(`/(screens)/education-detail?id=${featured.id}`)}
            >
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ backgroundColor: phaseConfig.color + '30', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: phaseConfig.accentColor, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                      {TYPE_LABELS[featured.type] ?? featured.type}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: '#c4bfcc', fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>{featured.duration}</Text>
                  </View>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>
                  {featured.title}
                </Text>
                <Text style={{ color: '#827a89', fontSize: 12, fontFamily: 'Inter' }}>
                  {featured.subtitle}
                </Text>
              </View>
            </ImageCard>
          )}

          {/* Rest of content */}
          {rest.map((item) => (
            <ImageCard
              key={item.id}
              imageUrl={item.imageUrl}
              title={item.title}
              badge={item.duration}
              badgeColor={phaseConfig.color}
              height={120}
              onPress={() => router.push(`/(screens)/education-detail?id=${item.id}`)}
            >
              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <View style={{ backgroundColor: phaseConfig.color + '30', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: phaseConfig.accentColor, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>
                      {TYPE_LABELS[item.type] ?? item.type}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'Inter' }} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
            </ImageCard>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
