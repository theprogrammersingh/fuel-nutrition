import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingReviewCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, pendingReviewCount = 0 }) => {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/85 backdrop-blur-xl border-t border-border-hairline shadow-[0_-1px_12px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-lg mx-auto px-gutter flex items-center justify-around relative">
        {/* Today Tab */}
        <button
          onClick={() => onSelectTab('today')}
          aria-label="Today Dashboard"
          className={`w-16 h-12 flex flex-col items-center justify-center gap-0.5 transition-colors ${
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

        {/* Floating Quick Capture Camera CTA (Elevated) */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => onSelectTab('scan')}
            aria-label="Scan food photo"
            className="relative -top-3 w-14 h-14 rounded-full bg-accent-neutral-bar text-white flex items-center justify-center shadow-[0px_4px_14px_rgba(9,9,11,0.24)] active:scale-95 hover:bg-black transition-transform focus:outline-hidden"
          >
            <span className="material-symbols-outlined text-[24px]">photo_camera</span>
          </button>
        </div>

        {/* Review Tab */}
        <button
          onClick={() => onSelectTab('review')}
          aria-label="Review & Log"
          className={`w-16 h-12 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
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
          className={`w-16 h-12 flex flex-col items-center justify-center gap-0.5 transition-colors ${
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
