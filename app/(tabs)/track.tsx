import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Utensils, Heart, Trophy, Timer } from 'lucide-react-native';
import {
  GlassCard,
  ListItemCard,
  ScoreCard,
  ScreenHeader,
  SectionLabel,
  SimpleBarChart,
} from '../../components/ui';

const weekData = [
  { label: 'M', value: 60, active: false },
  { label: 'T', value: 80, active: false },
  { label: 'W', value: 45, active: false },
  { label: 'T', value: 100, active: true },
  { label: 'F', value: 0, active: false },
  { label: 'S', value: 0, active: false },
  { label: 'S', value: 0, active: false },
];

const records = [
  { id: '1', name: 'Bench Press', subtitle: 'Personal Record', value: '100 kg', icon: Trophy, variant: 'green' as const, color: '#22ff73' },
  { id: '2', name: 'Deadlift', subtitle: 'Personal Record', value: '140 kg', icon: Trophy, variant: 'orange' as const, color: '#F97316' },
  { id: '3', name: 'Squat', subtitle: 'Personal Record', value: '120 kg', icon: Trophy, variant: 'blue' as const, color: '#38bdf8' },
  { id: '4', name: '5K Run', subtitle: 'Best Time', value: '23:45', icon: Timer, variant: 'purple' as const, color: '#b39aff' },
];

export default function TrackScreen() {
  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ScreenHeader title="Progress" subtitle="Your journey at a glance" showBack />

          {/* Scores */}
          <SectionLabel title="SCORES">
            <View className="flex-row gap-3">
              <ScoreCard
                icon={<TrendingUp size={20} color="#b39aff" />}
                value="87"
                label="FITNESS"
                iconBgColor="#6c3bff20"
              />
              <ScoreCard
                icon={<Utensils size={20} color="#22ff73" />}
                value="72"
                label="NUTRITION"
                iconBgColor="#22ff7320"
              />
              <ScoreCard
                icon={<Heart size={20} color="#38bdf8" />}
                value="91"
                label="WELLNESS"
                iconBgColor="#38bdf820"
              />
            </View>
          </SectionLabel>

          {/* Activity */}
          <SectionLabel title="ACTIVITY">
            <GlassCard shine>
              <View className="flex-row items-center justify-between">
                <Text className="font-jetbrains-bold text-[13px] text-white">This Week</Text>
                <Text className="font-jetbrains-medium text-[11px] text-[#827a89]">4/7 active</Text>
              </View>
              <SimpleBarChart data={weekData} />
            </GlassCard>
          </SectionLabel>

          {/* Personal Records */}
          <SectionLabel title="PERSONAL RECORDS">
            <View className="gap-3">
              {records.map((record) => {
                const IconComponent = record.icon;
                return (
                  <ListItemCard
                    key={record.id}
                    icon={<IconComponent size={18} color={record.color} />}
                    title={record.name}
                    subtitle={record.subtitle}
                    variant={record.variant}
                    right={
                      <Text className="font-inter-bold text-[14px]" style={{ color: record.color }}>
                        {record.value}
                      </Text>
                    }
                  />
                );
              })}
            </View>
          </SectionLabel>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
