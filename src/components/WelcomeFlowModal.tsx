import React, { useState } from 'react';
import { AVAILABLE_MODELS } from '../services/storage';
import { testGeminiApiKey } from '../services/gemini';
import { InstallGuide } from './InstallGuide';

interface WelcomeFlowModalProps {
  isOpen: boolean;
  initialApiKey: string;
  initialModel: string;
  onComplete: (apiKey: string, model: string) => void;
  onDismiss?: () => void;
}

export const WelcomeFlowModal: React.FC<WelcomeFlowModalProps> = ({
  isOpen,
  initialApiKey,
  initialModel,
  onComplete,
  onDismiss,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [selectedModel, setSelectedModel] = useState(initialModel || 'gemini-3.8-flash');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    const res = await testGeminiApiKey(apiKey.trim(), selectedModel);
    setIsTestingKey(false);
    setTestResult(res);
  };

  const handleFinalize = () => {
    onComplete(apiKey.trim(), selectedModel.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[90vh] bg-surface rounded-2xl border border-border-hairline shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-flow-title"
      >
        {/* Wizard Header */}
        <div className="p-4 border-b border-border-hairline bg-surface-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-neutral-bar text-white flex items-center justify-center font-bold text-sm shadow-xs">
              F
            </div>
            <div className="flex flex-col">
              <h2 id="welcome-flow-title" className="text-sm font-semibold text-text-primary tracking-tight">
                Welcome to Fuel
              </h2>
              <span className="text-[11px] text-text-muted">Personal Nutrition Intelligence</span>
            </div>
          </div>

          {/* Step Pill Indicators */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((stepNum) => (
              <button
                key={stepNum}
                type="button"
                onClick={() => setCurrentStep(stepNum as 1 | 2 | 3)}
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                  currentStep === stepNum
                    ? 'bg-accent-neutral-bar text-white shadow-xs'
                    : currentStep > stepNum
                    ? 'bg-accent-success-bg text-accent-success border border-emerald-200'
                    : 'bg-surface-subtle text-text-muted border border-border-hairline'
                }`}
                aria-label={`Step ${stepNum}`}
              >
                {currentStep > stepNum ? (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                ) : (
                  stepNum
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Step Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* STEP 1: WELCOME & OVERVIEW */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div className="flex flex-col gap-1.5 text-center py-2">
                <span className="font-label-xs text-label-xs uppercase tracking-widest text-accent-neutral-bar font-mono">
                  Reductive Intelligence
                </span>
                <h3 className="font-headline-lg text-2xl font-bold text-text-primary tracking-tight">
                  Track Nutrition in Seconds
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                  Fuel replaces tedious calorie counting with instant Gemini Multimodal Vision analysis, right from your device.
                </p>
              </div>

              {/* Feature Highlights Cards */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                <div className="p-3.5 rounded-xl bg-surface-card border border-border-hairline flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-subtle flex items-center justify-center text-text-primary shrink-0 border border-border-hairline">
                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Instant Plate Analysis</span>
                    <span className="text-[11px] text-text-muted mt-0.5 leading-snug">
                      Snap a photo of your food. Gemini calculates calories, protein, carbs, and fat automatically.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-card border border-border-hairline flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-subtle flex items-center justify-center text-text-primary shrink-0 border border-border-hairline">
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Your Own API Key & Model Choice</span>
                    <span className="text-[11px] text-text-muted mt-0.5 leading-snug">
                      Choose between Gemini 3.8 Flash or Flash-Lite. Zero subscription fees, completely under your control.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-card border border-border-hairline flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-subtle flex items-center justify-center text-text-primary shrink-0 border border-border-hairline">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Private & Local-First</span>
                    <span className="text-[11px] text-text-muted mt-0.5 leading-snug">
                      Your meal history and credentials stay securely in your browser's local storage.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GEMINI API KEY & MODEL SELECTION */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-150">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-accent-neutral-bar">smart_toy</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    AI Vision Core Configuration
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Fuel connects directly to Google Gemini using your API key. Select the model that fits your preference:
                </p>
              </div>

              {/* Model Selection List */}
              <div className="flex flex-col gap-2">
                <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
                  Select Multimodal Model
                </span>
                <div className="flex flex-col gap-2">
                  {AVAILABLE_MODELS.map((m) => (
                    <label
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
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
                        name="welcomeModelChoice"
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

                <div className="flex items-center justify-between text-[11px] text-text-muted pt-0.5">
                  <span>Free key from Google AI Studio</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-primary underline font-medium hover:text-black"
                  >
                    Get API Key ↗
                  </a>
                </div>
              </div>

              {/* Key Validation Feedback */}
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

              {/* Test Key Button */}
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTestingKey || !apiKey.trim()}
                className="py-2 px-3 rounded-lg border border-border-hairline bg-surface-subtle hover:bg-zinc-100 disabled:opacity-40 text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                {isTestingKey ? (
                  <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[14px]">electrical_services</span>
                )}
                Test Connection with {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Gemini'}
              </button>
            </div>
          )}

          {/* STEP 3: INSTALL APP ON DEVICE */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-2 duration-150">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-accent-neutral-bar">install_mobile</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    Install Fuel on Your Device
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  For the best experience (full-screen, instant camera launch, zero browser URL bars), add Fuel to your Home Screen:
                </p>
              </div>

              {/* Embed Full Interactive Install Guide */}
              <InstallGuide onInstalled={handleFinalize} />
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-border-hairline bg-surface-card flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
              className="px-3.5 py-2 rounded-xl border border-border-hairline bg-surface-subtle text-text-secondary hover:text-text-primary text-xs font-medium active:scale-95 transition-all"
            >
              Back
            </button>
          ) : onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-text-muted hover:text-text-primary transition-colors px-1"
            >
              Skip setup
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)}
                className="px-4 py-2 rounded-xl bg-accent-neutral-bar text-white text-xs font-medium hover:bg-black active:scale-95 transition-all shadow-xs flex items-center gap-1"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalize}
                className="px-5 py-2.5 rounded-xl bg-accent-neutral-bar text-white text-xs font-medium hover:bg-black active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Get Started with Fuel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
