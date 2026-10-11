import React, { useState } from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  currentTab: ActiveTab;
  onRefreshSync: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRefreshSync, onOpenSettings }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleSyncClick = () => {
    setIsRotating(true);
    onRefreshSync();
    setTimeout(() => setIsRotating(false), 800);
  };

  // Format today's date (e.g. Wednesday, Oct 24)
  const todayDateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl border-b border-border-hairline shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      <div className="h-14 max-w-lg mx-auto px-gutter flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-accent-neutral-bar text-white flex items-center justify-center font-bold text-[15px] tracking-tight shadow-xs">
            F
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-md text-headline-md text-text-primary tracking-tight">Fuel</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse"></span>
                <span className="font-label-xs text-label-xs text-text-secondary uppercase">Synced</span>
              </div>
            </div>
            <span className="font-label-xs text-label-xs text-text-muted">{todayDateStr}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleSyncClick}
            aria-label="Refresh and sync"
            className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-subtle active:scale-95 transition-all"
          >
            <span className={`material-symbols-outlined text-[20px] ${isRotating ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>
          
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-subtle active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
