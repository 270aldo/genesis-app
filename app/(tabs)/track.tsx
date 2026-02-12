import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Trophy, Target, Calendar, Zap, Camera, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  GlassCard,
  ScoreCard,
  ScreenHeader,
  SectionLabel,
  SimpleBarChart,
  SeasonHeader,
  ProgressBar,
} from '../../components/ui';
import { ImageCard } from '../../components/cards';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore, useTrackStore, useTrainingStore } from '../../stores';
import { PHASE_CONFIG, IMAGES } from '../../data';
import type { PhaseType } from '../../types';

export default function TrackScreen() {
  const { seasonNumber, currentWeek, currentPhase, weeks, progressPercent } = useSeasonStore();
  const {
    personalRecords,
    photos,
    completedWorkouts,
    totalPlanned,
    strengthProgress,
    streak,
    isLoading: isTrackLoading,
    fetchPersonalRecords,
    fetchPhotos,
    addPhoto,
    deletePhoto,
    fetchTrackStats,
    fetchStrengthProgress,
    fetchStreak,
  } = useTrackStore();
  const { fetchPreviousSessions } = useTrainingStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  useEffect(() => {
    fetchPersonalRecords();
    fetchPhotos();
    fetchTrackStats();
    fetchStrengthProgress();
    fetchStreak();
    fetchPreviousSessions();
  }, []);

  const handlePickPhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      await addPhoto(result.assets[0].uri, 'front');
    }
  }, [addPhoto]);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      await addPhoto(result.assets[0].uri, 'front');
    }
  }, [addPhoto]);

  // Real stats
  const adherence = totalPlanned > 0 ? Math.round((completedWorkouts / totalPlanned) * 100) : 0;
  const totalPRs = personalRecords.length;

  // Strength chart data from store
  const chartData = strengthProgress.dataPoints;

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Season Header */}
          <SeasonHeader
            seasonNumber={seasonNumber}
            currentWeek={currentWeek}
            currentPhase={phase}
            weeks={weeks}
          />

          <ScreenHeader title="Progress" subtitle="Tu temporada a detalle" />

          {isTrackLoading && (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator size="small" color={GENESIS_COLORS.primary} />
            </View>
          )}

          {/* Season Overview Hero */}
          <ImageCard
            imageUrl={IMAGES.hero_track}
            height={160}
            overlayColors={['transparent', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.95)']}
          >
            <View style={{ gap: 8 }}>
              <Text style={{ color: phaseConfig.accentColor, fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
                SEASON {seasonNumber} · SEMANA {currentWeek}/12
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'InterBold' }}>
                {progressPercent}% Completado
              </Text>
              <ProgressBar progress={progressPercent || 18} gradient />
            </View>
          </ImageCard>

          {/* Season Stats */}
          <SectionLabel title="STATS">
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <ScoreCard
                icon={<Calendar size={20} color={phaseConfig.accentColor} />}
                value={`${completedWorkouts}`}
                label="WORKOUTS"
                iconBgColor={phaseConfig.color + '20'}
              />
              <ScoreCard
                icon={<Trophy size={20} color="#FFD700" />}
                value={`${totalPRs}`}
                label="PRs"
                iconBgColor="#FFD70020"
              />
              <ScoreCard
                icon={<Target size={20} color={GENESIS_COLORS.success} />}
                value={`${adherence}%`}
                label="ADHERENCE"
                iconBgColor={GENESIS_COLORS.success + '20'}
              />
            </View>
          </SectionLabel>

          {/* Strength Chart */}
          <SectionLabel title={strengthProgress.exerciseName ? `${strengthProgress.exerciseName.toUpperCase()} TREND` : 'STRENGTH TREND'}>
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color={GENESIS_COLORS.success} />
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Progresion</Text>
                </View>
                <Text style={{ color: GENESIS_COLORS.success, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                  {strengthProgress.changePercent > 0 ? `+${strengthProgress.changePercent}% este season` : 'Sin datos aun'}
                </Text>
              </View>
              {chartData.length > 0 ? (
                <SimpleBarChart data={chartData} />
              ) : (
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', textAlign: 'center', paddingVertical: 16 }}>
                  Completa mas sesiones para ver tu progresion de fuerza.
                </Text>
              )}
            </GlassCard>
          </SectionLabel>

          {/* Personal Records */}
          <SectionLabel title="PERSONAL RECORDS">
            <View style={{ gap: 12 }}>
              {personalRecords.length > 0 ? (
                personalRecords.map((pr) => (
                  <GlassCard key={`${pr.exerciseId}-${pr.type}`}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFD70020', alignItems: 'center', justifyContent: 'center' }}>
                          <Trophy size={18} color="#FFD700" />
                        </View>
                        <View style={{ gap: 2 }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{pr.exerciseName}</Text>
                          <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                            {pr.type} · {new Date(pr.achievedAt).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: '#FFD700', fontSize: 16, fontFamily: 'InterBold' }}>
                        {pr.value} {pr.type === 'weight' ? 'kg' : pr.type === 'time' ? 's' : ''}
                      </Text>
                    </View>
                  </GlassCard>
                ))
              ) : (
                <GlassCard>
                  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', textAlign: 'center' }}>
                    Completa sesiones para desbloquear tus records personales.
                  </Text>
                </GlassCard>
              )}
            </View>
          </SectionLabel>

          {/* Progress Photos */}
          <SectionLabel title="PROGRESS PHOTOS">
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={handleTakePhoto}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: `${GENESIS_COLORS.primary}20`,
                    borderWidth: 1,
                    borderColor: `${GENESIS_COLORS.primary}40`,
                  }}
                >
                  <Camera size={16} color={GENESIS_COLORS.primary} />
                  <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold' }}>TAKE PHOTO</Text>
                </Pressable>
                <Pressable
                  onPress={handlePickPhoto}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: `${phaseConfig.color}15`,
                    borderWidth: 1,
                    borderColor: `${phaseConfig.color}33`,
                  }}
                >
                  <Text style={{ color: phaseConfig.accentColor, fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold' }}>GALLERY</Text>
                </Pressable>
              </View>

              {photos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {photos.map((photo, index) => (
                    <View key={photo.id ?? `photo-${index}`} style={{ width: 120, gap: 6 }}>
                      <View style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                        {photo.uri ? (
                          <Image source={{ uri: photo.uri }} style={{ width: 120, height: 160, borderRadius: 12 }} />
                        ) : (
                          <View style={{ width: 120, height: 160, borderRadius: 12, backgroundColor: `${GENESIS_COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' }}>
                            <Camera size={24} color={GENESIS_COLORS.textTertiary} />
                          </View>
                        )}
                        {/* Category badge */}
                        <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                          <Text style={{ color: '#FFF', fontSize: 9, fontFamily: 'JetBrainsMonoMedium', textTransform: 'uppercase' }}>{photo.category}</Text>
                        </View>
                        {/* Delete button */}
                        {photo.id && (
                          <Pressable
                            onPress={() => deletePhoto(photo.id!, photo.storagePath)}
                            style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: 4 }}
                          >
                            <Trash2 size={12} color="#FF6B6B" />
                          </Pressable>
                        )}
                      </View>
                      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium', textAlign: 'center' }}>
                        {new Date(photo.date).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <GlassCard>
                  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', textAlign: 'center' }}>
                    Toma tu primera foto de progreso para comparar tu transformacion.
                  </Text>
                </GlassCard>
              )}
            </View>
          </SectionLabel>

          {/* Phase Insight */}
          <GlassCard shine>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color={phaseConfig.accentColor} />
              <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>GENESIS INSIGHT</Text>
            </View>
            <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
              {completedWorkouts > 0
                ? `Tu adherencia del ${adherence}% ${adherence >= 70 ? 'esta por encima del promedio' : 'tiene margen de mejora'}. En fase de ${phaseConfig.label.toLowerCase()}, la consistencia es clave para maximizar adaptaciones.`
                : 'Empieza tu primera sesion para que GENESIS analice tu progreso y te de insights personalizados.'
              }
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
