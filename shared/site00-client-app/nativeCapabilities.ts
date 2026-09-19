export type NativeCapabilityStatus = 'AVAILABLE' | 'WEB_FALLBACK' | 'UNAVAILABLE';

export type NativeCapabilityContract = {
  biometrics: NativeCapabilityStatus;
  push: NativeCapabilityStatus;
  voiceNotes: NativeCapabilityStatus;
  attachments: NativeCapabilityStatus;
  share: NativeCapabilityStatus;
  calendar: NativeCapabilityStatus;
  haptics: NativeCapabilityStatus;
  offlineFiles: NativeCapabilityStatus;
  badges: NativeCapabilityStatus;
  deepLinks: NativeCapabilityStatus;
};

function detectPush(): NativeCapabilityStatus {
  if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
    return 'WEB_FALLBACK';
  }
  return 'UNAVAILABLE';
}

function detectShare(): NativeCapabilityStatus {
  if (typeof navigator !== 'undefined' && 'share' in navigator) return 'AVAILABLE';
  return 'WEB_FALLBACK';
}

export const NATIVE_CAPABILITY_CONTRACT: NativeCapabilityContract = {
  biometrics: 'UNAVAILABLE',
  push: typeof window === 'undefined' ? 'WEB_FALLBACK' : detectPush(),
  voiceNotes: 'WEB_FALLBACK',
  attachments: 'AVAILABLE',
  share: typeof window === 'undefined' ? 'WEB_FALLBACK' : detectShare(),
  calendar: 'WEB_FALLBACK',
  haptics: 'UNAVAILABLE',
  offlineFiles: 'WEB_FALLBACK',
  badges: 'WEB_FALLBACK',
  deepLinks: 'AVAILABLE',
};

export function getNativeCapabilities(): NativeCapabilityContract {
  return { ...NATIVE_CAPABILITY_CONTRACT };
}
