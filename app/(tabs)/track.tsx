import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Trophy, Target, Flame, Calendar, Zap } from 'lucide-react-native';
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
import { useSeasonStore } from '../../stores';
import { PHASE_CONFIG, IMAGES } from '../../data';
import type { PhaseType } from '../../types';

// Mock strength progression data
const benchProgress = [
  { label: 'S1', value: 55, active: false },
  { label: 'S2', value: 65, active: false },
  { label: 'S3', value: 72, active: false },
  { label: 'S4', value: 70, active: false },
  { label: 'S5', value: 78, active: false },
  { label: 'S6', value: 85, active: true },
  { label: 'S7', value: 0, active: false },
];

const personalRecords = [
  { id: '1', name: 'Bench Press', value: '100 kg', previous: '95 kg', color: '#FFD700' },
  { id: '2', name: 'Squat', value: '120 kg', previous: '115 kg', color: '#FFD700' },
  { id: '3', name: 'Deadlift', value: '140 kg', previous: '135 kg', color: '#FFD700' },
  { id: '4', name: '5K Run', value: '23:45', previous: '24:10', color: '#38bdf8' },
];

export default function TrackScreen() {
  const { seasonNumber, currentWeek, currentPhase, weeks, progressPercent } = useSeasonStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  // Season stats (mock)
  const totalWorkouts = 18;
  const completedWorkouts = 14;
  const adherence = Math.round((completedWorkouts / totalWorkouts) * 100);
  const totalPRs = 4;

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

          <ScreenHeader title="Progress" subtitle="Tu temporada a detalle" />

          {/* Season Overview Hero */}
          <ImageCard
            imageUrl={IMAGES.hero_track}
            height={160}
            overlayColors={['transparent', 'rgba(13, 13, 43, 0.6)', 'rgba(13, 13, 43, 0.95)']}
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
                icon={<Target size={20} color="#22ff73" />}
                value={`${adherence}%`}
                label="ADHERENCE"
                iconBgColor="#22ff7320"
              />
            </View>
          </SectionLabel>

          {/* Strength Chart */}
          <SectionLabel title="BENCH PRESS TREND">
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color="#22ff73" />
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Progresión</Text>
                </View>
                <Text style={{ color: '#22ff73', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>+12% este season</Text>
              </View>
              <SimpleBarChart data={benchProgress} />
            </GlassCard>
          </SectionLabel>

          {/* Personal Records */}
          <SectionLabel title="PERSONAL RECORDS">
            <View style={{ gap: 12 }}>
              {personalRecords.map((pr) => (
                <GlassCard key={pr.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: pr.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={18} color={pr.color} />
                      </View>
                      <View style={{ gap: 2 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{pr.name}</Text>
                        <Text style={{ color: '#827a89', fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>Anterior: {pr.previous}</Text>
                      </View>
                    </View>
                    <Text style={{ color: pr.color, fontSize: 16, fontFamily: 'InterBold' }}>{pr.value}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          </SectionLabel>

          {/* Phase Insight */}
          <GlassCard shine>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color={phaseConfig.accentColor} />
              <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>GENESIS INSIGHT</Text>
            </View>
            <Text style={{ color: '#c4bfcc', fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
              Tu adherencia del {adherence}% está por encima del promedio. En fase de {phaseConfig.label.toLowerCase()}, mantener esta consistencia es clave para maximizar adaptaciones. Sigue así.
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
