// PWA detection and installation management service

export type PlatformType = 'ios' | 'android' | 'desktop-mac' | 'desktop-windows' | 'desktop-other' | 'other';
export type BrowserType = 'safari' | 'chrome' | 'edge' | 'firefox' | 'samsung' | 'other';

export interface DeviceInfo {
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  platform: PlatformType;
  browser: BrowserType;
  platformName: string;
  browserName: string;
}

// Global deferred prompt holder
let deferredInstallPrompt: any = null;
const installListeners = new Set<() => void>();

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isStandalone: false,
      isIOS: false,
      isAndroid: false,
      isDesktop: false,
      platform: 'other',
      browser: 'other',
      platformName: 'Unknown',
      browserName: 'Browser',
    };
  }

  // Standalone detection (PWA running as installed app)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  const ua = window.navigator.userAgent.toLowerCase();
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // iOS detection (including iPadOS which mimics macOS desktop Safari userAgent)
  const isIOS =
    /iphone|ipad|ipod/.test(ua) ||
    (/macintosh|mac os x/.test(ua) && maxTouchPoints > 1);

  // Android detection
  const isAndroid = /android/.test(ua);

  // Desktop detection
  const isDesktopMac = /macintosh|mac os x/.test(ua) && !isIOS;
  const isDesktopWindows = /windows nt/.test(ua);
  const isDesktopOther = !isIOS && !isAndroid && !isDesktopMac && !isDesktopWindows;
  const isDesktop = isDesktopMac || isDesktopWindows || isDesktopOther;

  // Platform enum
  let platform: PlatformType = 'other';
  let platformName = 'Device';
  if (isIOS) {
    platform = 'ios';
    platformName = /ipad/.test(ua) || (maxTouchPoints > 1 && !/iphone/.test(ua)) ? 'iPad' : 'iPhone';
  } else if (isAndroid) {
    platform = 'android';
    platformName = 'Android';
  } else if (isDesktopMac) {
    platform = 'desktop-mac';
    platformName = 'Mac';
  } else if (isDesktopWindows) {
    platform = 'desktop-windows';
    platformName = 'Windows PC';
  } else if (isDesktop) {
    platform = 'desktop-other';
    platformName = 'Desktop';
  }

  // Browser detection
  let browser: BrowserType = 'other';
  let browserName = 'Browser';

  if (/samsungbrowser/.test(ua)) {
    browser = 'samsung';
    browserName = 'Samsung Internet';
  } else if (/edg\/|edgios\/|edge/.test(ua)) {
    browser = 'edge';
    browserName = 'Microsoft Edge';
  } else if (/crios/.test(ua)) {
    browser = 'chrome';
    browserName = 'Chrome for iOS';
  } else if (/fxios/.test(ua)) {
    browser = 'firefox';
    browserName = 'Firefox for iOS';
  } else if (/firefox/.test(ua)) {
    browser = 'firefox';
    browserName = 'Mozilla Firefox';
  } else if (/chrome|chromium/.test(ua)) {
    browser = 'chrome';
    browserName = 'Google Chrome';
  } else if (/safari/.test(ua) && !/chrome|crios|android/.test(ua)) {
    browser = 'safari';
    browserName = 'Apple Safari';
  }

  return {
    isStandalone,
    isIOS,
    isAndroid,
    isDesktop,
    platform,
    browser,
    platformName,
    browserName,
  };
}

export function isNativeInstallAvailable(): boolean {
  return deferredInstallPrompt !== null;
}

export function subscribeToInstallPrompt(callback: () => void): () => void {
  installListeners.add(callback);
  return () => installListeners.delete(callback);
}

function notifyInstallListeners() {
  installListeners.forEach(listener => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying install listener', e);
    }
  });
}

// Global initialization of PWA events
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent the default mini-infobar or banner so we control the installation flow
    e.preventDefault();
    deferredInstallPrompt = e;
    notifyInstallListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    notifyInstallListeners();
  });
}

