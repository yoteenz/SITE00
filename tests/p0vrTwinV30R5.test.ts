/**
 * P0.VR.TWINV3.0R5 — viewport master selection + authority pair lock
 */

import { describe, expect, it } from 'vitest';
import {
  assertDerivationAllowed,
  applyDesignPageAuthorityGeneration,
  createDesignPageAuthorityReviewSession,
  lockDesignWorkspaceAuthorityPair,
  promoteViewportMaster,
  runDesignAuthorityPairReadinessGate,
  seedDesignPageAuthorityPrototypeGallery,
  selectViewportCandidate,
  unselectViewportCandidate,
  P0_VR_TWIN_V30R5_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
  runDesignPageAuthorityGeneration,
  getCandidateViewportState,
  computePairChecksum,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

describe('P0.VR.TWINV3.0R5 design workspace authority pair', () => {
  function seededSession() {
    let session = createDesignPageAuthorityReviewSession();
    session = seedDesignPageAuthorityPrototypeGallery(session);
    return session;
  }

  it('1–2 mobile and desktop candidates can be selected independently', () => {
    let session = seededSession();
    const mobileRef = { territoryId: 'A' as const, candidateId: session.territoryGallery.A[0]!.candidateId };
    const desktopRef = { territoryId: 'B' as const, candidateId: session.territoryGallery.B[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', mobileRef);
    session = selectViewportCandidate(session, 'desktop', desktopRef);
    expect(session.authorityPipeline?.viewportSelection.mobile?.candidateId).toBe(mobileRef.candidateId);
    expect(session.authorityPipeline?.viewportSelection.desktop?.candidateId).toBe(desktopRef.candidateId);
    expect(getCandidateViewportState(session, mobileRef.candidateId, 'mobile')).toBe('SELECTED');
  });

  it('3 replacing selection does not delete prior candidate from gallery', () => {
    let session = seededSession();
    const a = session.territoryGallery.A[0]!.candidateId;
    const b = session.territoryGallery.B[0]!.candidateId;
    session = selectViewportCandidate(session, 'mobile', { territoryId: 'A', candidateId: a });
    session = selectViewportCandidate(session, 'mobile', { territoryId: 'B', candidateId: b });
    expect(session.territoryGallery.A.length).toBe(1);
    expect(getCandidateViewportState(session, a, 'mobile')).toBe('NOT_SELECTED');
    expect(getCandidateViewportState(session, b, 'mobile')).toBe('SELECTED');
  });

  it('4 selection does not equal promotion', () => {
    let session = seededSession();
    const ref = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', ref);
    expect(session.authorityPipeline?.mobileMaster).toBeNull();
    expect(getCandidateViewportState(session, ref.candidateId, 'mobile')).toBe('SELECTED');
  });

  it('5–6 promote mobile and desktop viewport masters', () => {
    let session = seededSession();
    const mRef = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    const dRef = { territoryId: 'C', candidateId: session.territoryGallery.C[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', mRef);
    session = promoteViewportMaster(session, 'mobile');
    session = selectViewportCandidate(session, 'desktop', dRef);
    session = promoteViewportMaster(session, 'desktop');
    expect(session.authorityPipeline?.mobileMaster?.viewport).toBe('MOBILE');
    expect(session.authorityPipeline?.desktopMaster?.viewport).toBe('DESKTOP');
    expect(session.authorityPipeline?.authorityPair?.status).toBe('PAIR_READY');
  });

  it('7–8 viewport slot mismatch guard via separate promotions', () => {
    let session = seededSession();
    const ref = { territoryId: 'B', candidateId: session.territoryGallery.B[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', ref);
    session = promoteViewportMaster(session, 'mobile');
    expect(session.authorityPipeline?.mobileMaster?.sourceTerritoryId).toBe('B');
    session = selectViewportCandidate(session, 'desktop', ref);
    session = promoteViewportMaster(session, 'desktop');
    expect(session.authorityPipeline?.desktopMaster?.sourceTerritoryId).toBe('B');
  });

  it('9 pair cannot lock with only one master', () => {
    let session = seededSession();
    const ref = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', ref);
    session = promoteViewportMaster(session, 'mobile');
    expect(() => lockDesignWorkspaceAuthorityPair(session)).toThrow(/DESIGN_AUTHORITY/);
  });

  it('10–11 pair lock with both masters + checksum', () => {
    let session = seededSession();
    const mRef = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    const dRef = { territoryId: 'B', candidateId: session.territoryGallery.B[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', mRef);
    session = promoteViewportMaster(session, 'mobile');
    session = selectViewportCandidate(session, 'desktop', dRef);
    session = promoteViewportMaster(session, 'desktop');
    const pre = runDesignAuthorityPairReadinessGate(session, { requireLocked: false });
    expect(pre.pass).toBe(true);
    session = lockDesignWorkspaceAuthorityPair(session);
    expect(session.authorityPipeline?.authorityPair?.status).toBe('PAIR_LOCKED');
    expect(session.authorityPipeline?.executionIntent).toBe('TRANSLATION');
    expect(session.authorityPipeline?.inventionBudget).toBe('NONE');
    const mm = session.authorityPipeline!.mobileMaster!;
    const dm = session.authorityPipeline!.desktopMaster!;
    expect(session.authorityPipeline?.authorityPair?.pairChecksum).toBe(computePairChecksum(mm, dm));
  });

  it('12 stale derivation when master replaced after lock would require new pair — promotion before lock supersedes', () => {
    let session = seededSession();
    const m1 = { territoryId: 'A' as const, candidateId: session.territoryGallery.A[0]!.candidateId };
    const d1 = { territoryId: 'B' as const, candidateId: session.territoryGallery.B[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', m1);
    session = promoteViewportMaster(session, 'mobile');
    session = selectViewportCandidate(session, 'desktop', d1);
    session = promoteViewportMaster(session, 'desktop');
    const firstMasterId = session.authorityPipeline!.mobileMaster!.id;
    session = selectViewportCandidate(session, 'mobile', { territoryId: 'C', candidateId: session.territoryGallery.C[0]!.candidateId });
    session = promoteViewportMaster(session, 'mobile');
    expect(session.authorityPipeline!.supersededMasters.some((m) => m.id === firstMasterId)).toBe(true);
  });

  it('13 rejected siblings remain in gallery history', () => {
    const session = seededSession();
    expect(session.territoryGallery.A.length).toBe(1);
    expect(session.territoryGallery.B.length).toBe(1);
    expect(Object.keys(session.authorityPipeline?.candidateViewportStates ?? {}).length).toBeGreaterThan(0);
  });

  it('14 derivation blocked before pair lock', () => {
    let session = seededSession();
    const mRef = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    const dRef = { territoryId: 'B', candidateId: session.territoryGallery.B[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', mRef);
    session = promoteViewportMaster(session, 'mobile');
    session = selectViewportCandidate(session, 'desktop', dRef);
    session = promoteViewportMaster(session, 'desktop');
    expect(() => assertDerivationAllowed(session)).toThrow(/DESIGN_AUTHORITY_PAIR_NOT_LOCKED/);
  });

  it('15–16 context version on masters and pair', async () => {
    let session = seededSession();
    const batch = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    session = applyDesignPageAuthorityGeneration(session, batch, 'GENERATE');
    const mRef = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    const dRef = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', mRef);
    session = promoteViewportMaster(session, 'mobile');
    session = selectViewportCandidate(session, 'desktop', dRef);
    session = promoteViewportMaster(session, 'desktop');
    expect(session.authorityPipeline?.mobileMaster?.projectCreativeContextVersion).toBeTruthy();
    expect(session.authorityPipeline?.authorityPair?.projectCreativeContextVersion).toBeTruthy();
  });

  it('17 grounding manifest traceable from master', () => {
    let session = seededSession();
    const ref = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', ref);
    session = promoteViewportMaster(session, 'mobile');
    expect(session.authorityPipeline?.mobileMaster?.sourceConceptCandidateId).toBe(ref.candidateId);
  });

  it('18 promotion preserves image URI (no regeneration)', () => {
    let session = seededSession();
    const before = session.territoryGallery.A[0]!.mobile.storageUrl;
    const ref = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', ref);
    session = promoteViewportMaster(session, 'mobile');
    expect(session.authorityPipeline?.mobileMaster?.authorityImageUri).toBe(before);
  });

  it('unselect clears viewport selection', () => {
    let session = seededSession();
    const ref = { territoryId: 'A', candidateId: session.territoryGallery.A[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', ref);
    session = unselectViewportCandidate(session, 'mobile');
    expect(session.authorityPipeline?.viewportSelection.mobile).toBeNull();
  });

  it('R5 lineage + build ref', async () => {
    const session = createDesignPageAuthorityReviewSession();
    const batch = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    expect(batch.lineage).toBe(P0_VR_TWIN_V30R5_LINEAGE);
    expect(batch.buildRef).toBe(P0_VR_TWIN_V30_BUILD);
  });
});
