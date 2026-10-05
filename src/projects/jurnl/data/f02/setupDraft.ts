/**
 * F02 setup profile — persisted through the repository device adapter (W0.3).
 */

import { useSyncExternalStore } from 'react';
import { getRepository } from '../repository/deviceRepository';
import { syncSetupConsentsToRepository } from '../repository/consentSync';

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

export function getSetupDraft(): SetupDraft {
  return getRepository().getSnapshot().setup;
}

export function patchSetup(patch: Partial<SetupDraft>) {
  getRepository().patchSetup(patch);
  if ('consentRemember' in patch || 'consentLinks' in patch || 'consentSale' in patch) {
    syncSetupConsentsToRepository(getSetupDraft());
  }
}

export function resetSetup() {
  getRepository().resetSetup();
}

function subscribe(listener: () => void) {
  return getRepository().subscribe(listener);
}

export function useSetup(): SetupDraft {
  return useSyncExternalStore(subscribe, getSetupDraft, () => EMPTY_SETUP);
}
