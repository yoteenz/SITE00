/**
 * C1.0 — Founder-facing Narrative Synthesis review panel.
 */

import type { NarrativeSynthesis } from '../../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

type Props = {
  synthesis: NarrativeSynthesis | null;
  onJudgment?: (j: 'LOVE_IT' | 'PUSH_FURTHER' | 'TOO_SAFE' | 'TOO_CLOSE' | 'PROMISING_REFINE' | 'NOT_FOR_ME') => void;
  judging?: boolean;
};

export function NarrativeSynthesisWorkspace({ synthesis, onJudgment, judging }: Props) {
  if (!synthesis) {
    return <p className="site00-expr-engine-panel__meta">Narrative synthesis not compiled for this Entry.</p>;
  }

  return (
    <section className="site00-ee-narrative-synthesis">
      <header>
        <span className="site00-ee-narrative-synthesis__kicker">NARRATIVE SYNTHESIS</span>
        <h2>{synthesis.centralQuestion}</h2>
        <p className="site00-ee-narrative-synthesis__premise">{synthesis.dramaticPremise}</p>
      </header>

      <div className="site00-ee-narrative-synthesis__roles">
        <RoleChip label="NDX" value={`${synthesis.roleIntelligence.ndxRole}`} />
        <RoleChip label="SUBJECT" value={`${synthesis.roleIntelligence.subjectRole}`} />
        <RoleChip label="WORLD" value={`${synthesis.roleIntelligence.worldFunction}`} />
        <RoleChip label="ARTIFACT" value={`${synthesis.roleIntelligence.artifactRole}`} />
      </div>

      <ol className="site00-ee-narrative-synthesis__spine">
        {synthesis.narrativeSpine.beats.map((beat) => (
          <li key={beat.beatId}>
            <span className="site00-ee-narrative-synthesis__beat-type">{beat.beatType}</span>
            <strong>{beat.whatHappens}</strong>
            <p>{beat.whyItHappensNow}</p>
          </li>
        ))}
      </ol>

      <div className="site00-ee-narrative-synthesis__qa">
        <span>COHESION QA — {synthesis.qaStatus.passed ? 'PASS' : 'REVIEW'}</span>
        <span>ORDER — {synthesis.causalBeatGraph.orderDependency}</span>
        <span>REVEAL — {synthesis.revealStrategy.primaryMode}</span>
      </div>

      {onJudgment ? (
        <div className="site00-ee-narrative-synthesis__judgment">
          <button type="button" className="site00-btn site00-btn--primary" disabled={judging} onClick={() => onJudgment('LOVE_IT')}>LOVE IT</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('PUSH_FURTHER')}>PUSH FURTHER</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('TOO_SAFE')}>TOO SAFE</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('PROMISING_REFINE')}>REVISE</button>
        </div>
      ) : null}
    </section>
  );
}

function RoleChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="site00-ee-narrative-synthesis__role-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
