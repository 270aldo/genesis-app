import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Utensils, Brain, Sparkles, Flame, BookOpen, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard, GradientCard, ScreenHeader, SectionLabel, ProgressBar, SeasonHeader } from '../../components/ui';
import { ImageCard } from '../../components/cards';
import { useSeasonStore, useWellnessStore, useTrainingStore, useNutritionStore } from '../../stores';
import { getMockBriefing, MOCK_EDUCATION, PHASE_CONFIG } from '../../data';
import type { PhaseType } from '../../types';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function HomeScreen() {
  const router = useRouter();

  // Store data
  const { seasonNumber, currentWeek, currentPhase, weeks, progressPercent, fetchSeasonPlan } = useSeasonStore();
  const todayCheckIn = useWellnessStore((s) => s.todayCheckIn);

  useEffect(() => {
    if (weeks.length === 0) fetchSeasonPlan();
  }, []);

  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const briefing = getMockBriefing(phase, currentWeek);
  const phaseConfig = PHASE_CONFIG[phase];
  const completedDays = 5;
  const currentDayIndex = new Date().getDay();
  const streak = 12;

  // Filter education by current phase
  const phaseEducation = MOCK_EDUCATION.filter((e) => e.relevantPhases.includes(phase));
  const todayLesson = phaseEducation[0];

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

          {/* GENESIS Daily Briefing — Hero Card with Image */}
          <ImageCard
            imageUrl={briefing.imageUrl}
            height={200}
            onPress={() => router.push('/(modals)/genesis-chat')}
            overlayColors={['transparent', 'rgba(13, 13, 43, 0.6)', 'rgba(13, 13, 43, 0.95)']}
          >
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={phaseConfig.accentColor} />
                <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>
                  GENESIS
                </Text>
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold', lineHeight: 20 }}>
                {briefing.greeting}
              </Text>
              <Text style={{ color: '#c4bfcc', fontSize: 13, fontFamily: 'Inter', lineHeight: 19 }}>
                {briefing.message}
              </Text>
            </View>
          </ImageCard>

          {/* Daily Missions */}
          <SectionLabel title="HOY">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <MissionCard
                icon={<Dumbbell size={18} color={phaseConfig.color} />}
                iconBg={phaseConfig.color + '20'}
                title="Train"
                subtitle="Push Day"
                detail="6 ejercicios · 55 min"
                onPress={() => router.push('/(tabs)/train')}
              />
              <MissionCard
                icon={<Utensils size={18} color="#22ff73" />}
                iconBg="#22ff7320"
                title="Fuel"
                subtitle="1,847 / 2,400"
                detail="Faltan 2 comidas"
                onPress={() => router.push('/(tabs)/fuel')}
              />
              <MissionCard
                icon={<Brain size={18} color="#38bdf8" />}
                iconBg="#38bdf820"
                title="Check-in"
                subtitle={todayCheckIn ? 'Completado' : 'Pendiente'}
                detail={todayCheckIn ? todayCheckIn.mood : 'Registra tu día'}
                onPress={() => router.push('/(modals)/check-in')}
              />
            </ScrollView>
          </SectionLabel>

          {/* Micro-Lesson */}
          {todayLesson && (
            <SectionLabel title="APRENDE HOY">
              <ImageCard
                imageUrl={todayLesson.imageUrl}
                height={140}
                badge={todayLesson.duration}
                badgeColor={phaseConfig.color}
              >
                <View style={{ gap: 4 }}>
                  <Text style={{ color: phaseConfig.accentColor, fontSize: 10, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
                    {todayLesson.category.toUpperCase()}
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
                    {todayLesson.title}
                  </Text>
                </View>
              </ImageCard>
            </SectionLabel>
          )}

          {/* Week Progress */}
          <SectionLabel title="ESTA SEMANA">
            <GlassCard shine>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Progreso Semanal</Text>
                <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>{completedDays}/7 días</Text>
              </View>
              <ProgressBar progress={(completedDays / 7) * 100} gradient />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 }}>
                {DAYS.map((day, i) => {
                  const dayIndex = i + 1;
                  const isCompleted = dayIndex <= completedDays;
                  const isToday = dayIndex === currentDayIndex;
                  return (
                    <View
                      key={`${day}-${i}`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isCompleted ? phaseConfig.color : isToday ? 'transparent' : 'rgba(255,255,255,0.08)',
                        borderWidth: isToday && !isCompleted ? 1 : 0,
                        borderColor: phaseConfig.accentColor,
                      }}
                    >
                      <Text style={{
                        color: isCompleted || isToday ? '#FFFFFF' : '#6b6b7b',
                        fontSize: 10,
                        fontFamily: 'JetBrainsMono',
                      }}>
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </SectionLabel>

          {/* Streak */}
          <GlassCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Flame size={22} color="#F97316" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>{streak} Day Streak</Text>
                <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'Inter' }}>Personal best! Keep going.</Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MissionCard({
  icon, iconBg, title, subtitle, detail, onPress,
}: {
  icon: React.ReactNode; iconBg: string; title: string; subtitle: string; detail: string; onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 140,
        gap: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(20,18,26,0.7)',
        padding: 16,
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg }}>
        {icon}
      </View>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoBold' }}>{title}</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter' }}>{subtitle}</Text>
      <Text style={{ color: '#827a89', fontSize: 10, fontFamily: 'Inter' }}>{detail}</Text>
    </Pressable>
  );
}
