import { useNutritionStore } from '../../stores/useNutritionStore';
import type { Meal } from '../../types/models';

const makeMeal = (overrides: Partial<Meal> = {}): Meal => ({
  id: `meal-${Date.now()}`,
  name: 'Chicken Bowl',
  calories: 500,
  protein: 40,
  carbs: 50,
  fat: 15,
  time: '12:00 PM',
  ...overrides,
});

beforeEach(() => {
  useNutritionStore.setState({
    dailyGoal: 2200,
    meals: [],
    water: 0,
    targetWater: 8,
    isLoading: false,
    error: null,
  });
});

describe('useNutritionStore', () => {
  it('has initial state with empty meals and water=0', () => {
    const state = useNutritionStore.getState();
    expect(state.meals).toEqual([]);
    expect(state.water).toBe(0);
    expect(state.dailyGoal).toBe(2200);
    expect(state.targetWater).toBe(8);
  });

  it('addMeal() adds meal to array', () => {
    const meal = makeMeal({ id: 'meal-1' });
    useNutritionStore.getState().addMeal(meal);
    const state = useNutritionStore.getState();
    expect(state.meals).toHaveLength(1);
    expect(state.meals[0].id).toBe('meal-1');
    expect(state.meals[0].calories).toBe(500);
  });

  it('removeMeal() filters by id', () => {
    const meal1 = makeMeal({ id: 'meal-1' });
    const meal2 = makeMeal({ id: 'meal-2', name: 'Salad', calories: 300 });
    useNutritionStore.getState().addMeal(meal1);
    useNutritionStore.getState().addMeal(meal2);
    expect(useNutritionStore.getState().meals).toHaveLength(2);

    useNutritionStore.getState().removeMeal('meal-1');
    const state = useNutritionStore.getState();
    expect(state.meals).toHaveLength(1);
    expect(state.meals[0].id).toBe('meal-2');
  });

  it('addWater() increments water (capped at targetWater)', () => {
    useNutritionStore.getState().addWater();
    expect(useNutritionStore.getState().water).toBe(1);

    // Set water to 7, addWater should cap at 8
    useNutritionStore.setState({ water: 7 });
    useNutritionStore.getState().addWater();
    expect(useNutritionStore.getState().water).toBe(8);

    // Adding water when already at max should stay at 8
    useNutritionStore.getState().addWater();
    expect(useNutritionStore.getState().water).toBe(8);
  });

  it('getDailyTotals() sums calories/protein/carbs/fat from meals', () => {
    useNutritionStore.getState().addMeal(makeMeal({ id: 'm1', calories: 500, protein: 40, carbs: 50, fat: 15 }));
    useNutritionStore.getState().addMeal(makeMeal({ id: 'm2', calories: 300, protein: 20, carbs: 30, fat: 10 }));

    const totals = useNutritionStore.getState().getDailyTotals();
    expect(totals.calories).toBe(800);
    expect(totals.protein).toBe(60);
    expect(totals.carbs).toBe(80);
    expect(totals.fat).toBe(25);
  });

  it('getRemainingCalories() returns dailyGoal minus totals', () => {
    useNutritionStore.getState().addMeal(makeMeal({ id: 'm1', calories: 800 }));
    const remaining = useNutritionStore.getState().getRemainingCalories();
    expect(remaining).toBe(2200 - 800);

    // If over goal, should return 0
    useNutritionStore.getState().addMeal(makeMeal({ id: 'm2', calories: 1500 }));
    const overRemaining = useNutritionStore.getState().getRemainingCalories();
    expect(overRemaining).toBe(0);
  });
});
