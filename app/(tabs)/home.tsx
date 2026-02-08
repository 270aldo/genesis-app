import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Utensils, Brain, Sparkles, Flame } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard, GradientCard, ScreenHeader, SectionLabel, ProgressBar } from '../../components/ui';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HomeScreen() {
  const router = useRouter();
  const completedDays = 5;
  const currentDayIndex = 3; // Thursday

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ScreenHeader title="Hey, Athlete" subtitle="Ready to conquer today?" />

          {/* Daily Missions */}
          <SectionLabel title="DAILY MISSIONS">
            <View className="flex-row gap-3">
              <MissionCard
                icon={<Dumbbell size={18} color="#6c3bff" />}
                iconBg="#6c3bff20"
                title="Train"
                subtitle="Push Day"
                onPress={() => router.push('/(tabs)/train')}
              />
              <MissionCard
                icon={<Utensils size={18} color="#22ff73" />}
                iconBg="#22ff7320"
                title="Log"
                subtitle="Meals"
                onPress={() => router.push('/(tabs)/fuel')}
              />
              <MissionCard
                icon={<Brain size={18} color="#38bdf8" />}
                iconBg="#38bdf820"
                title="Check-in"
                subtitle="Mood"
                onPress={() => router.push('/(tabs)/mind')}
              />
            </View>
          </SectionLabel>

          {/* This Week */}
          <SectionLabel title="THIS WEEK">
            <GlassCard shine>
              <View className="flex-row items-center justify-between">
                <Text className="font-jetbrains-bold text-[13px] text-white">Week Progress</Text>
                <Text className="font-jetbrains-medium text-[11px] text-[#827a89]">{completedDays}/7 days</Text>
              </View>
              <ProgressBar progress={(completedDays / 7) * 100} gradient />
              <View className="flex-row justify-between pt-2">
                {DAYS.map((day, i) => (
                  <View
                    key={`${day}-${i}`}
                    className={`h-6 w-6 items-center justify-center rounded-full ${
                      i < completedDays
                        ? 'bg-[#6c3bff]'
                        : i === currentDayIndex
                          ? 'border border-[#b39aff]'
                          : 'bg-[#FFFFFF14]'
                    }`}
                  >
                    <Text className={`font-jetbrains text-[9px] ${i < completedDays || i === currentDayIndex ? 'text-white' : 'text-[#6b6b7b]'}`}>
                      {day}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </SectionLabel>

          {/* Genesis AI */}
          <SectionLabel title="GENESIS AI">
            <GradientCard>
              <View className="flex-row items-center gap-2">
                <Sparkles size={18} color="#b39aff" />
                <Text className="font-jetbrains-bold text-[13px] text-[#b39aff]">Genesis</Text>
              </View>
              <Text className="font-inter text-[13px] leading-5 text-[#827a89]">
                Your consistency this week is impressive. Keep pushing through—recovery is looking strong and you're on track for a PR attempt next session.
              </Text>
              <Text className="font-jetbrains text-[9px] text-[#6b6b7b]">2 hours ago</Text>
            </GradientCard>
          </SectionLabel>

          {/* Streak */}
          <SectionLabel title="STREAK">
            <GlassCard>
              <View className="flex-row items-center gap-3">
                <Flame size={22} color="#F97316" />
                <Text className="font-inter-bold text-[18px] text-white">12 Day Streak</Text>
              </View>
              <Text className="font-inter text-[11px] text-[#827a89]">Personal best! Keep going.</Text>
            </GlassCard>
          </SectionLabel>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MissionCard({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-2 rounded-[16px] border border-[#FFFFFF14] bg-[#14121aB3] p-4"
      style={{ shadowColor: '#6c3bff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }}
    >
      <View className="h-10 w-10 items-center justify-center rounded-[12px]" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <Text className="font-jetbrains-bold text-[13px] text-white">{title}</Text>
      <Text className="font-inter text-[11px] text-[#827a89]">{subtitle}</Text>
    </Pressable>
  );
}
