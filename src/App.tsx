import React, { useState, useEffect } from 'react';
import { ActiveTab, MealEntry, GeminiInferenceResult, RecommendationItem, MealType, DailyGoals } from './types';
import {
  getMeals,
  addMeal,
  deleteMeal,
  clearTodayMeals,
  getGoals,
  saveGoals,
  getSettings,
  saveSettings,
  clearAllData,
  isOnboarded,
  setOnboarded,
  isBiWeeklyCheckInDue,
} from './services/storage';
import { calculateMacroNudge } from './services/recommendations';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { WelcomeFlowModal } from './components/WelcomeFlowModal';
import { InstallModal } from './components/InstallModal';
import { ManualLogModal } from './components/ManualLogModal';
import { GoalCheckInModal } from './components/GoalCheckInModal';
import { UpdateModal } from './components/UpdateModal';
import { subscribeToAppUpdate, applyAppUpdate } from './services/pwa';
import { TodayView } from './views/TodayView';
import { CameraView } from './views/CameraView';
import { ReviewView } from './views/ReviewView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [meals, setMeals] = useState<MealEntry[]>(getMeals);
  const [goals, setGoals] = useState(getGoals);
  const [settings, setSettings] = useState(getSettings);

  // Welcome flow & Install modal state
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => !isOnboarded());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isManualLogOpen, setIsManualLogOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [reviewMealType, setReviewMealType] = useState<MealType>('lunch');

  // Scanned item staged for Review
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<GeminiInferenceResult | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastDeletedMeal, setLastDeletedMeal] = useState<MealEntry | null>(null);

  // Live Macro Nudge Engine State & Bi-weekly Check-in condition
  const nudge = calculateMacroNudge(meals, goals);
  const checkInDue = isBiWeeklyCheckInDue(goals);

  // Sync state across reloads / tabs
  useEffect(() => {
    setMeals(getMeals());
  }, []);

  // Listen for PWA service worker updates
  useEffect(() => {
    const unsubscribe = subscribeToAppUpdate((hasUpdate) => {
      if (hasUpdate) {
        setIsUpdateModalOpen(true);
      }
    });
    return unsubscribe;
  }, []);

  const handleQuickLog = (item: RecommendationItem) => {
    const newMeal: MealEntry = {
      id: `quick-${Date.now()}`,
      name: item.name,
      description: 'Quick-logged via Smart AI Nudge',
      mealType: 'snack',
      timestamp: new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date()),
      date: new Date().toISOString().split('T')[0],
      calories: item.calories,
      protein: item.protein,
      carbs: 6,
      fat: 2,
      portionMultiplier: 1.0,
      confidenceScore: 0.99,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    };

    const updated = addMeal(newMeal);
    setMeals(updated);
    setToastMessage(`Quick-logged: ${item.name} (+${item.protein}g Pro)`);
  };

  const handleDeleteMeal = (id: string) => {
    const mealToDelete = meals.find((m) => m.id === id);
    if (mealToDelete) {
      setLastDeletedMeal(mealToDelete);
    }
    const updated = deleteMeal(id);
    setMeals(updated);
    setToastMessage(`Removed ${mealToDelete?.name || 'meal'}`);
  };

  const handleUndoDelete = () => {
    if (lastDeletedMeal) {
      const updated = addMeal(lastDeletedMeal);
      setMeals(updated);
      setLastDeletedMeal(null);
      setToastMessage(`Restored ${lastDeletedMeal.name}`);
    }
  };

  const handleScanComplete = (imageSrc: string, result: GeminiInferenceResult) => {
    setScannedImage(imageSrc);
    setScannedResult(result);
    setReviewMealType('lunch');
    setActiveTab('review');
  };

  const handleManualLogGenerated = (
    imageSrc: string,
    result: GeminiInferenceResult,
    mealType: MealType
  ) => {
    setScannedImage(imageSrc);
    setScannedResult(result);
    setReviewMealType(mealType);
    setIsManualLogOpen(false);
    setActiveTab('review');
    setToastMessage(`Gemini estimated: ${result.dish_name} (${result.calories} kcal · ${result.protein}g Pro)`);
  };

  const handleConfirmLogFromReview = (newMeal: MealEntry) => {
    const updated = addMeal(newMeal);
    setMeals(updated);
    setScannedImage(null);
    setScannedResult(null);
    setActiveTab('today');
    setToastMessage(`Logged: ${newMeal.name} (${newMeal.calories} kcal · ${newMeal.protein}g Pro)`);
  };

  const handleRefreshSync = () => {
    setMeals(getMeals());
    setToastMessage('Data synced · Cache refreshed');
  };

  const handleResetToday = () => {
    const updated = clearTodayMeals();
    setMeals(updated);
    setToastMessage("Reset today's meals");
  };

  const handleWelcomeComplete = (newApiKey: string, newModel: string, newGoals?: DailyGoals) => {
    const updated = {
      ...settings,
      geminiApiKey: newApiKey,
      selectedModel: newModel,
    };
    setSettings(updated);
    saveSettings(updated);

    if (newGoals) {
      setGoals(newGoals);
      saveGoals(newGoals);
    }

    setOnboarded(true);
    setIsWelcomeOpen(false);
    setToastMessage('Welcome to Fuel! Profile and goals calibrated.');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all meal logs and custom settings?')) {
      clearAllData();
      setMeals([]);
      setGoals(getGoals());
      setSettings(getSettings());
      setToastMessage('Reset to clean default state');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Sticky Top Header (Only on today, review, and settings tabs) */}
      {activeTab !== 'scan' && (
        <Header
          currentTab={activeTab}
          onRefreshSync={handleRefreshSync}
          onOpenSettings={() => setActiveTab('settings')}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${activeTab !== 'scan' ? 'pt-16' : ''}`}>
        {activeTab === 'today' && (
          <TodayView
            meals={meals}
            goals={goals}
            nudge={nudge}
            onQuickLog={handleQuickLog}
            onDeleteMeal={handleDeleteMeal}
            onOpenScan={() => setActiveTab('scan')}
            onOpenManualLog={() => setIsManualLogOpen(true)}
            onOpenInstallGuide={() => setIsInstallModalOpen(true)}
            onOpenGoalCheckIn={() => setIsCheckInModalOpen(true)}
            isCheckInDue={checkInDue}
          />
        )}

        {activeTab === 'scan' && (
          <CameraView
            onCancel={() => setActiveTab('today')}
            onScanComplete={handleScanComplete}
            onOpenManualLog={() => {
              setActiveTab('today');
              setIsManualLogOpen(true);
            }}
          />
        )}

        {activeTab === 'review' && (
          <ReviewView
            initialResult={scannedResult}
            initialImage={scannedImage}
            initialMealType={reviewMealType}
            onConfirmLog={handleConfirmLogFromReview}
            onCancel={() => setActiveTab('today')}
            onOpenScan={() => setActiveTab('scan')}
            onOpenManualLog={() => setIsManualLogOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            goals={goals}
            settings={settings}
            onUpdateGoals={(newGoals) => {
              setGoals(newGoals);
              saveGoals(newGoals);
            }}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              saveSettings(newSettings);
            }}
            onResetToday={handleResetToday}
            onClearAll={handleClearAll}
            mealCount={meals.length}
            onOpenInstallGuide={() => setIsInstallModalOpen(true)}
            onOpenWelcomeFlow={() => setIsWelcomeOpen(true)}
            onOpenGoalCheckIn={() => setIsCheckInModalOpen(true)}
            onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
          />
        )}
      </main>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        onUndo={lastDeletedMeal ? handleUndoDelete : undefined}
      />

      {/* User Welcome & Setup Flow Wizard */}
      <WelcomeFlowModal
        isOpen={isWelcomeOpen}
        initialApiKey={settings.geminiApiKey}
        initialModel={settings.selectedModel}
        initialGoals={goals}
        onComplete={handleWelcomeComplete}
        onDismiss={() => {
          setOnboarded(true);
          setIsWelcomeOpen(false);
        }}
      />

      {/* Standalone Device Installation Guide Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* PWA App Update Notification Pop-up Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onUpdate={applyAppUpdate}
        onClose={() => setIsUpdateModalOpen(false)}
      />

      {/* Manual Meal Logging Modal */}
      <ManualLogModal
        isOpen={isManualLogOpen}
        onClose={() => setIsManualLogOpen(false)}
        onPayloadGenerated={handleManualLogGenerated}
        onOpenSettings={() => {
          setIsManualLogOpen(false);
          setActiveTab('settings');
        }}
      />

      {/* Bi-Weekly Progress Check-In Modal */}
      <GoalCheckInModal
        isOpen={isCheckInModalOpen}
        goals={goals}
        onSaveGoals={(updatedGoals) => {
          setGoals(updatedGoals);
          saveGoals(updatedGoals);
          setToastMessage('Calibrated weight and targets for the next 2 weeks');
        }}
        onSnooze={() => {
          setIsCheckInModalOpen(false);
          const twoDaysFromNow = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString();
          const snoozed = { ...goals, lastGoalCheckInDate: twoDaysFromNow };
          setGoals(snoozed);
          saveGoals(snoozed);
          setToastMessage('Check-in snoozed for 2 days');
        }}
        onClose={() => setIsCheckInModalOpen(false)}
      />

      {/* Floating Action Buttons for Manual Log & Camera Scan */}
      {activeTab !== 'scan' && (
        <aside
          aria-label="Quick meal logging actions"
          className="fixed bottom-20 inset-x-0 max-w-lg mx-auto px-4 flex justify-end items-center gap-2.5 pointer-events-none z-40 pb-safe"
        >
          <button
            onClick={() => setIsManualLogOpen(true)}
            aria-label="Log meal manually"
            title="Log meal manually"
            className="pointer-events-auto h-12 px-3.5 rounded-full bg-surface-card border border-border-hairline text-text-primary flex items-center gap-1.5 shadow-[0px_4px_16px_rgba(0,0,0,0.12)] hover:bg-surface-subtle active:scale-95 transition-all text-xs font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px] text-accent-neutral-bar">edit_note</span>
            <span>Manual</span>
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            aria-label="Scan food photo"
            title="Scan food photo"
            className="pointer-events-auto w-14 h-14 rounded-full bg-accent-neutral-bar text-white flex items-center justify-center shadow-[0px_6px_20px_rgba(9,9,11,0.28)] hover:shadow-2xl active:scale-95 transition-all hover:bg-black focus:outline-hidden cursor-pointer"
          >
            <span className="material-symbols-outlined text-[26px]">photo_camera</span>
          </button>
        </aside>
      )}

      {/* Bottom Navigation Dock (Except during fullscreen camera scanner) */}
      {activeTab !== 'scan' && (
        <BottomNav
          currentTab={activeTab}
          onSelectTab={setActiveTab}
          pendingReviewCount={scannedResult ? 1 : 0}
        />
      )}
    </div>
  );
};

export default App;
