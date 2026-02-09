import { create } from 'zustand';
import type { Meal } from '../types';
import { hasSupabaseConfig } from '../services/supabaseClient';

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
  isLoading: boolean;
  addMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;
  addWater: () => void;
  setWater: (value: number) => void;
  getDailyTotals: () => DailyTotals;
  getRemainingCalories: () => number;
  fetchMeals: (date?: string) => Promise<void>;
  fetchWater: (date?: string) => Promise<void>;
};

export const useNutritionStore = create<NutritionState>((set, get) => ({
  dailyGoal: 2200,
  meals: [],
  water: 0,
  targetWater: 8,
  isLoading: false,

  addMeal: (meal) => {
    // Optimistic local update
    set((state) => ({ meals: [...state.meals, meal] }));

    // Persist to Supabase
    if (hasSupabaseConfig) {
      (async () => {
        try {
          const { insertMeal, getCurrentUserId } = await import('../services/supabaseQueries');
          const userId = getCurrentUserId();
          if (!userId) return;
          await insertMeal(userId, {
            date: new Date().toISOString().split('T')[0],
            meal_type: (meal.name.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack') || 'snack',
            food_items: [{ name: meal.name }],
            total_macros: { calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat },
          });
        } catch (err: any) {
          console.warn('addMeal persist failed:', err?.message);
        }
      })();
    }
  },

  removeMeal: (mealId) => set((state) => ({ meals: state.meals.filter((meal) => meal.id !== mealId) })),
  addWater: () => {
    const newWater = Math.min(get().water + 1, get().targetWater);
    set({ water: newWater });

    // Persist to Supabase
    if (hasSupabaseConfig) {
      (async () => {
        try {
          const { upsertWaterLog, getCurrentUserId } = await import('../services/supabaseQueries');
          const userId = getCurrentUserId();
          if (!userId) return;
          await upsertWaterLog(userId, new Date().toISOString().split('T')[0], newWater);
        } catch (err: any) {
          console.warn('addWater persist failed:', err?.message);
        }
      })();
    }
  },
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

  fetchMeals: async (date) => {
    set({ isLoading: true });
    try {
      if (hasSupabaseConfig) {
        const { fetchMealsForDate, getCurrentUserId } = await import('../services/supabaseQueries');
        const userId = getCurrentUserId();
        if (userId) {
          const data = await fetchMealsForDate(userId, date);
          if (data) {
            const meals: Meal[] = data.map((row: any) => {
              const macros = row.total_macros as Record<string, number>;
              return {
                id: row.id,
                name: row.meal_type,
                calories: macros?.calories ?? 0,
                protein: macros?.protein ?? 0,
                carbs: macros?.carbs ?? 0,
                fat: macros?.fat ?? 0,
                time: row.logged_at ? new Date(row.logged_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : '',
              };
            });
            set({ meals, isLoading: false });
            return;
          }
        }
      }
      // No fallback — meals start empty if no Supabase
    } catch (err: any) {
      console.warn('fetchMeals failed:', err?.message);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWater: async (date) => {
    try {
      if (hasSupabaseConfig) {
        const { fetchWaterLog, getCurrentUserId } = await import('../services/supabaseQueries');
        const userId = getCurrentUserId();
        if (userId) {
          const data = await fetchWaterLog(userId, date);
          if (data) {
            set({ water: data.glasses ?? 0 });
          }
        }
      }
    } catch (err: any) {
      console.warn('fetchWater failed:', err?.message);
    }
  },
}));
