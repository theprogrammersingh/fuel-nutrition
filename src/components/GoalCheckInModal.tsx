import React, { useState, useEffect } from 'react';
import { DailyGoals, DietaryFocus, TargetGoal } from '../types';
import { calculateRecommendedMacros } from '../services/storage';

interface GoalCheckInModalProps {
  isOpen: boolean;
  goals: DailyGoals;
  onSaveGoals: (updatedGoals: DailyGoals) => void;
  onSnooze: () => void;
  onClose: () => void;
}

export const GoalCheckInModal: React.FC<GoalCheckInModalProps> = ({
  isOpen,
  goals,
  onSaveGoals,
  onSnooze,
  onClose,
}) => {
  const [weightKg, setWeightKg] = useState<number>(goals.currentWeightKg || 70);
  const [targetGoal, setTargetGoal] = useState<TargetGoal>(goals.targetGoal || 'maintain');
  const [dietaryFocus, setDietaryFocus] = useState<DietaryFocus>(goals.dietaryFocus || 'omnivore');
  const [calories, setCalories] = useState<number>(goals.calories || 2000);
  const [protein, setProtein] = useState<number>(goals.protein || 140);

  useEffect(() => {
    if (isOpen) {
      setWeightKg(goals.currentWeightKg || 70);
      setTargetGoal(goals.targetGoal || 'maintain');
      setDietaryFocus(goals.dietaryFocus || 'omnivore');
      setCalories(goals.calories || 2000);
      setProtein(goals.protein || 140);
    }
  }, [isOpen, goals]);

  if (!isOpen) return null;

  const handleWeightChange = (newWeight: number) => {
    const safeW = Math.max(30, Math.min(250, newWeight));
    setWeightKg(safeW);
    const rec = calculateRecommendedMacros(safeW, targetGoal);
    setCalories(rec.calories);
    setProtein(rec.protein);
  };

  const handleTargetGoalChange = (newGoal: TargetGoal) => {
    setTargetGoal(newGoal);
    const rec = calculateRecommendedMacros(weightKg, newGoal);
    setCalories(rec.calories);
    setProtein(rec.protein);
  };

  const handleRecalculate = () => {
    const rec = calculateRecommendedMacros(weightKg, targetGoal);
    setCalories(rec.calories);
    setProtein(rec.protein);
  };

  const handleSave = () => {
    const updated: DailyGoals = {
      ...goals,
      currentWeightKg: weightKg,
      targetGoal: targetGoal,
      dietaryFocus: dietaryFocus,
      calories: calories,
      protein: protein,
      lastGoalCheckInDate: new Date().toISOString(),
    };
    onSaveGoals(updated);
    onClose();
  };

  // Days since last check-in
  const daysSince = goals.lastGoalCheckInDate
    ? Math.max(0, Math.round((Date.now() - new Date(goals.lastGoalCheckInDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 14;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[92vh] bg-surface rounded-2xl border border-border-hairline shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="check-in-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-border-hairline bg-surface-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-neutral-bar text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">event_repeat</span>
            </div>
            <div className="flex flex-col">
              <h2 id="check-in-title" className="text-sm font-semibold text-text-primary tracking-tight">
                Bi-Weekly Goal Check-In
              </h2>
              <span className="text-[11px] text-text-muted">
                {daysSince} days since last calibration · Keep recommendations fresh
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-zinc-200 flex items-center justify-center text-text-muted hover:text-text-primary active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-surface-subtle border border-border-hairline flex items-center gap-2.5">
            <span className="material-symbols-outlined text-accent-neutral-bar text-[20px]">
              insights
            </span>
            <p className="text-xs text-text-secondary leading-snug">
              Regular check-ins keep your macro targets aligned with changes in body weight and whether you're cutting or bulking.
            </p>
          </div>

          {/* Current Weight */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="checkin-weight" className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
                Current Body Weight
              </label>
              <span className="text-[11px] text-text-muted font-mono">
                Previous: {goals.currentWeightKg || 70} kg
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="checkin-weight"
                type="number"
                min={35}
                max={250}
                value={weightKg}
                onChange={(e) => handleWeightChange(Number(e.target.value) || 70)}
                className="w-32 bg-surface-card font-mono text-base font-semibold px-3 py-2 rounded-xl border border-border-hairline focus:outline-hidden focus:border-zinc-500 shadow-xs"
              />
              <span className="text-sm font-medium text-text-primary">kg</span>
              <span className="text-xs text-text-muted font-mono">
                (~{Math.round(weightKg * 2.20462)} lbs)
              </span>
            </div>
          </div>

          {/* Target Goal Selector */}
          <div className="flex flex-col gap-2">
            <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
              Target Focus
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lose_weight' as TargetGoal, name: 'Lose Weight', subtitle: 'Deficit', icon: 'trending_down' },
                { id: 'maintain' as TargetGoal, name: 'Maintain', subtitle: 'Balance', icon: 'balance' },
                { id: 'bulking' as TargetGoal, name: 'Bulking', subtitle: 'Surplus', icon: 'trending_up' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTargetGoalChange(item.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    targetGoal === item.id
                      ? 'bg-accent-neutral-bar text-white border-accent-neutral-bar shadow-xs'
                      : 'bg-surface-subtle text-text-primary border-border-hairline hover:bg-zinc-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] mb-0.5">{item.icon}</span>
                  <span className="text-xs font-semibold">{item.name}</span>
                  <span className={`text-[10px] font-mono mt-0.5 ${targetGoal === item.id ? 'text-zinc-300' : 'text-text-muted'}`}>
                    {item.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Focus */}
          <div className="flex flex-col gap-1.5">
            <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
              Dietary Preference
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'omnivore', label: 'Omnivore' },
                { id: 'high_protein_veg', label: 'High-Protein Veg' },
                { id: 'pescatarian', label: 'Pescatarian' },
                { id: 'vegan', label: 'Vegan' },
                { id: 'keto', label: 'Keto' },
              ].map((diet) => (
                <button
                  key={diet.id}
                  type="button"
                  onClick={() => setDietaryFocus(diet.id as DietaryFocus)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    dietaryFocus === diet.id
                      ? 'bg-accent-neutral-bar text-white border-accent-neutral-bar shadow-xs'
                      : 'bg-surface-subtle text-text-secondary border-border-hairline hover:bg-zinc-100'
                  }`}
                >
                  {diet.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calibrated Target Numbers */}
          <div className="p-3.5 rounded-xl bg-surface-card border border-border-hairline shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">
                Daily Macro Targets
              </span>
              <button
                type="button"
                onClick={handleRecalculate}
                className="text-[11px] text-accent-neutral-bar hover:underline font-mono flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[13px]">refresh</span>
                Recalculate recommended
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                <span className="font-label-xs text-label-xs text-text-muted uppercase">Daily Energy</span>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="font-headline-lg text-xl font-bold text-text-primary">{calories}</span>
                  <span className="text-xs text-text-muted font-mono">kcal</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCalories((c) => Math.max(1000, c - 50))}
                    className="w-6 h-6 rounded bg-surface-card hover:bg-zinc-200 flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalories((c) => Math.min(5000, c + 50))}
                    className="w-6 h-6 rounded bg-surface-card hover:bg-zinc-200 flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                <span className="font-label-xs text-label-xs text-text-muted uppercase">Protein</span>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="font-headline-lg text-xl font-bold text-accent-neutral-bar">{protein}</span>
                  <span className="text-xs text-text-muted font-mono">g</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setProtein((p) => Math.max(40, p - 5))}
                    className="w-6 h-6 rounded bg-surface-card hover:bg-zinc-200 flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setProtein((p) => Math.min(350, p + 5))}
                    className="w-6 h-6 rounded bg-surface-card hover:bg-zinc-200 flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-hairline bg-surface-card flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onSnooze}
            className="px-3.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Remind in 2 Days
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-accent-neutral-bar text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-black active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>Update & Calibrate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
