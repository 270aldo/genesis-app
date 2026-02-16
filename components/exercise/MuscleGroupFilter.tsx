import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { GENESIS_COLORS, MUSCLE_GRADIENTS } from '../../constants/colors';
import { MuscleGroupIcon, type MuscleGroup } from './MuscleGroupIcon';
import { hapticSelection } from '../../utils/haptics';

const FILTER_GROUPS: { label: string; value: string; iconGroup: MuscleGroup }[] = [
  { label: 'Pecho', value: 'Chest', iconGroup: 'chest' },
  { label: 'Espalda', value: 'Back', iconGroup: 'back' },
  { label: 'Hombros', value: 'Shoulders', iconGroup: 'shoulders' },
  { label: 'Piernas', value: 'Legs', iconGroup: 'legs' },
  { label: 'Brazos', value: 'Arms', iconGroup: 'arms' },
  { label: 'Core', value: 'Core', iconGroup: 'core' },
  { label: 'Cardio', value: 'Cardio', iconGroup: 'cardio' },
  { label: 'Full Body', value: 'Full Body', iconGroup: 'chest' },
];

interface MuscleGroupFilterProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function MuscleGroupFilter({ activeFilter, onFilterChange }: MuscleGroupFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 20 }}
    >
      {FILTER_GROUPS.map((fg) => {
        const active = activeFilter === fg.value;
        const gradientColor = MUSCLE_GRADIENTS[fg.iconGroup as keyof typeof MUSCLE_GRADIENTS]?.[0] ?? GENESIS_COLORS.primary;

        return (
          <Pressable
            key={fg.value}
            onPress={() => {
              hapticSelection();
              onFilterChange(active ? null : fg.value);
            }}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: active ? gradientColor + '25' : 'rgba(255,255,255,0.05)',
                borderRadius: 9999,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderWidth: 1,
                borderColor: active ? gradientColor : GENESIS_COLORS.borderSubtle,
              },
              active
                ? {
                    shadowColor: gradientColor,
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 4,
                  }
                : {},
            ]}
          >
            <MuscleGroupIcon
              group={fg.iconGroup}
              size={14}
              color={active ? gradientColor : GENESIS_COLORS.textMuted}
            />
            <Text
              style={{
                color: active ? gradientColor : GENESIS_COLORS.textMuted,
                fontSize: 10,
                fontFamily: 'JetBrainsMonoMedium',
                textTransform: 'uppercase',
              }}
            >
              {fg.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
