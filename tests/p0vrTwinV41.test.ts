/**
 * P0.VR.TWINV4.1 — pixel-derived scene graph extraction
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  forensicBlueprintCacheKey,
  writeForensicBlueprintToCache,
  clearForensicBlueprintCacheForTests,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import { seedLocalForensicBlueprintStub } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/resolveForensicUiBlueprintAuthoritySync.js';
import {
  PLACEHOLDER_SCENE_GRAPH_GENERATION_ATTEMPTED,
  TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE,
  TWIN_V41_STORAGE_PREFIX,
  V40_SCENE_GRAPH_REJECTION_REASON,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/constants.js';
import { compileTwinV41PixelExtraction } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/compileTwinV41PixelExtraction.js';
import { clearTwinV41PersistenceForTests } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/twinV41Persistence.js';
import {
  buildFounderApprovedForensicAuthorityForFixture,
  ensureTwinV41ForensicBlueprintFixturePng,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/testForensicBlueprintFixture.js';
import { extractTwinV4VisualSceneGraph, TWIN_V40_SCENE_GRAPH_STATUS } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/extractTwinV4VisualSceneGraph.js';
import { compileTwinV4ForensicReconstruction } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/compileTwinV4ForensicReconstruction.js';
import { TWIN_V41_PROJECT_STYLE_FIREWALL } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/compileTwinV41PixelExtraction.js';

const ACTUAL_HASH = 'b'.repeat(32);

function seedApprovedFixtureAuthority(): void {
  ensureTwinV41ForensicBlueprintFixturePng();
  const authority = buildFounderApprovedForensicAuthorityForFixture(ACTUAL_HASH);
  writeForensicBlueprintToCache(forensicBlueprintCacheKey({ actualHash: ACTUAL_HASH }), authority);
}

describe('P0.VR.TWINV4.1 pixel-derived forensic extraction', () => {
  beforeEach(() => {
    clearTwinV41PersistenceForTests();
    clearForensicBlueprintCacheForTests();
  });

  it('1–3 exact founder authority required; no stub or alternate', async () => {
    await expect(
      compileTwinV41PixelExtraction({ projectId: 'ndxbook', sourceActualHash: ACTUAL_HASH }),
    ).rejects.toThrow(TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE);

    const stub = seedLocalForensicBlueprintStub({
      projectId: 'ndxbook',
      sourceActualAuthorityId: 'x',
      sourceActualHash: ACTUAL_HASH,
      primaryActualImageUrl: 'x',
      secondaryLightBlueprintUrl: null,
      canonicalViewport: { widthPx: 800, heightPx: 1600 },
    });
    writeForensicBlueprintToCache(forensicBlueprintCacheKey({ actualHash: ACTUAL_HASH }), stub);
    await expect(
      compileTwinV41PixelExtraction({ projectId: 'ndxbook', sourceActualHash: ACTUAL_HASH }),
    ).rejects.toThrow(TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE);
  });

  it('4–5 V4.0 hardcoded graph rejected; placeholder generator disabled', () => {
    expect(TWIN_V40_SCENE_GRAPH_STATUS).toBe('REJECTED');
    expect(V40_SCENE_GRAPH_REJECTION_REASON).toBe('HARDCODED_SCENE_GRAPH_PLACEHOLDER_RENDER');
    expect(() => extractTwinV4VisualSceneGraph({ forensicBlueprintHash: 'x' })).toThrow(
      PLACEHOLDER_SCENE_GRAPH_GENERATION_ATTEMPTED,
    );
    expect(() =>
      compileTwinV4ForensicReconstruction({
        projectId: 'ndxbook',
        sourcePackageId: 'p',
        sourceActualHash: ACTUAL_HASH,
      }),
    ).toThrow('DOM_RECONSTRUCTION_DISABLED_V41');
  });

  it('6–16 pixel analysis pipeline on authority image', async () => {
    seedApprovedFixtureAuthority();
    const bundle = await compileTwinV41PixelExtraction({ projectId: 'ndxbook', sourceActualHash: ACTUAL_HASH });

    expect(bundle.authorityLock.immutable).toBe(true);
    expect(bundle.authorityLock.source).toBe('FOUNDER_APPROVED_FORENSIC_BLUEPRINT');
    expect(bundle.receipt.sourceDimensions.width).toBe(800);
    expect(bundle.receipt.sourceDimensions.height).toBe(1600);
    expect(bundle.analysis.majorRegions.length).toBeGreaterThanOrEqual(8);
    expect(bundle.analysis.edgeMap.edges.length).toBeGreaterThan(0);
    expect(bundle.analysis.colorSampleMap.samples.length).toBeGreaterThan(0);
    expect(bundle.analysis.textRegionMap.regions.length).toBeGreaterThan(0);
    expect(bundle.analysis.calloutMap.callouts.length).toBeGreaterThan(0);
    expect(bundle.analysis.visualObjectRegions.length).toBeGreaterThan(0);
    expect(bundle.sceneGraph.nodes.length).toBeGreaterThan(10);
    for (const node of bundle.sceneGraph.nodes) {
      expect(node.evidence.evidenceCount).toBeGreaterThan(0);
    }
    expect(bundle.receipt.nodesWithoutEvidence).toBe(0);
    const nodeText = JSON.stringify(bundle.sceneGraph.nodes);
    expect(nodeText).not.toContain('[SPEC-ROW]');
    expect(nodeText).not.toContain('[RECONSTRUCTED-PAGE]');
  });

  it('17–21 overlay UI, styling firewall, critical regions', async () => {
    seedApprovedFixtureAuthority();
    const bundle = await compileTwinV41PixelExtraction({ projectId: 'ndxbook', sourceActualHash: ACTUAL_HASH });
    const page = readFileSync('src/site00/pages/DesignTwinV4ProofPage.tsx', 'utf8');
    const overlay = readFileSync('src/site00/components/designWorkspace/TwinV41PixelExtractionOverlay.tsx', 'utf8');
    expect(page).toContain('PIXEL_EXTRACTION');
    expect(page).not.toContain("mode === 'LIVE'");
    expect(overlay).toContain('twin-v41-authority-raster');
    expect(overlay).toContain('site00-twin-v41-extraction__box');
    expect(TWIN_V41_PROJECT_STYLE_FIREWALL.forbidNdxbookDarkTheme).toBe(true);

    expect(bundle.criticalRegionChecks.DOCUMENT_CANVAS).toBe(true);
    expect(bundle.criticalRegionChecks.LEFT_MAIN_BLUEPRINT_PANEL).toBe(true);
    expect(bundle.criticalRegionChecks.RIGHT_OBJECT_INVENTORY).toBe(true);
    expect(bundle.criticalRegionChecks.LOWER_COLOR_PALETTE).toBe(true);
    expect(bundle.gate.status).toBe('FOUNDER_EXTRACTION_REVIEW');
  });

  it('22–28 gate, proof inconclusive, no DOM, routes unchanged', async () => {
    seedApprovedFixtureAuthority();
    const bundle = await compileTwinV41PixelExtraction({ projectId: 'ndxbook', sourceActualHash: ACTUAL_HASH });
    expect(bundle.reconstructionEngineProof).toBe('INCONCLUSIVE');
    expect(bundle.domReconstructionTriggered).toBe(false);
    expect(bundle.pixelExtractionReviewRequired).toBe(true);
    expect(TWIN_V41_STORAGE_PREFIX).toBe('site00:twin-v41:');
    const v3Page = readFileSync('src/site00/pages/DesignTwinImplementationPage.tsx', 'utf8');
    expect(v3Page).toContain('resolveTwinImplementationPreview');
    const designWs = readFileSync('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx', 'utf8');
    expect(designWs).not.toContain('TwinV41PixelExtractionOverlay');
  });
});