export async function triggerNativeInstall(): Promise<{ outcome: 'accepted' | 'dismissed' | 'unsupported' }> {
  if (!deferredInstallPrompt) {
    return { outcome: 'unsupported' };
  }

  try {
    const promptEvent = deferredInstallPrompt;
    await promptEvent.prompt();
    const choiceResult = await promptEvent.userChoice;
    deferredInstallPrompt = null;
    notifyInstallListeners();
    return { outcome: choiceResult.outcome || 'accepted' };
  } catch (err) {
    console.error('Failed to trigger PWA install prompt', err);
    deferredInstallPrompt = null;
    notifyInstallListeners();
    return { outcome: 'dismissed' };
  }
}

// ---------------------------------------------------------------------------
// PWA Service Worker Update Management
// ---------------------------------------------------------------------------

let currentRegistration: ServiceWorkerRegistration | null = null;
let waitingWorker: ServiceWorker | null = null;
const updateListeners = new Set<(hasUpdate: boolean) => void>();
let isUpdateAvailableState = false;

export function isAppUpdateAvailable(): boolean {
  return isUpdateAvailableState;
}

export function subscribeToAppUpdate(callback: (hasUpdate: boolean) => void): () => void {
  updateListeners.add(callback);
  callback(isUpdateAvailableState);
  return () => updateListeners.delete(callback);
}

function notifyUpdateListeners(hasUpdate: boolean) {
  isUpdateAvailableState = hasUpdate;
  updateListeners.forEach((listener) => {
    try {
      listener(hasUpdate);
    } catch (e) {
      console.error('Error notifying update listener', e);
    }
  });
}

export function initServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const swPath = `${(import.meta as any).env?.BASE_URL || '/'}sw.js`;
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        currentRegistration = registration;
        console.log('Fuel PWA ServiceWorker registered with scope:', registration.scope);

        // 1. Check if there is already a waiting worker from a previous session
        if (registration.waiting && navigator.serviceWorker.controller) {
          waitingWorker = registration.waiting;
          notifyUpdateListeners(true);
        }

        // 2. Listen for new worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            // Only notify if there is an active controller already (i.e. not first install)
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              waitingWorker = registration.waiting || newWorker;
              notifyUpdateListeners(true);
            }
          });
        });
      })
      .catch((error) => {
        console.warn('Fuel ServiceWorker registration error:', error);
      });

    // 3. Listen for controllerchange to reload page when new worker takes over
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    // 4. Periodically check for updates (every 30 minutes)
    setInterval(() => {
      if (currentRegistration) {
        currentRegistration.update().catch(() => {});
      }
    }, 30 * 60 * 1000);

    // 5. Check when window regains visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && currentRegistration) {
        currentRegistration.update().catch(() => {});
      }
    });
  });
}

export async function checkForAppUpdate(): Promise<{ hasUpdate: boolean; message: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { hasUpdate: false, message: 'Service worker not supported in this environment.' };
  }

  if (isUpdateAvailableState && waitingWorker) {
    return { hasUpdate: true, message: 'New update is already downloaded and ready to install!' };
  }

  if (!currentRegistration) {
    return { hasUpdate: false, message: 'Service worker initializing...' };
  }

  try {
    await currentRegistration.update();
    if (currentRegistration.waiting && navigator.serviceWorker.controller) {
      waitingWorker = currentRegistration.waiting;
      notifyUpdateListeners(true);
      return { hasUpdate: true, message: 'A new update is available and ready to install!' };
    }
    return { hasUpdate: false, message: 'Fuel is up to date with the latest features.' };
  } catch (err) {
    console.error('Error checking for PWA update', err);
    return { hasUpdate: false, message: 'Could not connect to update server.' };
  }
}

export function applyAppUpdate(): void {
  if (waitingWorker) {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  } else {
    // Fallback if no waiting worker
    window.location.reload();
  }
}

export function triggerSimulatedUpdate(enable: boolean = true): void {
  notifyUpdateListeners(enable);
}

