/**
 * P0.VR.TWINV3.0R5F1 — feature manifest + master amendment + coverage gate
 */

import { describe, expect, it } from 'vitest';
import {
  applyWorkspaceFeatureChangeSet,
  assertDerivationAllowed,
  assertFeatureCoverageForPromotion,
  buildDesignWorkspaceFeatureManifestV1,
  buildFeatureCoverageReceipt,
  buildR5F1AuthoritySelectionChangeSet,
  buildR5F1MasterAuthorityAmendment,
  createDesignPageAuthorityReviewSession,
  DESIGN_WORKSPACE_FEATURE_MANIFEST_V1,
  DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1,
  loadActiveDesignWorkspaceFeatureManifest,
  lockDesignWorkspaceAuthorityPair,
  masterAmendmentStatusLabel,
  promoteViewportMaster,
  resolveMasterFeatureStaleStatus,
  runDesignPageAuthorityGeneration,
  runDesignPageAuthorityR5F1SelfCheck,
  seedDesignPageAuthorityPrototypeGallery,
  selectViewportCandidate,
  buildAllTerritoryPrompts,
  buildPromotionFeatureBindings,
  P0_VR_TWIN_V30R5F1_LINEAGE,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

describe('P0.VR.TWINV3.0R5F1 feature authority', () => {
  it('1 active DesignWorkspaceFeatureManifest loads', () => {
    const m = loadActiveDesignWorkspaceFeatureManifest();
    expect(m.status).toBe('ACTIVE');
    expect(m.version).toBe(DESIGN_WORKSPACE_FEATURE_MANIFEST_V1);
  });

  it('2 every required feature has stable featureId', () => {
    expect(DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1.length).toBeGreaterThanOrEqual(29);
    expect(new Set(DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1).size).toBe(
      DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1.length,
    );
  });

  it('3 ADD_FEATURE change set extends manifest', () => {
    const base = buildDesignWorkspaceFeatureManifestV1();
    const cs = buildR5F1AuthoritySelectionChangeSet();
    const next = applyWorkspaceFeatureChangeSet(base, cs, [], new Date().toISOString());
    expect(next.requiredFeatureIds).toContain('select_mobile_master_candidate');
  });

  it('4 REMOVE_FEATURE removes from requirements', () => {
    const base = buildDesignWorkspaceFeatureManifestV1();
    const next = applyWorkspaceFeatureChangeSet(
      base,
      {
        ...buildR5F1AuthoritySelectionChangeSet(),
        changeType: 'REMOVE_FEATURE',
        removedFeatures: ['move_to_build'],
        addedFeatures: [],
      },
      [],
    );
    expect(next.requiredFeatureIds).not.toContain('move_to_build');
  });

  it('5 REPLACE_FEATURE preserves lineage map', () => {
    const base = buildDesignWorkspaceFeatureManifestV1();
    const next = applyWorkspaceFeatureChangeSet(
      base,
      {
        ...buildR5F1AuthoritySelectionChangeSet(),
        changeType: 'REPLACE_FEATURE',
        replacementPairs: [{ from: 'refine_concept', to: 'contextual_next_action' }],
        addedFeatures: [],
        removedFeatures: [],
      },
      [],
    );
    expect(next.replacementMap.refine_concept).toBe('contextual_next_action');
  });

  it('6 MasterAuthorityAmendment references change set', () => {
    const a = buildR5F1MasterAuthorityAmendment();
    expect(a.featureChangeSetId).toBe(buildR5F1AuthoritySelectionChangeSet().id);
    expect(a.evolutionMode).toBe('MASTER_AMENDMENT');
  });

  it('7–9 feature coverage receipt pass/fail/unapproved', () => {
    const prompts = buildAllTerritoryPrompts({ clientProjectId: 'ndxbook' });
    const pass = buildFeatureCoverageReceipt({
      authorityCandidateId: 'c1',
      promptOrArtifactText: prompts.A.mobile,
    });
    expect(pass.result).toBe('PASS');
    const fail = buildFeatureCoverageReceipt({
      authorityCandidateId: 'c2',
      promptOrArtifactText: 'empty mockup',
    });
    expect(fail.missingFeatureIds.length).toBeGreaterThan(0);
    const unapproved = buildFeatureCoverageReceipt({
      authorityCandidateId: 'c3',
      promptOrArtifactText: `${prompts.A.mobile} RANDOM FEATURE invented`,
    });
    expect(unapproved.result).toBe('FAIL');
  });

  it('10 promotion blocked on failed coverage', () => {
    expect(() =>
      assertFeatureCoverageForPromotion(
        buildFeatureCoverageReceipt({ authorityCandidateId: 'x', promptOrArtifactText: 'none' }),
      ),
    ).toThrow(/MASTER_FEATURE_COVERAGE_INCOMPLETE|VIEWPORT_MASTER_FEATURE_COVERAGE_FAILED/);
  });

  it('11–12 generation carries context + feature manifest version', async () => {
    const session = createDesignPageAuthorityReviewSession();
    const batch = await runDesignPageAuthorityGeneration({ session, action: 'GENERATE' });
    expect(batch.projectCreativeContextVersion).toBeTruthy();
    expect(batch.designWorkspaceFeatureManifestVersion).toBe(DESIGN_WORKSPACE_FEATURE_MANIFEST_V1);
    expect(batch.lineage).toBe(P0_VR_TWIN_V30R5F1_LINEAGE);
  });

  it('13–14 stale manifest blocks derivation', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const mRef = { territoryId: 'A' as const, candidateId: session.territoryGallery.A[0]!.candidateId };
    const dRef = { territoryId: 'B' as const, candidateId: session.territoryGallery.B[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', mRef);
    session = promoteViewportMaster(session, 'mobile');
    session = selectViewportCandidate(session, 'desktop', dRef);
    session = promoteViewportMaster(session, 'desktop');
    session = lockDesignWorkspaceAuthorityPair(session);
    if (session.authorityPipeline?.mobileMaster) {
      session.authorityPipeline.mobileMaster = {
        ...session.authorityPipeline.mobileMaster,
        designWorkspaceFeatureManifestVersion: 'stale-manifest',
      };
    }
    expect(resolveMasterFeatureStaleStatus(session.authorityPipeline?.mobileMaster)).toBe('FEATURE_STALE');
    expect(() => assertDerivationAllowed(session)).toThrow(/MASTER_AMENDMENT_REQUIRED/);
  });

  it('15–16 all territory prompts share manifest + self-check', () => {
    const prompts = buildAllTerritoryPrompts({ clientProjectId: 'ndxbook' });
    const combined = Object.values(prompts)
      .flatMap((p) => [p.mobile, p.desktop])
      .join('\n');
    const check = runDesignPageAuthorityR5F1SelfCheck({ promptOrArtifactText: combined });
    expect(check.pass).toBe(true);
    for (const id of ['A', 'B', 'C'] as const) {
      expect(prompts[id].mobile).toContain(DESIGN_WORKSPACE_FEATURE_MANIFEST_V1);
      expect(prompts[id].desktop).toContain(DESIGN_WORKSPACE_FEATURE_MANIFEST_V1);
    }
  });

  it('17–18 R5 selection features required + in manifest', () => {
    const m = loadActiveDesignWorkspaceFeatureManifest();
    for (const id of [
      'select_mobile_master_candidate',
      'select_desktop_master_candidate',
      'lock_authority_pair',
    ]) {
      expect(m.requiredFeatureIds).toContain(id);
    }
  });

  it('19–20 bindings on promote + immutable change set', () => {
    let session = seedDesignPageAuthorityPrototypeGallery(createDesignPageAuthorityReviewSession());
    const ref = { territoryId: 'A' as const, candidateId: session.territoryGallery.A[0]!.candidateId };
    session = selectViewportCandidate(session, 'mobile', ref);
    session = promoteViewportMaster(session, 'mobile');
    expect(session.featureAuthority?.masterBindings.length).toBeGreaterThan(0);
    const cs = buildR5F1AuthoritySelectionChangeSet();
    expect(cs.status).toBe('APPLIED');
  });

  it('21–24 amendment vs full regen + no silent omission in self-check', () => {
    const amendment = buildR5F1MasterAuthorityAmendment({ evolutionMode: 'MASTER_AMENDMENT' });
    const full = buildR5F1MasterAuthorityAmendment({ evolutionMode: 'FULL_MASTER_REGENERATION' });
    expect(amendment.evolutionMode).not.toBe(full.evolutionMode);
    expect(amendment.preservationZones.length).toBeGreaterThan(0);
    const prompts = buildAllTerritoryPrompts({ clientProjectId: 'ndxbook' });
    const check = runDesignPageAuthorityR5F1SelfCheck({ promptOrArtifactText: prompts.C.desktop });
    expect(check.pass).toBe(true);
    expect(masterAmendmentStatusLabel(null)).toBe('NO VIEWPORT MASTER');
    const master = buildPromotionFeatureBindings(
      {
        id: 'vma-test',
        viewport: 'MOBILE',
      } as never,
      ['select_mobile_master_candidate'],
    );
    expect(master[0]!.featureId).toBe('select_mobile_master_candidate');
  });
});
