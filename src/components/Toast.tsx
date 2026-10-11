import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  onUndo?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, onUndo, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto bg-accent-neutral-bar text-white py-3 px-4 rounded-xl shadow-xl flex items-center justify-between z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="material-symbols-outlined text-accent-success text-[20px] shrink-0">
          check_circle
        </span>
        <span className="font-body-md text-body-md text-white truncate">
          {message}
        </span>
      </div>
      {onUndo && (
        <button
          onClick={onUndo}
          className="font-label-xs text-label-xs uppercase px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition-colors ml-2 shrink-0 active:scale-95"
        >
          Undo
        </button>
      )}
    </div>
  );
};
