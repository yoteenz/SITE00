/**
 * P0.VR.DESIGN-AUTHORITY-WORKFLOW2 — independent viewport preferences, promotion, pair review.
 */

import { describe, expect, it } from 'vitest';

import {
  createInitialPageAuthorityWorkflow,
  promoteViewportDesign,
  setPreferredViewportConcept,
} from '../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import { railActionDisabledReason } from '../shared/site00-design-workspace-production/designInteractionEligibility.js';
import {
  transitionOpenPairReview,
  transitionPromoteViewportMaster,
  transitionSelectViewportCandidate,
} from '../shared/site00-design-workspace-production/designProductionTransitions.js';
import { createInitialDesignProductionState } from '../shared/site00-design-workspace-production/designProductionStore.js';

const founder = { email: 'founder@test', isFounder: true };

describe('P0.VR.DESIGN-AUTHORITY-WORKFLOW2', () => {
  it('select for mobile/desktop assigns independent preferred concepts (Concept A / Concept C)', () => {
    let state = createInitialDesignProductionState('ndxbook');
    state = transitionSelectViewportCandidate(state, founder, {
      viewport: 'MOBILE',
      candidateId: 'concept-a',
      candidateVersion: 'A',
    });
    expect(state.preferredMobileConceptId).toBe('concept-a');
    expect(state.preferredDesktopConceptId).toBeNull();
    expect(state.mobileAuthority).toBe('SELECTED');
    expect(state.desktopAuthority).toBe('MISSING');

    state = transitionSelectViewportCandidate(state, founder, {
      viewport: 'DESKTOP',
      candidateId: 'concept-c',
      candidateVersion: 'C',
    });
    expect(state.preferredMobileConceptId).toBe('concept-a');
    expect(state.preferredDesktopConceptId).toBe('concept-c');
    expect(state.desktopAuthority).toBe('SELECTED');
    expect(state.selectedCandidateId).not.toBe('concept-c');
  });

  it('promote mobile/desktop finalizes independent promoted designs', () => {
    let state = createInitialDesignProductionState('ndxbook');
    state = transitionSelectViewportCandidate(state, founder, {
      viewport: 'MOBILE',
      candidateId: 'concept-a',
      candidateVersion: 'A',
    });
    state = transitionSelectViewportCandidate(state, founder, {
      viewport: 'DESKTOP',
      candidateId: 'concept-c',
      candidateVersion: 'C',
    });
    state = transitionPromoteViewportMaster(state, founder, 'MOBILE');
    expect(state.promotedMobileConceptId).toBe('concept-a');
    expect(state.mobileAuthority).toBe('PROMOTED');
    expect(state.promotedDesktopConceptId).toBeNull();

    state = transitionPromoteViewportMaster(state, founder, 'DESKTOP');
    expect(state.promotedDesktopConceptId).toBe('concept-c');
    expect(state.desktopAuthority).toBe('PROMOTED');
  });

  it('pair review requires both promoted designs', () => {
    let state = createInitialDesignProductionState('ndxbook');
    expect(() => transitionOpenPairReview(state, founder)).toThrow();
    state = transitionSelectViewportCandidate(state, founder, {
      viewport: 'MOBILE',
      candidateId: 'concept-a',
      candidateVersion: 'A',
    });
    state = transitionPromoteViewportMaster(state, founder, 'MOBILE');
    expect(() => transitionOpenPairReview(state, founder)).toThrow();
    state = transitionSelectViewportCandidate(state, founder, {
      viewport: 'DESKTOP',
      candidateId: 'concept-c',
      candidateVersion: 'C',
    });
    state = transitionPromoteViewportMaster(state, founder, 'DESKTOP');
    state = transitionOpenPairReview(state, founder);
    expect(state.pairReviewOpenedAt).toBeTruthy();
  });

  it('promote guards explain missing preferred concept', () => {
    const state = createInitialDesignProductionState('ndxbook');
    expect(railActionDisabledReason('promote-mobile', state, founder)).toMatch(/preferred/i);
  });

  it('page authority workflow store tracks CGPT collaboration versions', () => {
    let wf = createInitialPageAuthorityWorkflow('ndxbook', 'ndxbook:overview');
    wf = setPreferredViewportConcept(wf, 'MOBILE', 'concept-a');
    wf = setPreferredViewportConcept(wf, 'DESKTOP', 'concept-c');
    wf = promoteViewportDesign(wf, 'MOBILE');
    wf = promoteViewportDesign(wf, 'DESKTOP');
    expect(wf.promoted.mobileConceptId).toBe('concept-a');
    expect(wf.promoted.desktopConceptId).toBe('concept-c');
    expect(wf.mobileAuthority.versions.length).toBeGreaterThan(0);
  });
});
