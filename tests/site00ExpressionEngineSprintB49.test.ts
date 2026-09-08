import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  bootstrapB49,
  resetFinalCinematicStoryboardStore,
  resetFinalCinematicStoryboardJudgmentStore,
  recordFinalStoryboardFounderJudgment,
} from '../api/_lib/site00ExpressionEngine/entry002B49Bootstrap.js';
import { bootstrapB48 } from '../api/_lib/site00ExpressionEngine/entry002B48Bootstrap.js';
import {
  resetPreStoryboardAuthorityStore,
  persistEntry002PreStoryboardFounderApprovals,
} from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityStore.js';
import { ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardFounderApproval.js';
import {
  ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION,
  ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION,
  resolveEntry002NextAction,
  resolveEntry002ProductionEligibility,
} from '../api/_lib/site00ExpressionEngine/entry002PipelineState.js';
import { compileEntry002FinalCinematicStoryboardBrief } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardBrief.js';
import { buildEntry002ReelTreatmentAuthority } from '../api/_lib/site00ExpressionEngine/entry002ReelTreatment.js';
import { buildEntry002PreStoryboardVisualAuthorities } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardVisualAuthorities.js';
import { attachEntry002PreStoryboardFounderAssets } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityAssets.js';
import { attachPreStoryboardAuthorityRecords } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecordBuilder.js';
import { applyStoredPreStoryboardJudgments } from '../api/_lib/site00ExpressionEngine/preStoryboardFounderJudgment.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecord.js';
import {
  assertStoryboardCompilationFailClosed,
  resolveFinalStoryboardCompilationContract,
} from '../api/_lib/site00ExpressionEngine/entry002FinalStoryboardCompilationContract.js';
import { buildPreStoryboardApprovalState } from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityGate.js';
import { isKeyframeEligibleFromFinalStoryboard } from '../api/_lib/site00ExpressionEngine/entry002FinalStoryboardRecord.js';
import { ENTRY_002_CINEMATIC_SEQUENCE_001 } from '../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import { ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID } from '../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { resetLineageStore, listGenerationReceiptsForEntry } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';
import { buildEntry002FinalCinematicStoryboardPublicStripPath } from '../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

describe('Expression Engine Sprint B4.9 — Final cinematic storyboard generation', () => {
  beforeEach(async () => {
    resetPreStoryboardAuthorityStore();
    resetFinalCinematicStoryboardStore();
    resetFinalCinematicStoryboardJudgmentStore();
    resetLineageStore();
    persistEntry002PreStoryboardFounderApprovals();

    const stripPath = path.join(
      process.cwd(),
      'public',
      buildEntry002FinalCinematicStoryboardPublicStripPath().replace(/^\//, ''),
    );
    try {
      await fs.unlink(stripPath);
    } catch {
      // ignore missing strip from prior run
    }
  });

  it('1. generation eligible only after all five authorities LOVE_IT', async () => {
    resetPreStoryboardAuthorityStore();
    const blocked = buildPreStoryboardApprovalState(buildEntry002PreStoryboardVisualAuthorities());
    expect(blocked.allAuthoritiesLoveIt).toBe(false);
    expect(() => assertStoryboardCompilationFailClosed(
      resolveFinalStoryboardCompilationContract(
        buildEntry002PreStoryboardVisualAuthorityPack(
          attachPreStoryboardAuthorityRecords(
            applyStoredPreStoryboardJudgments(
              attachEntry002PreStoryboardFounderAssets(buildEntry002PreStoryboardVisualAuthorities()),
            ),
          ),
        ),
      ),
    )).toThrow();
    persistEntry002PreStoryboardFounderApprovals();
    const result = await bootstrapB49();
    expect(result.preStoryboardAuthorityPack.approvalState.allAuthoritiesLoveIt).toBe(true);
  });

  it('2. all five authority IDs consumed by compilation', async () => {
    const result = await bootstrapB49();
    expect(result.storyboardBrief.authorityIds).toHaveLength(5);
    for (const expected of ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS) {
      expect(result.storyboardBrief.authorityIds).toContain(expected.authorityId);
    }
  });

  it('3. missing authority causes generation to fail closed', () => {
    const authorities = attachPreStoryboardAuthorityRecords(
      applyStoredPreStoryboardJudgments(
        attachEntry002PreStoryboardFounderAssets(buildEntry002PreStoryboardVisualAuthorities()),
      ),
    ).slice(0, 4);
    const pack = buildEntry002PreStoryboardVisualAuthorityPack(authorities);
    const contract = resolveFinalStoryboardCompilationContract(pack);
    expect(() => assertStoryboardCompilationFailClosed(contract)).toThrow();
  });

  it('4. historical cinematic sequence is not used as visual authority', async () => {
    const result = await bootstrapB49();
    expect(result.cinematicSequence.sequenceId).toBe(ENTRY_002_CINEMATIC_SEQUENCE_001);
    expect(result.cinematicSequence.visualAuthority).toBe(false);
    expect(result.cinematicSequence.referenceOnly).toBe(true);
    expect(result.storyboardBrief.historicalSequenceExcluded).toBe(ENTRY_002_CINEMATIC_SEQUENCE_001);
  });

  it('5. canonical final storyboard ID distinct from historical sequence', async () => {
    const result = await bootstrapB49();
    expect(result.finalCinematicStoryboard?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID);
    expect(result.finalCinematicStoryboard?.storyboardId).not.toBe(ENTRY_002_CINEMATIC_SEQUENCE_001);
  });

  it('6. initial founderJudgment = UNREVIEWED', async () => {
    const result = await bootstrapB49();
    expect(result.finalCinematicStoryboard?.founderJudgment).toBe('UNREVIEWED');
  });

  it('7. initial post-generation status = AWAITING_FOUNDER_APPROVAL', async () => {
    const result = await bootstrapB49();
    expect(result.finalCinematicStoryboard?.status).toBe('AWAITING_FOUNDER_APPROVAL');
  });

  it('8. storyboard is not automatically canon', async () => {
    const result = await bootstrapB49();
    expect(result.finalCinematicStoryboard?.canon).toBe(false);
  });

  it('9. storyboard is not automatically visualAuthority', async () => {
    const result = await bootstrapB49();
    expect(result.finalCinematicStoryboard?.visualAuthority).toBe(false);
  });

  it('10. founder storyboard review becomes active after generation', async () => {
    const result = await bootstrapB49();
    expect(result.productionEligibility.founderStoryboardApproval).toBe('ACTIVE');
    expect(result.finalStoryboardReviewGate.active).toBe(true);
  });

  it('11. next action changes to founder review after generation', async () => {
    const b48 = await bootstrapB48();
    expect(b48.nextAction).toBe(ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION);
    const result = await bootstrapB49();
    expect(result.nextAction).toBe(ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION);
    expect(result.pipelineState.nextAction).toBe(ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION);
  });

  it('12. keyframes blocked while storyboard UNREVIEWED', async () => {
    const result = await bootstrapB49();
    expect(result.keyframes).toBe('BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL');
  });

  it('13. keyframes blocked if storyboard PROMISING_REFINE', async () => {
    await bootstrapB49();
    recordFinalStoryboardFounderJudgment({ founderJudgment: 'PROMISING_REFINE' });
    const result = await bootstrapB49();
    expect(result.keyframes).toBe('BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL');
  });

  it('14. keyframes blocked if storyboard NOT_FOR_ME', async () => {
    await bootstrapB49();
    recordFinalStoryboardFounderJudgment({ founderJudgment: 'NOT_FOR_ME' });
    const result = await bootstrapB49();
    expect(result.keyframes).toBe('BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL');
  });

  it('15. keyframes eligible only when storyboard LOVE_IT', async () => {
    await bootstrapB49();
    recordFinalStoryboardFounderJudgment({ founderJudgment: 'LOVE_IT' });
    const result = await bootstrapB49();
    expect(result.keyframes).toBe('READY_FOR_GENERATION');
    expect(isKeyframeEligibleFromFinalStoryboard('LOVE_IT')).toBe(true);
  });

  it('16. video remains blocked after storyboard LOVE_IT', async () => {
    await bootstrapB49();
    recordFinalStoryboardFounderJudgment({ founderJudgment: 'LOVE_IT' });
    const result = await bootstrapB49();
    expect(result.video).toBe('BLOCKED');
  });

  it('17. NDX and subject authority inputs remain distinct', async () => {
    const result = await bootstrapB49();
    expect(result.storyboardBrief.characterFirewall.ndxNails).toBe('SHORT_LIME_GREEN');
    expect(result.storyboardBrief.characterFirewall.subjectNails).toBe('FRENCH_TIPS');
    expect(result.storyboardCompilationContract.characterSeparation.rule).toBe('NDX !== SUBJECT WOMAN');
  });

  it('18. nail continuity contract present in compiled payload', async () => {
    const result = await bootstrapB49();
    expect(result.storyboardBrief.characterFirewall.ndxNails).toBe('SHORT_LIME_GREEN');
    expect(result.storyboardBrief.characterFirewall.subjectNails).toBe('FRENCH_TIPS');
  });

  it('19. full-body phone-content requirement present', async () => {
    const result = await bootstrapB49();
    expect(result.storyboardBrief.phoneContentRules.framing).toBe('FULL_BODY_OUTFIT_LED');
  });

  it('20. pose-variation requirement present', async () => {
    const result = await bootstrapB49();
    expect(result.storyboardBrief.phoneContentRules.poseVariation).toBe(true);
  });

  it('21. 2016 old-Instagram requirement present', async () => {
    const result = await bootstrapB49();
    const text = result.storyboardBrief.panels.map((p) => p.visualDescription).join(' ');
    expect(text.toLowerCase()).toContain('2016');
    expect(text.toLowerCase()).toContain('instagram');
  });

  it('22. mandatory interjection present', async () => {
    const result = await bootstrapB49();
    expect(result.storyboardBrief.mandatoryInterjection).toBe(
      'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
    );
    expect(
      result.storyboardBrief.panels.some((p) =>
        p.mandatoryText?.includes('THE CLOTHES NEVER GOT AN APOLOGY'),
      ),
    ).toBe(true);
  });

  it('23. snap-back beat present', async () => {
    const result = await bootstrapB49();
    expect(result.storyboardBrief.panels.some((p) => p.panelTitle.toLowerCase().includes('snap-back'))).toBe(
      true,
    );
  });

  it('24. Entry 003 is not generated', async () => {
    const result = await bootstrapB49();
    const text = result.storyboardBrief.panels.map((p) => p.visualDescription).join(' ');
    expect(text.toLowerCase()).not.toContain('entry 003');
    expect(text.toLowerCase()).not.toContain('entry-003');
  });

  it('25. provider dispatch telemetry recorded only when actual dispatch occurs', async () => {
    const result = await bootstrapB49();
    expect(result.renderResult?.compiled).toBe(true);
    expect(result.renderResult?.dispatched).toBe(false);
    expect(result.telemetryNote).toContain('no provider dispatch');
  });

  it('26. render state requires actual artifact', async () => {
    const result = await bootstrapB49();
    expect(result.renderResult?.rendered).toBe(true);
    expect(result.renderResult?.actualFileExists).toBe(true);
    expect(result.finalCinematicStoryboard?.rendered).toBe(true);
    const stripPath = path.join(
      process.cwd(),
      'public',
      buildEntry002FinalCinematicStoryboardPublicStripPath().replace(/^\//, ''),
    );
    await expect(fs.access(stripPath)).resolves.toBeUndefined();
  });

  it('27. lineage includes all five authority IDs', async () => {
    await bootstrapB49();
    const receipts = listGenerationReceiptsForEntry('entry-002');
    const stripReceipt = receipts.find((r) => r.assetId.includes('FINAL-CINEMATIC-STORYBOARD-STRIP'));
    expect(stripReceipt).toBeTruthy();
    for (const expected of ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS) {
      expect(stripReceipt?.referenceLineage).toContain(expected.authorityId);
    }
  });

  it('28. continuity QA passes before founder review available', async () => {
    const result = await bootstrapB49();
    expect(result.continuityQA.passed).toBe(true);
    expect(result.continuityQA.result).not.toBe('FAIL');
    expect(result.productionEligibility.founderStoryboardApproval).toBe('ACTIVE');
  });

  it('29. failed QA blocks clean review (contract level)', () => {
    const treatment = buildEntry002ReelTreatmentAuthority();
    const authorities = attachPreStoryboardAuthorityRecords(
      applyStoredPreStoryboardJudgments(
        attachEntry002PreStoryboardFounderAssets(buildEntry002PreStoryboardVisualAuthorities()),
      ),
    );
    const pack = buildEntry002PreStoryboardVisualAuthorityPack(authorities.slice(0, 3));
    expect(() =>
      compileEntry002FinalCinematicStoryboardBrief({ treatment, preStoryboardAuthorityPack: pack }),
    ).toThrow();
  });

  it('30. production order remains intact', async () => {
    const result = await bootstrapB49();
    expect(result.productionOrder[4]).toBe('FINAL_CINEMATIC_STORYBOARD');
    expect(result.productionOrder[5]).toBe('FOUNDER_STORYBOARD_APPROVAL');
    expect(result.pipelineState.currentStage).toBe('FOUNDER_STORYBOARD_APPROVAL');
  });
});
