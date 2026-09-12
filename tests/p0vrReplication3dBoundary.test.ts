/**
 * P0.VR.REPLICATION.3D — Content root isolation + shell boundary enforcement.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildHeroAssetInventory } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3c/heroAssetInventory.js';
import { resolveHeroAssetSlots } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3c/resolveHeroAssets.js';
import { observationToLiteralRegionSpec, buildNdxHeroStructuralObservation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/ndxStructuralVisionSeed.js';
import {
  checkAssetBindingCompatibility,
  enforceHeroSlotBindings,
  executeContentRootBoundaryPipeline,
  buildReplicationRenderBoundaryReceipt,
  P0_VR_REPLICATION_3D_BOUNDARY_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3dBoundary/index.js';
import type { ReconstructionTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function session(): ReconstructionTwinSession {
  return {
    sessionId: 'twin_boundary',
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    canonicalRoute: '/projects/ndxbook/overview',
    twinRoute: '/twin',
    authorityVersionId: 'auth_b',
    beforeCaptureId: 'c',
    reconstructionPlanId: 'p',
    sourceLiveVersionId: 'live',
    twinVersionId: 'v333',
    mutationPolicy: 'READ_ONLY',
    functionContract: {
      route: '/',
      auth: [],
      permissions: [],
      dataQueries: [],
      mutations: [],
      forms: [],
      links: [],
      navigation: [],
      state: [],
      featureFlags: [],
      actions: [],
      businessRules: [],
    },
    reconstructionPlan: {
      planId: 'p',
      pagePurpose: 'overview',
      geometryChanges: [],
      spacingChanges: [],
      typographyChanges: [],
      assetChanges: [],
      componentChanges: [],
      functionPreservation: [],
      goal: 'boundary',
      measuredSpecId: null,
    },
    status: 'BUILDING',
    buildSteps: [],
    twinCapture: null,
    revisions: [],
    twinVersions: [],
    fidelityQa: [],
    promotionReadiness: null,
    responsiveImpact: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvedForPromotionAt: null,
    promotedAt: null,
  };
}

describe('P0.VR.REPLICATION.3D boundary enforcement', () => {
  it('non-proof hero slots do not bind full-page authority URL', () => {
    const heroSpec = observationToLiteralRegionSpec(buildNdxHeroStructuralObservation());
    const inventory = buildHeroAssetInventory({
      heroSpec,
      authorityImageUrl: 'https://cdn.example/design-authority/page.png',
    });
    const { slots } = resolveHeroAssetSlots({
      slots: inventory,
      authorityImageUrl: 'https://cdn.example/design-authority/page.png',
    });
    const sliceA = slots.find((s) => s.slotId === 'slice_a');
    expect(sliceA?.selectedAsset).toBeNull();
    expect(sliceA?.failureReason).toBe('PAGE_AUTHORITY_MISUSED_AS_REGION_ASSET');
  });

  it('enforceHeroSlotBindings strips raw authority from misbound slots', () => {
    const heroSpec = observationToLiteralRegionSpec(buildNdxHeroStructuralObservation());
    let { slots } = resolveHeroAssetSlots({
      slots: buildHeroAssetInventory({
        heroSpec,
        authorityImageUrl: 'https://cdn.example/authority-capture.png',
      }),
      authorityImageUrl: 'https://cdn.example/authority-capture.png',
    });
    slots = slots.map((s) =>
      s.slotId === 'slice_c'
        ? {
            ...s,
            selectedAsset: 'https://cdn.example/authority-capture.png',
            status: 'BOUND',
            selectedStrategy: 'AUTHORITY_REGION_DERIVATION',
          }
        : s,
    );
    const enforced = enforceHeroSlotBindings(slots);
    expect(enforced.strippedSlotIds).toContain('slice_c');
    expect(enforced.slots.find((s) => s.slotId === 'slice_c')?.selectedAsset).toBeNull();
  });

  it('materialized proof crop is compatible', () => {
    const check = checkAssetBindingCompatibility({
      slotId: 'slice_b',
      regionId: 'hero-editorial',
      authorityBounds: '',
      assetType: 'photography',
      visualRole: 'hero',
      required: true,
      authorityEvidence: '',
      candidateAssets: [],
      selectedStrategy: 'AUTHORITY_REGION_DERIVATION',
      selectedAsset: 'data:image/jpeg;base64,/9j/4',
      materializedPublicUrl: 'data:image/jpeg;base64,/9j/4',
      cropSpec: null,
      fitMode: 'cover',
      positionSpec: null,
      status: 'BOUND',
      failureReason: null,
    });
    expect(check.compatible).toBe(true);
  });

  it('executeContentRootBoundaryPipeline produces PASS when no misbound slots', () => {
    const heroSpec = observationToLiteralRegionSpec(buildNdxHeroStructuralObservation());
    const { slots } = resolveHeroAssetSlots({
      slots: buildHeroAssetInventory({ heroSpec, authorityImageUrl: 'https://x/authority.png' }),
      authorityImageUrl: 'https://x/authority.png',
    });
    const proofBound = slots.map((s) =>
      s.slotId === 'slice_b'
        ? {
            ...s,
            materializedPublicUrl: 'data:image/jpeg;base64,abc',
            selectedAsset: 'data:image/jpeg;base64,abc',
            status: 'BOUND' as const,
          }
        : s,
    );
    const result = executeContentRootBoundaryPipeline({
      session: session(),
      assetSlots: proofBound,
      coordinateMap: null,
    });
    expect(result.report.buildRef).toBe(P0_VR_REPLICATION_3D_BOUNDARY_BUILD);
    expect(result.report.verdict.PAGE_NESTING_DETECTED).toBe(false);
    expect(result.report.status).toBe('PASS');
  });

  it('receipt flags PAGE_NESTING when literal screenshot bound to hero', () => {
    const heroSpec = observationToLiteralRegionSpec(buildNdxHeroStructuralObservation());
    const { slots } = resolveHeroAssetSlots({
      slots: buildHeroAssetInventory({ heroSpec, authorityImageUrl: 'https://x/page.png' }),
      authorityImageUrl: 'https://x/page.png',
    });
    const poisoned = slots.map((s) =>
      s.slotId === 'slice_a'
        ? {
            ...s,
            selectedAsset: 'https://x/page.png',
            status: 'BOUND' as const,
            selectedStrategy: 'AUTHORITY_REGION_DERIVATION' as const,
          }
        : s,
    );
    const receipt = buildReplicationRenderBoundaryReceipt({
      session: session(),
      assetSlots: poisoned,
      coordinateMap: null,
      strippedHeroSlotIds: [],
    });
    expect(receipt.verdict.PAGE_NESTING_DETECTED).toBe(true);
    expect(receipt.typedFailures).toContain('PAGE_AUTHORITY_MISUSED_AS_REGION_ASSET');
  });

  it('DOM contract exposes content root and mount root in twin surfaces', () => {
    const shell = read('src/site00/components/reconstruction/ShellFirstNdxOverviewTwin.tsx');
    const vlt = read('src/site00/components/reconstruction/VisionLiteralNdxOverviewTwin.tsx');
    expect(shell).toContain('data-twin-content-root');
    expect(vlt).toContain('data-twin-mount-root');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/executeShellFirstNdxReplication.ts')).toContain(
      'executeContentRootBoundaryPipeline',
    );
  });
});
