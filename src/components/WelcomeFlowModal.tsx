import React, { useState } from 'react';
import { AVAILABLE_MODELS, calculateRecommendedMacros, DEFAULT_GOALS } from '../services/storage';
import { testGeminiApiKey } from '../services/gemini';
import { InstallGuide } from './InstallGuide';
import { DailyGoals, DietaryFocus, TargetGoal } from '../types';

interface WelcomeFlowModalProps {
  isOpen: boolean;
  initialApiKey: string;
  initialModel: string;
  initialGoals?: DailyGoals;
  onComplete: (apiKey: string, model: string, goals?: DailyGoals) => void;
  onDismiss?: () => void;
}

export const WelcomeFlowModal: React.FC<WelcomeFlowModalProps> = ({
  isOpen,
  initialApiKey,
  initialModel,
  initialGoals,
  onComplete,
  onDismiss,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [selectedModel, setSelectedModel] = useState(initialModel || 'gemini-3.8-flash');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Goal & Weight Profile State
  const baseGoals = initialGoals || DEFAULT_GOALS;
  const [weightKg, setWeightKg] = useState<number>(baseGoals.currentWeightKg || 70);
  const [targetGoal, setTargetGoal] = useState<TargetGoal>(baseGoals.targetGoal || 'maintain');
  const [dietaryFocus, setDietaryFocus] = useState<DietaryFocus>(baseGoals.dietaryFocus || 'omnivore');
  const [calories, setCalories] = useState<number>(baseGoals.calories || 2000);
  const [protein, setProtein] = useState<number>(baseGoals.protein || 140);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    const res = await testGeminiApiKey(apiKey.trim(), selectedModel);
    setIsTestingKey(false);
    setTestResult(res);
  };

  const handleWeightChange = (newWeight: number) => {
    const safeW = Math.max(30, Math.min(250, newWeight));
    setWeightKg(safeW);
    const recommended = calculateRecommendedMacros(safeW, targetGoal);
    setCalories(recommended.calories);
    setProtein(recommended.protein);
  };

  const handleTargetGoalChange = (newGoal: TargetGoal) => {
    setTargetGoal(newGoal);
    const recommended = calculateRecommendedMacros(weightKg, newGoal);
    setCalories(recommended.calories);
    setProtein(recommended.protein);
  };

  const handleFinalize = () => {
    const updatedGoals: DailyGoals = {
      currentWeightKg: weightKg,
      targetGoal: targetGoal,
      dietaryFocus: dietaryFocus,
      calories: calories,
      protein: protein,
      lastGoalCheckInDate: new Date().toISOString(),
    };
    onComplete(apiKey.trim(), selectedModel.trim(), updatedGoals);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[90vh] bg-surface rounded-2xl border border-border-hairline shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-flow-title"
      >
        {/* Wizard Header */}
        <div className="p-4 border-b border-border-hairline bg-surface-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-neutral-bar text-white flex items-center justify-center font-bold text-sm shadow-xs">
              F
            </div>
            <div className="flex flex-col">
              <h2 id="welcome-flow-title" className="text-sm font-semibold text-text-primary tracking-tight">
                Welcome to Fuel
              </h2>
              <span className="text-[11px] text-text-muted">Personal Nutrition Intelligence</span>
            </div>
          </div>

          {/* Step Pill Indicators */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((stepNum) => (
              <button
                key={stepNum}
                type="button"
                onClick={() => setCurrentStep(stepNum as 1 | 2 | 3 | 4)}
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                  currentStep === stepNum
                    ? 'bg-accent-neutral-bar text-white shadow-xs'
                    : currentStep > stepNum
                    ? 'bg-accent-success-bg text-accent-success border border-emerald-200'
                    : 'bg-surface-subtle text-text-muted border border-border-hairline'
                }`}
                aria-label={`Step ${stepNum}`}
              >
                {currentStep > stepNum ? (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                ) : (
                  stepNum
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Step Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* STEP 1: WELCOME & OVERVIEW */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div className="flex flex-col gap-1.5 text-center py-2">
                <span className="font-label-xs text-label-xs uppercase tracking-widest text-accent-neutral-bar font-mono">
                  Reductive Intelligence
                </span>
                <h3 className="font-headline-lg text-2xl font-bold text-text-primary tracking-tight">
                  Track Nutrition in Seconds
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                  Fuel replaces tedious calorie counting with instant Gemini Multimodal Vision analysis, right from your device.
                </p>
              </div>

              {/* Feature Highlights Cards */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                <div className="p-3.5 rounded-xl bg-surface-card border border-border-hairline flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-subtle flex items-center justify-center text-text-primary shrink-0 border border-border-hairline">
                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Instant Plate Analysis</span>
                    <span className="text-[11px] text-text-muted mt-0.5 leading-snug">
                      Snap a photo of your food. Gemini calculates calories, protein, carbs, and fat automatically.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-card border border-border-hairline flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-subtle flex items-center justify-center text-text-primary shrink-0 border border-border-hairline">
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Your Own API Key & Model Choice</span>
                    <span className="text-[11px] text-text-muted mt-0.5 leading-snug">
                      Choose between Gemini 3.8 Flash or Flash-Lite. Zero subscription fees, completely under your control.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-card border border-border-hairline flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-subtle flex items-center justify-center text-text-primary shrink-0 border border-border-hairline">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Private & Local-First</span>
                    <span className="text-[11px] text-text-muted mt-0.5 leading-snug">
                      Your meal history and credentials stay securely in your browser's local storage.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GEMINI API KEY & MODEL SELECTION */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-accent-neutral-bar">smart_toy</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    AI Vision Core Configuration
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Fuel connects directly to Google Gemini using your API key. Select the model that fits your preference:
                </p>
              </div>

              {/* Model Selection List */}
              <div className="flex flex-col gap-2">
                <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
                  Select Multimodal Model
                </span>
                <div className="flex flex-col gap-2">
                  {AVAILABLE_MODELS.map((m) => (
                    <label
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedModel === m.id
                          ? 'border-accent-neutral-bar bg-surface-subtle shadow-xs'
                          : 'border-border-hairline bg-surface-card hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-text-primary">{m.name}</span>
                          {m.recommended && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent-success-bg text-accent-success font-medium">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted mt-0.5">{m.description}</span>
                      </div>
                      <input
                        type="radio"
                        name="welcomeModelChoice"
                        checked={selectedModel === m.id}
                        onChange={() => setSelectedModel(m.id)}
                        className="mt-1 accent-zinc-900"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
                  Google Gemini API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-surface-subtle font-mono text-xs px-3 py-2.5 rounded-lg border border-border-hairline focus:outline-hidden focus:border-zinc-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 text-text-muted hover:text-text-primary p-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showApiKey ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted pt-0.5">
                  <span>Free key from Google AI Studio</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-primary underline font-medium hover:text-black"
                  >
                    Get API Key ↗
                  </a>
                </div>
              </div>

              {/* Key Validation Feedback */}
              {testResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-accent-success-bg text-accent-success border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {testResult.success ? 'check_circle' : 'error'}
                  </span>
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Test Key Button */}
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTestingKey || !apiKey.trim()}
                className="py-2 px-3 rounded-lg border border-border-hairline bg-surface-subtle hover:bg-zinc-100 disabled:opacity-40 text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                {isTestingKey ? (
                  <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[14px]">electrical_services</span>
                )}
                Test Connection with {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Gemini'}
              </button>
            </div>
          )}

          {/* STEP 3: GOALS, WEIGHT & TARGET PROFILE */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-accent-neutral-bar">fitness_center</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    Calibrate Your Targets & Stats
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Fuel customizes your daily macro budget and adapts food suggestions based on whether you're cutting or bulking:
                </p>
              </div>

              {/* Weight Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
                    Current Body Weight
                  </label>
                  <span className="text-[11px] text-text-muted font-mono">Used for macro baseline</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
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
                  What is your primary target?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'lose_weight' as TargetGoal,
                      name: 'Lose Weight',
                      subtitle: 'Calorie Deficit',
                      icon: 'trending_down',
                      desc: 'High-volume, lean protein to preserve muscle in a deficit.',
                    },
                    {
                      id: 'maintain' as TargetGoal,
                      name: 'Maintain',
                      subtitle: 'Energy Balance',
                      icon: 'balance',
                      desc: 'Steady baseline calories and balanced protein intake.',
                    },
                    {
                      id: 'bulking' as TargetGoal,
                      name: 'Bulking',
                      subtitle: 'Muscle Surplus',
                      icon: 'trending_up',
                      desc: 'Calorie & protein-dense pairings for lean hypertrophy.',
                    },
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => handleTargetGoalChange(goal.id)}
                      className={`p-3 rounded-xl border flex flex-col items-start text-left transition-all ${
                        targetGoal === goal.id
                          ? 'border-accent-neutral-bar bg-surface-subtle shadow-xs'
                          : 'border-border-hairline bg-surface-card hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 w-full justify-between mb-1">
                        <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-accent-neutral-bar">
                            {goal.icon}
                          </span>
                          {goal.name}
                        </span>
                        {targetGoal === goal.id && (
                          <span className="w-2 h-2 rounded-full bg-accent-neutral-bar"></span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-accent-neutral-bar uppercase tracking-wider">
                        {goal.subtitle}
                      </span>
                      <span className="text-[11px] text-text-muted mt-1 leading-snug">
                        {goal.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Focus */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
                  Dietary Focus
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

              {/* Auto-Calculated Targets Box */}
              <div className="p-3.5 rounded-xl bg-surface-card border border-border-hairline shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">
                    Calibrated Daily Targets
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const rec = calculateRecommendedMacros(weightKg, targetGoal);
                      setCalories(rec.calories);
                      setProtein(rec.protein);
                    }}
                    className="text-[11px] text-accent-neutral-bar hover:underline font-mono flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[13px]">refresh</span>
                    Reset recommended
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
                    <span className="font-label-xs text-label-xs text-text-muted uppercase">Protein Intake</span>
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
          )}

          {/* STEP 4: INSTALL APP ON DEVICE */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-2 duration-150">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-accent-neutral-bar">install_mobile</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    Install Fuel on Your Device
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  For the best experience (full-screen, instant camera launch, zero browser URL bars), add Fuel to your Home Screen:
                </p>
              </div>

              {/* Embed Full Interactive Install Guide */}
              <InstallGuide onInstalled={handleFinalize} />
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-border-hairline bg-surface-card flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
              className="px-3.5 py-2 rounded-xl border border-border-hairline bg-surface-subtle text-text-secondary hover:text-text-primary text-xs font-medium active:scale-95 transition-all"
            >
              Back
            </button>
          ) : onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-text-muted hover:text-text-primary transition-colors px-1"
            >
              Skip setup
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}
                className="px-4 py-2 rounded-xl bg-accent-neutral-bar text-white text-xs font-medium hover:bg-black active:scale-95 transition-all shadow-xs flex items-center gap-1"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalize}
                className="px-5 py-2.5 rounded-xl bg-accent-neutral-bar text-white text-xs font-medium hover:bg-black active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Get Started with Fuel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
