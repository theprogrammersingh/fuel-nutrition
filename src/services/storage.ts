import { MealEntry, DailyGoals, AppSettings } from '../types';

const STORAGE_KEYS = {
  MEALS: 'fuel_meals_v1',
  GOALS: 'fuel_goals_v1',
  SETTINGS: 'fuel_settings_v1',
  ONBOARDED: 'fuel_onboarded_v1',
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

export const SEED_MEALS: MealEntry[] = [];

export function getMeals(): MealEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load meals from localStorage', err);
    return [];
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
  localStorage.removeItem(STORAGE_KEYS.ONBOARDED);
}

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  } catch {
    return false;
  }
}

export function setOnboarded(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, value ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to save onboarding state', err);
  }
}
