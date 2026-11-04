/**
 * P0.JURNL.F05-MONEY.DOT01.FINAL-VISUAL-CONVERGENCE-AND-BATCH05-06-ASSET-INTEGRATION.OPUS1 — the Batch 05 / 06 registry.
 * Every Grok file has one record; only qualified art is mounted; nothing is approved by being registered.
 */
import { describe, expect, it } from 'vitest';
import review from '../src/projects/jurnl/families/F05_MONEY/MICRO_ASSETS/BATCH_05_06_REVIEW.json';
import { MICRO_ASSETS, MICRO_ASSET_REVIEW, microAssetSrc, type MicroAssetId } from '../src/projects/jurnl/runtime/screens/f05/microAssets';

const ids = review.files.map((f) => f.registry_id as MicroAssetId);

describe('Batch 05 / 06 registry', () => {
  it('B1 all 20 handoff files are verified and recorded once, with their source hash and size', () => {
    expect(review.files_verified).toBe(20);
    expect(new Set(ids).size).toBe(20);
    for (const f of review.files) {
      const r = MICRO_ASSET_REVIEW[f.registry_id as MicroAssetId]!;
      expect(r.sourceSha256).toBe(f.source_sha256);
      expect(r.sourcePx).toEqual(f.source_px);
      expect(r.founderApproval).toBe('PENDING');
    }
  });
  it('B2 only the qualified candidate and the exact founder layer have runtime art', () => {
    const mounted = ids.filter((id) => microAssetSrc(id) != null);
    expect(mounted.sort()).toEqual(['F05.D01.CTRL.BACK.PARCHMENT.LIGHT', 'F05.D01.SURFACE.ACTION.TORN']);
    expect(MICRO_ASSETS['F05.D01.CTRL.BACK.PARCHMENT.LIGHT'].status).toBe('CANDIDATE_FOR_REVIEW');
    expect(MICRO_ASSETS['F05.D01.SURFACE.ACTION.TORN'].status).toBe('EXACT_SOURCE_REUSE');
  });
  it('B3 corrections and rejections are never mounted; the dock keeps its vectors', () => {
    for (const id of ids) {
      const r = MICRO_ASSET_REVIEW[id]!;
      if (r.classification === 'CORRECTION_REQUIRED' || r.classification === 'REJECTED') {
        expect(microAssetSrc(id)).toBeNull();
        expect(r.mountStatus).toBe('NOT_MOUNTED');
        expect(r.visualQa).toBe('FAIL');
      }
      if (id.startsWith('F05.D01.ICON.NAV.')) expect(MICRO_ASSETS[id].status).toBe('VECTOR_IN_RUNTIME');
    }
  });
  it('B4 the counts match the qualification: 1 qualified, 6 exact reuse, 7 corrections, 6 rejected', () => {
    expect(review.counts).toEqual({ CORRECTION_REQUIRED: 7, EXACT_APPROVED_SOURCE_REUSE: 6, REJECTED: 6, VISUALLY_QUALIFIED_CANDIDATE: 1 });
  });
  it('B5 Batches 01–04 are unchanged: 40 founder icons still available', () => {
    const b14 = Object.values(MICRO_ASSETS).filter((a) => a.status === 'AVAILABLE');
    expect(b14).toHaveLength(40);
  });
});
