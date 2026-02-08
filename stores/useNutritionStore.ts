import { create } from 'zustand';
import type { Meal } from '../types';

type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type NutritionState = {
  dailyGoal: number;
  meals: Meal[];
  water: number;
  targetWater: number;
  addMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;
  addWater: () => void;
  setWater: (value: number) => void;
  getDailyTotals: () => DailyTotals;
  getRemainingCalories: () => number;
};

export const useNutritionStore = create<NutritionState>((set, get) => ({
  dailyGoal: 2200,
  meals: [],
  water: 0,
  targetWater: 8,
  addMeal: (meal) => set((state) => ({ meals: [...state.meals, meal] })),
  removeMeal: (mealId) => set((state) => ({ meals: state.meals.filter((meal) => meal.id !== mealId) })),
  addWater: () => set((state) => ({ water: Math.min(state.water + 1, state.targetWater) })),
  setWater: (water) => set({ water }),
  getDailyTotals: () => {
    const meals = get().meals;
    return {
      calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
      carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
      fat: meals.reduce((sum, meal) => sum + meal.fat, 0),
    };
  },
  getRemainingCalories: () => {
    const state = get();
    const totals = state.getDailyTotals();
    return Math.max(0, state.dailyGoal - totals.calories);
  },
}));
