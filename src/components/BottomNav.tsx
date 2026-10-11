import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingReviewCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, pendingReviewCount = 0 }) => {
  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/85 backdrop-blur-xl border-t border-border-hairline shadow-[0_-1px_12px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-lg mx-auto px-gutter grid grid-cols-3 items-center">
        {/* Today Tab */}
        <button
          onClick={() => onSelectTab('today')}
          aria-label="Today Dashboard"
          className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentTab === 'today'
              ? 'text-text-primary font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${currentTab === 'today' ? 'icon-filled' : ''}`}>
            calendar_today
          </span>
          <span className="font-label-xs text-label-xs">Today</span>
        </button>

        {/* Review Tab */}
        <button
          onClick={() => onSelectTab('review')}
          aria-label="Review & Log"
          className={`h-full flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
            currentTab === 'review'
              ? 'text-text-primary font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <div className="relative">
            <span className={`material-symbols-outlined text-[22px] ${currentTab === 'review' ? 'icon-filled' : ''}`}>
              rule
            </span>
            {pendingReviewCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent-warning"></span>
            )}
          </div>
          <span className="font-label-xs text-label-xs">Review</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => onSelectTab('settings')}
          aria-label="Settings"
          className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentTab === 'settings'
              ? 'text-text-primary font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${currentTab === 'settings' ? 'icon-filled' : ''}`}>
            tune
          </span>
          <span className="font-label-xs text-label-xs">Settings</span>
        </button>
      </div>
    </nav>
  );
};
