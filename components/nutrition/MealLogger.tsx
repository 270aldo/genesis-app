import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useNutritionStore } from '../../stores';

export function MealLogger() {
  const addMeal = useNutritionStore((state) => state.addMeal);
  const [name, setName] = useState('');

  return (
    <View style={{ gap: 8 }}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Log meal"
        placeholderTextColor={theme.colors.textTertiary}
        style={{ borderWidth: 1, borderColor: theme.colors.borderSubtle, borderRadius: 12, padding: 10, color: theme.colors.textPrimary }}
      />
      <Pressable
        onPress={() => {
          const value = name.trim();
          if (!value) return;
          addMeal({ id: `meal-${Date.now()}`, name: value, calories: 450, protein: 32, carbs: 40, fat: 18, time: new Date().toLocaleTimeString() });
          setName('');
        }}
        style={{ borderRadius: 12, alignItems: 'center', paddingVertical: 10, backgroundColor: `${theme.colors.primary}22` }}
      >
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Add meal</Text>
      </Pressable>
    </View>
  );
}
