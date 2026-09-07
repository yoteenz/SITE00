import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bootstrapB46 } from '../api/_lib/site00ExpressionEngine/entry002B46Bootstrap.js';
import { buildEntry002ReelTreatmentAuthority } from '../api/_lib/site00ExpressionEngine/entry002ReelTreatment.js';
import { buildEntry002ReelStoryboardAuthorityRecord } from '../api/_lib/site00ExpressionEngine/entry002StoryboardAuthority.js';
import { runStoryboardAuthorityQA } from '../api/_lib/site00ExpressionEngine/storyboardAuthorityQA.js';
import {
  buildStoryboardApprovalState,
  assertStructuralStoryboardApprovedForKeyframeGeneration,
  isKeyframeGenerationBlockedByStructuralStoryboardGate,
} from '../api/_lib/site00ExpressionEngine/storyboardGate.js';
import { buildEntry002StructuralStoryboardBoards } from '../api/_lib/site00ExpressionEngine/storyboardBoardPlanner.js';
import { compileKeyframesFromApprovedStoryboard } from '../api/_lib/site00ExpressionEngine/storyboardToKeyframeCompiler.js';
import {
  assertProductionKeyframeGenerationAllowed,
  isKeyframeGenerationBlockedByCinematicSequenceGate,
} from '../api/_lib/site00ExpressionEngine/entry002ReelProductionGates.js';
import { dispatchEntry002ReelKeyframeRaster } from '../api/_lib/site00ExpressionEngine/entry002ReelKeyframeDispatch.js';
import { STORYBOARD_GATED_PRODUCTION_ORDER } from '../shared/site00-expression-engine/storyboardGateTypes.js';
import { applyFounderBoardJudgments } from '../api/_lib/site00ExpressionEngine/storyboardFounderJudgment.js';
import { resetLineageStore } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

vi.mock('../api/_lib/site00Assts/storage.js', () => ({
  site00StorageObjectExists: vi.fn(async (path: string) =>
    path.includes('reel/ndx-entry-002-reel-kf'),
  ),
  getSite00AssetPublicUrl: vi.fn((path: string) => `https://storage.test/${path}`),
  uploadSite00AssetBuffer: vi.fn(async () => ({ publicUrl: 'https://storage.test/uploaded' })),
  downloadUrlToBuffer: vi.fn(async () => Buffer.from('fake')),
}));

describe('Expression Engine Sprint B4.6 — Storyboard gate + reel treatment authority', () => {
  beforeEach(() => {
    resetLineageStore();
    vi.stubEnv('FAL_KEY', '');
    vi.stubEnv('VITEST', 'true');
  });

  it('1. locks storyboard-gated production order before keyframes', async () => {
    const b46 = await bootstrapB46({ dispatchFal: false });
    expect(b46.productionOrder).toEqual(STORYBOARD_GATED_PRODUCTION_ORDER);
    expect(b46.productionOrder.indexOf('STORYBOARD_AUTHORITY')).toBeLessThan(
      b46.productionOrder.indexOf('START_MID_END_KEYFRAME_GENERATION'),
    );
  });

  it('2. locks Entry 002 reel treatment with same-woman contradiction', () => {
    const treatment = buildEntry002ReelTreatmentAuthority();
    expect(treatment.status).toBe('LOCKED');
    expect(treatment.coreStory.toLowerCase()).toContain('same woman');
    expect(treatment.coreStory).toContain('THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.');
    expect(treatment.characterRoles.ndx.toLowerCase()).toContain('not the subject woman');
  });

  it('3. builds 10-beat outline and 5 separate structural boards', () => {
    const authority = buildEntry002ReelStoryboardAuthorityRecord();
    expect(authority.beatOutline.length).toBe(10);
    expect(authority.boards.length).toBe(5);
    const ids = new Set(authority.boards.map((b) => b.boardId));
    expect(ids.size).toBe(5);
    expect(authority.boards.filter((b) => b.keyframeExtractionRole).map((b) => b.keyframeExtractionRole)).toEqual([
      'START',
      'MID',
      'END',
    ]);
  });

  it('4. QA passes structural storyboard authority', () => {
    const treatment = buildEntry002ReelTreatmentAuthority();
    const authority = buildEntry002ReelStoryboardAuthorityRecord();
    const qa = runStoryboardAuthorityQA(treatment, authority);
    expect(qa.passed).toBe(true);
    expect(qa.result).toBe('PASS');
  });

  it('5. GATE_0C blocks keyframe generation until all 5 boards LOVE_IT', () => {
    const boards = buildEntry002StructuralStoryboardBoards();
    const unreviewed = buildStoryboardApprovalState(boards);
    expect(isKeyframeGenerationBlockedByStructuralStoryboardGate(unreviewed)).toBe(true);
    expect(() => assertStructuralStoryboardApprovedForKeyframeGeneration(unreviewed)).toThrow(
      'GATE_0C_STRUCTURAL_STORYBOARD',
    );

    const approvedBoards = applyFounderBoardJudgments(boards, {
      BOARD_01: 'LOVE_IT',
      BOARD_02: 'LOVE_IT',
      BOARD_03: 'LOVE_IT',
      BOARD_04: 'LOVE_IT',
      BOARD_05: 'LOVE_IT',
    });
    const approved = buildStoryboardApprovalState(approvedBoards);
    expect(isKeyframeGenerationBlockedByStructuralStoryboardGate(approved)).toBe(false);
    const compiled = compileKeyframesFromApprovedStoryboard(approvedBoards, approved);
    expect(compiled.map((c) => c.role)).toEqual(['START', 'MID', 'END']);
  });

  it('6. cinematic sequence is parallel dev — no longer sole keyframe blocker', () => {
    expect(isKeyframeGenerationBlockedByCinematicSequenceGate('UNREVIEWED')).toBe(true);
    expect(() =>
      assertProductionKeyframeGenerationAllowed({
        cinematicSequenceJudgment: 'LOVE_IT',
      }),
    ).toThrow('GATE_0C_STRUCTURAL_STORYBOARD');
  });

  it('7. keyframe dispatch blocked pending structural storyboard approval', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    vi.stubEnv('VITEST', '');
    const storage = await import('../api/_lib/site00Assts/storage.js');
    vi.mocked(storage.site00StorageObjectExists).mockResolvedValueOnce(false);

    await expect(
      dispatchEntry002ReelKeyframeRaster('START', { dispatchFal: true }),
    ).rejects.toThrow('GATE_0C_STRUCTURAL_STORYBOARD');
  });

  it('8. bootstrap returns founder per-board review slots', async () => {
    const b46 = await bootstrapB46({ dispatchFal: false });
    expect(b46.founderReviewSlots?.length).toBe(5);
    expect(b46.blockingRules.keyframeGeneration).toBe('BLOCKED_PENDING_STORYBOARD_APPROVAL');
    expect(b46.nextAction).toBe('FOUNDER_STORYBOARD_REVIEW_PER_BOARD');
  });
});
