/**
 * F02 draft. Device storage for this runtime only. F01 session state is untouched.
 */

import { useSyncExternalStore } from 'react';

export type SetupDraft = {
  started: boolean;
  resumeAt: string;
  household: 'JUST_ME' | 'SHARED' | null;
  accounts: 'CONNECTED' | 'NAMED' | 'SKIPPED' | null;
  accountName: string;
  accountKind: 'CHECKING' | 'SAVINGS' | 'CARD' | null;
  cadence: string | null;
  amount: string;
  obligations: { name: string; cadence: string }[];
  obligationsSkipped: boolean;
  priorities: string[];
  goalName: string;
  goalHorizon: 'THIS SEASON' | 'THIS YEAR' | 'LATER' | null;
  protectedAmount: string;
  protectedSkipped: boolean;
  consentRemember: boolean;
  consentLinks: boolean;
  consentSale: boolean;
  voice: 'GUIDED' | 'QUIET' | null;
};

export const EMPTY_SETUP: SetupDraft = {
  started: false,
  resumeAt: 'F02.01',
  household: null,
  accounts: null,
  accountName: '',
  accountKind: null,
  cadence: null,
  amount: '',
  obligations: [],
  obligationsSkipped: false,
  priorities: [],
  goalName: '',
  goalHorizon: null,
  protectedAmount: '',
  protectedSkipped: false,
  consentRemember: true,
  consentLinks: true,
  consentSale: true,
  voice: null,
};

const KEY = 'jurnl.runtime.v1.setup';
const listeners = new Set<() => void>();
let draft: SetupDraft = EMPTY_SETUP;
let hydrated = false;

function readStored(): SetupDraft {
  if (typeof sessionStorage === 'undefined') return EMPTY_SETUP;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return EMPTY_SETUP;
    return { ...EMPTY_SETUP, ...(JSON.parse(raw) as SetupDraft) };
  } catch {
    return EMPTY_SETUP;
  }
}

function hydrate() {
  if (hydrated || typeof sessionStorage === 'undefined') return;
  draft = readStored();
  hydrated = true;
}

function emit() {
  if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(KEY, JSON.stringify(draft));
  listeners.forEach((l) => l());
}

export function getSetupDraft(): SetupDraft {
  hydrate();
  return draft;
}

export function patchSetup(patch: Partial<SetupDraft>) {
  hydrate();
  draft = { ...draft, ...patch, started: patch.started ?? true };
  emit();
}

export function resetSetup() {
  draft = EMPTY_SETUP;
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSetup(): SetupDraft {
  return useSyncExternalStore(subscribe, getSetupDraft, () => EMPTY_SETUP);
}
