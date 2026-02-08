import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { Meal } from '../../types';

type MealCardProps = {
  meal: Meal;
};

export function MealCard({ meal }: MealCardProps) {
  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 4 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{meal.name}</Text>
      <Text style={{ color: theme.colors.textSecondary }}>{meal.time}</Text>
      <Text style={{ color: theme.colors.textSecondary }}>
        {meal.calories} kcal · P{meal.protein} C{meal.carbs} F{meal.fat}
      </Text>
    </View>
  );
}
