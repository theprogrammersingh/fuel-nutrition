import React, { useState } from 'react';
import { NudgeState, RecommendationItem } from '../types';

interface NudgeBannerProps {
  nudge: NudgeState;
  onQuickLog: (item: RecommendationItem) => void;
}

export const NudgeBanner: React.FC<NudgeBannerProps> = ({ nudge, onQuickLog }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-subtle text-text-muted text-xs">
        <span className="font-mono-data">AI Insight available</span>
        <button
          onClick={() => setDismissed(false)}
          className="text-text-primary underline font-medium"
        >
          Show
        </button>
      </div>
    );
  }

  // Styles based on scenario
  const isWarning = nudge.scenario === 'A';
  const isSuccess = nudge.scenario === 'C';

  const bgClass = isWarning
    ? 'bg-accent-warning-bg border border-amber-200/60'
    : isSuccess
    ? 'bg-accent-success-bg border border-emerald-200/60'
    : 'bg-surface-card border border-border-hairline shadow-xs';

  const iconColor = isWarning
    ? 'text-accent-warning'
    : isSuccess
    ? 'text-accent-success'
    : 'text-text-secondary';

  const iconName = isWarning ? 'warning' : isSuccess ? 'task_alt' : 'lightbulb';

  return (
    <section className={`rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm transition-all duration-200 ${bgClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`material-symbols-outlined text-[20px] shrink-0 ${iconColor} icon-filled`}>
            {iconName}
          </span>
          <span className="font-headline-md text-headline-md text-on-background tracking-tight truncate">
            {nudge.title}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="text-text-secondary hover:text-text-primary p-0.5 rounded transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Description text */}
      <p className="font-body-md text-body-md text-text-secondary leading-snug">
        {nudge.message}
      </p>

      {/* Quick Recommendations Pills */}
      {nudge.recommendations.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          <span className="font-label-xs text-label-xs uppercase text-text-secondary tracking-wider">
            {isWarning ? 'Recommended Lean Densities' : 'Suggested High-Protein Options'}
          </span>

          <div className="grid grid-cols-2 gap-2">
            {nudge.recommendations.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onQuickLog(item)}
                className="flex flex-col text-left p-2.5 rounded-lg bg-surface-card hover:bg-surface-subtle border border-border-hairline shadow-xs cursor-pointer active:scale-98 transition-all group"
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="font-headline-md text-[13px] font-semibold text-text-primary truncate">
                    {item.name}
                  </span>
                  <span className="material-symbols-outlined text-text-muted group-hover:text-text-primary text-[16px] shrink-0">
                    add_circle
                  </span>
                </div>
                <span className="font-mono-data text-mono-data text-text-secondary mt-0.5">
                  {item.calories} kcal · +{item.protein}g Pro
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
