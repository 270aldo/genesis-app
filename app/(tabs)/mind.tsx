import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Moon, Play, Activity, Sparkles } from 'lucide-react-native';
import {
  GlassCard,
  MoodSelector,
  ScreenHeader,
  SectionLabel,
  Pill,
  ProgressBar,
  SeasonHeader,
  ErrorBanner,
} from '../../components/ui';
import { ImageCard } from '../../components/cards';
import { RecoveryHeatmap } from '../../components/wellness';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore, useWellnessStore, useTrainingStore } from '../../stores';
import { PHASE_CONFIG, IMAGES } from '../../data';
import type { MuscleRecovery, PhaseType } from '../../types';

const moodLabels: Record<string, string> = {
  great: 'Excelente',
  good: 'Bien',
  okay: 'Normal',
  low: 'Bajo',
  bad: 'Mal',
};

// Map wellness store mood values to MoodSelector values
const moodToSelector: Record<string, string> = {
  excellent: 'great',
  good: 'good',
  neutral: 'okay',
  poor: 'low',
  terrible: 'bad',
};

const sleepQualityLabels: Record<string, string> = {
  excellent: 'Excelente',
  good: 'Bueno',
  fair: 'Regular',
  poor: 'Malo',
};

const meditations = [
  { id: '1', name: 'Morning Calm', duration: '10 min', type: 'Guided', imageUrl: IMAGES.morning, color: GENESIS_COLORS.primary },
  { id: '2', name: 'Focus Flow', duration: '15 min', type: 'Ambient', imageUrl: IMAGES.focus, color: GENESIS_COLORS.info },
  { id: '3', name: 'Night Wind Down', duration: '20 min', type: 'Sleep', imageUrl: IMAGES.night, color: GENESIS_COLORS.success },
];

