import React, { useState, useRef, useEffect } from 'react';
import { GeminiInferenceResult, MealType } from '../types';
import { analyzeMealManual } from '../services/gemini';
import { getSettings } from '../services/storage';

interface ManualLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayloadGenerated: (
    imageSrc: string,
    result: GeminiInferenceResult,
    mealType: MealType
  ) => void;
  onOpenSettings?: () => void;
}

const DEFAULT_FOOD_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

const EXAMPLE_SUGGESTIONS = [
  { label: '🍳 2 Eggs & Avocado Toast', text: '2 scrambled eggs with half an avocado on whole wheat sourdough toast' },
  { label: '🥗 Grilled Chicken Salad', text: 'Grilled chicken breast with mixed greens, cherry tomatoes, cucumbers, and olive oil dressing' },
  { label: '🥣 Protein Oatmeal', text: '1 cup rolled oats with blueberries, chia seeds, a scoop of vanilla whey protein, and almond milk' },
  { label: '🥩 Salmon & Quinoa', text: 'Baked salmon fillet (~200g) with 1 cup cooked quinoa and steamed broccoli' },
  { label: '🥤 Berry Whey Shake', text: 'Protein shake with 1 scoop whey, 1 cup frozen berries, 1 banana, and 300ml whole milk' },
];

function getDefaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 21) return 'dinner';
  return 'snack';
}

export const ManualLogModal: React.FC<ManualLogModalProps> = ({
  isOpen,
  onClose,
  onPayloadGenerated,
  onOpenSettings,
}) => {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState('image/jpeg');
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const settings = getSettings();

  useEffect(() => {
    if (isOpen) {
      setMealType(getDefaultMealType());
      setError(null);
      setIsAnalyzing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPhoto(dataUrl);
      setPhotoMimeType(file.type || 'image/jpeg');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    const cleanDesc = description.trim();
    if (!cleanDesc) {
      setError('Please provide a brief description of your dish.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setStatusMessage('Estimating portion density & macros with Gemini...');

    try {
      const result = await analyzeMealManual(cleanDesc, photo, photoMimeType);
      const finalImage = photo || DEFAULT_FOOD_IMAGE;
      setIsAnalyzing(false);
      onPayloadGenerated(finalImage, result, mealType);
    } catch (err: any) {
      setIsAnalyzing(false);
      const msg = err?.message || 'Error communicating with Gemini API.';
      setError(msg);
    }
  };

  const isMissingKey = error?.toLowerCase().includes('api key');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[92vh] bg-surface rounded-2xl border border-border-hairline shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-log-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-border-hairline bg-surface-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-neutral-bar text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </div>
            <div className="flex flex-col">
              <h2 id="manual-log-title" className="text-sm font-semibold text-text-primary tracking-tight">
                Log Meal Manually
              </h2>
              <span className="text-[11px] text-text-muted">
                Describe your meal · Gemini generates macros & payload
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Gemini Model Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-subtle border border-border-hairline text-xs font-mono text-text-muted">
              <span className="material-symbols-outlined text-[13px] text-accent-success icon-filled">
                smart_toy
              </span>
              <span>{settings.selectedModel}</span>
            </div>

            <button
              onClick={onClose}
              disabled={isAnalyzing}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-zinc-200 flex items-center justify-center text-text-muted hover:text-text-primary active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Photo Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
                Meal Photo (Optional)
              </label>
              {photo && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {photo ? (
              <div className="relative rounded-xl overflow-hidden border border-border-hairline bg-surface-subtle group h-44 flex items-center justify-center">
                <img src={photo} alt="Selected meal preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white text-zinc-900 text-xs font-medium shadow-md active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    Change Photo
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-accent-neutral-bar bg-zinc-100'
                    : 'border-border-hairline hover:border-zinc-400 bg-surface-subtle/50 hover:bg-surface-subtle'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-surface-card border border-border-hairline flex items-center justify-center text-text-secondary mb-1.5 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                </div>
                <span className="text-xs font-semibold text-text-primary">
                  Add a photo of your dish
                </span>
                <span className="text-[11px] text-text-muted mt-0.5">
                  Tap to snap or upload from gallery (helps Gemini estimate portion size)
                </span>
              </div>
            )}
          </div>

          {/* Dish Description Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="dish-description" className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
                Describe The Dish *
              </label>
              <span className="font-mono text-[11px] text-text-muted">
                {description.length} chars
              </span>
            </div>

            <textarea
              id="dish-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 2 scrambled eggs on sourdough toast with half an avocado, cooked in olive oil..."
              className="w-full p-3 rounded-xl bg-surface-card border border-border-hairline text-text-primary placeholder:text-text-muted text-sm focus:outline-hidden focus:border-zinc-500 shadow-xs resize-none"
            />

            {/* Quick Inspiration Pills */}
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[11px] text-text-muted">Quick suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setDescription(item.text)}
                    className="px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-zinc-200 text-text-secondary hover:text-text-primary text-[11px] font-medium border border-border-hairline transition-all active:scale-95 text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Meal Type Segmented Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
              Meal Time
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-surface-subtle rounded-xl border border-border-hairline">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`py-1.5 text-xs capitalize rounded-lg transition-all font-medium ${
                    mealType === type
                      ? 'bg-accent-neutral-bar text-white shadow-xs font-semibold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0">
                  error
                </span>
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
              {isMissingKey && onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="self-start px-3 py-1 rounded-md bg-red-600 text-white font-medium text-[11px] hover:bg-red-700 active:scale-95 transition-all"
                >
                  Configure API Key in Settings
                </button>
              )}
            </div>
          )}

          {/* Analyzing Loading Indicator */}
          {isAnalyzing && (
            <div className="p-3 rounded-xl bg-surface-subtle border border-border-hairline flex items-center gap-3 animate-pulse">
              <span className="material-symbols-outlined text-[20px] text-accent-success animate-spin">
                progress_activity
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-text-primary">
                  Gemini Vision & Reasoning Engine Active
                </span>
                <span className="text-[11px] text-text-muted font-mono">{statusMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-border-hairline bg-surface-card flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isAnalyzing}
            className="px-4 py-2.5 rounded-xl border border-border-hairline text-text-secondary hover:text-text-primary text-xs font-medium hover:bg-surface-subtle active:scale-95 transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !description.trim()}
            className="px-5 py-2.5 rounded-xl bg-accent-neutral-bar text-white text-xs font-semibold flex items-center gap-2 shadow-md hover:bg-black active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isAnalyzing ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
                <span>Calculating Macros...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] text-amber-300">
                  auto_awesome
                </span>
                <span>Generate & Review with Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
