/**
 * Gallery select must stay local when design-workspace-production API is unavailable.
 */

import { describe, expect, it } from 'vitest';

import { transitionSelectGalleryCandidate } from '../shared/site00-design-workspace-production/designProductionTransitions.js';
import { createInitialDesignProductionState } from '../shared/site00-design-workspace-production/designProductionStore.js';

describe('P0 design production gallery select local fallback', () => {
  it('transitionSelectGalleryCandidate updates selectedCandidateId for offline cache', () => {
    const base = createInitialDesignProductionState('ndxbook');
    const next = transitionSelectGalleryCandidate(base, 'concept-b');
    expect(next.selectedCandidateId).toBe('concept-b');
  });
});
