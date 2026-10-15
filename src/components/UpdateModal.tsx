import React, { useState } from 'react';

interface UpdateModalProps {
  isOpen: boolean;
  onUpdate: () => void;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onUpdate, onClose }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleUpdateClick = () => {
    setIsUpdating(true);
    // Trigger the update service worker skipWaiting and page reload
    setTimeout(() => {
      onUpdate();
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border-hairline shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Top Accent Graphic Banner */}
        <div className="p-5 bg-surface-card border-b border-border-hairline flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-neutral-bar text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">system_update</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-label-xs text-label-xs font-semibold uppercase tracking-wider text-accent-neutral-bar">
                  Fuel PWA
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent-success-bg text-accent-success font-medium border border-emerald-200">
                  Ready to install
                </span>
              </div>
              <h2 id="update-modal-title" className="text-base font-bold text-text-primary mt-0.5">
                New Update Available
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Dismiss update modal"
            disabled={isUpdating}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            A new version of Fuel is ready with the latest performance upgrades, smarter nutrition calibration, and instant offline syncing.
          </p>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border-hairline flex flex-col gap-2">
            <span className="font-label-xs text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              What's Included:
            </span>
            <ul className="text-xs text-text-primary space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-accent-success">check_circle</span>
                <span>Enhanced PWA cache management & live updates</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-accent-success">check_circle</span>
                <span>Manual dish logging with Gemini nutrition breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-accent-success">check_circle</span>
                <span>Personalized goal calibration & bi-weekly check-ins</span>
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-text-muted leading-tight">
            Updating reloads the app seamlessly without losing your saved meal logs or settings.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border-hairline bg-surface-card flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2.5 rounded-xl border border-border-hairline bg-surface hover:bg-surface-subtle text-text-primary text-xs font-semibold active:scale-95 transition-all"
          >
            Later
          </button>
          <button
            type="button"
            onClick={handleUpdateClick}
            disabled={isUpdating}
            className="px-5 py-2.5 rounded-xl bg-accent-neutral-bar text-white text-xs font-semibold flex items-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-75"
          >
            {isUpdating ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                <span>Updating Fuel...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Update Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
