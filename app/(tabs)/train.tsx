import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell } from 'lucide-react-native';
import { GradientCard, ListItemCard, Pill, ScreenHeader, SectionLabel, Divider } from '../../components/ui';

const exercises = [
  { id: '1', name: 'Bench Press', sets: 4, reps: '8-10', variant: 'purple' as const },
  { id: '2', name: 'Incline DB Press', sets: 3, reps: '10-12', variant: 'blue' as const },
  { id: '3', name: 'Cable Flyes', sets: 3, reps: '12-15', variant: 'green' as const },
  { id: '4', name: 'Lateral Raises', sets: 4, reps: '12-15', variant: 'orange' as const },
];

export default function TrainScreen() {
  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="gap-2">
            <ScreenHeader title="Push Day" showBack />
            <View className="flex-row flex-wrap gap-2">
              <Pill label="Chest" />
              <Pill label="Shoulders" />
              <Pill label="45 min" variant="warning" />
              <Pill label="Intermediate" variant="info" />
            </View>
          </View>

          {/* Exercises */}
          <SectionLabel title="EXERCISES">
            <View className="gap-3">
              {exercises.map((ex) => (
                <ListItemCard
                  key={ex.id}
                  icon={<Dumbbell size={18} color={getVariantColor(ex.variant)} />}
                  title={ex.name}
                  subtitle={`${ex.sets} × ${ex.reps} reps`}
                  variant={ex.variant}
                />
              ))}
            </View>
          </SectionLabel>

          <Divider />

          {/* Summary */}
          <View className="flex-row justify-between">
            <Text className="font-jetbrains-medium text-[13px] text-[#827a89]">4 exercises</Text>
            <Text className="font-jetbrains-medium text-[13px] text-[#827a89]">~45 min</Text>
          </View>

          {/* Start Button */}
          <GradientCard className="items-center py-4">
            <Text className="font-jetbrains-semibold text-[14px] text-white">START WORKOUT</Text>
          </GradientCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function getVariantColor(variant: string): string {
  const colors: Record<string, string> = {
    purple: '#6c3bff',
    blue: '#38bdf8',
    green: '#22ff73',
    orange: '#F97316',
    red: '#ff6b6b',
  };
  return colors[variant] ?? '#6c3bff';
}
