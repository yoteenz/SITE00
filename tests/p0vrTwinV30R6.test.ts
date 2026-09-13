/**
 * P0.VR.TWINV3.0R6 — derivation pipeline + GENERATE DERIVATIVES
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  applyOneTimeFounderAuthorityInjection,
  createDesignPageAuthorityReviewSession,
  DESIGN_WORKSPACE_FEATURE_MANIFEST_V1,
  DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1,
  FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER,
  FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER,
  markDerivationRunActive,
  PROJECT_CREATIVE_CONTEXT_VERSION,
  refreshImplementationPackageStaleState,
  resolveDerivationButtonView,
  runDesignWorkspaceDerivation,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

function lockedR5F2Session() {
  return applyOneTimeFounderAuthorityInjection(createDesignPageAuthorityReviewSession());
}

describe('P0.VR.TWINV3.0R6 derivation', () => {
  it('1 rejects unlocked pair', () => {
    const session = createDesignPageAuthorityReviewSession();
    expect(() => runDesignWorkspaceDerivation(session)).toThrow(/AUTHORITY_PAIR_NOT_LOCKED|DESIGN_AUTHORITY/);
  });

  it('2–3 resolves R5F2 mobile and desktop authorities', () => {
    const { bundle, run } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(run.mobileAuthorityId).toContain('vma-founder-mobile');
    expect(run.desktopAuthorityId).toContain('vma-founder-desktop');
    expect(bundle.structuralBlueprint.mobileAuthorityHash).toContain(FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.originalFileHashSha256);
    expect(bundle.structuralBlueprint.desktopAuthorityHash).toContain(FOUNDER_R5F2_NDXBOOK_DESKTOP_MASTER.originalFileHashSha256);
  });

  it('4–8 run carries hashes, manifest, context, TRANSLATION, NONE', () => {
    const { run } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(run.mobileAuthorityHash).toMatch(/^sha256:/);
    expect(run.featureManifestVersion).toBe(DESIGN_WORKSPACE_FEATURE_MANIFEST_V1);
    expect(run.projectCreativeContextVersion).toBe(PROJECT_CREATIVE_CONTEXT_VERSION);
    expect(run.executionIntent).toBe('TRANSLATION');
    expect(run.inventionBudget).toBe('NONE');
  });

  it('9–11 blueprint mobile/desktop + stable object IDs + relationships', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    const mob = bundle.structuralBlueprint.regions.filter((r) => r.viewport === 'MOBILE');
    const desk = bundle.structuralBlueprint.regions.filter((r) => r.viewport === 'DESKTOP');
    expect(mob.length).toBeGreaterThan(0);
    expect(desk.length).toBeGreaterThan(0);
    const ids = new Set(bundle.surgicalObjectMap.objects.map((o) => o.objectId));
    expect(ids.size).toBe(bundle.surgicalObjectMap.objects.length);
    expect(bundle.surgicalObjectMap.relationships.length).toBeGreaterThan(0);
  });

  it('12 covers all required features', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(bundle.featureBindings.length).toBe(DESIGN_WORKSPACE_REQUIRED_FEATURE_IDS_V1.length);
  });

  it('13 asset manifest forbids authority crops', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(bundle.canonicalAssetManifest.assets.every((a) => a.authorityCropForbidden)).toBe(true);
  });

  it('14 function MISSING is not fabricated as BOUND', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    const missing = bundle.functionBindingMap.bindings.filter((b) => b.status === 'MISSING');
    expect(missing.length).toBeGreaterThan(0);
    expect(missing.every((b) => b.functionTarget !== 'fake_implementation')).toBe(true);
  });

  it('15–16 ownership + sibling responsive authorities', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(bundle.hostProjectOwnershipMap.entries.some((e) => e.ownership === 'SITE_00_HOST')).toBe(true);
    expect(bundle.responsiveRelationshipContract.siblingAuthorities).toBe(true);
  });

  it('17 technical_details maps different mobile/desktop modes', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    const row = bundle.responsiveRelationshipContract.entries.find((e) => e.featureOrRegionKey === 'technical_details');
    expect(row?.mobileExpression).toContain('SHEET');
    expect(row?.desktopExpression).toContain('INSPECTOR');
  });

  it('18 UNKNOWN state distinct from zero', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    const locked = bundle.stateVisualContract.states.find((s) => s.state === 'PAIR_LOCKED');
    expect(locked?.numericValue).toBe('UNKNOWN');
  });

  it('19 interaction geometry for interactive objects', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(bundle.interactionGeometryContract.entries.length).toBeGreaterThan(0);
    expect(bundle.interactionGeometryContract.entries[0]!.minTouchTargetPx).toBeGreaterThanOrEqual(44);
  });

  it('20 forbids authority screenshot primitives', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(bundle.implementationPrimitiveContract.authorityRasterFirewall).toBe(true);
    expect(
      bundle.implementationPrimitiveContract.entries.every((e) => !e.primitive.includes('AUTHORITY_SCREENSHOT')),
    ).toBe(true);
  });

  it('21 reverse traceability for features', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(bundle.reverseTraceabilityMap.traces.length).toBeGreaterThan(0);
  });

  it('22 package checksum deterministic on reuse', () => {
    let session = lockedR5F2Session();
    const a = runDesignWorkspaceDerivation(session);
    session = a.session;
    const b = runDesignWorkspaceDerivation(session);
    expect(b.reusedExisting).toBe(true);
    expect(b.bundle.implementationPackage.packageChecksum).toBe(a.bundle.implementationPackage.packageChecksum);
  });

  it('23 compiler readiness PASS when structured gates pass', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(bundle.compilerReadinessReceipt.overall).toBe('PASS');
  });

  it('24 does not auto-build — package READY_FOR_REVIEW only', () => {
    const { bundle } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(bundle.implementationPackage.status).toBe('READY_FOR_REVIEW');
    expect(bundle.implementationPackage.status).not.toBe('APPROVED_FOR_BUILD');
  });

  it('25 locked authority JPG bytes unchanged', () => {
    const mobilePath = '/workspace/public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg';
    const before = createHash('sha256').update(readFileSync(mobilePath)).digest('hex');
    runDesignWorkspaceDerivation(lockedR5F2Session());
    const after = createHash('sha256').update(readFileSync(mobilePath)).digest('hex');
    expect(after).toBe(before);
  });

  it('26–27 button states READY vs disabled before lock', () => {
    const locked = resolveDerivationButtonView(lockedR5F2Session());
    expect(locked.state).toBe('GENERATE_DERIVATIVES');
    const unlocked = resolveDerivationButtonView(createDesignPageAuthorityReviewSession());
    expect(unlocked.disabled).toBe(true);
  });

  it('28 duplicate active run blocked', () => {
    const session = markDerivationRunActive(lockedR5F2Session(), 'DERIVING');
    expect(() => runDesignWorkspaceDerivation(session)).toThrow(/DERIVATION_RUN_ALREADY_ACTIVE/);
  });

  it('29–30 after run button REVIEW_DERIVATIVES', () => {
    const { session } = runDesignWorkspaceDerivation(lockedR5F2Session());
    const view = resolveDerivationButtonView(session);
    expect(view.state).toBe('REVIEW_DERIVATIVES');
    expect(view.label).toBe('REVIEW DERIVATIVES');
  });

  it('33–35 no FAL on structured derivation; routing recorded', () => {
    const { run } = runDesignWorkspaceDerivation(lockedR5F2Session());
    expect(run.falJobsDispatched).toBe(0);
    expect(run.providerDispatches.some((p) => p.provider === 'LOCAL_COMPILER')).toBe(true);
    expect(run.providerDispatches.some((p) => p.provider === 'FAL')).toBe(false);
  });

  it('36 reuses package for identical inputs', () => {
    let session = lockedR5F2Session();
    session = runDesignWorkspaceDerivation(session).session;
    const second = runDesignWorkspaceDerivation(session);
    expect(second.reusedExisting).toBe(true);
  });

  it('37–38 stale manifest marks package FEATURE_STALE', () => {
    let session = runDesignWorkspaceDerivation(lockedR5F2Session()).session;
    const pkg = session.designWorkspaceDerivation!.packages[0]!;
    session = {
      ...session,
      designWorkspaceDerivation: {
        ...session.designWorkspaceDerivation!,
        packages: [{ ...pkg, featureManifestVersion: 'stale-manifest-v0' }],
      },
    };
    const refreshed = refreshImplementationPackageStaleState({
      ...session,
      authorityPipeline: {
        ...session.authorityPipeline!,
        mobileMaster: {
          ...session.authorityPipeline!.mobileMaster!,
          designWorkspaceFeatureManifestVersion: DESIGN_WORKSPACE_FEATURE_MANIFEST_V1,
        },
      },
    });
    const updated = refreshed.designWorkspaceDerivation!.packages[0]!;
    expect(updated.status).toBe('FEATURE_STALE');
    expect(updated.status).not.toBe('APPROVED_FOR_BUILD');
  });
});
