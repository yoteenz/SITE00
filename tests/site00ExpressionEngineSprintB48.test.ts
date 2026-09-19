import { describe, it, expect, beforeEach } from 'vitest';
import { bootstrapB48 } from '../api/_lib/site00ExpressionEngine/entry002B48Bootstrap.js';
import { bootstrapB47 } from '../api/_lib/site00ExpressionEngine/entry002B47Bootstrap.js';
import {
  resetPreStoryboardAuthorityStore,
  persistEntry002PreStoryboardFounderApprovals,
} from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityStore.js';
import {
  ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
  ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS,
} from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardFounderApproval.js';
import {
  buildEntry002PipelineReconciliationState,
  ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION,
} from '../api/_lib/site00ExpressionEngine/entry002PipelineState.js';
import { buildPreStoryboardApprovalState } from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityGate.js';
import { buildEntry002PreStoryboardVisualAuthorities } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardVisualAuthorities.js';
import { applyStoredPreStoryboardJudgments } from '../api/_lib/site00ExpressionEngine/preStoryboardFounderJudgment.js';
import { attachPreStoryboardAuthorityRecords } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecordBuilder.js';
import { attachEntry002PreStoryboardFounderAssets } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityAssets.js';
import {
  resolveFinalStoryboardCompilationContract,
  assertStoryboardCompilationFailClosed,
} from '../api/_lib/site00ExpressionEngine/entry002FinalStoryboardCompilationContract.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecord.js';
import { buildEntry002FounderReviewGatesForPipeline } from '../api/_lib/site00ExpressionEngine/entry002ReelProductionGates.js';
import { resetLineageStore, listGenerationReceiptsForEntry } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

