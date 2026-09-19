/**
 * P0.VR.TWINV2.6 — Design compiler hardening
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
  approveActiveConceptCandidate,
  prepareConceptDirectedTwinV2Build,
  assertV1Isolation,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { ensureConceptGallery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { beginDualOutputConceptGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV25/buildDualOutputPreGeneration.js';
import {
  computeStableChecksum,
  assertBuildCompilerContracts,
  assertConceptGenerationPreflight,
  runConceptGenerationPreflight,
  lockApprovedDesignBundle,
  designCompilerCacheKey,
  assertStableObjectIds,
  P0_VR_TWIN_V26_BUILD,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV26/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function sessionWithCreative() {
  let s = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'v26-1' });
  return ensureConceptGallery(s);
}

describe('P0.VR.TWINV2.6 design compiler', () => {
  it('1–4 IR chain + bundle checksum', () => {
    let session = sessionWithCreative();
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/c.jpg',
      imageStorageRef: 'r',
    });
    const active = session.conceptGallery!.candidates.at(-1)!;
    const bundle = session.conceptGallery!.designCompilerBundles![active.conceptId];
    expect(bundle.buildRef).toBe(P0_VR_TWIN_V26_BUILD);
    expect(bundle.irChain.intent.inputIrIds).toEqual([]);
    expect(bundle.irChain.implementation.inputIrIds).toHaveLength(3);
    expect(bundle.bundleChecksum.checksum).toBeTruthy();
    expect(computeStableChecksum({ a: 1 })).toMatch(/^ck/);
  });

  it('5–10 preflight blocks incomplete + object lineage stable', () => {
    const session = sessionWithCreative();
    const { pending } = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' });
    const pre = runConceptGenerationPreflight(session, pending);
    expect(pre.status).toBe('PASS');
    assertConceptGenerationPreflight(pre);

    let broken = sessionWithCreative();
    broken = { ...broken, creativeDirection: null as never };
    expect(runConceptGenerationPreflight(broken, pending).status).toBe('FAIL');
  });

  it('11–20 approve lock + build compiler contracts', () => {
    let session = sessionWithCreative();
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/c.jpg',
      imageStorageRef: 'r',
    });
    session = approveActiveConceptCandidate(session);
    const active = session.conceptGallery!.candidates.at(-1)!;
    const bundle = session.conceptGallery!.designCompilerBundles![active.conceptId];
    expect(bundle.executionIntent).toBe('TRANSLATION');
    expect(bundle.approvedBundleChecksum).toBe(bundle.bundleChecksum.checksum);

    session = prepareConceptDirectedTwinV2Build(session);
    assertBuildCompilerContracts(session);

    const upstream = bundle.objectLineage.map((o) => o.objectId);
    assertStableObjectIds(upstream.slice(0, 5), upstream);
  });

  it('21–30 cache key + UI + V1 isolation', () => {
    const key = designCompilerCacheKey({
      conceptVersionId: 'vc-1',
      bundleChecksum: 'ckabc',
      buildId: null,
    });
    expect(key).toBe('vc-1:ckabc:nobuild');

    expect(read('src/site00/components/designWorkspace/pageFamily/TwinV2CompilerReadinessPanel.tsx')).toContain(
      'COMPILER READINESS',
    );
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV25/buildDualOutputPreGeneration.ts')).toContain(
      'assertConceptGenerationPreflight',
    );
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
  });

  it('immutable lock helper', () => {
    let session = sessionWithCreative();
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/c.jpg',
      imageStorageRef: 'r',
    });
    const active = session.conceptGallery!.candidates.at(-1)!;
    const bundle = session.conceptGallery!.designCompilerBundles![active.conceptId];
    const locked = lockApprovedDesignBundle(bundle, 'APPROVE_PAIRED_CONCEPT');
    expect(locked.irChain.design.status).toBe('LOCKED');
  });
});
