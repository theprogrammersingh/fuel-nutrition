import React from 'react';
import { InstallGuide } from './InstallGuide';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[90vh] bg-surface rounded-2xl border border-border-hairline shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-border-hairline flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-neutral-bar text-white flex items-center justify-center font-bold text-sm">
              F
            </div>
            <div className="flex flex-col">
              <h2 id="install-modal-title" className="text-sm font-semibold text-text-primary">
                Install Fuel on Device
              </h2>
              <span className="text-[11px] text-text-muted">Home screen & standalone PWA guide</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          <InstallGuide onInstalled={onClose} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-hairline bg-surface-card flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-accent-neutral-bar text-white text-xs font-medium hover:bg-black active:scale-95 transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
