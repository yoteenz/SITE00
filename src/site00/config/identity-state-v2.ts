/**
 * Identity State V2 — progress positions, overview copy, and helpers.
 */

import type { IdntyAssessmentStateId } from './idnty-assessment';
import type { IdntyBrandStateIconId } from './idnty-brand-state-icons';

export type IdentityStateProgressMeta = {
  stateId: IdntyAssessmentStateId;
  brandStateId: IdntyBrandStateIconId;
  code: string;
  position: number;
  positionLabel: string;
  systemMode: string;
};

export const IDENTITY_STATE_PROGRESS: IdentityStateProgressMeta[] = [
  {
    stateId: 'starting-at-zero',
    brandStateId: 'starting-at-zero',
    code: '00',
    position: 1,
    positionLabel: '01 / 04',
    systemMode: 'IDENTITY ORIGIN',
  },
  {
    stateId: 'some-pieces-exist',
    brandStateId: 'some-pieces',
    code: '01',
    position: 2,
    positionLabel: '02 / 04',
    systemMode: 'IDENTITY INVENTORY',
  },
  {
    stateId: 'ready-for-evolution',
    brandStateId: 'ready-evolution',
    code: '02',
    position: 3,
    positionLabel: '03 / 04',
    systemMode: 'IDENTITY DIAGNOSTIC',
  },
  {
    stateId: 'build-ready',
    brandStateId: 'build-ready',
    code: '03',
    position: 4,
    positionLabel: '04 / 04',
    systemMode: 'IDENTITY VERIFICATION',
  },
];

export function getIdentityStateProgress(stateId: IdntyAssessmentStateId): IdentityStateProgressMeta {
  return IDENTITY_STATE_PROGRESS.find((entry) => entry.stateId === stateId) ?? IDENTITY_STATE_PROGRESS[0];
}

export type InventorySummary = {
  total: number;
  found: number;
  gaps: number;
  completenessPct: number;
  foundLabels: string[];
  gapLabels: string[];
};

export function computeInventorySummary(
  options: { id: string; label: string }[],
  selectedIds: string[],
): InventorySummary {
  const foundLabels = options.filter((o) => selectedIds.includes(o.id)).map((o) => o.label);
  const gapLabels = options.filter((o) => !selectedIds.includes(o.id)).map((o) => o.label);
  const total = options.length;
  const found = foundLabels.length;
  const gaps = gapLabels.length;
  const completenessPct = total === 0 ? 0 : Math.round((found / total) * 100);
  return { total, found, gaps, completenessPct, foundLabels, gapLabels };
}

/** Foundation categories tracked on Starting at Zero landing. */
export const IDENTITY_ORIGIN_FOUNDATION_CATEGORIES = [
  'PURPOSE',
  'AUDIENCE',
  'POSITIONING',
  'PERSONALITY',
  'VISUAL DIRECTION',
] as const;

export function computeFoundationProgress(completedStepIds: string[]): {
  pct: number;
  completed: number;
  total: number;
} {
  const total = IDENTITY_ORIGIN_FOUNDATION_CATEGORIES.length;
  const completed = Math.min(completedStepIds.length, total);
  const pct = Math.round((completed / total) * 100);
  return { pct, completed, total };
}
