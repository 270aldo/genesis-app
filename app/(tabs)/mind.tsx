import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Play, Activity, Sparkles } from 'lucide-react-native';
import {
  GlassCard,
  MoodSelector,
  ScreenHeader,
  SectionLabel,
  Pill,
  ProgressBar,
  SeasonHeader,
} from '../../components/ui';
import { ImageCard } from '../../components/cards';
import { RecoveryHeatmap } from '../../components/wellness';
import { useSeasonStore, useWellnessStore } from '../../stores';
import { MOCK_RECOVERY, PHASE_CONFIG, IMAGES } from '../../data';
import type { PhaseType } from '../../types';

const moodLabels: Record<string, string> = {
  great: 'Excelente',
  good: 'Bien',
  okay: 'Normal',
  low: 'Bajo',
  bad: 'Mal',
};

const meditations = [
  { id: '1', name: 'Morning Calm', duration: '10 min', type: 'Guided', imageUrl: IMAGES.morning, color: '#b39aff' },
  { id: '2', name: 'Focus Flow', duration: '15 min', type: 'Ambient', imageUrl: IMAGES.focus, color: '#38bdf8' },
  { id: '3', name: 'Night Wind Down', duration: '20 min', type: 'Sleep', imageUrl: IMAGES.night, color: '#22ff73' },
];

export default function MindScreen() {
  const [selectedMood, setSelectedMood] = useState('good');
  const { seasonNumber, currentWeek, currentPhase, weeks } = useSeasonStore();
  const todayCheckIn = useWellnessStore((s) => s.todayCheckIn);
  const calculateWellnessScore = useWellnessStore((s) => s.calculateWellnessScore);
  const getRecoveryRecommendations = useWellnessStore((s) => s.getRecoveryRecommendations);
  const wellnessScore = useMemo(() => calculateWellnessScore(), [calculateWellnessScore, todayCheckIn]);
  const recommendations = useMemo(() => getRecoveryRecommendations(), [getRecoveryRecommendations, todayCheckIn]);
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
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

          <ScreenHeader title="Mind & Recovery" subtitle="¿Cómo estás hoy?" />

          {/* Mood Check-in */}
          <SectionLabel title="CHECK-IN">
            <GlassCard shine>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Mood de Hoy</Text>
              <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
              {selectedMood && (
                <Text style={{ color: phaseConfig.accentColor, fontSize: 13, fontFamily: 'Inter' }}>
                  {moodLabels[selectedMood] ?? ''}
                </Text>
              )}
            </GlassCard>
          </SectionLabel>

          {/* Recovery Heatmap */}
          <SectionLabel title="RECOVERY STATUS">
            <RecoveryHeatmap data={MOCK_RECOVERY} />
          </SectionLabel>

          {/* Wellness Score */}
          <SectionLabel title="WELLNESS SCORE">
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color={phaseConfig.accentColor} />
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Overall</Text>
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 36, fontFamily: 'InterBold' }}>
                {wellnessScore || 78}
              </Text>
              <ProgressBar progress={wellnessScore || 78} gradient />
              {recommendations.map((rec, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
                  <Sparkles size={12} color={phaseConfig.accentColor} />
                  <Text style={{ color: '#c4bfcc', fontSize: 11, fontFamily: 'Inter', flex: 1, lineHeight: 16 }}>{rec}</Text>
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
                  overlayColors={['transparent', 'rgba(13, 13, 43, 0.5)', 'rgba(13, 13, 43, 0.9)']}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ gap: 2 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{med.name}</Text>
                      <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>{med.duration} · {med.type}</Text>
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
                <Moon size={18} color="#b39aff" />
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Anoche</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 28, fontFamily: 'InterBold' }}>7h 23m</Text>
                <Pill label="Bueno" variant="success" />
              </View>
              <ProgressBar progress={85} gradient />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 }}>
                <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>Deep: 2h 10m</Text>
                <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>Light: 4h 03m</Text>
                <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>REM: 1h 10m</Text>
              </View>
            </GlassCard>
          </SectionLabel>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
