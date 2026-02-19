import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowLeft, ChevronRight, Play, Sparkles } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageCard } from '../../components/cards';
import { GlassCard } from '../../components/ui';
import { FormCues } from '../../components/training/FormCues';
import { GENESIS_COLORS, getMuscleGroupColor } from '../../constants/colors';
import { PHASE_CONFIG, GENESIS_TIPS } from '../../data';
import { useTrainingStore } from '../../stores/useTrainingStore';
import { useSeasonStore } from '../../stores/useSeasonStore';
import { getExerciseImage } from '../../utils/exerciseImages';
import type { PhaseType } from '../../types';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: GENESIS_COLORS.success,
  intermediate: GENESIS_COLORS.warning,
  advanced: GENESIS_COLORS.error,
};

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exerciseCatalog, isCatalogLoading, fetchExerciseCatalog, getPreviousExerciseData } =
    useTrainingStore();
  const currentPhase = useSeasonStore((s) => s.currentPhase) as PhaseType;

  useEffect(() => {
    if (exerciseCatalog.length === 0) {
      fetchExerciseCatalog();
    }
  }, []);

  const exercise = exerciseCatalog.find((e) => e.id === id);
  const muscleColor = exercise ? getMuscleGroupColor(exercise.muscleGroup) : GENESIS_COLORS.primary;
  const phaseConfig = PHASE_CONFIG[currentPhase] ?? PHASE_CONFIG.hypertrophy;
  const isCompound = exercise ? exercise.secondaryMuscles.length > 0 : false;

  // History — last session data per exercise
  const previousData = useMemo(() => getPreviousExerciseData(), []);
  const exerciseHistory = exercise ? previousData[exercise.id] : undefined;

  // GENESIS Pro Tip — random per phase, stable per mount
  const genesisTip = useMemo(() => {
    const tips = GENESIS_TIPS[currentPhase] ?? GENESIS_TIPS.hypertrophy;
    return tips[Math.floor(Math.random() * tips.length)];
  }, [currentPhase]);

  // Alternatives: same muscle group, exclude current, take 6
  const alternatives = useMemo(() => {
    if (!exercise) return [];
    return exerciseCatalog
      .filter((e) => e.id !== exercise.id && e.muscleGroup === exercise.muscleGroup)
      .slice(0, 6);
  }, [exercise, exerciseCatalog]);

  if (!exercise) {
    return (
      <LinearGradient
        colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        {isCatalogLoading ? (
          <ActivityIndicator size="large" color={GENESIS_COLORS.primary} />
        ) : (
          <Text style={{ color: GENESIS_COLORS.textTertiary, fontFamily: 'Inter', fontSize: 16 }}>
            Exercise not found
          </Text>
        )}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* ── A: Enhanced Hero ── */}
          <View>
            <ImageCard
              imageUrl={exercise.imageUrl || getExerciseImage(exercise.name, exercise.muscleGroup)}
              height={280}
              overlayColors={['transparent', 'rgba(0,0,0,0.4)', muscleColor + 'CC']}
            />

            {/* Back button */}
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

            {/* Floating pills — equipment + difficulty */}
            <View style={{ position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', gap: 8 }}>
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontFamily: 'JetBrainsMonoMedium',
                    textTransform: 'uppercase',
                  }}
                >
                  {exercise.equipment}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] + '30',
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: DIFFICULTY_COLORS[exercise.difficulty] + '50',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: DIFFICULTY_COLORS[exercise.difficulty],
                    fontSize: 10,
                    fontFamily: 'JetBrainsMonoMedium',
                    textTransform: 'uppercase',
                  }}
                >
                  {exercise.difficulty}
                </Text>
              </View>
            </View>

            {/* H: Video CTA — floating circle */}
            {exercise.videoUrl ? (
              <Pressable
                onPress={() =>
                  router.push(
                    `/(modals)/exercise-video?url=${encodeURIComponent(exercise.videoUrl)}`,
                  )
                }
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              </Pressable>
            ) : null}
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 24 }}>
            {/* ── A2: Title + Classification Pill ── */}
            <View style={{ gap: 8 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 26, fontFamily: 'InterBold' }}>
                {exercise.name}
              </Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  borderWidth: 1,
                  borderColor: GENESIS_COLORS.textMuted,
                  borderRadius: 9999,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    color: GENESIS_COLORS.textTertiary,
                    fontSize: 9,
                    fontFamily: 'JetBrainsMonoMedium',
                    letterSpacing: 1.5,
                  }}
                >
                  {isCompound ? 'COMPOUND' : 'ISOLATION'}
                </Text>
              </View>
            </View>

            {/* ── B: Muscles Targeted ── */}
            <View style={{ gap: 10 }}>
              <Text
                style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  letterSpacing: 2,
                }}
              >
                MUSCLES TARGETED
              </Text>
              <GlassCard style={{ backgroundColor: '#000000', borderRadius: 20, borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
                <View style={{ gap: 12 }}>
                  {/* Primary muscle */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: muscleColor,
                      }}
                    />
                    <Text
                      style={{
                        color: muscleColor,
                        fontSize: 13,
                        fontFamily: 'InterBold',
                        textTransform: 'uppercase',
                      }}
                    >
                      {exercise.muscleGroup.replace('_', ' ')}
                    </Text>
                    <Text
                      style={{
                        color: GENESIS_COLORS.textMuted,
                        fontSize: 10,
                        fontFamily: 'JetBrainsMonoMedium',
                      }}
                    >
                      PRIMARY
                    </Text>
                  </View>

                  {/* Secondary muscles with individual colors */}
                  {exercise.secondaryMuscles.length > 0 && (
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                      {exercise.secondaryMuscles.map((muscle) => {
                        const mColor = getMuscleGroupColor(muscle);
                        return (
                          <View
                            key={muscle}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 5,
                              backgroundColor: mColor + '12',
                              borderRadius: 9999,
                              paddingHorizontal: 9,
                              paddingVertical: 3,
                            }}
                          >
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: mColor + '80',
                              }}
                            />
                            <Text
                              style={{
                                color: mColor,
                                fontSize: 10,
                                fontFamily: 'JetBrainsMonoMedium',
                                textTransform: 'uppercase',
                              }}
                            >
                              {muscle.replace('_', ' ')}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Equipment + Difficulty pills inside card */}
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 8,
                      borderTopWidth: 1,
                      borderTopColor: GENESIS_COLORS.borderSubtle,
                      paddingTop: 10,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: 9999,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: GENESIS_COLORS.textSecondary,
                          fontSize: 10,
                          fontFamily: 'JetBrainsMonoMedium',
                          textTransform: 'uppercase',
                        }}
                      >
                        {exercise.equipment}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] + '15',
                        borderRadius: 9999,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: DIFFICULTY_COLORS[exercise.difficulty],
                          fontSize: 10,
                          fontFamily: 'JetBrainsMonoMedium',
                          textTransform: 'uppercase',
                        }}
                      >
                        {exercise.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </View>

            {/* ── C: Your History ── */}
            <View style={{ gap: 10 }}>
              <Text
                style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  letterSpacing: 2,
                }}
              >
                TU HISTORIAL
              </Text>
              <GlassCard style={{ backgroundColor: '#000000', borderRadius: 20, borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
                {exerciseHistory && exerciseHistory.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    <Text
                      style={{
                        color: GENESIS_COLORS.textMuted,
                        fontSize: 9,
                        fontFamily: 'JetBrainsMonoMedium',
                        letterSpacing: 1,
                      }}
                    >
                      ÚLTIMA SESIÓN
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {exerciseHistory.map((set, i) => (
                        <View
                          key={i}
                          style={{
                            flexBasis: '47%',
                            flexGrow: 1,
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            borderRadius: 10,
                            padding: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: GENESIS_COLORS.textMuted,
                              fontSize: 9,
                              fontFamily: 'JetBrainsMonoMedium',
                            }}
                          >
                            SET {i + 1}
                          </Text>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 14,
                              fontFamily: 'InterBold',
                              marginTop: 2,
                            }}
                          >
                            {set.weight} kg × {set.reps}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text
                    style={{
                      color: GENESIS_COLORS.textMuted,
                      fontSize: 13,
                      fontFamily: 'Inter',
                      textAlign: 'center',
                      paddingVertical: 8,
                    }}
                  >
                    Sin historial para este ejercicio
                  </Text>
                )}
              </GlassCard>
            </View>

            {/* ── D: Form Cues — reuse existing component ── */}
            {exercise.formCues.length > 0 && (
              <View style={{ gap: 10 }}>
                <Text
                  style={{
                    color: GENESIS_COLORS.textTertiary,
                    fontSize: 10,
                    fontFamily: 'JetBrainsMonoMedium',
                    letterSpacing: 2,
                  }}
                >
                  FORM CUES
                </Text>
                <FormCues cues={exercise.formCues} />
              </View>
            )}

            {/* ── E: Phase Prescriptions — current phase highlighted ── */}
            <View style={{ gap: 10 }}>
              <Text
                style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  letterSpacing: 2,
                }}
              >
                PHASE PRESCRIPTIONS
              </Text>
              <GlassCard style={{ backgroundColor: '#000000', borderRadius: 20, borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
                <View style={{ gap: 6 }}>
                  {(Object.keys(PHASE_CONFIG) as PhaseType[]).map((phaseKey) => {
                    const cfg = PHASE_CONFIG[phaseKey];
                    const isCurrent = phaseKey === currentPhase;
                    return (
                      <View
                        key={phaseKey}
                        style={[
                          { flexDirection: 'row', alignItems: 'center', gap: 10 },
                          isCurrent && {
                            backgroundColor: cfg.accentColor + '15',
                            borderRadius: 8,
                            paddingVertical: 6,
                            paddingHorizontal: 6,
                          },
                        ]}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: cfg.accentColor,
                          }}
                        />
                        <Text
                          style={{
                            color: isCurrent ? '#FFFFFF' : GENESIS_COLORS.textSecondary,
                            fontSize: 12,
                            fontFamily: 'InterBold',
                            width: 100,
                            textTransform: 'uppercase',
                          }}
                        >
                          {cfg.label}
                        </Text>
                        {isCurrent && (
                          <View
                            style={{
                              backgroundColor: cfg.accentColor + '30',
                              borderRadius: 4,
                              paddingHorizontal: 5,
                              paddingVertical: 1,
                            }}
                          >
                            <Text
                              style={{
                                color: cfg.accentColor,
                                fontSize: 8,
                                fontFamily: 'JetBrainsMonoBold',
                              }}
                            >
                              ACTUAL
                            </Text>
                          </View>
                        )}
                        <Text
                          style={{
                            color: GENESIS_COLORS.textSecondary,
                            fontSize: 12,
                            fontFamily: 'JetBrainsMonoMedium',
                            flex: 1,
                            textAlign: 'right',
                          }}
                        >
                          {cfg.repRange} reps {'\u00B7'} {cfg.setsRange} sets
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </GlassCard>
            </View>

            {/* ── F: GENESIS Pro Tip ── */}
            <View style={{ gap: 10 }}>
              <Text
                style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  letterSpacing: 2,
                }}
              >
                GENESIS PRO TIP
              </Text>
              <GlassCard
                style={{
                  backgroundColor: '#000000',
                  borderRadius: 20,
                  borderColor: GENESIS_COLORS.primary,
                  borderWidth: 1,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Sparkles size={16} color={phaseConfig.accentColor} style={{ marginTop: 2 }} />
                  <Text
                    style={{
                      flex: 1,
                      color: GENESIS_COLORS.textSecondary,
                      fontSize: 13,
                      fontFamily: 'Inter',
                      fontStyle: 'italic',
                      lineHeight: 19,
                    }}
                  >
                    &ldquo;{genesisTip}&rdquo;
                  </Text>
                </View>
              </GlassCard>
            </View>

            {/* ── G: Alternatives — Rich Vertical Cards ── */}
            {alternatives.length > 0 && (
              <View style={{ gap: 10 }}>
                <Text
                  style={{
                    color: GENESIS_COLORS.textTertiary,
                    fontSize: 10,
                    fontFamily: 'JetBrainsMonoMedium',
                    letterSpacing: 2,
                  }}
                >
                  ALTERNATIVAS
                </Text>
                <View style={{ gap: 8 }}>
                  {alternatives.map((alt) => {
                    const altDiffColor = DIFFICULTY_COLORS[alt.difficulty] ?? GENESIS_COLORS.textMuted;
                    return (
                      <Pressable
                        key={alt.id}
                        onPress={() => router.push(`/(screens)/exercise-detail?id=${alt.id}`)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          backgroundColor: '#000000',
                          borderWidth: 1,
                          borderColor: GENESIS_COLORS.primary + '30',
                          borderRadius: 14,
                          padding: 12,
                        }}
                      >
                        <Image
                          source={{
                            uri: alt.imageUrl || getExerciseImage(alt.name, alt.muscleGroup),
                          }}
                          style={{ width: 52, height: 52, borderRadius: 12 }}
                          contentFit="cover"
                        />
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text
                            style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}
                            numberOfLines={1}
                          >
                            {alt.name}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <View
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                borderRadius: 9999,
                                paddingHorizontal: 7,
                                paddingVertical: 2,
                              }}
                            >
                              <Text
                                style={{
                                  color: GENESIS_COLORS.textSecondary,
                                  fontSize: 9,
                                  fontFamily: 'JetBrainsMonoMedium',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {alt.equipment}
                              </Text>
                            </View>
                            <View
                              style={{
                                backgroundColor: altDiffColor + '15',
                                borderRadius: 9999,
                                paddingHorizontal: 7,
                                paddingVertical: 2,
                              }}
                            >
                              <Text
                                style={{
                                  color: altDiffColor,
                                  fontSize: 9,
                                  fontFamily: 'JetBrainsMonoMedium',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {alt.difficulty}
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={{
                              color: GENESIS_COLORS.textMuted,
                              fontSize: 11,
                              fontFamily: 'Inter',
                            }}
                            numberOfLines={1}
                          >
                            {alt.muscleGroup.replace('_', ' ')}
                            {alt.secondaryMuscles.length > 0
                              ? ` \u00B7 ${alt.secondaryMuscles.map((m) => m.replace('_', ' ')).join(', ')}`
                              : ''}
                          </Text>
                        </View>
                        <ChevronRight size={16} color={GENESIS_COLORS.textMuted} />
                      </Pressable>
                    );
                  })}
                </View>

                {/* Library link */}
                <Pressable
                  onPress={() =>
                    router.push(`/(screens)/library?muscle=${exercise.muscleGroup}`)
                  }
                  style={{ alignItems: 'center', paddingVertical: 8 }}
                >
                  <Text
                    style={{
                      color: GENESIS_COLORS.primary,
                      fontSize: 13,
                      fontFamily: 'JetBrainsMonoSemiBold',
                    }}
                  >
                    Ver librería completa →
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
