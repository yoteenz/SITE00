/**
 * P0.R.1 — Reader account persistence (Supabase when available, local fallback for prototype).
 */

import type {
  CustomAvatarGenerationRecord,
  ReaderAccountProfile,
  ReaderOnboardingStep,
} from './types.js';
import { defaultReaderAlertPreferences } from './readerAlertService.js';

const STORAGE_KEY = 'site00_astral_reader_account_v1';

type ReaderAccountStoreSnapshot = {
  profiles: Record<string, ReaderAccountProfile>;
  customAvatars: Record<string, CustomAvatarGenerationRecord>;
};

let memoryStore: ReaderAccountStoreSnapshot = { profiles: {}, customAvatars: {} };

function emptyProfile(userId: string): ReaderAccountProfile {
  const now = new Date().toISOString();
  return {
    readerId: `reader-${userId.slice(0, 8)}`,
    userId,
    accountRole: 'READER',
    displayName: '',
    introduction: '',
    experienceNotes: '',
    specialties: [],
    primaryDestination: 'tarot-suite',
    avatarId: null,
    customAvatarId: null,
    customAvatarEntitlement: 'NOT_PURCHASED',
    presence: 'OFFLINE',
    currentDestination: null,
    currentRoomId: null,
    onboardingStep: 'WELCOME',
    onboardingComplete: false,
    alertPreferences: defaultReaderAlertPreferences(),
    rating: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadReaderAccountStore(): ReaderAccountStoreSnapshot {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryStore = JSON.parse(raw) as ReaderAccountStoreSnapshot;
      }
    } catch {
      /* keep memory */
    }
  }
  return memoryStore;
}

export function saveReaderAccountStore(snapshot: ReaderAccountStoreSnapshot): void {
  memoryStore = snapshot;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* quota */
    }
  }
}

export function getReaderProfileByUserId(userId: string): ReaderAccountProfile | null {
  const store = loadReaderAccountStore();
  return Object.values(store.profiles).find((p) => p.userId === userId) ?? null;
}

export function getOrCreateReaderProfile(userId: string): ReaderAccountProfile {
  const store = loadReaderAccountStore();
  const existing = Object.values(store.profiles).find((p) => p.userId === userId);
  if (existing) return existing;
  const profile = emptyProfile(userId);
  store.profiles[profile.readerId] = profile;
  saveReaderAccountStore(store);
  return profile;
}

export function upsertReaderProfile(profile: ReaderAccountProfile): ReaderAccountProfile {
  const store = loadReaderAccountStore();
  const updated = { ...profile, updatedAt: new Date().toISOString() };
  store.profiles[updated.readerId] = updated;
  saveReaderAccountStore(store);
  return updated;
}

export function advanceOnboardingStep(
  userId: string,
  step: ReaderOnboardingStep,
  patch?: Partial<ReaderAccountProfile>,
): ReaderAccountProfile {
  const profile = getOrCreateReaderProfile(userId);
  return upsertReaderProfile({
    ...profile,
    ...patch,
    onboardingStep: step,
    onboardingComplete: step === 'COMPLETE' ? true : profile.onboardingComplete,
  });
}

export function listReaderProfiles(): ReaderAccountProfile[] {
  return Object.values(loadReaderAccountStore().profiles);
}

export function resetReaderAccountStoreForTest(): void {
  memoryStore = { profiles: {}, customAvatars: {} };
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
