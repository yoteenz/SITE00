/**
 * F02 SETUP live screen tree. Routes match the implementation source map.
 * Authorities are reference files for the design viewport, not runtime images.
 */

import type { F02EmblemId, F02LockupId, F02PlateId } from './plates';

export type F02Role = 'PARENT' | 'CHILD' | 'GRANDCHILD';

export type F02ScreenDef = {
  id: string;
  name: string;
  role: F02Role;
  route: string;
  plate: F02PlateId;
  phase: 1 | 2 | 3 | 4;
  emblem: F02EmblemId | null;
  lockup: F02LockupId | null;
  /** What paints in the header. A lockup replaces the emblem and the live wordmark. */
  header: 'LOCKUP' | 'EMBLEM' | 'NONE';
  authorityFile: string;
  back: string | null;
};

const AUTH = (file: string) => `public/jurnl/f02-setup/authorities/${file}`;

export const F02_SCREENS: readonly F02ScreenDef[] = [
  { id: 'F02.00', name: 'THE SHAPE OF YOUR LIFE', role: 'PARENT', route: 'setup', plate: 'ENV.ARRIVAL', phase: 1, emblem: 'F02.BOTANICAL.EMBLEM.001', lockup: 'F02.BRANDLOCKUP.JURNL.001', header: 'LOCKUP', authorityFile: AUTH('F02.00_SETUP_PARENT.jpg'), back: null },
  { id: 'F02.01', name: 'WHO THIS IS FOR', role: 'CHILD', route: 'setup/household', plate: 'ENV.ARRIVAL', phase: 1, emblem: 'F02.BOTANICAL.EMBLEM.002', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.01_CONTEXT.jpg'), back: 'F02.00' },
  { id: 'F02.02', name: 'WHERE IT LIVES', role: 'CHILD', route: 'setup/accounts', plate: 'ENV.DESK', phase: 2, emblem: 'F02.BOTANICAL.EMBLEM.003', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.02_ACCOUNTS.jpg'), back: 'F02.01' },
  { id: 'F02.03', name: 'WHAT ARRIVES', role: 'CHILD', route: 'setup/income', plate: 'ENV.DESK', phase: 2, emblem: 'F02.BOTANICAL.EMBLEM.004', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.03_INCOME.jpg'), back: 'F02.02' },
  { id: 'F02.04', name: 'WHAT REPEATS', role: 'CHILD', route: 'setup/commitments', plate: 'ENV.DESK', phase: 2, emblem: 'F02.BOTANICAL.EMBLEM.004', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.04_COMMITMENTS.jpg'), back: 'F02.03' },
  { id: 'F02.05', name: 'WHAT MATTERS FIRST', role: 'CHILD', route: 'setup/priorities', plate: 'ENV.EDIT', phase: 3, emblem: 'F02.BOTANICAL.EMBLEM.005', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.05_PRIORITIES.jpg'), back: 'F02.04' },
  { id: 'F02.06', name: 'WHAT SHOULD STAY', role: 'CHILD', route: 'setup/protected', plate: 'ENV.DESK', phase: 3, emblem: 'F02.BOTANICAL.EMBLEM.006', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.06_AVAILABLE.jpg'), back: 'F02.05' },
  { id: 'F02.07', name: 'WHAT JURNL MAY KEEP', role: 'CHILD', route: 'setup/boundaries', plate: 'ENV.QUIET', phase: 3, emblem: 'F02.BOTANICAL.EMBLEM.007', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.07_BOUNDARIES.jpg'), back: 'F02.06' },
  { id: 'F02.08', name: 'JURNL IS READY', role: 'CHILD', route: 'setup/ready', plate: 'ENV.ARRIVAL', phase: 4, emblem: 'F02.BOTANICAL.EMBLEM.008', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.08_READY.jpg'), back: 'F02.07' },
  { id: 'F02.02.1', name: 'NAME AN ACCOUNT', role: 'GRANDCHILD', route: 'setup/accounts/name', plate: 'ENV.DESK', phase: 2, emblem: 'F02.BOTANICAL.EMBLEM.009', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.02.1_NAME_ACCOUNT.jpg'), back: 'F02.02' },
  { id: 'F02.05.1', name: 'NAME A GOAL', role: 'GRANDCHILD', route: 'setup/priorities/goal', plate: 'ENV.EDIT', phase: 3, emblem: 'F02.BOTANICAL.EMBLEM.010', lockup: null, header: 'EMBLEM', authorityFile: AUTH('F02.05.1_NAME_GOAL.jpg'), back: 'F02.05' },
];

export const F02_STATE_SCREENS = {
  'F02.ST.RESUME': { id: 'F02.ST.RESUME', route: 'setup', plate: 'ENV.ARRIVAL' as const, emblem: 'F02.BOTANICAL.EMBLEM.011' as const, lockup: null, header: 'EMBLEM' as const, authorityFile: AUTH('F02.ST.RESUME.jpg') },
  'F02.ST.VALIDATION': { id: 'F02.ST.VALIDATION', route: 'setup/income', plate: 'ENV.DESK' as const, emblem: 'F02.BOTANICAL.EMBLEM.012' as const, lockup: 'F02.BRANDLOCKUP.JURNL_SETUP.001' as const, header: 'LOCKUP' as const, authorityFile: AUTH('F02.ST.VALIDATION.jpg') },
  'F02.ST.CONNECTED': { id: 'F02.ST.CONNECTED', route: 'setup/accounts', plate: 'ENV.DESK' as const, emblem: 'F02.BOTANICAL.EMBLEM.013' as const, lockup: null, header: 'EMBLEM' as const, authorityFile: AUTH('F02.ST.CONNECTED.jpg') },
};

export const F02_NEXT: Record<string, string> = {
  'F02.00': 'F02.01',
  'F02.01': 'F02.02',
  'F02.02': 'F02.03',
  'F02.03': 'F02.04',
  'F02.04': 'F02.05',
  'F02.05': 'F02.06',
  'F02.06': 'F02.07',
  'F02.07': 'F02.08',
};

export const f02Screen = (id: string) => F02_SCREENS.find((s) => s.id === id) ?? null;
export const f02ScreenForRoute = (route: string) => F02_SCREENS.find((s) => s.route === route.replace(/^\/+|\/+$/g, '')) ?? null;

export const F02_PRIORITIES = ['HOUSING', 'DAILY LIFE', 'A GOAL', 'DEBT', 'TRAVEL', 'A BUFFER'] as const;
export const F02_CADENCES = ['WEEKLY', 'EVERY TWO WEEKS', 'MONTHLY', 'IRREGULAR'] as const;
export const F02_KINDS = ['CHECKING', 'SAVINGS', 'CARD'] as const;
export const F02_HORIZONS = ['THIS SEASON', 'THIS YEAR', 'LATER'] as const;

export const F02_PATH = ['HOUSEHOLD', 'MONEY', 'WHAT MATTERS', 'BOUNDARIES'] as const;

/** A number the field can keep. Empty is not a number. */
export const isSetupAmount = (value: string) => /^\d+(\.\d{1,2})?$/.test(value.trim());
