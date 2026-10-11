import React, { useState } from 'react';
import { GeminiInferenceResult, MealEntry, MealType } from '../types';

interface ReviewViewProps {
  initialResult: GeminiInferenceResult | null;
  initialImage: string | null;
  onConfirmLog: (meal: MealEntry) => void;
  onCancel: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  initialResult,
  initialImage,
  onConfirmLog,
  onCancel,
}) => {
  // Fallback defaults if no scan has happened yet
  const fallbackResult: GeminiInferenceResult = {
    dish_name: 'Paneer Bhurji with 2 Rotis',
    portion_estimate: '1 bowl scrambled paneer + 2 rotis',
    calories: 480,
    protein: 24,
    carbs: 42,
    fat: 22,
    confidence_score: 0.96,
    ingredients: ['Cottage Cheese', 'Whole Wheat Rotis', 'Onions & Tomatoes', 'Ghee / Spices']
  };

  const currentResult = initialResult || fallbackResult;
  const currentImage = initialImage || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80';

  const [dishName, setDishName] = useState(currentResult.dish_name);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  
  // Base raw values from inference
  const baseCalories = currentResult.calories;
  const baseProtein = currentResult.protein;
  const baseCarbs = currentResult.carbs || 30;
  const baseFat = currentResult.fat || 15;

  // Editable values
  const [calories, setCalories] = useState<number>(Math.round(baseCalories * portionMultiplier));
  const [protein, setProtein] = useState<number>(Math.round(baseProtein * portionMultiplier));

  const handleMultiplierChange = (multiplier: number) => {
    setPortionMultiplier(multiplier);
    setCalories(Math.round(baseCalories * multiplier));
    setProtein(Math.round(baseProtein * multiplier));
  };

  const handleConfirm = () => {
    const newMeal: MealEntry = {
      id: `meal-${Date.now()}`,
      name: dishName.trim() || 'Logged Meal',
      description: currentResult.portion_estimate,
      mealType: mealType,
      timestamp: new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date()),
      date: new Date().toISOString().split('T')[0],
      calories: Math.max(1, calories),
      protein: Math.max(0, protein),
      carbs: Math.round(baseCarbs * portionMultiplier),
      fat: Math.round(baseFat * portionMultiplier),
      imageUrl: currentImage,
      portionMultiplier: portionMultiplier,
      confidenceScore: currentResult.confidence_score,
    };

    onConfirmLog(newMeal);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-gutter pb-28 pt-2 gap-space-md select-none">
      {/* AI Processing Status Indicator Strip */}
      <div className="w-full bg-surface-card rounded-xl p-space-sm border border-border-hairline shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-accent-success-bg text-accent-success shrink-0">
            <span className="material-symbols-outlined text-[16px] icon-filled">check</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-label-xs text-label-xs text-text-primary uppercase tracking-wider font-semibold">
                Vision Engine Verified
              </span>
              <span className="w-1 h-1 rounded-full bg-accent-success"></span>
            </div>
            <p className="font-mono-data text-mono-data text-text-muted truncate text-[11px]">
              Analyzed plate geometry & portion density
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-surface-subtle px-2 py-1 rounded-full shrink-0">
          <span className="material-symbols-outlined text-[13px] text-accent-success icon-filled">verified</span>
          <span className="font-label-xs text-label-xs text-text-primary font-medium">
            {Math.round((currentResult.confidence_score || 0.95) * 100)}% Conf.
          </span>
        </div>
      </div>

      {/* Dish Card with Image & Editable Metadata */}
      <div className="bg-surface-card rounded-xl border border-border-hairline shadow-sm p-space-md flex flex-col gap-space-md">
        <div className="flex items-start gap-space-md">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-subtle shrink-0 border border-border-hairline">
            <img src={currentImage} alt={dishName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <label className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider mb-1">
              Dish Title
            </label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="font-headline-md text-headline-md font-semibold text-text-primary bg-surface-subtle/70 px-2.5 py-1.5 rounded-lg border border-border-hairline focus:outline-hidden focus:border-zinc-500 w-full"
            />
            <span className="font-mono-data text-mono-data text-text-muted mt-1 text-xs">
              {currentResult.portion_estimate}
            </span>
          </div>
        </div>

        {/* Meal Type Segmented Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-subtle rounded-lg">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`flex-1 py-1 text-xs capitalize rounded-md transition-all font-medium ${
                mealType === type
                  ? 'bg-white text-text-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Portion Density Multiplier */}
      <div className="bg-surface-card rounded-xl border border-border-hairline shadow-sm p-space-md flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
            Portion Size Density
          </span>
          <span className="font-mono-data text-mono-data text-text-primary font-medium">
            {portionMultiplier}x Multiplier
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Light', mult: 0.75, desc: '0.75x Plate' },
            { label: 'Standard', mult: 1.0, desc: '1.0x Normal' },
            { label: 'Hearty', mult: 1.5, desc: '1.5x Large' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleMultiplierChange(item.mult)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all ${
                portionMultiplier === item.mult
                  ? 'bg-accent-neutral-bar text-white border-accent-neutral-bar shadow-xs'
                  : 'bg-surface-subtle text-text-primary border-border-hairline hover:bg-zinc-100'
              }`}
            >
              <span className="font-headline-md text-xs font-semibold">{item.label}</span>
              <span className={`text-[10px] font-mono mt-0.5 ${portionMultiplier === item.mult ? 'text-zinc-300' : 'text-text-muted'}`}>
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Editable Nutrient Steppers */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calories Stepper */}
        <div className="bg-surface-card rounded-xl border border-border-hairline shadow-sm p-3.5 flex flex-col justify-between">
          <span className="font-label-xs text-label-xs text-text-muted uppercase">Energy</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-headline-lg text-2xl font-bold text-text-primary">
              {calories}
            </span>
            <span className="text-xs text-text-muted font-mono">kcal</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-hairline">
            <button
              onClick={() => setCalories((c) => Math.max(10, c - 25))}
              className="w-8 h-8 rounded-md bg-surface-subtle hover:bg-zinc-200 flex items-center justify-center text-text-primary active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-mono text-[11px] text-text-muted">±25</span>
            <button
              onClick={() => setCalories((c) => c + 25)}
              className="w-8 h-8 rounded-md bg-surface-subtle hover:bg-zinc-200 flex items-center justify-center text-text-primary active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>

        {/* Protein Stepper */}
        <div className="bg-surface-card rounded-xl border border-border-hairline shadow-sm p-3.5 flex flex-col justify-between">
          <span className="font-label-xs text-label-xs text-text-muted uppercase">Protein</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-headline-lg text-2xl font-bold text-accent-neutral-bar">
              {protein}
            </span>
            <span className="text-xs text-text-muted font-mono">g</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-hairline">
            <button
              onClick={() => setProtein((p) => Math.max(0, p - 2))}
              className="w-8 h-8 rounded-md bg-surface-subtle hover:bg-zinc-200 flex items-center justify-center text-text-primary active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-mono text-[11px] text-text-muted">±2g</span>
            <button
              onClick={() => setProtein((p) => p + 2)}
              className="w-8 h-8 rounded-md bg-surface-subtle hover:bg-zinc-200 flex items-center justify-center text-text-primary active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Macronutrient Pills */}
      <div className="bg-surface-card rounded-xl border border-border-hairline shadow-sm p-space-md flex flex-col gap-2">
        <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
          Estimated Macronutrient Profile
        </span>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col p-2 rounded-lg bg-surface-subtle text-center">
            <span className="text-[11px] text-text-muted">Protein</span>
            <span className="font-mono text-sm font-semibold text-text-primary mt-0.5">{protein}g</span>
          </div>
          <div className="flex flex-col p-2 rounded-lg bg-surface-subtle text-center">
            <span className="text-[11px] text-text-muted">Carbs</span>
            <span className="font-mono text-sm font-semibold text-text-primary mt-0.5">{Math.round(baseCarbs * portionMultiplier)}g</span>
          </div>
          <div className="flex flex-col p-2 rounded-lg bg-surface-subtle text-center">
            <span className="text-[11px] text-text-muted">Fat</span>
            <span className="font-mono text-sm font-semibold text-text-primary mt-0.5">{Math.round(baseFat * portionMultiplier)}g</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 px-4 rounded-xl bg-accent-neutral-bar text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 hover:bg-black transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">check</span>
          Confirm & Log Meal
        </button>
        <button
          onClick={onCancel}
          className="w-full py-2.5 text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
