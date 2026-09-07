import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bootstrapB44 } from '../api/_lib/site00ExpressionEngine/entry002B44Bootstrap.js';
import { buildEntry002ReelStoryboardRecord } from '../api/_lib/site00ExpressionEngine/entry002ReelStoryboardBuilder.js';
import { runReelStoryboardQA } from '../api/_lib/site00ExpressionEngine/entry002ReelStoryboardQA.js';
import { buildEntry002PreStoryboardKeyframeStatuses } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardKeyframes.js';
import {
  assertStoryboardApprovedForKeyframeGeneration,
  isKeyframeGenerationBlockedByStoryboardGate,
} from '../api/_lib/site00ExpressionEngine/entry002ReelProductionGates.js';
import { dispatchEntry002ReelKeyframeRaster } from '../api/_lib/site00ExpressionEngine/entry002ReelKeyframeDispatch.js';
import { REEL_PRODUCTION_ORDER } from '../shared/site00-expression-engine/entry002ReelStoryboardTypes.js';
import { resetLineageStore } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

vi.mock('../api/_lib/site00Assts/storage.js', () => ({
  site00StorageObjectExists: vi.fn(async () => false),
  getSite00AssetPublicUrl: vi.fn((path: string) => `https://storage.test/${path}`),
  uploadSite00AssetBuffer: vi.fn(async () => ({ publicUrl: 'https://storage.test/uploaded' })),
  downloadUrlToBuffer: vi.fn(async () => Buffer.from('fake')),
}));

describe('Expression Engine Sprint B4.4 — Reel storyboard authority', () => {
  beforeEach(() => {
    resetLineageStore();
    vi.stubEnv('FAL_KEY', '');
    vi.stubEnv('VITEST', 'true');
  });

  it('1. locks canonical production order with storyboard before keyframes', async () => {
    const b44 = await bootstrapB44({ dispatchFal: false });
    expect(b44.productionOrder).toEqual(REEL_PRODUCTION_ORDER);
    expect(b44.productionOrder.indexOf('COMPLETE_STORYBOARD')).toBeLessThan(
      b44.productionOrder.indexOf('START_MID_END_KEYFRAMES'),
    );
    expect(b44.productionOrder.indexOf('FOUNDER_STORYBOARD_JUDGMENT')).toBeLessThan(
      b44.productionOrder.indexOf('START_MID_END_KEYFRAMES'),
    );
  });

  it('2. builds 10-panel Entry 002 storyboard with full argument arc', async () => {
    const b44 = await bootstrapB44({ dispatchFal: false });
    expect(b44.storyboard.panels.length).toBe(10);
    expect(b44.storyboard.argumentArc).toEqual([
      'CLAIM',
      'RECEIPT',
      'CONTRADICTION',
      'INTERJECTION',
      'SYNTHESIS',
    ]);
    expect(b44.storyboard.gateId).toBe('GATE_0_STORYBOARD');
    expect(b44.storyboard.founderJudgment).toBe('UNREVIEWED');
  });

  it('3. runReelStoryboardQA passes on complete storyboard — not 3 polished images', () => {
    const sb = buildEntry002ReelStoryboardRecord();
    const qa = runReelStoryboardQA(sb);
    expect(qa.passed).toBe(true);
    expect(qa.result).toBe('PASS');
    expect(qa.blockers).toHaveLength(0);
    const notThreeImages = qa.checks.find((c) => c.check === 'not just 3 polished images');
    expect(notThreeImages?.passed).toBe(true);
  });

  it('4. GATE_0_STORYBOARD blocks keyframe generation until LOVE_IT', () => {
    expect(isKeyframeGenerationBlockedByStoryboardGate('UNREVIEWED')).toBe(true);
    expect(isKeyframeGenerationBlockedByStoryboardGate('PROMISING_REFINE')).toBe(true);
    expect(isKeyframeGenerationBlockedByStoryboardGate('NOT_FOR_ME')).toBe(true);
    expect(isKeyframeGenerationBlockedByStoryboardGate('LOVE_IT')).toBe(false);
    expect(() => assertStoryboardApprovedForKeyframeGeneration('UNREVIEWED')).toThrow(
      'KEYFRAME_GENERATION blocked',
    );
  });

  it('5. keyframe dispatch blocked for new generation without storyboard approval', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    vi.stubEnv('VITEST', '');
    const { site00StorageObjectExists } = await import('../api/_lib/site00Assts/storage.js');
    vi.mocked(site00StorageObjectExists).mockResolvedValue(false);

    await expect(
      dispatchEntry002ReelKeyframeRaster('START', { dispatchFal: true }),
    ).rejects.toThrow('KEYFRAME_GENERATION blocked');
  });

  it('6. marks pre-storyboard START/MID/END-001 as NON_CANON experiments', async () => {
    const b44 = await bootstrapB44({ dispatchFal: false });
    expect(b44.preStoryboardKeyframes.length).toBe(3);
    for (const kf of b44.preStoryboardKeyframes) {
      expect(kf.status).toBe('PRE_STORYBOARD_EXPERIMENT');
      expect(kf.canonState).toBe('NON_CANON');
      expect(kf.mayNotBecomeReelAuthority).toBe(true);
      expect(kf.mayNotSourceMotion).toBe(true);
    }
    const statuses = buildEntry002PreStoryboardKeyframeStatuses();
    expect(statuses.map((s) => s.assetId)).toEqual(
      b44.preStoryboardKeyframes.map((s) => s.assetId),
    );
  });

  it('7. keyframe extraction map points to approved panel candidates', async () => {
    const b44 = await bootstrapB44({ dispatchFal: false });
    expect(b44.storyboard.keyframeExtractionMap.START.sourcePanelIds.length).toBeGreaterThan(0);
    expect(b44.storyboard.keyframeExtractionMap.MID.sourcePanelIds.length).toBeGreaterThan(0);
    expect(b44.storyboard.keyframeExtractionMap.END.sourcePanelIds.length).toBeGreaterThan(0);
    expect(b44.storyboard.keyframeExtractionMap.START.blockedUntilApproval).toBe(true);
  });

  it('8. hard stop — no video/kling/rough cut; keyframe gen blocked this sprint', async () => {
    const b44 = await bootstrapB44({ dispatchFal: false });
    expect(b44.keyframeGenerationBlocked).toBe(true);
    expect(b44.videoGenerationBlocked).toBe(true);
    expect(b44.klingBlocked).toBe(true);
    expect(b44.roughCutBlocked).toBe(true);
    expect(b44.downstreamBlocked).toBe(true);
    expect(b44.nextAction).toBe('FOUNDER STORYBOARD REVIEW');
  });

  it('9. telemetry separates storyboard from keyframe and video stages', async () => {
    const b44 = await bootstrapB44({ dispatchFal: false });
    expect(b44.telemetry.storyboardGeneration).toBe(10);
    expect(typeof b44.telemetry.keyframeGeneration).toBe('number');
    expect(typeof b44.telemetry.videoGeneration).toBe('number');
  });
});
