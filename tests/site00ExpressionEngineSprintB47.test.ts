import { describe, it, expect, beforeEach } from 'vitest';
import { bootstrapB47 } from '../api/_lib/site00ExpressionEngine/entry002B47Bootstrap.js';
import { buildEntry002PreStoryboardVisualAuthorities } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardVisualAuthorities.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecord.js';
import {
  buildPreStoryboardApprovalState,
  buildPreStoryboardGateSatisfaction,
} from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityGate.js';
import {
  applyPreStoryboardFounderJudgments,
} from '../api/_lib/site00ExpressionEngine/preStoryboardFounderJudgment.js';
import {
  resetPreStoryboardAuthorityStore,
  recordPreStoryboardAuthorityJudgment,
} from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityStore.js';
import {
  buildEntry002PipelineReconciliationState,
  ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION,
  ENTRY_002_ACTIVE_NEXT_ACTION,
} from '../api/_lib/site00ExpressionEngine/entry002PipelineState.js';
import {
  resolveFinalStoryboardCompilationContract,
  assertAllFiveAuthoritiesResolved,
} from '../api/_lib/site00ExpressionEngine/entry002FinalStoryboardCompilationContract.js';
import { buildEntry002PreStoryboardAuthorityId } from '../shared/site00-expression-engine/preStoryboardAuthorityIds.js';
import { attachEntry002PreStoryboardFounderAssets } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityAssets.js';
import { resetLineageStore, listGenerationReceiptsForEntry } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

function allLoveItJudgments() {
  return {
    AUTHORITY_01: 'LOVE_IT' as const,
    AUTHORITY_02: 'LOVE_IT' as const,
    AUTHORITY_03: 'LOVE_IT' as const,
    AUTHORITY_04: 'LOVE_IT' as const,
    AUTHORITY_05: 'LOVE_IT' as const,
  };
}

