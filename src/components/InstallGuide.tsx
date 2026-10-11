import React, { useState, useEffect } from 'react';
import { getDeviceInfo, isNativeInstallAvailable, subscribeToInstallPrompt, triggerNativeInstall } from '../services/pwa';

interface InstallGuideProps {
  onInstalled?: () => void;
}

type GuidePlatform = 'ios-safari' | 'ios-chrome' | 'android' | 'desktop-chrome' | 'mac-safari' | 'other';

export const InstallGuide: React.FC<InstallGuideProps> = ({ onInstalled }) => {
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo);
  const [canPrompt, setCanPrompt] = useState(isNativeInstallAvailable);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Determine initial active tab based on detected device
  const getInitialTab = (): GuidePlatform => {
    const info = getDeviceInfo();
    if (info.isIOS) {
      if (info.browser === 'chrome') return 'ios-chrome';
      return 'ios-safari';
    }
    if (info.isAndroid) return 'android';
    if (info.platform === 'desktop-mac' && info.browser === 'safari') return 'mac-safari';
    return 'desktop-chrome';
  };

  const [activeTab, setActiveTab] = useState<GuidePlatform>(getInitialTab);

  useEffect(() => {
    const update = () => {
      setDeviceInfo(getDeviceInfo());
      setCanPrompt(isNativeInstallAvailable());
    };
    update();
    const unsubscribe = subscribeToInstallPrompt(update);
    return unsubscribe;
  }, []);

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    const res = await triggerNativeInstall();
    setIsInstalling(false);
    if (res.outcome === 'accepted') {
      setInstallSuccess(true);
      if (onInstalled) {
        setTimeout(onInstalled, 1200);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Standalone status badge if already installed */}
      {deviceInfo.isStandalone ? (
        <div className="p-3.5 rounded-xl bg-accent-success-bg border border-emerald-200 flex items-center gap-3 text-accent-success">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px] text-accent-success">check_circle</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-emerald-900">Fuel is Installed</span>
            <span className="text-[11px] text-emerald-700">
              Running in standalone app mode with offline storage & camera privileges.
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Native 1-Click Install Button when available */}
          {canPrompt && (
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-hairline flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent-neutral-bar text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary">Direct 1-Click Install</span>
                    <span className="text-[11px] text-text-muted">Fast native installation supported</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-accent-success-bg text-accent-success font-medium">
                  Ready
                </span>
              </div>

              <button
                type="button"
                onClick={handleNativeInstall}
                disabled={isInstalling || installSuccess}
                className="w-full py-3 px-4 rounded-xl bg-accent-neutral-bar text-white font-medium text-xs flex items-center justify-center gap-2 hover:bg-black active:scale-98 transition-all shadow-sm"
              >
                {isInstalling ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Opening Install Dialog...</span>
                  </>
                ) : installSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Installed Successfully!</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">add_to_home_screen</span>
                    <span>Install Fuel App on Device</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Platform Guide Tabs */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-label-xs text-label-xs text-text-muted uppercase tracking-wider">
                Select Your Browser / Device
              </span>
              <span className="font-mono text-[11px] text-text-secondary bg-surface-subtle px-2 py-0.5 rounded">
                Detected: {deviceInfo.platformName} ({deviceInfo.browserName})
              </span>
            </div>

            {/* Scrollable platform selector buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'ios-safari' as GuidePlatform, label: 'iOS Safari', icon: 'ios_share' },
                { id: 'ios-chrome' as GuidePlatform, label: 'iOS Chrome', icon: 'smartphone' },
                { id: 'android' as GuidePlatform, label: 'Android (Chrome)', icon: 'android' },
                { id: 'desktop-chrome' as GuidePlatform, label: 'Chrome / Edge', icon: 'laptop' },
                { id: 'mac-safari' as GuidePlatform, label: 'Mac Safari (Dock)', icon: 'desktop_mac' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                    activeTab === tab.id
                      ? 'bg-accent-neutral-bar text-white shadow-xs'
                      : 'bg-surface-card border border-border-hairline text-text-secondary hover:text-text-primary hover:bg-zinc-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Platform Specific Step Guide Card */}
            <div className="p-4 rounded-xl bg-surface-card border border-border-hairline flex flex-col gap-3.5 shadow-xs">
              {/* TAB 1: iOS Safari */}
              {activeTab === 'ios-safari' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-neutral-bar"></span>
                    <span className="text-xs font-semibold text-text-primary">
                      Apple iOS Safari (iPhone & iPad)
                    </span>
                  </div>
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    Apple restricts automatic installation prompts on iOS Safari. Follow these 3 quick steps to add Fuel directly to your Home Screen:
                  </p>

                  <div className="flex flex-col gap-2.5 pt-1">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                          Tap the Share button
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-surface-card border border-border-hairline text-text-primary">
                            <span className="material-symbols-outlined text-[14px]">ios_share</span>
                          </span>
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Located in Safari's bottom toolbar on iPhone (or top right on iPad).
                        </span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                          Select "Add to Home Screen"
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-surface-card border border-border-hairline text-text-primary">
                            <span className="material-symbols-outlined text-[14px]">add_box</span>
                          </span>
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Scroll down the share sheet actions until you see the plus icon.
                        </span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">
                          Tap "Add" in the top-right corner
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Fuel will now launch in native standalone mode with zero browser address bars!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: iOS Chrome */}
              {activeTab === 'ios-chrome' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-neutral-bar"></span>
                    <span className="text-xs font-semibold text-text-primary">
                      Google Chrome on iOS (iPhone & iPad)
                    </span>
                  </div>
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    Install Fuel from Chrome on iOS:
                  </p>

                  <div className="flex flex-col gap-2.5 pt-1">
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                          Tap the Share icon
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-surface-card border border-border-hairline text-text-primary">
                            <span className="material-symbols-outlined text-[14px]">share</span>
                          </span>
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          In the address bar on the right, or via the Three Dots (•••) menu.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">
                          Tap "Add to Home Screen"
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Select the Home Screen shortcut option and confirm.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Android */}
              {activeTab === 'android' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-neutral-bar"></span>
                    <span className="text-xs font-semibold text-text-primary">
                      Android (Chrome, Brave, Samsung Internet)
                    </span>
                  </div>
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    Android fully supports Progressive Web Apps with full camera & storage access:
                  </p>

                  <div className="flex flex-col gap-2.5 pt-1">
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                          Tap the Menu button
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-surface-card border border-border-hairline text-text-primary">
                            <span className="material-symbols-outlined text-[14px]">more_vert</span>
                          </span>
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Located in the top-right corner of Chrome or bottom bar of Samsung Internet.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">
                          Tap "Install App" or "Add to Home screen"
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Chrome will package Fuel as a native Android app in your app drawer.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Desktop Chrome / Edge */}
              {activeTab === 'desktop-chrome' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-neutral-bar"></span>
                    <span className="text-xs font-semibold text-text-primary">
                      Desktop (Google Chrome & Microsoft Edge)
                    </span>
                  </div>
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    Install Fuel on macOS, Windows, or Linux:
                  </p>

                  <div className="flex flex-col gap-2.5 pt-1">
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                          Click the Install Icon
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-surface-card border border-border-hairline text-text-primary">
                            <span className="material-symbols-outlined text-[14px]">install_desktop</span>
                          </span>
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          On the right side of the browser URL address bar.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">
                          Click "Install" in the prompt
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Fuel will open in its own clean window and add a desktop launcher.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: macOS Safari (Dock) */}
              {activeTab === 'mac-safari' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-neutral-bar"></span>
                    <span className="text-xs font-semibold text-text-primary">
                      Apple Safari on Mac (macOS Sonoma+)
                    </span>
                  </div>
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    Turn Fuel into a macOS desktop app using Safari:
                  </p>

                  <div className="flex flex-col gap-2.5 pt-1">
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">
                          In Safari menu bar, click "File" → "Add to Dock..."
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Available in macOS Sonoma 14 and newer.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-subtle border border-border-hairline">
                      <div className="w-6 h-6 rounded-full bg-accent-neutral-bar text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">
                          Click "Add"
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Fuel appears directly in your Mac Dock as a native application.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
