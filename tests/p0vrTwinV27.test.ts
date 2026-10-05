/**
 * P0.VR.TWINV2.7 — Parallel authority + surgical blueprint twin generation
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
  assertV1Isolation,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { ensureConceptGallery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { beginDualOutputConceptGeneration, P0_VR_TWIN_V25_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV25/index.js';
import {
  P0_VR_TWIN_V27_BUILD,
  beginParallelCompositionTwinGeneration,
  assertAuthorityRuntimeFirewall,
  assertBlueprintNotPostHocOnly,
  assertSharedCompositionLineage,
  buildConceptCompositionState,
  buildSurgicalBlueprintTwin,
  compileSurgicalBlueprintToCode,
  runParallelTwinGenerationFromCompositionState,
  runTwinReconciliationPass,
  runNdxOverviewTwinV27Pilot,
  runParallelVisualObjectGuard,
  simulateAssetRegenerationReceipt,
  INVENTION_BUDGET_NONE,
  EXECUTION_INTENT_TRANSLATION,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV27/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function sessionWithCreative() {
  let s = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'v27-1' });
  s = ensureConceptGallery(s);
  if (!s.creativeDirection) throw new Error('missing creative direction');
  return s;
}

describe('P0.VR.TWINV2.7 parallel composition + surgical blueprint', () => {
  it('1–4 ConceptCompositionState + object/relationship counts', () => {
    const session = sessionWithCreative();
    const { pending } = beginParallelCompositionTwinGeneration(session, { generationType: 'INITIAL' });
    expect(pending.buildRef).toBe(P0_VR_TWIN_V27_BUILD);
    expect(pending.parallelTwin.compositionState.compositionStateId).toMatch(/^ccs-/);
    expect(pending.parallelTwin.compositionState.compositionObjects.length).toBeGreaterThanOrEqual(25);
    expect(pending.parallelTwin.compositionState.compositionRelationships.length).toBeGreaterThanOrEqual(6);
  });

  it('5–8 parallel lineage shares compositionStateId', () => {
    const session = sessionWithCreative();
    const bundle = runParallelTwinGenerationFromCompositionState({
      conceptId: 'cc-test',
      conceptVersionId: 'vc-test',
      session,
    });
    assertSharedCompositionLineage(bundle);
    const id = bundle.compositionState.compositionStateId;
    expect(bundle.surgicalBlueprintTwin.compositionStateId).toBe(id);
    expect(bundle.authorityVisual.compositionStateId).toBe(id);
    expect(bundle.assetGenerationContractSet.compositionStateId).toBe(id);
  });

  it('9–12 guards: post-hoc blueprint + authority firewall', () => {
    expect(() =>
      assertBlueprintNotPostHocOnly({
        compositionStateCreatedAt: '2026-01-01T00:00:00Z',
        blueprintCreatedAt: '2026-01-02T00:00:00Z',
        authorityImageReceivedAt: '2026-01-01T12:00:00Z',
        blueprintSource: 'POSTHOC_VISION',
      }),
    ).toThrow(/TWIN_V2_BLUEPRINT_POSTHOC_ONLY/);

    const compilerSrc = read('src/site00/components/reconstruction/ConceptSurgicalBlueprintTwinV2.tsx');
    expect(compilerSrc).toContain('data-authority-substrate="false"');
    const legacyCompiler = read('src/site00/components/reconstruction/ConceptVisualCompilerTwinV2.tsx');
    expect(assertAuthorityRuntimeFirewall(legacyCompiler).pass).toBe(false);
  });

  it('13–20 reconciliation + paired finalize stores v27 artifacts', () => {
    let session = sessionWithCreative();
    session = beginParallelCompositionTwinGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/concept-v27.jpg',
      imageStorageRef: 'ref-v27',
    });
    const active = session.conceptGallery!.candidates.at(-1)!;
    expect(active.conceptOrigin).toBe('DUAL_OUTPUT_PAIRED');
    const receipt = session.conceptGallery!.twinReconciliationReceipts?.[active.conceptId];
    expect(receipt?.status).toBe('PASS');
    expect(receipt?.compositionStateId).toBeTruthy();
    expect(session.conceptGallery!.canonicalAssetManifestsV27).toBeTruthy();
  });

  it('21–28 surgical samples + asset contracts + regeneration receipt', () => {
    const session = sessionWithCreative();
    const cs = buildConceptCompositionState({
      conceptId: 'cc-samples',
      conceptVersionId: 'vc-samples',
      session,
    });
    const sbt = buildSurgicalBlueprintTwin({ compositionState: cs });
    const text = sbt.objects.find((o) => o.objectId === 'hero.headline')!;
    const divider = sbt.objects.find((o) => o.objectId === 'hero.dividerLime')!;
    const image = sbt.objects.find((o) => o.objectId === 'hero.imageMain')!;
    expect(text.lineBreaks.length).toBeGreaterThan(0);
    expect(divider.dividerThickness).toBeTruthy();
    expect(image.assetSlotId).toBeTruthy();
    expect(image.assetGenerationContractId).toBeTruthy();

    const regen = simulateAssetRegenerationReceipt({
      assetId: 'ca-test',
      generationContractId: 'agc-test',
    });
    expect(regen.newAssetVersionId).not.toBe(regen.oldAssetVersionId);
  });

  it('29–36 blueprint compiler translation mode + parallel UI guard', () => {
    const session = sessionWithCreative();
    const cs = buildConceptCompositionState({ conceptId: 'c', conceptVersionId: 'v', session });
    const sbt = buildSurgicalBlueprintTwin({ compositionState: cs });
    const guard = runParallelVisualObjectGuard({
      blueprintObjects: sbt.objects,
      proposedNewControls: [{ role: 'nav duplicate', functionKey: 'section_nav.overview' }],
    });
    expect(guard.pass).toBe(false);
    expect(guard.code).toBe('TWIN_V2_PARALLEL_FUNCTION_UI');
  });

  it('37–43 pilot + v1 isolation + v25 path unchanged', () => {
    const pilot = runNdxOverviewTwinV27Pilot();
    expect(pilot.sharedCompositionStateId).toBe(pilot.compositionState.compositionStateId);
    expect(pilot.surgicalObjectCount).toBeGreaterThanOrEqual(25);
    expect(pilot.machinePassStatus).toBe('PASS');
    expect(pilot.buildRef).toBe(P0_VR_TWIN_V27_BUILD);

    const v25 = beginDualOutputConceptGeneration(sessionWithCreative(), { generationType: 'INITIAL' });
    expect(v25.pending.buildRef).toBe(P0_VR_TWIN_V25_BUILD);

    assertV1Isolation();
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/orchestrateTwinV2VisualConcept.ts')).toContain(
      'finalizeParallelCompositionTwinGeneration',
    );
  });

  it('44–46 translation receipt + invention budget constants', () => {
    expect(EXECUTION_INTENT_TRANSLATION).toBe('TRANSLATION');
    expect(INVENTION_BUDGET_NONE).toBe('NONE');

    let session = sessionWithCreative();
    session = beginParallelCompositionTwinGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/x.jpg',
      imageStorageRef: null,
    });
    const active = session.conceptGallery!.candidates.at(-1)!;
    const tr = session.conceptGallery!.blueprintTranslationReceipts?.[active.conceptId];
    expect(tr?.status).toBe('PASS');
    expect(tr?.objectCoverage).toBeGreaterThanOrEqual(0.99);

    const ri = session.conceptGallery!.runtimeIndependenceReceipts?.[active.conceptId];
    expect(ri?.authorityVisualRequired).toBe(false);
    expect(ri?.status).toBe('PASS');
  });

  it('reconciliation pass micro-drift', () => {
    const session = sessionWithCreative();
    const bundle = runParallelTwinGenerationFromCompositionState({
      conceptId: 'cc-rec',
      conceptVersionId: 'vc-rec',
      session,
    });
    const { receipt } = runTwinReconciliationPass({
      compositionState: bundle.compositionState,
      authorityVisual: { ...bundle.authorityVisual, imageUrl: '/a.jpg', status: 'RENDERED' },
      surgicalBlueprintTwin: bundle.surgicalBlueprintTwin,
      imageUrl: '/a.jpg',
    });
    expect(receipt.matchedObjectCount).toBe(receipt.plannedObjectCount);
  });
});