describe('Expression Engine Sprint B4.7 — Pre-storyboard authority approval', () => {
  beforeEach(() => {
    resetPreStoryboardAuthorityStore();
    resetLineageStore();
  });

  it('1. five missing judgments => gate blocked', () => {
    const authorities = buildEntry002PreStoryboardVisualAuthorities();
    const approval = buildPreStoryboardApprovalState(authorities);
    expect(approval.allAuthoritiesLoveIt).toBe(false);
    expect(approval.blocksCinematicStoryboard).toBe(true);
  });

  it('2. four LOVE_IT + one UNREVIEWED => gate blocked', () => {
    const authorities = applyPreStoryboardFounderJudgments(
      buildEntry002PreStoryboardVisualAuthorities(),
      {
        AUTHORITY_01: 'LOVE_IT',
        AUTHORITY_02: 'LOVE_IT',
        AUTHORITY_03: 'LOVE_IT',
        AUTHORITY_04: 'LOVE_IT',
      },
    );
    const approval = buildPreStoryboardApprovalState(authorities);
    expect(approval.allAuthoritiesLoveIt).toBe(false);
  });

  it('3. four LOVE_IT + one PROMISING_REFINE => gate blocked', () => {
    const authorities = applyPreStoryboardFounderJudgments(
      buildEntry002PreStoryboardVisualAuthorities(),
      {
        AUTHORITY_01: 'LOVE_IT',
        AUTHORITY_02: 'LOVE_IT',
        AUTHORITY_03: 'LOVE_IT',
        AUTHORITY_04: 'LOVE_IT',
        AUTHORITY_05: 'PROMISING_REFINE',
      },
    );
    expect(buildPreStoryboardApprovalState(authorities).allAuthoritiesLoveIt).toBe(false);
  });

  it('4. four LOVE_IT + one NOT_FOR_ME => gate blocked', () => {
    const authorities = applyPreStoryboardFounderJudgments(
      buildEntry002PreStoryboardVisualAuthorities(),
      {
        AUTHORITY_01: 'LOVE_IT',
        AUTHORITY_02: 'LOVE_IT',
        AUTHORITY_03: 'LOVE_IT',
        AUTHORITY_04: 'LOVE_IT',
        AUTHORITY_05: 'NOT_FOR_ME',
      },
    );
    expect(buildPreStoryboardApprovalState(authorities).allAuthoritiesLoveIt).toBe(false);
  });

  it('5. all five LOVE_IT => gate satisfied', () => {
    const authorities = applyPreStoryboardFounderJudgments(
      buildEntry002PreStoryboardVisualAuthorities(),
      allLoveItJudgments(),
    );
    const satisfaction = buildPreStoryboardGateSatisfaction(authorities);
    expect(satisfaction.satisfied).toBe(true);
    expect(satisfaction.loveItCount).toBe(5);
  });

  it('6. final storyboard blocked until all five LOVE_IT', () => {
    const blocked = buildEntry002PipelineReconciliationState(
      buildPreStoryboardApprovalState(buildEntry002PreStoryboardVisualAuthorities()),
    );
    expect(blocked.finalStoryboard.status).toBe('BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL');
  });

  it('7. final storyboard READY_FOR_GENERATION after all five LOVE_IT', () => {
    const authorities = applyPreStoryboardFounderJudgments(
      buildEntry002PreStoryboardVisualAuthorities(),
      allLoveItJudgments(),
    );
    const ready = buildEntry002PipelineReconciliationState(buildPreStoryboardApprovalState(authorities));
    expect(ready.finalStoryboard.status).toBe('READY_FOR_GENERATION');
    expect(ready.preStoryboardVisualAuthorities).toBe('GATE_SATISFIED');
  });

  it('8. final storyboard is not automatically approved', () => {
    const authorities = applyPreStoryboardFounderJudgments(
      buildEntry002PreStoryboardVisualAuthorities(),
      allLoveItJudgments(),
    );
    const state = buildEntry002PipelineReconciliationState(buildPreStoryboardApprovalState(authorities));
    expect(state.finalStoryboard.autoApproved).toBe(false);
  });

  it('9. keyframes remain blocked after authority gate satisfaction', async () => {
    applyPreStoryboardFounderJudgments(buildEntry002PreStoryboardVisualAuthorities(), allLoveItJudgments());
    const result = await bootstrapB47();
    expect(result.keyframes).toBe('BLOCKED');
  });

  it('10. video remains blocked after authority gate satisfaction', async () => {
    applyPreStoryboardFounderJudgments(buildEntry002PreStoryboardVisualAuthorities(), allLoveItJudgments());
    const result = await bootstrapB47();
    expect(result.video).toBe('BLOCKED');
  });

  it('11. cinematic sequence remains PRE_AUTHORITY_EXPERIMENT / NON_CANON', async () => {
    const result = await bootstrapB47();
    expect(result.cinematicSequence.status).toBe('PRE_AUTHORITY_EXPERIMENT');
    expect(result.cinematicSequence.canonState).toBe('NON_CANON');
    expect(result.cinematicSequence.visualAuthority).toBe(false);
  });

  it('12. structural storyboard remains planning-only in pipeline state', async () => {
    const result = await bootstrapB47();
    expect(result.pipelineState.structuralStoryboard.role).toBe('PLANNING_NARRATIVE_STRUCTURE');
    expect(result.pipelineState.structuralStoryboard.activeGate).toBe(false);
  });

  it('13. UI next action reflects founder review before gate satisfaction', async () => {
    const result = await bootstrapB47();
    expect(result.nextAction).toBe(ENTRY_002_ACTIVE_NEXT_ACTION);
    expect(result.pipelineState.nextAction).toBe(ENTRY_002_ACTIVE_NEXT_ACTION);
  });

  it('14. next action changes to final storyboard generation after gate satisfaction', async () => {
    applyPreStoryboardFounderJudgments(buildEntry002PreStoryboardVisualAuthorities(), allLoveItJudgments());
    const result = await bootstrapB47();
    expect(result.nextAction).toBe(ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION);
    expect(result.pipelineState.nextAction).toBe(ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION);
  });

  it('15. no provider dispatch telemetry for authority reconciliation bootstrap', async () => {
    await bootstrapB47();
    const receipts = listGenerationReceiptsForEntry('entry-002');
    const authorityReceipts = receipts.filter((r) =>
      r.promptLineage?.includes('PRE_STORYBOARD_VISUAL_AUTHORITY'),
    );
    expect(authorityReceipts).toHaveLength(0);
    expect((await bootstrapB47()).telemetryNote).toContain('no provider dispatch');
  });

  it('16. required authority IDs are stable and deterministic', () => {
    expect(buildEntry002PreStoryboardAuthorityId(1)).toBe('NDX-ENTRY-002-PRE-SBA-NDX-PRESENCE-001');
    expect(buildEntry002PreStoryboardAuthorityId(2)).toBe('NDX-ENTRY-002-PRE-SBA-SUBJECT-DUAL-ERA-001');
    expect(buildEntry002PreStoryboardAuthorityId(3)).toBe('NDX-ENTRY-002-PRE-SBA-NDX-HANDS-001');
    expect(buildEntry002PreStoryboardAuthorityId(4)).toBe('NDX-ENTRY-002-PRE-SBA-FASHION-CONTINUITY-001');
    expect(buildEntry002PreStoryboardAuthorityId(5)).toBe('NDX-ENTRY-002-PRE-SBA-PHONE-GLITCH-001');
  });

  it('17. NDX and subject authority domains remain structurally separate', () => {
    const authorities = buildEntry002PreStoryboardVisualAuthorities();
    const ndxRoles = authorities.filter((a) => a.role.includes('NDX'));
    const subjectRoles = authorities.filter((a) => a.role.includes('SUBJECT') || a.role.includes('FASHION'));
    expect(ndxRoles.length).toBe(2);
    expect(subjectRoles.length).toBe(2);
    for (const ndx of ndxRoles) {
      expect(ndx.continuityRules.join(' ').toLowerCase()).toContain('ndx');
    }
  });

  it('18. storyboard compilation contract resolves all five authorities', () => {
    const pack = buildEntry002PreStoryboardVisualAuthorityPack(
      attachEntry002PreStoryboardFounderAssets(buildEntry002PreStoryboardVisualAuthorities()),
    );
    const contract = resolveFinalStoryboardCompilationContract(pack);
    assertAllFiveAuthoritiesResolved(contract);
    expect(contract.authorities.ndxPresenceAuthority?.boardId).toBe(
      'NDX-ENTRY-002-PRE-SBA-NDX-PRESENCE-001',
    );
    expect(contract.nailSeparation.ndx).toBe('SHORT_LIME_GREEN_NAILS');
    expect(contract.nailSeparation.subject).toBe('FRENCH_TIPS');
  });

  it('19. founder-approved visual assets linked to all five authorities', async () => {
    const result = await bootstrapB47();
    for (const authority of result.preStoryboardAuthorityPack.authorities) {
      expect(authority.previewUrl).toMatch(/pre-storyboard-authority/);
      expect(authority.storagePath).toMatch(/public\/assets/);
    }
  });

  it('20. persisted founder judgment survives bootstrap reload', async () => {
    recordPreStoryboardAuthorityJudgment({
      authorityKey: 'AUTHORITY_01',
      authorityId: 'NDX-ENTRY-002-PRE-SBA-NDX-PRESENCE-001',
      founderJudgment: 'LOVE_IT',
    });
    const result = await bootstrapB47();
    const board1 = result.preStoryboardAuthorityPack.authorities.find((a) => a.boardNumber === 1);
    expect(board1?.founderJudgment).toBe('LOVE_IT');
    expect(board1?.record?.visualAuthority).toBe(true);
  });
});
