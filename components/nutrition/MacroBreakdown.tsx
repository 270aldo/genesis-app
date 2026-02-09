import { View } from 'react-native';
import type { Meal } from '../../types';
import { MacroBar } from '../charts';
import { GENESIS_COLORS } from '../../constants/colors';

type MacroBreakdownProps = {
  meals: Meal[];
};

export function MacroBreakdown({ meals }: MacroBreakdownProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <View style={{ gap: 10 }}>
      <MacroBar label="Protein" value={totals.protein} target={180} color={GENESIS_COLORS.info} />
      <MacroBar label="Carbs" value={totals.carbs} target={260} color={GENESIS_COLORS.success} />
      <MacroBar label="Fat" value={totals.fat} target={80} color={GENESIS_COLORS.warning} />
    </View>
  );
}
