import type { NmeWizardStep } from './narrativeMomentumWizardModel.js';

export type NmeWizardPersistedState = {
  currentWizardStep: NmeWizardStep;
  selectedBeatId: string | null;
  selectedProofId: string | null;
  selectedFormat: 'REEL' | 'CAROUSEL';
  completedSteps: number[];
};

const STORAGE_PREFIX = 'site00-nme-wizard-v1';

function storageKey(planId: string): string {
  return `${STORAGE_PREFIX}:${planId}`;
}

export function loadNmeWizardState(planId: string): Partial<NmeWizardPersistedState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(planId));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<NmeWizardPersistedState>;
  } catch {
    return null;
  }
}

export function saveNmeWizardState(planId: string, state: NmeWizardPersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(planId), JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function defaultWizardState(defaultBeatId: string | null): NmeWizardPersistedState {
  return {
    currentWizardStep: 1,
    selectedBeatId: defaultBeatId,
    selectedProofId: null,
    selectedFormat: 'REEL',
    completedSteps: [],
  };
}
