import React, { useState, useEffect } from 'react';
import { DailyGoals, AppSettings, DietaryFocus, TargetGoal } from '../types';
import { AVAILABLE_MODELS, exportDataAsJson, calculateRecommendedMacros } from '../services/storage';
import { testGeminiApiKey } from '../services/gemini';

import { getDeviceInfo, checkForAppUpdate, isAppUpdateAvailable, triggerSimulatedUpdate } from '../services/pwa';

interface SettingsViewProps {
  goals: DailyGoals;
  settings: AppSettings;
  onUpdateGoals: (goals: DailyGoals) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetToday: () => void;
  onClearAll: () => void;
  mealCount: number;
  onOpenInstallGuide: () => void;
  onOpenWelcomeFlow: () => void;
  onOpenGoalCheckIn?: () => void;
  onOpenUpdateModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  goals,
  settings,
  onUpdateGoals,
  onUpdateSettings,
  onResetToday,
  onClearAll,
  mealCount,
  onOpenInstallGuide,
  onOpenWelcomeFlow,
  onOpenGoalCheckIn,
  onOpenUpdateModal,
}) => {
  const deviceInfo = getDeviceInfo();
  const [calorieTarget, setCalorieTarget] = useState(goals.calories);
  const [proteinTarget, setProteinTarget] = useState(goals.protein);
  const [dietaryFocus, setDietaryFocus] = useState<DietaryFocus>(goals.dietaryFocus);
  const [weightKg, setWeightKg] = useState<number>(goals.currentWeightKg || 70);
  const [targetGoal, setTargetGoal] = useState<TargetGoal>(goals.targetGoal || 'maintain');

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatusMessage, setUpdateStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setCalorieTarget(goals.calories);
    setProteinTarget(goals.protein);
    setDietaryFocus(goals.dietaryFocus);
    setWeightKg(goals.currentWeightKg || 70);
    setTargetGoal(goals.targetGoal || 'maintain');
  }, [goals]);

  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleWeightChange = (newWeight: number) => {
    const safeW = Math.max(30, Math.min(250, newWeight));
    setWeightKg(safeW);
    onUpdateGoals({ ...goals, currentWeightKg: safeW });
  };

  const handleTargetGoalChange = (newGoal: TargetGoal) => {
    setTargetGoal(newGoal);
    onUpdateGoals({ ...goals, targetGoal: newGoal });
  };

  const handleAutoRecalculateMacros = () => {
    const rec = calculateRecommendedMacros(weightKg, targetGoal);
    setCalorieTarget(rec.calories);
    setProteinTarget(rec.protein);
    onUpdateGoals({
      ...goals,
      currentWeightKg: weightKg,
      targetGoal: targetGoal,
      calories: rec.calories,
      protein: rec.protein,
      lastGoalCheckInDate: new Date().toISOString(),
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const handleGoalCalorieChange = (delta: number) => {
    const val = Math.max(1000, Math.min(5000, calorieTarget + delta));
    setCalorieTarget(val);
    onUpdateGoals({ ...goals, calories: val });
  };

  const handleGoalProteinChange = (delta: number) => {
    const val = Math.max(40, Math.min(350, proteinTarget + delta));
    setProteinTarget(val);
    onUpdateGoals({ ...goals, protein: val });
  };

  const handleDietaryChange = (focus: DietaryFocus) => {
    setDietaryFocus(focus);
    onUpdateGoals({ ...goals, dietaryFocus: focus });
  };

  const handleSaveApiSettings = () => {
    onUpdateSettings({
      geminiApiKey: apiKey.trim(),
      selectedModel: selectedModel.trim(),
      simulationMode: false,
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    const res = await testGeminiApiKey(apiKey, selectedModel);
    setIsTestingKey(false);
    setTestResult(res);
  };

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatusMessage(null);
    const result = await checkForAppUpdate();
    setIsCheckingUpdate(false);
    setUpdateStatusMessage(result.message);
    if (result.hasUpdate && onOpenUpdateModal) {
      onOpenUpdateModal();
    }
  };

  const handlePreviewUpdateModal = () => {
    triggerSimulatedUpdate(true);
    if (onOpenUpdateModal) {
      onOpenUpdateModal();
    }
  };

  const handleDownloadExport = () => {
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel_data_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-gutter pb-28 pt-2 gap-space-lg select-none">
      {/* SECTION 1: GOAL SETTING ENGINE */}
      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
            Goal Setting Engine
          </span>
          <span className="font-mono-data text-mono-data text-accent-success flex items-center gap-1 text-xs">
            <span className="material-symbols-outlined text-[14px] icon-filled">bolt</span>
            Calibrated
          </span>
        </div>

        {/* Body Stats & Target Focus Card */}
        <div className="p-space-lg rounded-xl bg-surface-card border border-border-hairline shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-headline-md text-sm font-semibold text-text-primary">
                Body Stats & Target Focus
              </span>
              <span className="text-[11px] text-text-muted">
                Drives your personalized macro targets & AI meal suggestions
              </span>
            </div>
            {onOpenGoalCheckIn && (
              <button
                type="button"
                onClick={onOpenGoalCheckIn}
                className="px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-zinc-200 text-text-primary border border-border-hairline text-xs font-medium active:scale-95 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                Check In
              </button>
            )}
          </div>

          {/* Current Weight Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="settings-weight" className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
              Current Body Weight
            </label>
            <div className="flex items-center gap-2">
              <input
                id="settings-weight"
                type="number"
                min={35}
                max={250}
                value={weightKg}
                onChange={(e) => handleWeightChange(Number(e.target.value) || 70)}
                className="w-28 bg-surface-subtle font-mono text-sm font-semibold px-3 py-2 rounded-lg border border-border-hairline focus:outline-hidden focus:border-zinc-500"
              />
              <span className="text-xs font-semibold text-text-primary">kg</span>
              <span className="text-xs text-text-muted font-mono">
                (~{Math.round(weightKg * 2.20462)} lbs)
              </span>
            </div>
          </div>

          {/* Target Goal Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
              Primary Goal Target
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lose_weight' as TargetGoal, name: 'Lose Weight', subtitle: 'Deficit', icon: 'trending_down' },
                { id: 'maintain' as TargetGoal, name: 'Maintain', subtitle: 'Balance', icon: 'balance' },
                { id: 'bulking' as TargetGoal, name: 'Bulking', subtitle: 'Surplus', icon: 'trending_up' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleTargetGoalChange(g.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    targetGoal === g.id
                      ? 'bg-accent-neutral-bar text-white border-accent-neutral-bar shadow-xs'
                      : 'bg-surface-subtle text-text-primary border-border-hairline hover:bg-zinc-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] mb-0.5">{g.icon}</span>
                  <span className="text-xs font-semibold">{g.name}</span>
                  <span className={`text-[10px] font-mono mt-0.5 ${targetGoal === g.id ? 'text-zinc-300' : 'text-text-muted'}`}>
                    {g.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Calculate Action */}
          <div className="pt-2 border-t border-border-hairline flex items-center justify-between">
            <span className="text-[11px] text-text-muted">
              Auto-calculate targets from weight & goal:
            </span>
            <button
              type="button"
              onClick={handleAutoRecalculateMacros}
              className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-zinc-200 text-text-primary border border-border-hairline text-xs font-medium active:scale-95 transition-all flex items-center gap-1 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
              Auto-Calculate
            </button>
          </div>
        </div>

        {/* Calorie Step Card */}
        <div className="p-space-lg rounded-xl bg-surface-card border border-border-hairline shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-md text-label-md text-text-secondary block">
                Daily Calorie Target
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline-lg text-2xl font-bold text-text-primary">
                  {calorieTarget.toLocaleString()}
                </span>
                <span className="font-label-md text-label-md text-text-muted">kcal</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg">
              <button
                onClick={() => handleGoalCalorieChange(-50)}
                aria-label="Decrease 50 calories"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-card border border-border-hairline text-text-primary shadow-xs active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="font-label-xs text-label-xs text-text-muted px-1.5 font-mono">
                50
              </span>
              <button
                onClick={() => handleGoalCalorieChange(50)}
                aria-label="Increase 50 calories"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-card border border-border-hairline text-text-primary shadow-xs active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
          {/* Step Range Visual Rail */}
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden relative">
            <div
              className="h-full bg-accent-neutral-bar rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (calorieTarget / 3500) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Protein Step Card */}
        <div className="p-space-lg rounded-xl bg-surface-card border border-border-hairline shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-md text-label-md text-text-secondary block">
                Daily Protein Target
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline-lg text-2xl font-bold text-text-primary">
                  {proteinTarget}
                </span>
                <span className="font-label-md text-label-md text-text-muted">g</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg">
              <button
                onClick={() => handleGoalProteinChange(-5)}
                aria-label="Decrease 5g protein"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-card border border-border-hairline text-text-primary shadow-xs active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="font-label-xs text-label-xs text-text-muted px-1.5 font-mono">
                5g
              </span>
              <button
                onClick={() => handleGoalProteinChange(5)}
                aria-label="Increase 5g protein"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-card border border-border-hairline text-text-primary shadow-xs active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
          {/* Step Range Visual Rail */}
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden relative">
            <div
              className="h-full bg-accent-neutral-bar rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (proteinTarget / 250) * 100)}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DIETARY FOCUS */}
      <section className="flex flex-col gap-space-sm">
        <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
          Dietary Profile
        </span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'omnivore', label: 'Omnivore' },
            { id: 'high_protein_veg', label: 'High-Protein Veg' },
            { id: 'pescatarian', label: 'Pescatarian' },
            { id: 'vegan', label: 'Vegan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleDietaryChange(item.id as DietaryFocus)}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                dietaryFocus === item.id
                  ? 'bg-accent-neutral-bar text-white border-accent-neutral-bar shadow-xs'
                  : 'bg-surface-card text-text-primary border-border-hairline hover:bg-zinc-100'
              }`}
            >
              <span>{item.label}</span>
              {dietaryFocus === item.id && (
                <span className="material-symbols-outlined text-[16px]">check</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: GEMINI FLASH MODEL & API KEY CONFIG */}
      <section className="p-space-lg rounded-xl bg-surface-card border border-border-hairline shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-accent-neutral-bar">
              smart_toy
            </span>
            <span className="font-label-xs text-label-xs text-text-primary uppercase tracking-wider font-semibold">
              Gemini Vision Core
            </span>
          </div>
          <span className="font-mono-data text-xs text-accent-success font-medium">Flash Multimodal</span>
        </div>

        {/* Model Selection */}
        <div className="flex flex-col gap-2">
          <label className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
            Choose Flash Model
          </label>
          <div className="flex flex-col gap-2">
            {AVAILABLE_MODELS.map((m) => (
              <label
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-all ${
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
                  name="modelChoice"
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
          <span className="text-[11px] text-text-muted leading-tight">
            Key is stored locally in your browser. Get a key at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-text-primary underline font-medium"
            >
              Google AI Studio
            </a>
            .
          </span>
        </div>


        {/* Test Result Message */}
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

        {/* Actions for API configuration */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTestingKey}
            className="flex-1 py-2 px-3 rounded-lg border border-border-hairline bg-surface-subtle hover:bg-zinc-100 text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            {isTestingKey ? (
              <span className="material-symbols-outlined text-[14px] animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[14px]">electrical_services</span>
            )}
            Test Key
          </button>

          <button
            type="button"
            onClick={handleSaveApiSettings}
            className="flex-1 py-2 px-3 rounded-lg bg-accent-neutral-bar text-white text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-black shadow-xs"
          >
            <span className="material-symbols-outlined text-[14px]">save</span>
            {savedNotification ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </section>

      {/* SECTION 4: APP INSTALLATION & PWA */}
      <section className="p-space-lg rounded-xl bg-surface-card border border-border-hairline shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-accent-neutral-bar">
              install_mobile
            </span>
            <span className="font-label-xs text-label-xs text-text-primary uppercase tracking-wider font-semibold">
              App Installation & Device
            </span>
          </div>
          {deviceInfo.isStandalone ? (
            <span className="font-mono-data text-xs text-accent-success font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-success"></span>
              Installed
            </span>
          ) : (
            <span className="font-mono-data text-xs text-text-muted font-medium">Browser Mode</span>
          )}
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          {deviceInfo.isStandalone
            ? 'Fuel is installed on your device with full standalone camera, offline cache, and display permissions.'
            : 'Add Fuel directly to your Home Screen or Dock for full-screen launching, offline caching, and faster camera scanning.'}
        </p>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenInstallGuide}
            className="w-full py-2.5 px-3 rounded-lg bg-accent-neutral-bar text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-black active:scale-98 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">
              {deviceInfo.isStandalone ? 'visibility' : 'add_to_home_screen'}
            </span>
            <span>{deviceInfo.isStandalone ? 'View Installation Guide' : 'Install Fuel App (Guide & 1-Click)'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenWelcomeFlow}
            className="w-full py-2 px-3 rounded-lg bg-surface-subtle hover:bg-zinc-100 text-text-secondary hover:text-text-primary text-xs font-medium flex items-center justify-center gap-1.5 border border-border-hairline active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[15px]">help_outline</span>
            <span>Replay Welcome Tour & Setup</span>
          </button>
        </div>

        {/* PWA App Version & Service Worker Updates */}
        <div className="mt-2 pt-3 border-t border-border-hairline flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-xs text-xs font-semibold text-text-primary">
                PWA Version & Updates
              </span>
              <span className="text-[11px] text-text-muted font-mono">
                v1.2.0 · Cache: fuel-pwa-v5
              </span>
            </div>
            {isAppUpdateAvailable() ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Update Ready
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Up to Date
              </span>
            )}
          </div>

          {updateStatusMessage && (
            <div className="p-2 rounded-lg bg-surface-subtle border border-border-hairline text-[11px] text-text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-accent-neutral-bar">info</span>
              <span>{updateStatusMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCheckForUpdates}
              disabled={isCheckingUpdate}
              className="py-2 px-3 rounded-lg border border-border-hairline bg-surface-subtle hover:bg-zinc-100 text-text-primary text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              {isCheckingUpdate ? (
                <span className="material-symbols-outlined text-[15px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[15px]">sync</span>
              )}
              <span>{isCheckingUpdate ? 'Checking...' : 'Check Updates'}</span>
            </button>

            <button
              type="button"
              onClick={handlePreviewUpdateModal}
              className="py-2 px-3 rounded-lg border border-border-hairline bg-surface-subtle hover:bg-zinc-100 text-text-secondary hover:text-text-primary text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">preview</span>
              <span>Preview Pop-Up</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: DATA & STORAGE MANAGEMENT */}
      <section className="p-space-lg rounded-xl bg-surface-card border border-border-hairline shadow-sm flex flex-col gap-space-sm">
        <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
          Storage & Offline Data
        </span>
        <div className="flex items-center justify-between text-xs py-1">
          <span className="text-text-secondary">Logged Meals in Storage:</span>
          <span className="font-mono font-medium text-text-primary">{mealCount} entries</span>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-border-hairline">
          <button
            onClick={handleDownloadExport}
            className="w-full py-2.5 px-3 rounded-lg bg-surface-subtle hover:bg-zinc-100 text-text-primary text-xs font-medium flex items-center justify-center gap-1.5 border border-border-hairline transition-colors active:scale-98"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Food Log (JSON)
          </button>

          <button
            onClick={onResetToday}
            className="w-full py-2.5 px-3 rounded-lg bg-surface-subtle hover:bg-zinc-100 text-text-secondary hover:text-text-primary text-xs font-medium flex items-center justify-center gap-1.5 border border-border-hairline transition-colors active:scale-98"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset Today's Meals
          </button>

          <button
            onClick={onClearAll}
            className="w-full py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors active:scale-98"
          >
            <span className="material-symbols-outlined text-[16px]">delete_forever</span>
            Clear All Local Data
          </button>
        </div>
      </section>
    </div>
  );
};
