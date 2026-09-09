import type { EvolveProjectOpsInput } from '../../../../../shared/site00-evolve-operations/types.js';
import { createEvolveOperationsIntelligence } from '../../../../../shared/site00-evolve-operations/index.js';

type ProjectEvolveOpsPanelProps = {
  input: EvolveProjectOpsInput;
  audience?: 'FOUNDER' | 'CLIENT';
};

/** Project-scoped operations view for control room integration. */
export function ProjectEvolveOpsPanel({ input, audience = 'FOUNDER' }: ProjectEvolveOpsPanelProps) {
  const engine = createEvolveOperationsIntelligence();
  const view = engine.analyzeProject(input);
  const display = audience === 'CLIENT' ? view.clientSafe : null;

  if (audience === 'CLIENT' && display) {
    return (
      <section className="site00-project-ops-panel" data-visual-authority="VISUAL_AUTHORITY_REQUIRED">
        <h3>PROJECT STATUS</h3>
        <p>{display.healthLabel}</p>
        <p>{display.creditsRemaining} RUNS LEFT · {display.usagePercent}% USED</p>
        {display.nextAction ? <p>NEXT: {display.nextAction}</p> : null}
      </section>
    );
  }

  return (
    <section className="site00-project-ops-panel" data-visual-authority="VISUAL_AUTHORITY_REQUIRED">
      <h3>EVOLVE OPS · INTERNAL</h3>
      <p>HEALTH: {view.health.health}</p>
      <p>SPEND: {view.spend.health} — {view.spend.internalSummary}</p>
      {view.escalation ? <p>ESCALATION: {view.escalation.level}</p> : null}
      {view.internalMargin ? <p>MARGIN: {view.internalMargin.health}</p> : null}
    </section>
  );
}
