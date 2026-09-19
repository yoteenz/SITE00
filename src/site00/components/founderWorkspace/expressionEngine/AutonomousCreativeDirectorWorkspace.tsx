/**
 * C1.1 — Founder-facing Autonomous Creative Director review (visual hierarchy).
 */

import type { CreativeDirectorRun } from '../../../../../shared/site00-expression-engine/creative-director/types.js';

type Props = {
  run: CreativeDirectorRun | null;
  onJudgment?: (
    j:
      | 'LOVE_IT'
      | 'PUSH_FURTHER'
      | 'TOO_SAFE'
      | 'TOO_CLOSE'
      | 'CHANGE_THE_WORLD'
      | 'CHANGE_THE_ROLE'
      | 'REVISE'
      | 'NOT_FOR_ME',
  ) => void;
  judging?: boolean;
};

export function AutonomousCreativeDirectorWorkspace({ run, onJudgment, judging }: Props) {
  if (!run) {
    return <p className="site00-expr-engine-panel__meta">Autonomous Creative Director run not available.</p>;
  }

  const winner = run.territories.find((t) => t.territoryId === run.winningDirection.territoryId);

  const sections = [
    { n: '01', title: 'CULTURAL READ', body: run.culturalRead.uncomfortableTruth },
    {
      n: '02',
      title: 'CREATIVE LEAP',
      body: `${run.deeperReframe.creativeReframe} · Not: ${run.obviousVersion.summary.slice(0, 80)}…`,
    },
    { n: '03', title: 'STORY', body: run.narrativeSynthesis?.narrativeSpine.beats.map((b) => b.whatHappens).join(' → ') ?? 'Pending' },
    {
      n: '04',
      title: 'ROLES',
      body: `NDX: ${run.roleSynthesis.ndxRole} · SUBJECT: ${run.roleSynthesis.subjectRole} · AUDIENCE: ${run.roleSynthesis.audienceRole}`,
    },
    {
      n: '05',
      title: 'WORLD + ARTIFACT',
      body: `${winner?.world ?? run.winningDirection.territoryName} — ${winner?.worldFunction ?? ''} · ARTIFACT: ${winner?.artifact ?? 'derived'} — ${winner?.artifactFunction ?? ''}`,
    },
    {
      n: '06',
      title: 'TURN + PAYOFF',
      body: `${run.turningPoint.turnEvent} · ${run.payoffAftershock.intellectualPayoff} · Aftershock: ${run.payoffAftershock.aftershock}`,
    },
    { n: '07', title: 'DIRECTORIAL IDEA', body: run.directorialConception.cameraLanguage },
    {
      n: '08',
      title: 'AUTHORITY PLAN',
      body: run.visualAuthorityPlan.map((a) => `${a.authorityName} (${a.priority})`).join(' · '),
    },
    {
      n: '09',
      title: 'SELF-CRITIQUE',
      body: run.selfCritique.failureClasses.join(', ') || 'No blocking failures — substantive maturity pass',
    },
    {
      n: '10',
      title: 'FOUNDER REVIEW',
      body: `Intervention dependency: ${run.founderInterventionDependency} · Judgment: ${run.founderJudgment}`,
    },
  ];

  return (
    <section className="site00-ee-creative-director">
      <header>
        <span className="site00-ee-creative-director__kicker">AUTONOMOUS CREATIVE DIRECTOR · C1.1</span>
        <h2>{run.brief.subject}</h2>
        <p className="site00-ee-creative-director__thesis">{run.brief.thesis}</p>
        <div className="site00-ee-creative-director__meta">
          <span>WINNER — {run.winningDirection.territoryName}</span>
          <span>MATURITY — {run.creativeMaturity.substantivePass ? 'SUBSTANTIVE' : 'REVIEW'}</span>
          <span>DEPENDENCY — {run.founderInterventionDependency}</span>
          <span>LLM — {run.llmProviderUsed}</span>
        </div>
      </header>

      <div className="site00-ee-creative-director__sections">
        {sections.map((s) => (
          <details key={s.n} className="site00-ee-creative-director__block" open={s.n === '01' || s.n === '10'}>
            <summary>
              <span>{s.n}</span> {s.title}
            </summary>
            <p>{s.body}</p>
          </details>
        ))}
      </div>

      {onJudgment ? (
        <div className="site00-ee-creative-director__judgment">
          <button type="button" className="site00-btn site00-btn--primary" disabled={judging} onClick={() => onJudgment('LOVE_IT')}>LOVE IT</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('PUSH_FURTHER')}>PUSH FURTHER</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('TOO_SAFE')}>TOO SAFE</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('TOO_CLOSE')}>TOO CLOSE</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('CHANGE_THE_WORLD')}>CHANGE THE WORLD</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('CHANGE_THE_ROLE')}>CHANGE THE ROLE</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('REVISE')}>REVISE</button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('NOT_FOR_ME')}>NOT FOR ME</button>
        </div>
      ) : null}
    </section>
  );
}
