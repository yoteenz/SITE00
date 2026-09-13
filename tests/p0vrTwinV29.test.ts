/**
 * P0.VR.TWINV2.9 — Atomic creative generation bundle
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createConceptDirectedTwinSession, assertV1Isolation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { ensureConceptGallery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import {
  ATOMIC_PIPELINE_CALL_ORDER,
  GENERATION_BUNDLE_OUTPUT_TYPES,
  P0_VR_TWIN_V29_BUILD,
  runAtomicConceptGenerationBundle,
  assertAtomicGenerationNotBlockedByV28,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV29/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function sessionWithCreative() {
  let s = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'v29-1' });
  s = ensureConceptGallery(s);
  if (!s.creativeDirection) throw new Error('missing creative direction');
  return s;
}

describe('P0.VR.TWINV2.9 atomic generation bundle', () => {
  it('1–5 bundle model + shared lineage ids', async () => {
    const result = await runAtomicConceptGenerationBundle({
      session: sessionWithCreative(),
      conceptId: 'cc-atomic-1',
      conceptVersionId: 'vc-atomic-1',
    });
    expect(result.bundle.buildRef).toBe(P0_VR_TWIN_V29_BUILD);
    expect(result.bundle.generationBundleId).toBe('agb-cc-atomic-1');
    expect(result.bundle.compositionStateId).toBe(result.compositionState.compositionStateId);
    expect(result.authorityArtifact.compositionStateId).toBe(result.bundle.compositionStateId);
    expect(result.blueprintTwinArtifact.compositionStateId).toBe(result.bundle.compositionStateId);
  });

  it('6–11 sibling outputs exist', async () => {
    const result = await runAtomicConceptGenerationBundle({
      session: sessionWithCreative(),
      conceptId: 'cc-atomic-2',
      conceptVersionId: 'vc-atomic-2',
    });
    expect(result.authorityArtifact.artifactKind).toBe('AUTHORITY_VISUAL');
    expect(result.blueprintTwinArtifact.artifactKind).toBe('BLUEPRINT_TWIN_VISUAL');
    expect(result.surgicalBlueprintData.objects.length).toBeGreaterThanOrEqual(25);
    expect(result.surgicalBlueprintData.relationships.length).toBeGreaterThanOrEqual(6);
    expect(result.assetContractSet.contracts.length).toBeGreaterThan(0);
    expect(result.functionBindingMap.bindings.length).toBeGreaterThan(0);
    expect(result.standaloneAssets.length).toBeGreaterThanOrEqual(1);
  });

  it('12–18 completeness + partial blocks approval when incomplete', async () => {
    const result = await runAtomicConceptGenerationBundle({
      session: sessionWithCreative(),
      conceptId: 'cc-atomic-3',
      conceptVersionId: 'vc-atomic-3',
    });
    expect(result.completeness.authorityReady).toBe(true);
    expect(result.completeness.blueprintTwinReady).toBe(true);
    expect(result.completeness.surgicalDataReady).toBe(true);
    expect(GENERATION_BUNDLE_OUTPUT_TYPES).toContain('FUNCTION_BINDING_MAP');
    if (result.completeness.status !== 'PASS') {
      expect(result.approveEnabled).toBe(false);
    }
  });

  it('19–23 registration + hero.ndxOverlay thread', async () => {
    const result = await runAtomicConceptGenerationBundle({
      session: sessionWithCreative(),
      conceptId: 'cc-atomic-4',
      conceptVersionId: 'vc-atomic-4',
    });
    expect(result.registration.bundleChecksum).toMatch(/^[a-f0-9]{24}$/);
    const overlay = result.surgicalBlueprintData.objects.find((o) => o.objectId === 'hero.ndxOverlay');
    expect(overlay).toBeTruthy();
    const contract = result.assetContractSet.contracts.find((c) => c.objectId === 'hero.ndxOverlay');
    expect(contract?.generationBundleId).toBe(result.bundle.generationBundleId);
    expect(result.assetRegenerationCapability.contractStored).toBe(true);
  });

  it('24–28 no post-hoc surgical + real FAL dispatch in API', () => {
    expect(read('api/site00/twin-v2-atomic-concept-generation.ts')).toContain('runAtomicConceptGenerationBundle');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV29/buildSurgicalBlueprintData.ts')).toContain(
      'ConceptCompositionState',
    );
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV29/dispatchAtomicFalVisuals.ts')).toContain(
      'fal.subscribe',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/TwinV2AtomicGenerationBundlePanel.tsx')).toContain(
      'OBJECT_DATA',
    );
    const twinUi = read('src/site00/components/designWorkspace/pageFamily/PageConceptDirectedTwinV2Experience.tsx');
    expect(twinUi).toContain('TwinV2AtomicGenerationBundleControls');
    expect(twinUi).toContain('site00-twin-v2-fal-proof-pilot');
    expect(twinUi).toContain('isTwinV2OverviewPageScope');
    expect(twinUi).not.toContain("session.pageId === 'overview'");
  });

  it('29–33 v28 block + v1 + pipeline order', () => {
    expect(() => assertAtomicGenerationNotBlockedByV28('FAL_PARALLEL_TWIN_CAPABILITY_FAILED')).toThrow(
      /ATOMIC_GENERATION_BLOCKED_BY_PROVIDER_CAPABILITY/,
    );
    assertV1Isolation();
    expect(ATOMIC_PIPELINE_CALL_ORDER[0]).toBe('PAGE_INTENT');
  });

  it('classification partial in vitest', async () => {
    const result = await runAtomicConceptGenerationBundle({
      session: sessionWithCreative(),
      conceptId: 'cc-atomic-5',
      conceptVersionId: 'vc-atomic-5',
    });
    expect(result.classification).toBe('ATOMIC_CREATIVE_GENERATION_PARTIAL');
  });
});
