import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageCard } from '../../components/cards';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { PHASE_CONFIG } from '../../data';
import { useTrainingStore } from '../../stores/useTrainingStore';
import type { PhaseType } from '../../types';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: GENESIS_COLORS.success,
  intermediate: GENESIS_COLORS.warning,
  advanced: GENESIS_COLORS.error,
};

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exerciseCatalog, isCatalogLoading, fetchExerciseCatalog } = useTrainingStore();

  // If catalog is empty (e.g., deep link), fetch on mount
  useEffect(() => {
    if (exerciseCatalog.length === 0) {
      fetchExerciseCatalog();
    }
  }, []);

  const exercise = exerciseCatalog.find((e) => e.id === id);

  // Alternatives: same muscle group, exclude current exercise, take first 3
  const alternatives = useMemo(() => {
    if (!exercise) return [];
    return exerciseCatalog
      .filter((e) => e.id !== exercise.id && e.muscleGroup === exercise.muscleGroup)
      .slice(0, 3);
  }, [exercise, exerciseCatalog]);

  if (!exercise) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {isCatalogLoading ? (
          <ActivityIndicator size="large" color={GENESIS_COLORS.primary} />
        ) : (
          <Text style={{ color: GENESIS_COLORS.textTertiary, fontFamily: 'Inter', fontSize: 16 }}>Exercise not found</Text>
        )}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
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
                backgroundColor: GENESIS_COLORS.surfaceCard,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
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
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1.5, marginTop: 4 }}>
              {exercise.equipment.toUpperCase()}
            </Text>

            {/* Metadata pills — pill shape */}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <View style={{
                backgroundColor: GENESIS_COLORS.primaryDim,
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderActive,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}>
                <Text style={{
                  color: GENESIS_COLORS.primary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  textTransform: 'uppercase',
                }}>
                  {exercise.muscleGroup.replace('_', ' ')}
                </Text>
              </View>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}>
                <Text style={{
                  color: GENESIS_COLORS.textSecondary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  textTransform: 'uppercase',
                }}>
                  {exercise.equipment}
                </Text>
              </View>
              <View style={{
                backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] + '15',
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: DIFFICULTY_COLORS[exercise.difficulty] + '40',
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}>
                <Text style={{
                  color: DIFFICULTY_COLORS[exercise.difficulty],
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  textTransform: 'uppercase',
                }}>
                  {exercise.difficulty}
                </Text>
              </View>
            </View>

            {/* Form Cues */}
            <View style={{ gap: 10 }}>
              <Text style={{
                color: GENESIS_COLORS.textTertiary,
                fontSize: 10,
                fontFamily: 'JetBrainsMonoMedium',
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}>
                FORM CUES
              </Text>
              <GlassCard style={{ backgroundColor: GENESIS_COLORS.surfaceCard, borderRadius: 20 }}>
                <View style={{ gap: 10 }}>
                  {exercise.formCues.map((cue, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: GENESIS_COLORS.primaryDim, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                        <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoBold' }}>{i + 1}</Text>
                      </View>
                      <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 19, flex: 1 }}>
                        {cue}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </View>

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

            {/* Video CTA */}
            {exercise.videoUrl && (
              <Pressable
                onPress={() => router.push(`/(modals)/exercise-video?url=${encodeURIComponent(exercise.videoUrl)}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: GENESIS_COLORS.primary + '15',
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Play size={16} color={GENESIS_COLORS.primary} />
                <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold' }}>VER DEMO</Text>
              </Pressable>
            )}

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <View style={{ gap: 10 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
                  Alternatives
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {alternatives.map((alt) => (
                    <View key={alt.id} style={{ width: 170 }}>
                      <ImageCard
                        imageUrl={alt.imageUrl}
                        title={alt.name}
                        badge={alt.equipment}
                        badgeColor={DIFFICULTY_COLORS[alt.difficulty]}
                        height={140}
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