describe('Expression Engine Sprint B4.8 — Pre-storyboard gate satisfaction', () => {
  beforeEach(() => {
    resetPreStoryboardAuthorityStore();
    resetLineageStore();
  });

  it('1. all five specified authority records resolve', async () => {
    const result = await bootstrapB48();
    expect(result.preStoryboardAuthorityPack.authorities).toHaveLength(5);
    for (const expected of ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS) {
      const board = result.preStoryboardAuthorityPack.authorities.find(
        (a) => a.boardId === expected.authorityId,
      );
      expect(board).toBeTruthy();
    }
  });

  it('2. all five founder judgments persist as LOVE_IT', async () => {
    const result = await bootstrapB48();
    for (const board of result.preStoryboardAuthorityPack.authorities) {
      expect(board.founderJudgment).toBe('LOVE_IT');
    }
  });

  it('3. all five remain visualAuthority=true', async () => {
    const result = await bootstrapB48();
    expect(result.authorityRecords.allVisualAuthority).toBe(true);
    for (const record of result.authorityRecords.records) {
      expect(record.visualAuthority).toBe(true);
      expect(record.canon).toBe(true);
      expect(record.status).toBe('APPROVED');
    }
  });

  it('4. GATE_0B_PRE_STORYBOARD_AUTHORITY becomes SATISFIED', async () => {
    const result = await bootstrapB48();
    expect(result.preStoryboardGate.gateStatus).toBe('SATISFIED');
    expect(result.gateSatisfaction.satisfied).toBe(true);
  });

  it('5. approvedAuthorityCount = 5', async () => {
    const result = await bootstrapB48();
    expect(result.productionEligibility.approvedAuthorityCount).toBe(5);
    expect(result.productionEligibility.requiredAuthorityCount).toBe(5);
  });

  it('6. final storyboard transitions from blocked to ready', async () => {
    const blocked = buildEntry002PipelineReconciliationState({
      preStoryboardApproval: buildPreStoryboardApprovalState(buildEntry002PreStoryboardVisualAuthorities()),
    });
    expect(blocked.finalStoryboard.status).toBe('BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL');

    const result = await bootstrapB48();
    expect(result.finalStoryboardEligibility.status).toBe('READY_FOR_GENERATION');
  });

  it('7. final storyboard does NOT become approved automatically', async () => {
    const result = await bootstrapB48();
    expect(result.finalStoryboardRecord.approved).toBe(false);
    expect(result.finalStoryboardRecord.rendered).toBe(false);
    expect(result.pipelineState.finalStoryboard.autoApproved).toBe(false);
  });

  it('8. next action becomes final cinematic storyboard generation', async () => {
    const result = await bootstrapB48();
    expect(result.nextAction).toBe(ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION);
    expect(result.pipelineState.nextAction).toBe(ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION);
  });

  it('9. structural storyboard remains planning-only', async () => {
    const result = await bootstrapB48();
    expect(result.pipelineState.structuralStoryboard.role).toBe('PLANNING_NARRATIVE_STRUCTURE');
    expect(result.pipelineState.structuralStoryboard.activeGate).toBe(false);
  });

  it('10. historical cinematic sequence remains PRE_AUTHORITY_EXPERIMENT', async () => {
    const result = await bootstrapB48();
    expect(result.cinematicSequence.status).toBe('PRE_AUTHORITY_EXPERIMENT');
  });

  it('11. historical cinematic sequence remains NON_CANON', async () => {
    const result = await bootstrapB48();
    expect(result.cinematicSequence.canonState).toBe('NON_CANON');
  });

  it('12. historical cinematic sequence remains referenceOnly=true', async () => {
    const result = await bootstrapB48();
    expect(result.cinematicSequence.visualAuthority).toBe(false);
    expect(result.pipelineState.cinematicSequence.referenceOnly).toBe(true);
    expect(result.pipelineState.cinematicSequence.active).toBe(false);
  });

  it('13. keyframes remain blocked', async () => {
    const result = await bootstrapB48();
    expect(result.keyframes).toBe('BLOCKED');
    expect(result.productionEligibility.keyframeEligibility).toBe('BLOCKED');
  });

  it('14. video remains blocked', async () => {
    const result = await bootstrapB48();
    expect(result.video).toBe('BLOCKED');
    expect(result.productionEligibility.videoEligibility).toBe('BLOCKED');
  });

  it('15. UI/API no longer reports pre-storyboard approval as pending', async () => {
    const result = await bootstrapB48();
    expect(result.productionEligibility.preStoryboardAuthorityGate).toBe('SATISFIED');
    expect(result.pipelineState.founderPreStoryboardAuthorityApproval).toBe('SATISFIED');
    expect(result.preStoryboardAuthorityPack.approvalState.allAuthoritiesLoveIt).toBe(true);
  });

  it('16. founder gates do not show storyboard review as active', async () => {
    const result = await bootstrapB48();
    const active = result.founderGates.filter((g) => g.activeGate);
    expect(active).toHaveLength(1);
    expect(active[0]?.gateId).toBe('FINAL_CINEMATIC_STORYBOARD');
    expect(result.founderGates.some((g) => g.label.includes('FOUNDER STORYBOARD REVIEW REQUIRED'))).toBe(
      false,
    );
  });

  it('17. all five authority domains available to storyboard compilation', async () => {
    const result = await bootstrapB48();
    assertStoryboardCompilationFailClosed(result.storyboardCompilationContract);
    expect(result.storyboardCompilationContract.readyForCompilation).toBe(true);
  });

  it('18. storyboard generation fails closed if authority unresolved', () => {
    const pack = buildEntry002PreStoryboardVisualAuthorityPack(
      attachEntry002PreStoryboardFounderAssets(buildEntry002PreStoryboardVisualAuthorities()).slice(0, 4),
    );
    const contract = resolveFinalStoryboardCompilationContract(pack);
    expect(() => assertStoryboardCompilationFailClosed(contract)).toThrow();
  });

  it('19. NDX and subject-woman authority domains remain separate', async () => {
    const result = await bootstrapB48();
    const ndx = result.preStoryboardAuthorityPack.authorities.filter((a) => a.role.includes('NDX'));
    const subject = result.preStoryboardAuthorityPack.authorities.filter((a) =>
      a.role.includes('SUBJECT'),
    );
    expect(ndx.length).toBe(2);
    expect(subject.length).toBe(2);
  });

  it('20. provider telemetry records zero dispatches for state-only work', async () => {
    await bootstrapB48();
    const receipts = listGenerationReceiptsForEntry('entry-002');
    expect(receipts.filter((r) => r.promptLineage?.includes('PRE_STORYBOARD'))).toHaveLength(0);
  });

  it('21. production-order tests remain valid after gate satisfaction', async () => {
    const result = await bootstrapB48();
    expect(result.productionOrder.indexOf('PRE_STORYBOARD_VISUAL_AUTHORITIES')).toBeLessThan(
      result.productionOrder.indexOf('FINAL_CINEMATIC_STORYBOARD'),
    );
  });

  it('22. authority version is 001 for all approved boards', async () => {
    const result = await bootstrapB48();
    expect(result.authorityVersion).toBe(ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION);
    for (const record of result.authorityRecords.records) {
      expect(record.version).toBe('001');
    }
  });

  it('23. B47 without persisted approvals remains blocked (regression)', async () => {
    const result = await bootstrapB47();
    expect(result.gateSatisfaction.satisfied).toBe(false);
    expect(result.finalStoryboardEligibility.status).toBe(
      'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL',
    );
  });

  it('24. founder gates shift active gate to final storyboard when satisfied', async () => {
    persistEntry002PreStoryboardFounderApprovals();
    const authorities = attachPreStoryboardAuthorityRecords(
      applyStoredPreStoryboardJudgments(
        attachEntry002PreStoryboardFounderAssets(buildEntry002PreStoryboardVisualAuthorities()),
      ),
    );
    const approval = buildPreStoryboardApprovalState(authorities);
    const gates = buildEntry002FounderReviewGatesForPipeline(approval);
    expect(gates.find((g) => g.activeGate)?.gateId).toBe('FINAL_CINEMATIC_STORYBOARD');
  });
});
