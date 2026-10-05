/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CONCEPT-SELECTION-SYNC1
 */

import { describe, expect, it } from 'vitest';

import {
  activateWorkspaceConcept,
  buildCompareConceptColumns,
  conceptViewportBadge,
  derivePairReviewStatus,
  deriveWorkspaceSelfReviewState,
  hasPendingAuthorityChange,
  promoteViewportConceptForReview,
  selectViewportConceptForReview,
  setWorkspaceReviewViewport,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/reviewState.js';
import {
  beginWorkspaceConceptSet,
  mergeGenerationArtifactsIntoConcepts,
  registerGenerationJobs,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/generationWorkflow.js';
import {
  compileAndFreezeFunctionContract,
  completePairReview,
  createInitialWorkspaceSelfState,
  lockWorkspaceAuthority,
  openPairReview,
  stageConceptArtifact,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import { resolveViewportAuthorityPreview } from '../shared/site00-design-workspace-production/workspaceSelfConcept/viewportAuthorityPreview.js';
import type { WorkspaceSelfGeneratedArtifact } from '../shared/site00-design-workspace-production/workspaceSelfConcept/generationTypes.js';

function job(
  conceptId: 'CONCEPT_A' | 'CONCEPT_B' | 'CONCEPT_C',
  viewport: 'MOBILE' | 'DESKTOP',
  captureSetId: string,
  path: string,
): WorkspaceSelfGeneratedArtifact {
  return {
    artifactId: `wsga-${conceptId}-${viewport}`,
    conceptId,
    territoryId: `wg2-${conceptId}`,
    viewport,
    captureSetId,
    functionContractId: 'wsfc-test',
    creativeBriefSetId: 'wsp-test',
    creativeDirectionId: `wdir-${conceptId}`,
    gpt2ConceptId: `wg2-${conceptId}`,
    provider: 'NBP',
    model: 'fal-ai/nano-banana-pro/edit',
    providerJobId: 'j1',
    promptVersion: 'v2',
    createdAt: new Date().toISOString(),
    status: 'READY',
    artifactPath: path,
    imageUri: null,
    width: 390,
    height: 844,
  };
}

function withArtifacts(captureSetId: string) {
  let s = compileAndFreezeFunctionContract(createInitialWorkspaceSelfState());
  s = beginWorkspaceConceptSet(s, {
    captureSetId,
    functionContractId: s.functionContract!.contractId,
    creativeBriefSetId: 'wsp-1',
    createdBy: 't',
  });
  s = registerGenerationJobs(s, [
    job('CONCEPT_A', 'MOBILE', captureSetId, 'local://a-m'),
    job('CONCEPT_A', 'DESKTOP', captureSetId, 'local://a-d'),
    job('CONCEPT_B', 'MOBILE', captureSetId, 'local://b-m'),
    job('CONCEPT_B', 'DESKTOP', captureSetId, 'local://b-d'),
    job('CONCEPT_C', 'MOBILE', captureSetId, 'local://c-m'),
    job('CONCEPT_C', 'DESKTOP', captureSetId, 'local://c-d'),
  ]);
  s = mergeGenerationArtifactsIntoConcepts(s);
  for (const id of ['CONCEPT_A', 'CONCEPT_B', 'CONCEPT_C'] as const) {
    s = stageConceptArtifact(s, id, {});
  }
  return s;
}

describe('WORKSPACE_SELF concept selection sync', () => {
  it('active concept differs from selected concept', () => {
    let s = withArtifacts('cap-1');
    s = activateWorkspaceConcept(s, 'CONCEPT_A');
    s = selectViewportConceptForReview(s, 'DESKTOP', 'CONCEPT_B');
    const review = deriveWorkspaceSelfReviewState(s);
    expect(review.activeConceptId).toBe('CONCEPT_A');
    expect(review.selectedDesktopConceptId).toBe('CONCEPT_B');
    expect(review.selectedMobileConceptId).toBeNull();
  });

  it('selecting mobile updates rail preview to selected artifact', () => {
    let s = withArtifacts('cap-1');
    s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_A');
    const mobile = resolveViewportAuthorityPreview(s, 'MOBILE');
    expect(mobile.imageRef).toBe('local://a-m');
    expect(mobile.state).toBe('SELECTED_PENDING_PROMOTION');
  });

  it('promotion uses selected concept not merely active concept', () => {
    let s = withArtifacts('cap-1');
    s = activateWorkspaceConcept(s, 'CONCEPT_C');
    s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_A');
    s = promoteViewportConceptForReview(s, 'MOBILE');
    expect(s.promotedMobileConceptId).toBe('CONCEPT_A');
    expect(deriveWorkspaceSelfReviewState(s).activeConceptId).toBe('CONCEPT_C');
  });

  it('re-selection after promotion creates pending authority change without overwriting promoted', () => {
    let s = withArtifacts('cap-1');
    s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_A');
    s = promoteViewportConceptForReview(s, 'MOBILE');
    s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_C');
    expect(s.promotedMobileConceptId).toBe('CONCEPT_A');
    expect(s.preferredMobileConceptId).toBe('CONCEPT_C');
    expect(hasPendingAuthorityChange(s, 'MOBILE')).toBe(true);
    const rail = resolveViewportAuthorityPreview(s, 'MOBILE');
    expect(rail.imageRef).toBe('local://a-m');
    expect(rail.pendingConceptSlot).toBe('CONCEPT_C');
    expect(s.history.some((h) => h.type === 'workspace_self_pending_authority_change_created')).toBe(true);
  });

  it('compare columns are scoped to one viewport', () => {
    const s = withArtifacts('cap-1');
    const mobile = buildCompareConceptColumns(s, 'MOBILE');
    const desktop = buildCompareConceptColumns(s, 'DESKTOP');
    expect(mobile.map((c) => c.imageRef)).toEqual(['local://a-m', 'local://b-m', 'local://c-m']);
    expect(desktop.map((c) => c.imageRef)).toEqual(['local://a-d', 'local://b-d', 'local://c-d']);
  });

  it('viewport switch preserves independent mobile/desktop selections', () => {
    let s = withArtifacts('cap-1');
    s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_A');
    s = selectViewportConceptForReview(s, 'DESKTOP', 'CONCEPT_B');
    s = setWorkspaceReviewViewport(s, 'DESKTOP');
    expect(s.preferredMobileConceptId).toBe('CONCEPT_A');
    expect(s.preferredDesktopConceptId).toBe('CONCEPT_B');
  });

  it('pair review uses promoted pair only and requires explicit completion before lock', () => {
    let s = withArtifacts('cap-1');
    s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_A');
    s = selectViewportConceptForReview(s, 'DESKTOP', 'CONCEPT_B');
    s = promoteViewportConceptForReview(s, 'MOBILE');
    s = promoteViewportConceptForReview(s, 'DESKTOP');
    expect(derivePairReviewStatus(s)).toBe('READY');
    s = openPairReview(s);
    expect(derivePairReviewStatus(s)).toBe('IN_REVIEW');
    expect(() => lockWorkspaceAuthority(s, 'f@test')).toThrow();
    s = completePairReview(s);
    expect(derivePairReviewStatus(s)).toBe('COMPLETE');
    s = lockWorkspaceAuthority(s, 'f@test');
    expect(s.authorityPair?.mobileArtifactId).toBe('wsga-CONCEPT_A-MOBILE');
  });

  it('persists review ui through JSON roundtrip normalize', () => {
    let s = withArtifacts('cap-1');
    s = activateWorkspaceConcept(s, 'CONCEPT_B');
    s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_A');
    const loaded = JSON.parse(JSON.stringify(s)) as typeof s;
    expect(loaded.reviewUi.activeConceptId).toBe('CONCEPT_B');
    expect(loaded.preferredMobileConceptId).toBe('CONCEPT_A');
  });

  it('superseded concept set clears promotion from active rail binding', () => {
    let s = withArtifacts('cap-old');
    s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_A');
    s = beginWorkspaceConceptSet(s, {
      captureSetId: 'cap-new',
      functionContractId: s.functionContract!.contractId,
      creativeBriefSetId: 'wsp-2',
      createdBy: 't',
    });
    expect(s.promotedMobileConceptId).toBeNull();
    expect(resolveViewportAuthorityPreview(s, 'MOBILE').state).toBe('EMPTY');
  });

  it('gallery badges reflect selected and promoted independently', () => {
    let s = withArtifacts('cap-1');
    s = selectViewportConceptForReview(s, 'MOBILE', 'CONCEPT_A');
    s = selectViewportConceptForReview(s, 'DESKTOP', 'CONCEPT_B');
    s = promoteViewportConceptForReview(s, 'MOBILE');
    expect(conceptViewportBadge(s, 'CONCEPT_A', 'MOBILE')).toBe('PROMOTED');
    expect(conceptViewportBadge(s, 'CONCEPT_B', 'DESKTOP')).toBe('SELECTED');
  });
});