export default function MindScreen() {
  const router = useRouter();
  const { seasonNumber, currentWeek, currentPhase, weeks } = useSeasonStore();
  const todayCheckIn = useWellnessStore((s) => s.todayCheckIn);
  const isWellnessLoading = useWellnessStore((s) => s.isLoading);
  const calculateWellnessScore = useWellnessStore((s) => s.calculateWellnessScore);
  const getRecoveryRecommendations = useWellnessStore((s) => s.getRecoveryRecommendations);
  const previousSessions = useTrainingStore((s) => s.previousSessions);

  const wellnessScore = useMemo(() => calculateWellnessScore(), [calculateWellnessScore, todayCheckIn]);
  const recommendations = useMemo(() => getRecoveryRecommendations(), [getRecoveryRecommendations, todayCheckIn]);
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  // Derive mood from today's check-in
  const selectedMood = todayCheckIn?.mood ? (moodToSelector[todayCheckIn.mood] ?? 'okay') : undefined;

  const handleMoodSelect = (_mood: string) => {
    if (!todayCheckIn) {
      router.push('/(modals)/check-in');
    }
    // If already checked in, mood is display-only
  };

  // Derive sleep data from today's check-in
  const sleepHours = todayCheckIn?.sleepHours ?? 0;
  const sleepFormatted = sleepHours > 0
    ? `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`
    : '--';
  const sleepQualityLabel = todayCheckIn?.sleepQuality
    ? (sleepQualityLabels[todayCheckIn.sleepQuality] ?? 'Regular')
    : '--';
  const sleepQualityVariant = todayCheckIn?.sleepQuality === 'good' || todayCheckIn?.sleepQuality === 'excellent'
    ? 'success'
    : 'default';

  // Compute recovery heatmap from real workout sessions
  const recoveryData = useMemo((): MuscleRecovery[] => {
    const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];

    if (previousSessions.length === 0) {
      return muscleGroups.map((group) => ({
        muscleGroup: group,
        status: 'recovered' as const,
        lastTrained: '',
        daysSinceTraining: 99,
      }));
    }

    const lastTrained: Record<string, Date> = {};
    const now = new Date();

    for (const session of previousSessions) {
      if (!session.completed) continue;
      const sessionDate = new Date(session.date);
      for (const ex of session.exercises) {
        const name = ex.name.toLowerCase();
        let group = '';
        if (name.includes('bench') || name.includes('chest') || name.includes('fly') || name.includes('push')) group = 'Chest';
        else if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('deadlift') || name.includes('back')) group = 'Back';
        else if (name.includes('shoulder') || name.includes('press') || name.includes('lateral') || name.includes('ohp') || name.includes('delt')) group = 'Shoulders';
        else if (name.includes('squat') || name.includes('leg') || name.includes('lunge') || name.includes('calf') || name.includes('glute') || name.includes('hip')) group = 'Legs';
        else if (name.includes('curl') || name.includes('tricep') || name.includes('bicep') || name.includes('arm')) group = 'Arms';
        else if (name.includes('core') || name.includes('plank') || name.includes('ab') || name.includes('crunch')) group = 'Core';

        if (group && (!lastTrained[group] || sessionDate > lastTrained[group])) {
          lastTrained[group] = sessionDate;
        }
      }
    }

    return muscleGroups.map((group) => {
      const trained = lastTrained[group];
      const daysSince = trained ? Math.floor((now.getTime() - trained.getTime()) / 86400000) : 99;
      let status: MuscleRecovery['status'];
      if (daysSince <= 1) status = 'fatigued';
      else if (daysSince <= 2) status = 'moderate';
      else status = 'recovered';

      return {
        muscleGroup: group,
        status,
        lastTrained: trained?.toISOString() ?? '',
        daysSinceTraining: Math.min(daysSince, 99),
      };
    });
  }, [previousSessions]);

  // Fetch real data on mount
  useEffect(() => {
    useWellnessStore.getState().fetchTodayCheckIn();
    useWellnessStore.getState().fetchWeeklyCheckIns();
    useTrainingStore.getState().fetchPreviousSessions();
  }, []);

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Season Header */}
          <SeasonHeader
            seasonNumber={seasonNumber}
            currentWeek={currentWeek}
            currentPhase={phase}
            weeks={weeks}
          />

          <ScreenHeader title="Mind & Recovery" subtitle="¿Cómo estás hoy?" />

          {isWellnessLoading && (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator size="small" color={GENESIS_COLORS.primary} />
            </View>
          )}

          {/* Mood Check-in */}
          <SectionLabel title="CHECK-IN">
            <GlassCard shine>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Mood de Hoy</Text>
              <MoodSelector selected={selectedMood} onSelect={handleMoodSelect} disabled={!!todayCheckIn} />
              {todayCheckIn ? (
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                  Ya hiciste tu check-in hoy · {moodLabels[selectedMood ?? ''] ?? ''}
                </Text>
              ) : selectedMood ? (
                <Text style={{ color: phaseConfig.accentColor, fontSize: 13, fontFamily: 'Inter' }}>
                  {moodLabels[selectedMood] ?? ''}
                </Text>
              ) : null}
            </GlassCard>
          </SectionLabel>

          {/* Recovery Heatmap */}
          <SectionLabel title="RECOVERY STATUS">
            <RecoveryHeatmap data={recoveryData} />
          </SectionLabel>

          {/* Wellness Score */}
          <SectionLabel title="WELLNESS SCORE">
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color={phaseConfig.accentColor} />
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Overall</Text>
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 36, fontFamily: 'InterBold' }}>
                {todayCheckIn ? wellnessScore : '--'}
              </Text>
              <ProgressBar progress={todayCheckIn ? wellnessScore : 0} gradient />
              {recommendations.map((rec, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
                  <Sparkles size={12} color={phaseConfig.accentColor} />
                  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'Inter', flex: 1, lineHeight: 16 }}>{rec}</Text>
                </View>
              ))}
            </GlassCard>
          </SectionLabel>

          {/* Meditation with Images */}
          <SectionLabel title="MEDITACIÓN">
            <View style={{ gap: 12 }}>
              {meditations.map((med) => (
                <ImageCard
                  key={med.id}
                  imageUrl={med.imageUrl}
                  height={100}
                  overlayColors={['transparent', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.9)']}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ gap: 2 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{med.name}</Text>
                      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>{med.duration} · {med.type}</Text>
                    </View>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: med.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={16} color={med.color} />
                    </View>
                  </View>
                </ImageCard>
              ))}
            </View>
          </SectionLabel>

          {/* Sleep */}
          <SectionLabel title="SLEEP">
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Moon size={18} color={GENESIS_COLORS.primary} />
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Anoche</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 28, fontFamily: 'InterBold' }}>{sleepFormatted}</Text>
                <Pill label={sleepQualityLabel} variant={sleepQualityVariant as any} />
              </View>
              <ProgressBar progress={sleepHours > 0 ? Math.min((sleepHours / 8) * 100, 100) : 0} gradient />
              {sleepHours > 0 ? (
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', textAlign: 'center' }}>
                  Meta: 8h · Calidad: {sleepQualityLabel}
                </Text>
              ) : (
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', textAlign: 'center' }}>
                  Completa tu check-in para ver datos de sueño
                </Text>
              )}
            </GlassCard>
          </SectionLabel>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
