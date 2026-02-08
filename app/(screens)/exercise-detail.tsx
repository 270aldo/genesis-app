import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageCard } from '../../components/cards';
import { GlassCard } from '../../components/ui';
import { MOCK_EXERCISE_LIBRARY, PHASE_CONFIG } from '../../data';
import type { PhaseType } from '../../types';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#22ff73',
  intermediate: '#F97316',
  advanced: '#ff6b6b',
};

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = MOCK_EXERCISE_LIBRARY.find((e) => e.id === id);

  if (!exercise) {
    return (
      <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#827a89', fontFamily: 'Inter', fontSize: 16 }}>Exercise not found</Text>
      </LinearGradient>
    );
  }

  const alternatives = MOCK_EXERCISE_LIBRARY.filter((e) => exercise.alternatives.includes(e.id));

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View>
            <ImageCard imageUrl={exercise.imageUrl} height={260} />
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                position: 'absolute',
                top: 12,
                left: 16,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(13,13,43,0.7)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 24 }}>
            {/* Name */}
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontFamily: 'InterBold' }}>
              {exercise.name}
            </Text>

            {/* Pills row */}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <View style={{ backgroundColor: '#6c3bff20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: '#b39aff', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                  {exercise.muscleGroup.replace('_', ' ')}
                </Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: '#c4bfcc', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                  {exercise.equipment}
                </Text>
              </View>
              <View style={{ backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: DIFFICULTY_COLORS[exercise.difficulty], fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                  {exercise.difficulty}
                </Text>
              </View>
            </View>

            {/* Form Cues */}
            <GlassCard>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold', marginBottom: 12 }}>
                Form Cues
              </Text>
              <View style={{ gap: 10 }}>
                {exercise.formCues.map((cue, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#6c3bff30', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                      <Text style={{ color: '#b39aff', fontSize: 11, fontFamily: 'JetBrainsMonoBold' }}>{i + 1}</Text>
                    </View>
                    <Text style={{ color: '#c4bfcc', fontSize: 13, fontFamily: 'Inter', lineHeight: 19, flex: 1 }}>
                      {cue}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            {/* Recommended Phases */}
            <View style={{ gap: 10 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
                Recommended Phases
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {exercise.recommendedPhases.map((p) => {
                  const cfg = PHASE_CONFIG[p as PhaseType];
                  return (
                    <View key={p} style={{ backgroundColor: cfg.color + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ color: cfg.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                        {cfg.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <View style={{ gap: 10 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
                  Alternatives
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {alternatives.map((alt) => (
                    <View key={alt.id} style={{ width: 150 }}>
                      <ImageCard
                        imageUrl={alt.imageUrl}
                        title={alt.name}
                        badge={alt.equipment}
                        badgeColor={DIFFICULTY_COLORS[alt.difficulty]}
                        height={120}
                        onPress={() => router.push(`/(screens)/exercise-detail?id=${alt.id}`)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
