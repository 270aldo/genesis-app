import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coffee, Utensils, Apple, UtensilsCrossed, Droplets, Check, Plus } from 'lucide-react-native';
import {
  GlassCard,
  ListItemCard,
  MacroCard,
  ScreenHeader,
  SectionLabel,
  ProgressBar,
  WaterDots,
} from '../../components/ui';

const meals = [
  { id: '1', name: 'Breakfast', subtitle: 'Oats, banana, protein shake', cal: 520, icon: Coffee, variant: 'green' as const, logged: true },
  { id: '2', name: 'Lunch', subtitle: 'Chicken, rice, vegetables', cal: 680, icon: Utensils, variant: 'green' as const, logged: true },
  { id: '3', name: 'Snack', subtitle: 'Greek yogurt, almonds', cal: 247, icon: Apple, variant: 'blue' as const, logged: true },
  { id: '4', name: 'Dinner', subtitle: 'Not logged yet', cal: 0, icon: UtensilsCrossed, variant: 'red' as const, logged: false },
];

export default function FuelScreen() {
  const consumed = 1847;
  const target = 2400;
  const remaining = target - consumed;
  const progress = (consumed / target) * 100;

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ScreenHeader title="Nutrition" subtitle="Today, Dec 4" showBack />

          {/* Calories */}
          <SectionLabel title="CALORIES">
            <GlassCard shine>
              <View className="flex-row items-center justify-between">
                <Text className="font-jetbrains-medium text-[11px] text-[#827a89]">Calories</Text>
                <Text className="font-jetbrains-medium text-[11px] text-[#827a89]">/ {target.toLocaleString()}</Text>
              </View>
              <Text className="font-inter-bold text-[36px] text-white">{consumed.toLocaleString()}</Text>
              <ProgressBar progress={progress} gradient />
              <Text className="font-jetbrains-medium text-[11px] text-[#827a89]">{remaining} remaining</Text>
            </GlassCard>
          </SectionLabel>

          {/* Macros */}
          <SectionLabel title="MACROS">
            <View className="flex-row gap-3">
              <MacroCard label="PROTEIN" value={120} unit="g" progress={75} color="#38bdf8" />
              <MacroCard label="CARBS" value={210} unit="g" progress={70} color="#22ff73" />
              <MacroCard label="FAT" value={58} unit="g" progress={65} color="#F97316" />
            </View>
          </SectionLabel>

          {/* Meals */}
          <SectionLabel title="MEALS">
            <View className="gap-3">
              {meals.map((meal) => {
                const IconComponent = meal.icon;
                return (
                  <ListItemCard
                    key={meal.id}
                    icon={<IconComponent size={18} color={getVariantColor(meal.variant)} />}
                    title={meal.name}
                    subtitle={meal.subtitle}
                    variant={meal.variant}
                    right={
                      <View className="flex-row items-center gap-2">
                        <Text
                          className="font-jetbrains-medium text-[11px]"
                          style={{ color: meal.logged ? '#22ff73' : '#ff6b6b' }}
                        >
                          {meal.logged ? `${meal.cal} cal` : '—'}
                        </Text>
                        {meal.logged ? (
                          <Check size={14} color="#22ff73" />
                        ) : (
                          <Plus size={14} color="#ff6b6b" />
                        )}
                      </View>
                    }
                  />
                );
              })}
            </View>
          </SectionLabel>

          {/* Hydration */}
          <SectionLabel title="HYDRATION">
            <GlassCard>
              <View className="flex-row items-center gap-2">
                <Droplets size={18} color="#38bdf8" />
                <Text className="font-jetbrains-bold text-[13px] text-white">Water Intake</Text>
              </View>
              <Text className="font-inter-bold text-[18px] text-white">6/8 glasses</Text>
              <WaterDots filled={6} total={8} />
            </GlassCard>
          </SectionLabel>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function getVariantColor(variant: string): string {
  const colors: Record<string, string> = {
    green: '#22ff73',
    blue: '#38bdf8',
    red: '#ff6b6b',
  };
  return colors[variant] ?? '#6c3bff';
}
