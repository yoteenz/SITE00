/**
 * P0.VR.PAGE-CONCEPT-CGPT-REAL-SUBSTEP-EMISSION1 — server-persisted CGPT substep lane.
 */

import type { PageConceptCgptSubstepId } from './pageConceptLiveProgress.js';

export type PageConceptCgptSubstepServerState =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETE'
  | 'RATE_LIMITED'
  | 'FAILED';

export type PageConceptCgptSubstepRunDetail = {
  currentCgptSubstep: PageConceptCgptSubstepId | null;
  substepStatusById: Record<PageConceptCgptSubstepId, PageConceptCgptSubstepServerState>;
  substepStartedAt: Partial<Record<PageConceptCgptSubstepId, string>>;
  substepUpdatedAt: Partial<Record<PageConceptCgptSubstepId, string>>;
  substepDigest: Partial<Record<PageConceptCgptSubstepId, string>>;
  contextCompilationComplete: boolean;
};

export function emptyCgptSubstepRunDetail(): PageConceptCgptSubstepRunDetail {
  return {
    currentCgptSubstep: null,
    substepStatusById: {
      'page-intelligence': 'PENDING',
      'brand-context': 'PENDING',
      'key-messages': 'PENDING',
      'visual-moodboard': 'PENDING',
      'creative-direction': 'PENDING',
    },
    substepStartedAt: {},
    substepUpdatedAt: {},
    substepDigest: {},
    contextCompilationComplete: false,
  };
}

export function cgptSubstepsForStatusApi(detail: PageConceptCgptSubstepRunDetail | null) {
  if (!detail) return null;
  return {
    currentCgptSubstep: detail.currentCgptSubstep,
    pageIntelligence: detail.substepStatusById['page-intelligence'],
    brandContext: detail.substepStatusById['brand-context'],
    keyMessages: detail.substepStatusById['key-messages'],
    visualMoodboard: detail.substepStatusById['visual-moodboard'],
    creativeDirection: detail.substepStatusById['creative-direction'],
    contextCompilationComplete: detail.contextCompilationComplete,
    substepDigest: detail.substepDigest,
    substepUpdatedAt: detail.substepUpdatedAt,
  };
}
