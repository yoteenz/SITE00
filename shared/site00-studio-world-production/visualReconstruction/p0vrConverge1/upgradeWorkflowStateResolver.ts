/**
 * P0.VR.CONVERGE.1R1 — Founder-facing upgrade workflow state (no COMPLETE + PLANNED conflict).
 */

import type { PageCreativeUpgradeSession } from '../p0vrCapture1/types.js';
import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';

export const UPGRADE_WORKFLOW_STATES = [
  'COMPARE_READY',
  'DIRECTION_READY',
  'READY_TO_BUILD_TWIN',
  'TWIN_BUILDING',
  'TWIN_READY',
  'TWIN_IN_REVIEW',
  'TWIN_REVISION_REQUESTED',
  'TWIN_REVISING',
  'READY_FOR_PROMOTION',
  'PROMOTED',
  'TWIN_BUILD_FAILED',
  'CANCELLED',
  'SUPERSEDED',
] as const;

export type UpgradeWorkflowState = (typeof UPGRADE_WORKFLOW_STATES)[number];

export type UpgradeWorkflowResolution = {
  state: UpgradeWorkflowState;
  founderStatusLabel: string;
  twinStatusLabel: string | null;
  primaryTask: 'APPROVE_DIRECTION' | 'BUILD_TWIN' | 'PREVIEW_TWIN' | 'PROMOTE' | 'COMPARE' | 'NONE';
  isTerminal: boolean;
  conflictingComplete: boolean;
};

export function resolveUpgradeWorkflowState(input: {
  session: PageCreativeUpgradeSession;
  twinSession?: ReconstructionTwinSession | null;
}): UpgradeWorkflowResolution {
  const twin = input.twinSession;
  const session = input.session;

  if (twin?.status === 'PROMOTED') {
    return {
      state: 'PROMOTED',
      founderStatusLabel: 'COMPLETE',
      twinStatusLabel: 'PROMOTED',
      primaryTask: 'NONE',
      isTerminal: true,
      conflictingComplete: false,
    };
  }

  if (twin?.status === 'SUPERSEDED') {
    return {
      state: 'SUPERSEDED',
      founderStatusLabel: 'SUPERSEDED',
      twinStatusLabel: 'SUPERSEDED',
      primaryTask: 'NONE',
      isTerminal: true,
      conflictingComplete: false,
    };
  }

  if (twin?.status === 'FAILED') {
    return {
      state: 'TWIN_BUILD_FAILED',
      founderStatusLabel: 'TWIN BUILD FAILED',
      twinStatusLabel: 'FAILED',
      primaryTask: 'BUILD_TWIN',
      isTerminal: false,
      conflictingComplete: session.status === 'COMPLETE',
    };
  }

  if (twin?.status === 'BUILDING') {
    return {
      state: 'TWIN_BUILDING',
      founderStatusLabel: 'BUILDING TWIN',
      twinStatusLabel: 'BUILDING',
      primaryTask: 'NONE',
      isTerminal: false,
      conflictingComplete: session.status === 'COMPLETE',
    };
  }

  if (twin?.status === 'PLANNED') {
    return {
      state: 'READY_TO_BUILD_TWIN',
      founderStatusLabel: 'READY TO BUILD TWIN',
      twinStatusLabel: 'PLANNED',
      primaryTask: 'BUILD_TWIN',
      isTerminal: false,
      conflictingComplete: session.status === 'COMPLETE',
    };
  }

  if (twin && ['READY_FOR_REVIEW', 'VERIFYING'].includes(twin.status)) {
    return {
      state: 'TWIN_READY',
      founderStatusLabel: 'TWIN READY',
      twinStatusLabel: 'READY',
      primaryTask: 'PREVIEW_TWIN',
      isTerminal: false,
      conflictingComplete: false,
    };
  }

  if (twin?.status === 'REVISION_REQUESTED') {
    return {
      state: 'TWIN_REVISION_REQUESTED',
      founderStatusLabel: 'TWIN REVISION REQUESTED',
      twinStatusLabel: twin.status,
      primaryTask: 'PREVIEW_TWIN',
      isTerminal: false,
      conflictingComplete: false,
    };
  }

  if (twin?.status === 'REVISING') {
    return {
      state: 'TWIN_REVISING',
      founderStatusLabel: 'REVISING TWIN',
      twinStatusLabel: 'REVISING',
      primaryTask: 'PREVIEW_TWIN',
      isTerminal: false,
      conflictingComplete: false,
    };
  }

  if (twin?.status === 'APPROVED_FOR_PROMOTION') {
    return {
      state: 'READY_FOR_PROMOTION',
      founderStatusLabel: 'READY FOR PROMOTION',
      twinStatusLabel: twin.status,
      primaryTask: 'PROMOTE',
      isTerminal: false,
      conflictingComplete: false,
    };
  }

  if (session.status === 'DIRECTION_READY') {
    return {
      state: 'DIRECTION_READY',
      founderStatusLabel: 'DIRECTION READY',
      twinStatusLabel: null,
      primaryTask: 'APPROVE_DIRECTION',
      isTerminal: false,
      conflictingComplete: false,
    };
  }

  if (session.status === 'DIRECTION_APPROVED' || session.status === 'APPROVED') {
    return {
      state: 'READY_TO_BUILD_TWIN',
      founderStatusLabel: 'READY TO BUILD TWIN',
      twinStatusLabel: twin ? twin.status : null,
      primaryTask: 'BUILD_TWIN',
      isTerminal: false,
      conflictingComplete: false,
    };
  }

  if (session.status === 'COMPLETE' && !twin) {
    return {
      state: 'PROMOTED',
      founderStatusLabel: 'COMPLETE',
      twinStatusLabel: null,
      primaryTask: 'NONE',
      isTerminal: true,
      conflictingComplete: false,
    };
  }

  return {
    state: 'COMPARE_READY',
    founderStatusLabel: session.status.replace(/_/g, ' '),
    twinStatusLabel: twin?.status ?? null,
    primaryTask: 'COMPARE',
    isTerminal: false,
    conflictingComplete: false,
  };
}
