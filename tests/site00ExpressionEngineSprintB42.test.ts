import { describe, it, expect, beforeEach } from 'vitest';
import { bootstrapB42 } from '../api/_lib/site00ExpressionEngine/entry002B42Bootstrap.js';
import { bootstrapB4 } from '../api/_lib/site00ExpressionEngine/entry002ReelProduction.js';
import {
  dispatchEntry002ReelKeyframeRaster,
  isValidGeneratedRaster,
  type ReelKeyframeRasterResult,
} from '../api/_lib/site00ExpressionEngine/entry002ReelKeyframeDispatch.js';
import {
  ENTRY_002_REEL_KF_END_001,
  ENTRY_002_REEL_KF_MID_001,
  ENTRY_002_REEL_KF_START_001,
} from '../shared/site00-expression-engine/entry002ReelKeyframeIds.js';
import { isPlanningReceipt } from '../api/_lib/site00ExpressionEngine/entry002ReelKeyframeTelemetry.js';
import {
  listGenerationReceiptsForEntry,
  resetLineageStore,
} from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';
import { resetExpressionEntryStore } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import { resetExpressionEngineMemoryStore } from '../api/_lib/site00ExpressionEngine/projectScope.js';
import { resetChapterStore } from '../api/_lib/site00ExpressionEngine/chapterStore.js';
import { resetCoverAnnotationHistoryStore } from '../api/_lib/site00ExpressionEngine/coverAnnotationHistoryStore.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

describe('Expression Engine Sprint B4.2 — Keyframe execution dispatch', () => {
  beforeEach(() => {
    resetExpressionEntryStore();
    resetExpressionEngineMemoryStore();
    resetLineageStore();
    resetChapterStore();
    resetCoverAnnotationHistoryStore();
  });

  it('1. COMPILED receipt does not count as generation attempt', async () => {
    const b4 = await bootstrapB4();
    expect(b4.telemetry.generationAttempts).toBe(0);
    expect(b4.telemetry.compiledPlans).toBe(3);
    expect(b4.telemetry.planningReceipts).toBe(3);
  });

  it('2. generation attempt requires actual dispatch', async () => {
    const b42 = await bootstrapB42({ dispatchFal: false });
    expect(b42.telemetrySemantics.dispatchedGenerations).toBe(0);
    expect(b42.telemetrySemantics.generationAttempts).toBe(0);
    expect(b42.actualRasterResults).toBe(0);
  });

  it('3. actual result requires raster/file reference — no placeholder URL', async () => {
    const result = await dispatchEntry002ReelKeyframeRaster('START', { dispatchFal: false });
    expect(result.status).toBe('NOT_DISPATCHED');
    expect(result.previewUrl).toBeNull();
    expect(isValidGeneratedRaster(result)).toBe(false);
  });

  it('4. fixed asset IDs used for first-pass review assets', async () => {
    const b42 = await bootstrapB42({ dispatchFal: false });
    expect(b42.keyframeExecutions.map((k) => k.assetId)).toEqual([
      ENTRY_002_REEL_KF_START_001,
      ENTRY_002_REEL_KF_MID_001,
      ENTRY_002_REEL_KF_END_001,
    ]);
  });

  it('5. founder judgment remains UNREVIEWED without self-approval', async () => {
    const b42 = await bootstrapB42({ dispatchFal: false });
    expect(b42.keyframeExecutions.every((k) => k.founderJudgment === 'UNREVIEWED')).toBe(true);
    expect(b42.keyframeExecutions.every((k) => k.canonState === 'NON_CANON')).toBe(true);
  });

  it('6. no motion dispatch — Kling and rough cut blocked', async () => {
    const b42 = await bootstrapB42({ dispatchFal: false });
    expect(b42.klingBlocked).toBe(true);
    expect(b42.roughCutBlocked).toBe(true);
    expect(b42.videoDispatched).toBe(false);
  });

  it('7. no downstream generation', async () => {
    const b42 = await bootstrapB42({ dispatchFal: false });
    expect(b42.downstreamHold.every((d) => d.produced === false)).toBe(true);
  });

  it('8. planning receipts distinguished from generation receipts', async () => {
    await bootstrapB42({ dispatchFal: false });
    const receipts = listGenerationReceiptsForEntry('entry-002').filter((r) => r.format === 'REEL');
    expect(receipts.some(isPlanningReceipt)).toBe(true);
    expect(receipts.filter(isPlanningReceipt).length).toBe(3);
  });

  it('9. FAILED raster does not fabricate success', () => {
    const failed: ReelKeyframeRasterResult = {
      role: 'MID',
      assetId: ENTRY_002_REEL_KF_MID_001,
      storagePath: 'site00/assts/expression-engine/ndxbook/entry-002/reel/ndx-entry-002-reel-kf-mid-001.webp',
      previewUrl: null,
      provider: 'fal-flux',
      model: 'fal-ai/flux-pro',
      dimensions: { width: 1080, height: 1920 },
      aspectRatio: '9:16',
      promptLineage: [],
      referenceLineage: [],
      planningReceiptId: 'plan-mid',
      generationReceipt: null,
      creativeAssetRecord: null,
      providerRequestId: null,
      dispatchAttempted: true,
      actualFileExists: false,
      fallbackAttempted: true,
      status: 'FAILED',
      failure: 'provider timeout',
      founderJudgment: 'UNREVIEWED',
      canonState: 'NON_CANON',
    };
    expect(isValidGeneratedRaster(failed)).toBe(false);
    expect(failed.previewUrl).toBeNull();
    expect(failed.generationReceipt).toBeNull();
  });
});
