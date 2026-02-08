import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sunrise, Zap, Play } from 'lucide-react-native';
import {
  GlassCard,
  ListItemCard,
  MoodSelector,
  ScreenHeader,
  SectionLabel,
  Pill,
  ProgressBar,
} from '../../components/ui';

const moodLabels: Record<string, string> = {
  great: 'Feeling Great',
  good: 'Feeling Good',
  okay: 'Feeling Okay',
  low: 'Feeling Low',
  bad: 'Feeling Bad',
};

const meditations = [
  { id: '1', name: 'Morning Calm', duration: '10 min', type: 'Guided', icon: Sunrise, variant: 'purple' as const, color: '#b39aff' },
  { id: '2', name: 'Focus Flow', duration: '15 min', type: 'Ambient', icon: Zap, variant: 'blue' as const, color: '#38bdf8' },
  { id: '3', name: 'Night Wind Down', duration: '20 min', type: 'Sleep', icon: Moon, variant: 'green' as const, color: '#22ff73' },
];

export default function MindScreen() {
  const [selectedMood, setSelectedMood] = useState('good');

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ScreenHeader title="Mind" subtitle="How are you feeling?" showBack />

          {/* Mood Check-in */}
          <SectionLabel title="MOOD CHECK-IN">
            <GlassCard shine>
              <Text className="font-jetbrains-bold text-[13px] text-white">Today's Mood</Text>
              <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
              {selectedMood && (
                <Text className="font-inter text-[13px] text-[#b39aff]">
                  {moodLabels[selectedMood] ?? ''}
                </Text>
              )}
            </GlassCard>
          </SectionLabel>

          {/* Meditation */}
          <SectionLabel title="MEDITATION">
            <View className="gap-3">
              {meditations.map((med) => {
                const IconComponent = med.icon;
                return (
                  <ListItemCard
                    key={med.id}
                    icon={<IconComponent size={18} color={med.color} />}
                    title={med.name}
                    subtitle={`${med.duration} · ${med.type}`}
                    variant={med.variant}
                    right={<Play size={18} color={med.color} />}
                  />
                );
              })}
            </View>
          </SectionLabel>

          {/* Sleep */}
          <SectionLabel title="SLEEP">
            <GlassCard shine>
              <View className="flex-row items-center gap-2">
                <Moon size={18} color="#b39aff" />
                <Text className="font-jetbrains-bold text-[13px] text-white">Last Night</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-inter-bold text-[28px] text-white">7h 23m</Text>
                <Pill label="Good" variant="success" />
              </View>
              <ProgressBar progress={85} gradient />
              <View className="flex-row justify-between pt-1">
                <Text className="font-jetbrains-medium text-[11px] text-[#827a89]">Deep: 2h 10m</Text>
                <Text className="font-jetbrains-medium text-[11px] text-[#827a89]">Light: 4h 03m</Text>
                <Text className="font-jetbrains-medium text-[11px] text-[#827a89]">REM: 1h 10m</Text>
              </View>
            </GlassCard>
          </SectionLabel>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
