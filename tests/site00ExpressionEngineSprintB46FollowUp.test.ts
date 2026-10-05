import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bootstrapB46FollowUp } from '../api/_lib/site00ExpressionEngine/entry002B46FollowUpBootstrap.js';
import { buildEntry002CharacterVisualCanon } from '../api/_lib/site00ExpressionEngine/entry002CinematicSequenceContinuityPack.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecord.js';
import { runPreStoryboardAuthorityQA } from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityQA.js';
import {
  assertPreStoryboardVisualAuthorityApprovedForStoryboard,
  buildPreStoryboardApprovalState,
} from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityGate.js';
import { buildEntry002PreStoryboardVisualAuthorities } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardVisualAuthorities.js';
import { assertProductionKeyframeGenerationAllowed } from '../api/_lib/site00ExpressionEngine/entry002ReelProductionGates.js';
import { dispatchEntry002ReelKeyframeRaster } from '../api/_lib/site00ExpressionEngine/entry002ReelKeyframeDispatch.js';
import { PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER } from '../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { resetLineageStore } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

vi.mock('../api/_lib/site00Assts/storage.js', () => ({
  site00StorageObjectExists: vi.fn(async (path: string) =>
    path.includes('reel/ndx-entry-002-reel-kf'),
  ),
  getSite00AssetPublicUrl: vi.fn((path: string) => `https://storage.test/${path}`),
  uploadSite00AssetBuffer: vi.fn(async () => ({ publicUrl: 'https://storage.test/uploaded' })),
  downloadUrlToBuffer: vi.fn(async () => Buffer.from('fake')),
}));

describe('Expression Engine Sprint B4.6 follow-up — Pre-storyboard visual authority pack', () => {
  beforeEach(() => {
    resetLineageStore();
    vi.stubEnv('FAL_KEY', '');
    vi.stubEnv('VITEST', 'true');
  });

  it('1. fixes collapsed NDX/subject woman character canon', () => {
    const canon = buildEntry002CharacterVisualCanon();
    expect(canon.roleSplitCorrected).toBe(true);
    expect(canon.deprecatedCollapsedIdentity).toContain('NOT canon');
    expect(canon.ndxRole.toLowerCase()).toContain('partial');
    expect(canon.subjectWomanRole.toLowerCase()).toContain('same woman');
    expect(canon.ndxRole.toLowerCase()).not.toContain('same ndxbook woman every frame');
  });

  it('2. registers five separate pre-storyboard visual authorities', () => {
    const pack = buildEntry002PreStoryboardVisualAuthorityPack();
    expect(pack.authorities.length).toBe(5);
    expect(pack.authorities.map((a) => a.role)).toEqual([
      'NDX_PRESENCE',
      'SUBJECT_WOMAN_DUAL_ERA',
      'NDX_HAND_NAIL_INTERACTION',
      'SUBJECT_FASHION_CONTINUITY',
      'PHONE_CULTURAL_GLITCH',
    ]);
  });

  it('3. QA passes pre-storyboard authority pack', () => {
    const pack = buildEntry002PreStoryboardVisualAuthorityPack();
    const qa = runPreStoryboardAuthorityQA(pack);
    expect(qa.passed).toBe(true);
  });

  it('4. GATE_0B blocks cinematic storyboard until all authorities LOVE_IT', () => {
    const authorities = buildEntry002PreStoryboardVisualAuthorities();
    const unreviewed = buildPreStoryboardApprovalState(authorities);
    expect(() => assertPreStoryboardVisualAuthorityApprovedForStoryboard(unreviewed)).toThrow(
      'GATE_0B_PRE_STORYBOARD_AUTHORITY',
    );
  });

  it('5. production order places pre-storyboard authorities before cinematic storyboard', async () => {
    const result = await bootstrapB46FollowUp({ dispatchFal: false });
    expect(result.productionOrder).toEqual(PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER);
    expect(result.productionOrder.indexOf('PRE_STORYBOARD_VISUAL_AUTHORITIES')).toBeLessThan(
      result.productionOrder.indexOf('FINAL_CINEMATIC_STORYBOARD'),
    );
  });

  it('6. cinematic sequence marked PRE_AUTHORITY_EXPERIMENT — not visual authority', async () => {
    const result = await bootstrapB46FollowUp({ dispatchFal: false });
    expect(result.cinematicSequence.status).toBe('PRE_AUTHORITY_EXPERIMENT');
    expect(result.cinematicSequence.visualAuthority).toBe(false);
    expect(result.finalStoryboard.status).toBe('BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL');
  });

  it('7. keyframes blocked pending pre-storyboard approval', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    vi.stubEnv('VITEST', '');
    const storage = await import('../api/_lib/site00Assts/storage.js');
    vi.mocked(storage.site00StorageObjectExists).mockResolvedValueOnce(false);

    await expect(
      dispatchEntry002ReelKeyframeRaster('START', { dispatchFal: true }),
    ).rejects.toThrow('GATE_0B_PRE_STORYBOARD_AUTHORITY');
  });

  it('8. bootstrap returns founder review slots for five authorities', async () => {
    const result = await bootstrapB46FollowUp({ dispatchFal: false });
    expect(result.founderReviewSlots.length).toBe(5);
    expect(result.nextAction).toBe('FOUNDER REVIEW OF FIVE PRE-STORYBOARD VISUAL AUTHORITIES');
    expect(result.keyframes).toBe('BLOCKED');
    expect(result.video).toBe('BLOCKED');
  });
});
