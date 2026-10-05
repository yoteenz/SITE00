/**
 * P0.VR.TWINV2.8 — FAL parallel twin generation capability proof
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createConceptDirectedTwinSession, assertV1Isolation } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { ensureConceptGallery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import {
  MINIMAL_TWIN_REQUIRED_OBJECT_IDS,
  P0_VR_TWIN_V28_BUILD,
  buildMinimalTwinGenerationState,
  buildAuthorityVisualPrompt,
  buildBlueprintTwinVisualPrompt,
  runFalParallelTwinProof,
  classifyFalParallelTwinCapability,
  runTwinVisualAlignmentHeuristic,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV28/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function sessionWithCreative() {
  let s = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'v28-1' });
  s = ensureConceptGallery(s);
  if (!s.creativeDirection) throw new Error('missing creative direction');
  return s;
}

describe('P0.VR.TWINV2.8 FAL parallel twin proof', () => {
  it('1–6 MinimalTwinGenerationState + shared ids', async () => {
    const session = sessionWithCreative();
    const state = buildMinimalTwinGenerationState({
      conceptId: 'cc-v28',
      conceptVersionId: 'vc-v28',
      session,
    });
    expect(state.compositionStateId).toMatch(/^mts-/);
    expect(state.objectIds.length).toBe(MINIMAL_TWIN_REQUIRED_OBJECT_IDS.length);
    expect(state.objectIds).toEqual([...MINIMAL_TWIN_REQUIRED_OBJECT_IDS]);

    const bundle = await runFalParallelTwinProof({
      session,
      conceptId: 'cc-v28',
      conceptVersionId: 'vc-v28',
    });
    expect(bundle.generationReceipt.buildRef).toBe(P0_VR_TWIN_V28_BUILD);
    expect(bundle.authorityArtifact.artifactId).not.toBe(bundle.blueprintArtifact.artifactId);
    expect(bundle.authorityArtifact.compositionStateId).toBe(bundle.blueprintArtifact.compositionStateId);
    expect(bundle.generationReceipt.authorityJobRef).not.toBe(bundle.generationReceipt.blueprintJobRef);
  });

  it('7–10 artifact classification + FalTwinGenerationReceipt', async () => {
    const bundle = await runFalParallelTwinProof({
      session: sessionWithCreative(),
      conceptId: 'cc-a',
      conceptVersionId: 'vc-a',
    });
    expect(bundle.authorityArtifact.artifactKind).toBe('AUTHORITY_VISUAL');
    expect(bundle.blueprintArtifact.artifactKind).toBe('BLUEPRINT_TWIN_VISUAL');
    expect(bundle.generationReceipt.sameCompositionState).toBe(true);
    expect(bundle.generationReceipt.sameObjectIds).toBe(true);
  });

  it('11–14 prompts same state — no post-hoc blueprint-only prompt', () => {
    const session = sessionWithCreative();
    const state = buildMinimalTwinGenerationState({ conceptId: 'c', conceptVersionId: 'v', session });
    const auth = buildAuthorityVisualPrompt(state, 'overview');
    const bp = buildBlueprintTwinVisualPrompt(state, 'overview');
    expect(auth).toContain(state.compositionStateId);
    expect(bp).toContain(state.compositionStateId);
    expect(bp).not.toMatch(/make a blueprint of this image/i);
    expect(bp).toContain('hero.headline');
    expect(auth).not.toMatch(/technical drawing|construction sheet/i);
    expect(bp).toMatch(/wireframe|technical drawing|construction/i);
  });

  it('15–18 API uses FAL dispatch — not local fake blueprint artifact', () => {
    const api = read('api/site00/twin-v2-fal-parallel-twin-proof.ts');
    expect(api).toContain('runFalParallelTwinProof');
    expect(api).not.toContain('SVG');
    const dispatch = read(
      'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV28/dispatchFalParallelTwinGeneration.ts',
    );
    expect(dispatch).toContain('fal.subscribe');
    expect(dispatch).toContain('COORDINATED_DUAL_CALL');
  });

  it('19–20 fail if only one artifact', () => {
    const receipt = {
      buildRef: P0_VR_TWIN_V28_BUILD,
      compositionStateId: 'mts-x',
      conceptId: 'c',
      conceptVersionId: 'v',
      provider: 'fal',
      authorityModel: 'm',
      blueprintModel: 'm',
      generationMode: 'COORDINATED_DUAL_CALL' as const,
      authorityJobRef: 'a',
      blueprintJobRef: 'b',
      authorityArtifactId: 'same',
      blueprintArtifactId: 'same',
      authorityUrl: '/a',
      blueprintUrl: '/b',
      sameCompositionState: true,
      sameObjectIds: true,
      sameViewport: true,
      status: 'FAIL' as const,
      createdAt: new Date().toISOString(),
    };
    const align = runTwinVisualAlignmentHeuristic({
      state: buildMinimalTwinGenerationState({
        conceptId: 'c',
        conceptVersionId: 'v',
        session: sessionWithCreative(),
      }),
      authority: {
        artifactId: 'same',
        artifactKind: 'AUTHORITY_VISUAL',
        compositionStateId: 'mts-x',
        conceptId: 'c',
        conceptVersionId: 'v',
        objectId: null,
        storageUrl: '/a',
        providerJobRef: 'a',
        provider: 'p',
        model: 'm',
      },
      blueprint: {
        artifactId: 'same',
        artifactKind: 'BLUEPRINT_TWIN_VISUAL',
        compositionStateId: 'mts-x',
        conceptId: 'c',
        conceptVersionId: 'v',
        objectId: null,
        storageUrl: '/b',
        providerJobRef: 'b',
        provider: 'p',
        model: 'm',
      },
    });
    const { classification, failureCode } = classifyFalParallelTwinCapability({
      receipt,
      alignment: align,
      fromLiveFal: false,
    });
    expect(classification).toBe('FAL_PARALLEL_TWIN_CAPABILITY_FAILED');
    expect(failureCode).toBe('FAL_TWIN_OUTPUT_NOT_PROVEN');
  });

  it('21–23 asset mini-proof + overlay UI + v1/live isolation', async () => {
    const bundle = await runFalParallelTwinProof({
      session: sessionWithCreative(),
      conceptId: 'cc-asset',
      conceptVersionId: 'vc-asset',
    });
    expect(bundle.assetProofs.length).toBeGreaterThanOrEqual(2);
    expect(read('src/site00/components/designWorkspace/pageFamily/TwinV2FalParallelTwinProofPanel.tsx')).toContain(
      'OVERLAY',
    );
    assertV1Isolation();
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV27/blueprintToCodeCompiler.ts')).not.toContain(
      'p0vrTwinV28',
    );
  });

  it('vitest classification is PARTIAL not PROVEN (no live FAL in CI)', async () => {
    const bundle = await runFalParallelTwinProof({
      session: sessionWithCreative(),
      conceptId: 'cc-class',
      conceptVersionId: 'vc-class',
    });
    expect(bundle.capabilityClassification).toBe('FAL_PARALLEL_TWIN_CAPABILITY_PARTIAL');
    expect(bundle.alignmentReceipt.status).toBe('PENDING_FOUNDER_REVIEW');
  });
});
