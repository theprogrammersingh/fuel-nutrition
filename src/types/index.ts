export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  name: string;
  description: string;
  mealType: MealType;
  timestamp: string; // e.g. "08:30 AM"
  date: string;      // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string;
  portionMultiplier: number;
  confidenceScore?: number;
}

export type DietaryFocus = 'omnivore' | 'high_protein_veg' | 'pescatarian' | 'vegan' | 'keto';

export interface DailyGoals {
  calories: number;
  protein: number;
  dietaryFocus: DietaryFocus;
}

export interface ModelOption {
  id: string;
  name: string;
  category: 'flash' | 'flash_lite' | 'custom';
  description: string;
  recommended?: boolean;
}

export interface AppSettings {
  geminiApiKey: string;
  selectedModel: string;
  simulationMode: boolean;
}

export interface GeminiInferenceResult {
  dish_name: string;
  portion_estimate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence_score: number;
  ingredients?: string[];
}

export interface RecommendationItem {
  name: string;
  calories: number;
  protein: number;
}

export interface NudgeState {
  scenario: 'A' | 'B' | 'C';
  title: string;
  message: string;
  remainingCalories: number;
  remainingProtein: number;
  recommendations: RecommendationItem[];
  dismissed?: boolean;
}

export type ActiveTab = 'today' | 'scan' | 'review' | 'settings';
