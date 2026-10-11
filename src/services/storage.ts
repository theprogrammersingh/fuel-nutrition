import { MealEntry, DailyGoals, AppSettings } from '../types';

const STORAGE_KEYS = {
  MEALS: 'fuel_meals_v1',
  GOALS: 'fuel_goals_v1',
  SETTINGS: 'fuel_settings_v1',
};

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    category: 'flash' as const,
    description: 'Latest high-performance vision multimodal model. Fast & reliable.',
    recommended: true,
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    category: 'flash_lite' as const,
    description: 'Ultra-low latency, highly efficient for rapid portion & calorie estimation.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    category: 'flash' as const,
    description: 'Balanced vision multimodal reasoning model.',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    category: 'flash_lite' as const,
    description: 'High-speed lightweight flash model.',
  },
];

export const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 140,
  dietaryFocus: 'omnivore',
};

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || '',
  selectedModel: 'gemini-3.8-flash',
  simulationMode: false,
};

// Stitch Design Pre-seeded Meals matching the Kinetic Fuel mockups
export const SEED_MEALS: MealEntry[] = [
  {
    id: 'seed-1',
    name: 'Avocado Toast & Boiled Eggs',
    description: '1 slice sourdough, 2 eggs',
    mealType: 'breakfast',
    timestamp: '08:30 AM',
    date: new Date().toISOString().split('T')[0],
    calories: 420,
    protein: 22,
    carbs: 28,
    fat: 26,
    portionMultiplier: 1.0,
    confidenceScore: 0.94,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'seed-2',
    name: 'Grilled Chicken Salad',
    description: 'Vinaigrette, 160g chicken, greens',
    mealType: 'lunch',
    timestamp: '01:15 PM',
    date: new Date().toISOString().split('T')[0],
    calories: 380,
    protein: 34,
    carbs: 12,
    fat: 18,
    portionMultiplier: 1.0,
    confidenceScore: 0.96,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'seed-3',
    name: 'Greek Yogurt & Berries',
    description: '170g nonfat yogurt, blueberries, chia',
    mealType: 'snack',
    timestamp: '04:45 PM',
    date: new Date().toISOString().split('T')[0],
    calories: 180,
    protein: 18,
    carbs: 22,
    fat: 2,
    portionMultiplier: 1.0,
    confidenceScore: 0.98,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'seed-4',
    name: 'Paneer Bhurji & Multigrain Rotis',
    description: 'Scrambled cottage cheese, turmeric, 2 rotis',
    mealType: 'dinner',
    timestamp: '07:30 PM',
    date: new Date().toISOString().split('T')[0],
    calories: 570,
    protein: 24,
    carbs: 48,
    fat: 32,
    portionMultiplier: 1.0,
    confidenceScore: 0.92,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
  }
];

export function getMeals(): MealEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(SEED_MEALS));
      return SEED_MEALS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load meals from localStorage', err);
    return SEED_MEALS;
  }
}

export function saveMeals(meals: MealEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  } catch (err) {
    console.error('Failed to save meals', err);
  }
}

export function addMeal(meal: MealEntry): MealEntry[] {
  const current = getMeals();
  const updated = [meal, ...current];
  saveMeals(updated);
  return updated;
}

export function deleteMeal(id: string): MealEntry[] {
  const current = getMeals();
  const updated = current.filter(m => m.id !== id);
  saveMeals(updated);
  return updated;
}

export function clearTodayMeals(): MealEntry[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const current = getMeals();
  const updated = current.filter(m => m.date !== todayStr);
  saveMeals(updated);
  return updated;
}

export function getGoals(): DailyGoals {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) return DEFAULT_GOALS;
    return { ...DEFAULT_GOALS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GOALS;
  }
}

export function saveGoals(goals: DailyGoals): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (err) {
    console.error('Failed to save goals', err);
  }
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function exportDataAsJson(): string {
  const data = {
    exportDate: new Date().toISOString(),
    goals: getGoals(),
    settings: { ...getSettings(), geminiApiKey: 'REDACTED' },
    meals: getMeals(),
  };
  return JSON.stringify(data, null, 2);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.MEALS);
  localStorage.removeItem(STORAGE_KEYS.GOALS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
