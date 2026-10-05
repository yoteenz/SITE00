/**
 * P0.R.1 — Server-side reader account service (Supabase + in-memory fallback).
 */

import type { ReaderAccountProfile, ReaderOnboardingStep } from '../../../shared/site00-astral-world/readerAccount/types.js';
import {
  getOrCreateReaderProfile,
  getReaderProfileByUserId,
  upsertReaderProfile,
  listReaderProfiles,
} from '../../../shared/site00-astral-world/readerAccount/readerAccountStore.js';

export function fetchReaderAccount(userId: string): ReaderAccountProfile {
  return getOrCreateReaderProfile(userId);
}

export function patchReaderAccount(
  userId: string,
  patch: Partial<ReaderAccountProfile>,
): ReaderAccountProfile {
  const existing = getOrCreateReaderProfile(userId);
  return upsertReaderProfile({ ...existing, ...patch, userId });
}

export function completeOnboardingStep(
  userId: string,
  step: ReaderOnboardingStep,
  patch?: Partial<ReaderAccountProfile>,
): ReaderAccountProfile {
  const profile = getOrCreateReaderProfile(userId);
  return upsertReaderProfile({
    ...profile,
    ...patch,
    onboardingStep: step,
    onboardingComplete: step === 'COMPLETE',
  });
}

export function getReaderAccountByUserId(userId: string): ReaderAccountProfile | null {
  return getReaderProfileByUserId(userId);
}

export function listAllReaderAccounts(): ReaderAccountProfile[] {
  return listReaderProfiles();
}

export function resolveAstralAccountRole(userId: string, profileRole?: string | null): 'SEEKER' | 'READER' {
  const reader = getReaderProfileByUserId(userId);
  if (reader?.onboardingComplete) return 'READER';
  if (profileRole?.toUpperCase() === 'READER') return 'READER';
  return 'SEEKER';
}
