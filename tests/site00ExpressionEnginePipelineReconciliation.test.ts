import { describe, it, expect } from 'vitest';
import { buildEntry002PipelineReconciliationState, ENTRY_002_ACTIVE_NEXT_ACTION } from '../api/_lib/site00ExpressionEngine/entry002PipelineState.js';
import { buildPreStoryboardApprovalState } from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityGate.js';
import { buildEntry002PreStoryboardVisualAuthorities } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardVisualAuthorities.js';
import { buildEntry002FounderReviewGatesForPipeline } from '../api/_lib/site00ExpressionEngine/entry002ReelProductionGates.js';

describe('Entry 002 pipeline state reconciliation', () => {
  it('locks active gate to GATE_0B_PRE_STORYBOARD_AUTHORITY', () => {
    const state = buildEntry002PipelineReconciliationState();
    expect(state.activeGate.gateId).toBe('GATE_0B_PRE_STORYBOARD_AUTHORITY');
    expect(state.nextAction).toBe(ENTRY_002_ACTIVE_NEXT_ACTION);
    expect(state.currentStage).toBe('PRE_STORYBOARD_VISUAL_AUTHORITIES');
  });

  it('marks structural storyboard as planning only — not active gate', () => {
    const state = buildEntry002PipelineReconciliationState();
    expect(state.structuralStoryboard.role).toBe('PLANNING_NARRATIVE_STRUCTURE');
    expect(state.structuralStoryboard.activeGate).toBe(false);
  });

  it('surfaces only pre-storyboard gate as active in founder gates', () => {
    const authorities = buildEntry002PreStoryboardVisualAuthorities();
    const approval = buildPreStoryboardApprovalState(authorities);
    const gates = buildEntry002FounderReviewGatesForPipeline(approval);
    const active = gates.filter((g) => g.activeGate);
    expect(active).toHaveLength(1);
    expect(active[0]?.gateId).toBe('GATE_0B_PRE_STORYBOARD_AUTHORITY');
    expect(gates.some((g) => g.label.includes('FOUNDER STORYBOARD REVIEW REQUIRED'))).toBe(false);
  });
});
