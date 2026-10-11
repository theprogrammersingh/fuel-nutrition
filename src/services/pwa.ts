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
