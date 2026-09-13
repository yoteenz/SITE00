/**
 * P0.VR.TWINV2.5 — Dual-output concept generation contract
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
  approveActiveConceptCandidate,
  assertV1Isolation,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { ensureConceptGallery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import {
  beginDualOutputConceptGeneration,
  buildNdxOverviewVisualObjectCatalog,
  compileConceptBlueprintToCode,
  assertRasterAuthorityFirewall,
  buildRasterIndependenceReceipt,
  P0_VR_TWIN_V25_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV25/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function sessionWithCreative() {
  let s = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'v25-1' });
  s = ensureConceptGallery(s);
  if (!s.creativeDirection) throw new Error('missing creative direction fixture');
  return s;
}

describe('P0.VR.TWINV2.5 dual-output concept generation', () => {
  it('1–4 pre-generation object map + plans before visual', () => {
    const session = sessionWithCreative();
    const { pending } = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' });
    expect(pending.buildRef).toBe(P0_VR_TWIN_V25_BUILD);
    expect(pending.visualBlueprint.objects.length).toBeGreaterThanOrEqual(25);
    expect(pending.assetPlan.assetSlots.length).toBeGreaterThan(0);
    expect(pending.functionTargetPlan.targets.length).toBeGreaterThan(5);
    expect(pending.compositionPlan.objects.length).toBe(pending.visualBlueprint.objects.length);
  });

  it('5–8 object IDs exist before image (catalog sample)', () => {
    const objects = buildNdxOverviewVisualObjectCatalog();
    expect(objects.some((o) => o.objectId === 'hero.headline')).toBe(true);
    expect(objects.some((o) => o.objectId === 'progress.percent')).toBe(true);
    expect(objects.every((o) => o.sourceType)).toBe(true);
  });

  it('9–12 visual model receives dual-output instruction via session + API', () => {
    expect(read('api/site00/twin-v2-visual-concept.ts')).toContain('pendingDualOutput');
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/buildVisualConceptPrompt.ts')).toContain(
      'dualOutputInstruction',
    );
    const session = sessionWithCreative();
    const { session: withPending } = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' });
    expect(withPending.conceptGallery?.pendingDualOutput?.visualGenerationInstruction).toContain(
      'Render this composition plan',
    );
  });

  it('13–20 finalize paired bundle after visual merge', () => {
    let session = sessionWithCreative();
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/concept-v25.jpg',
      imageStorageRef: 'ref-v25',
    });
    const active = session.conceptGallery!.candidates.at(-1)!;
    expect(active.conceptOrigin).toBe('DUAL_OUTPUT_PAIRED');
    expect(active.buildReadiness.blueprintReady).toBe(true);
    expect(session.conceptGallery!.generatedConceptAssets?.[active.conceptId]?.length).toBeGreaterThan(0);
    expect(session.conceptGallery!.blueprintVisualCoverage?.[active.conceptId]?.coveragePercent).toBeGreaterThanOrEqual(
      0.95,
    );
  });

  it('21–28 approval gate + legacy preservation + compiler + firewall', () => {
    let session = sessionWithCreative();
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/c.jpg',
      imageStorageRef: 'r',
    });
    session = approveActiveConceptCandidate(session);
    const active = session.conceptGallery!.candidates.at(-1)!;
    expect(active.founderJudgment).toBe('APPROVED');

    const pkg = Object.values(session.conceptGallery!.packages).find((p) => p.conceptId === active.conceptId);
    expect(pkg).toBeDefined();

    const compile = compileConceptBlueprintToCode({
      blueprint: pkg!.blueprint,
      manifest: pkg!.assetManifest,
      bindingPlan: pkg!.functionBindingPlan,
    });
    expect(compile.unboundPrimary.length).toBe(0);

    const firewall = assertRasterAuthorityFirewall(read('src/site00/components/reconstruction/ConceptVisualCompilerTwinV2.tsx'));
    expect(firewall.pass).toBe(true);

    expect(buildRasterIndependenceReceipt(active.conceptId).status).toBe('PASS');
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
  });

  it('29–31 legacy image-first concepts preserved', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.ts')).toContain(
      'LEGACY_IMAGE_FIRST',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/TwinV2PairedConceptReviewPanel.tsx')).toContain(
      'OVERLAY',
    );
  });
});
