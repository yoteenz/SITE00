import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bootstrapB45 } from '../api/_lib/site00ExpressionEngine/entry002B45Bootstrap.js';
import { buildEntry002BlockingStoryboardRetirement } from '../api/_lib/site00ExpressionEngine/entry002BlockingStoryboardRetirement.js';
import { buildEntry002CinematicVisualSequenceRecord } from '../api/_lib/site00ExpressionEngine/entry002CinematicSequenceBuilder.js';
import { runCinematicVisualSequenceQA } from '../api/_lib/site00ExpressionEngine/entry002CinematicSequenceQA.js';
import {
  assertCinematicSequenceApprovedForKeyframeGeneration,
  isKeyframeGenerationBlockedByCinematicSequenceGate,
} from '../api/_lib/site00ExpressionEngine/entry002ReelProductionGates.js';
import { dispatchEntry002ReelKeyframeRaster } from '../api/_lib/site00ExpressionEngine/entry002ReelKeyframeDispatch.js';
import { CINEMATIC_VIDEO_PRODUCTION_ORDER } from '../shared/site00-expression-engine/entry002CinematicVisualSequenceTypes.js';
import { resetLineageStore } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

vi.mock('../api/_lib/site00Assts/storage.js', () => ({
  site00StorageObjectExists: vi.fn(async (path: string) =>
    path.includes('reel/ndx-entry-002-reel-kf'),
  ),
  getSite00AssetPublicUrl: vi.fn((path: string) => `https://storage.test/${path}`),
  uploadSite00AssetBuffer: vi.fn(async () => ({ publicUrl: 'https://storage.test/uploaded' })),
  downloadUrlToBuffer: vi.fn(async () => Buffer.from('fake')),
}));

describe('Expression Engine Sprint B4.5 — Cinematic visual sequence board', () => {
  beforeEach(() => {
    resetLineageStore();
    vi.stubEnv('FAL_KEY', '');
    vi.stubEnv('VITEST', 'true');
  });

  it('1. retires B4.4 sketch storyboard as blocking reference only', () => {
    const retired = buildEntry002BlockingStoryboardRetirement();
    expect(retired.type).toBe('DIRECTOR_BLOCKING_STORYBOARD');
    expect(retired.status).toBe('REFERENCE_ONLY');
    expect(retired.visualAuthority).toBe(false);
    expect(retired.doesNotDefine).toContain('cinematography');
  });

  it('2. locks cinematic production order before production keyframes', async () => {
    const b45 = await bootstrapB45({ dispatchFal: false, skipContactSheet: true });
    expect(b45.productionOrder).toEqual(CINEMATIC_VIDEO_PRODUCTION_ORDER);
    expect(b45.productionOrder.indexOf('CINEMATIC_VISUAL_SEQUENCE_BOARD')).toBeLessThan(
      b45.productionOrder.indexOf('START_MID_END_PRODUCTION_KEYFRAMES'),
    );
  });

  it('3. builds 10 cinematic development frames — not sketch storyboard', async () => {
    const b45 = await bootstrapB45({ dispatchFal: false, skipContactSheet: true });
    expect(b45.cinematicSequence.frames.length).toBe(10);
    expect(b45.cinematicSequence.visualStyle).toBe('CINEMATIC_VISUAL_DEVELOPMENT');
    expect(b45.cinematicSequence.gateId).toBe('GATE_0B_CINEMATIC_SEQUENCE');
  });

  it('4. QA passes and rejects desktop editing workstation', async () => {
    const seq = await buildEntry002CinematicVisualSequenceRecord();
    const qa = runCinematicVisualSequenceQA(seq);
    expect(qa.passed).toBe(true);
    const workstation = qa.checks.find((c) => c.check === 'edit suite not computer workstation');
    expect(workstation?.passed).toBe(true);
  });

  it('5. GATE_0B cinematic sequence is parallel dev — structural storyboard blocks keyframes', () => {
    expect(isKeyframeGenerationBlockedByCinematicSequenceGate('UNREVIEWED')).toBe(true);
    expect(isKeyframeGenerationBlockedByCinematicSequenceGate('LOVE_IT')).toBe(false);
  });

  it('6. keyframe dispatch blocked pending structural storyboard approval (B4.6)', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    vi.stubEnv('VITEST', '');
    const storage = await import('../api/_lib/site00Assts/storage.js');
    vi.mocked(storage.site00StorageObjectExists).mockResolvedValueOnce(false);

    await expect(
      dispatchEntry002ReelKeyframeRaster('START', { dispatchFal: true }),
    ).rejects.toThrow('GATE_0C_STRUCTURAL_STORYBOARD');
  });

  it('7. hard stop — keyframes and video blocked this sprint', async () => {
    const b45 = await bootstrapB45({ dispatchFal: false, skipContactSheet: true });
    expect(b45.keyframeGenerationBlocked).toBe(true);
    expect(b45.videoGenerationBlocked).toBe(true);
    expect(b45.nextAction).toBe('FOUNDER CINEMATIC VISUAL SEQUENCE REVIEW');
  });

  it('8. continuity reference boards resolve from existing assets', async () => {
    const b45 = await bootstrapB45({ dispatchFal: false, skipContactSheet: true });
    expect(b45.cinematicSequence.continuityReferences.length).toBe(5);
    expect(b45.cinematicSequence.continuityReferences.some((b) => b.resolved)).toBe(true);
  });
});
