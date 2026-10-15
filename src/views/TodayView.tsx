import React from 'react';
import { MealEntry, DailyGoals, RecommendationItem, NudgeState } from '../types';
import { NudgeBanner } from '../components/NudgeBanner';
import { getDeviceInfo } from '../services/pwa';

interface TodayViewProps {
  meals: MealEntry[];
  goals: DailyGoals;
  nudge: NudgeState;
  onQuickLog: (item: RecommendationItem) => void;
  onDeleteMeal: (id: string) => void;
  onOpenScan: () => void;
  onOpenManualLog?: () => void;
  onOpenInstallGuide?: () => void;
  onOpenGoalCheckIn?: () => void;
  isCheckInDue?: boolean;
}

export const TodayView: React.FC<TodayViewProps> = ({
  meals,
  goals,
  nudge,
  onQuickLog,
  onDeleteMeal,
  onOpenScan,
  onOpenManualLog,
  onOpenInstallGuide,
  onOpenGoalCheckIn,
  isCheckInDue = false,
}) => {
  const [bannerDismissed, setBannerDismissed] = React.useState(false);
  const [checkInDismissed, setCheckInDismissed] = React.useState(false);
  const deviceInfo = getDeviceInfo();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(m => m.date === todayStr);

  const totalCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + m.protein, 0);

  const remCalories = Math.max(0, goals.calories - totalCalories);
  const remProtein = Math.max(0, goals.protein - totalProtein);

  const calProgressPct = Math.min(100, Math.round((totalCalories / Math.max(1, goals.calories)) * 100));
  const proProgressPct = Math.min(100, Math.round((totalProtein / Math.max(1, goals.protein)) * 100));

  const isProteinLagging = nudge.scenario === 'A';
  const isProteinMet = nudge.scenario === 'C';

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-gutter pb-28 pt-3 gap-space-lg">
      {/* PWA Status Bar */}
      <div className="flex items-center justify-between pt-space-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse"></span>
          <span className="font-label-xs text-label-xs uppercase tracking-wider font-medium">
            Synced · Offline Ready
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono-data text-mono-data text-text-muted">
          <span>{todayFormatted}</span>
        </div>
      </div>

      {/* Bi-Weekly Progress Check-In Banner */}
      {isCheckInDue && !checkInDismissed && onOpenGoalCheckIn && (
        <div className="p-3.5 rounded-xl bg-accent-neutral-bar text-white shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">event_repeat</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate">Bi-Weekly Goal Check-In</span>
              <span className="text-[11px] text-white/80 truncate">
                Recalibrate weight ({goals.currentWeightKg || 70}kg) & {goals.targetGoal === 'bulking' ? 'Bulking' : goals.targetGoal === 'lose_weight' ? 'Cutting' : 'Maintenance'} targets
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenGoalCheckIn}
              className="px-2.5 py-1 rounded-lg bg-white text-zinc-900 text-[11px] font-semibold hover:bg-zinc-100 active:scale-95 transition-all shadow-xs"
            >
              Check In
            </button>
            <button
              onClick={() => setCheckInDismissed(true)}
              aria-label="Dismiss check-in reminder"
              className="p-1 text-white/70 hover:text-white rounded"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Install Fuel Prompt Banner (When running in browser) */}
      {!deviceInfo.isStandalone && !bannerDismissed && (
        <div className="p-3.5 rounded-xl bg-surface-card border border-border-hairline shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent-neutral-bar text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">add_to_home_screen</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-text-primary truncate">Install Fuel on Device</span>
              <span className="text-[11px] text-text-muted truncate">
                {deviceInfo.isIOS ? 'Tap Share → Add to Home Screen' : 'Add to Home screen for 1-tap logging'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenInstallGuide}
              className="px-2.5 py-1 rounded-lg bg-accent-neutral-bar text-white text-[11px] font-medium hover:bg-black active:scale-95 transition-all shadow-xs"
            >
              Install
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss install banner"
              className="p-1 text-text-muted hover:text-text-primary rounded"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Target Card: Radical Reductive Macro Balance */}
      <section className="bg-surface-card rounded-xl p-space-lg border border-border-hairline shadow-sm flex flex-col gap-space-md">
        {/* Daily Energy Header */}
        <div className="flex items-baseline justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">Daily Energy</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-subtle text-text-secondary uppercase">
                {goals.targetGoal === 'bulking' ? 'Bulk' : goals.targetGoal === 'lose_weight' ? 'Cut' : 'Maintain'} · {goals.currentWeightKg || 70}kg
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-display-stat-mobile text-[34px] leading-tight font-semibold text-text-primary tracking-tight">
                {totalCalories.toLocaleString()}
              </span>
              <span className="font-body-md text-body-md text-text-muted">
                / {goals.calories.toLocaleString()} kcal
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-label-xs text-label-xs uppercase px-2 py-0.5 rounded bg-surface-subtle text-text-secondary font-medium">
              {calProgressPct}% Logged
            </span>
            <span className="font-mono-data text-mono-data text-accent-neutral-bar mt-1">
              {remCalories} kcal left
            </span>
          </div>
        </div>

        {/* Dual Minimal Linear Rails */}
        <div className="flex flex-col gap-3 mt-1">
          {/* Calories Rail */}
          <div className="flex flex-col gap-1">
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-neutral-bar rounded-full transition-all duration-500 ease-out"
                style={{ width: `${calProgressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Protein Rail */}
          <div className="flex flex-col gap-1 mt-0.5">
            <div className="flex items-center justify-between font-label-xs text-label-xs">
              <span className="text-text-secondary uppercase">Protein Intake</span>
              <span className={`font-semibold ${
                isProteinMet ? 'text-accent-success' : isProteinLagging ? 'text-accent-warning' : 'text-text-primary'
              }`}>
                {totalProtein}g / {goals.protein}g · {isProteinMet ? 'Target Hit' : isProteinLagging ? 'Lagging' : 'On Track'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isProteinMet
                    ? 'bg-accent-success'
                    : isProteinLagging
                    ? 'bg-accent-warning'
                    : 'bg-accent-neutral-bar'
                }`}
                style={{ width: `${proProgressPct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Monospace Real-Time Summary Readout */}
        <div className="pt-space-xs flex items-center justify-between text-text-secondary font-mono-data text-mono-data bg-surface-subtle px-3 py-2 rounded-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-neutral-bar"></span>
            <span>REM: {remCalories} KCAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isProteinLagging ? 'bg-accent-warning' : 'bg-accent-success'}`}></span>
            <span className="text-text-primary font-semibold">
              REM: {remProtein}G PROTEIN
            </span>
          </div>
        </div>
      </section>

      {/* Contextual Smart Nutritional Nudge */}
      <NudgeBanner nudge={nudge} onQuickLog={onQuickLog} />

      {/* Chronological Meal Log Section */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-1">
          <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
            Today's Log ({todayMeals.length} {todayMeals.length === 1 ? 'item' : 'items'})
          </span>
          <div className="flex items-center gap-1.5">
            {onOpenManualLog && (
              <button
                onClick={onOpenManualLog}
                className="font-label-xs text-label-xs px-2.5 py-1 rounded-md bg-surface-subtle text-text-primary hover:bg-zinc-200 flex items-center gap-1 transition-colors font-medium border border-border-hairline shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px]">edit_note</span>
                Manual
              </button>
            )}
            <button
              onClick={onOpenScan}
              className="font-label-xs text-label-xs px-2.5 py-1 rounded-md bg-accent-neutral-bar text-white hover:bg-black flex items-center gap-1 transition-colors font-medium shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px]">photo_camera</span>
              Scan
            </button>
          </div>
        </div>

        {todayMeals.length === 0 ? (
          <div className="bg-surface-card rounded-xl p-8 border border-border-hairline shadow-sm flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted">
              <span className="material-symbols-outlined text-[24px]">restaurant</span>
            </div>
            <span className="font-headline-md text-headline-md text-text-primary">No meals logged yet today</span>
            <p className="font-body-md text-body-md text-text-secondary max-w-xs">
              Snap a picture or describe your meal to estimate calories and protein in seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                onClick={onOpenScan}
                className="px-4 py-2 bg-accent-neutral-bar text-white rounded-lg text-sm font-medium active:scale-95 transition-transform flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                Scan Food Photo
              </button>
              {onOpenManualLog && (
                <button
                  onClick={onOpenManualLog}
                  className="px-4 py-2 bg-surface-subtle hover:bg-zinc-200 text-text-primary border border-border-hairline rounded-lg text-sm font-medium active:scale-95 transition-transform flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Log Manually
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {todayMeals.map((meal) => (
              <article
                key={meal.id}
                className="bg-surface-card rounded-xl p-3.5 border border-border-hairline shadow-sm flex items-center justify-between gap-3 relative overflow-hidden group hover:border-zinc-300 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-border-hairline">
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-xs text-label-xs text-text-muted uppercase">
                      {meal.timestamp} · {meal.mealType}
                    </span>
                  </div>
                  <h2 className="font-headline-md text-[15px] font-semibold text-text-primary truncate mt-0.5">
                    {meal.name}
                  </h2>
                  <span className="font-body-md text-body-md text-text-secondary truncate text-[13px]">
                    {meal.description}
                  </span>
                </div>

                {/* Macro summary & delete action */}
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="font-mono-data text-mono-data text-text-primary font-semibold">
                    {meal.calories} kcal
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-label-xs text-label-xs px-2 py-0.5 rounded-full bg-surface-subtle text-accent-neutral-bar font-medium">
                      {meal.protein}g Pro
                    </span>
                    <button
                      onClick={() => onDeleteMeal(meal.id)}
                      aria-label={`Delete ${meal.name}`}
                      className="text-text-muted hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
