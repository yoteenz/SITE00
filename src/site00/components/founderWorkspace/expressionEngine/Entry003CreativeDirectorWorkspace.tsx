/**
 * C1.2 — Entry 003 autonomous creative director founder review (12-section progressive disclosure).
 */

import type { Entry003C14Package } from '../../../../../shared/site00-expression-engine/entry-003/types.js';

type Judgment =
  | 'LOVE_IT'
  | 'PUSH_FURTHER'
  | 'TOO_SAFE'
  | 'TOO_CLOSE'
  | 'CHANGE_THE_WORLD'
  | 'CHANGE_THE_ROLE'
  | 'REVISE'
  | 'NOT_FOR_ME';

type Props = {
  pkg: Entry003C14Package | null;
  onJudgment?: (j: Judgment) => void;
  judging?: boolean;
};

export function Entry003CreativeDirectorWorkspace({ pkg, onJudgment, judging }: Props) {
  if (!pkg) {
    return <p className="site00-expr-engine-panel__meta">Entry 003 creative package not available.</p>;
  }

  const run = pkg.creativeDirectorRun;
  const winner = run.territories.find((t) => t.territoryId === run.winningDirection.territoryId);
  const sel = pkg.subjectSelection;
  const read = pkg.extendedCulturalRead;
  const spine =
    run.narrativeSynthesis?.narrativeSpine.beats.map((b) => b.whatHappens).join(' → ') ?? 'Pending';

  const sections = [
    {
      n: '01',
      title: 'CULTURAL READ',
      body: `${read.surfaceRead} · ${read.whatThisIsReallyAbout}`,
    },
    {
      n: '02',
      title: 'THE CREATIVE LEAP',
      body: `${run.deeperReframe.creativeReframe} · Not: ${run.obviousVersion.summary.slice(0, 90)}…`,
    },
    {
      n: '03',
      title: 'WINNING TERRITORY',
      body: `${run.winningDirection.territoryName} — ${run.winningDirection.whyItWins.slice(0, 120)}…`,
    },
    { n: '04', title: 'STORY', body: spine },
    {
      n: '05',
      title: 'ROLES',
      body: `NDX: ${run.roleSynthesis.ndxRole} · SUBJECT: ${run.roleSynthesis.subjectRole} · WORLD: ${pkg.worldRecord.worldName} · ARTIFACT: ${pkg.artifactRecord.artifact ?? 'NONE'}`,
    },
    {
      n: '06',
      title: 'TURN + CONTRADICTION',
      body: `${run.turningPoint.turnEvent} · A: ${run.contradiction.positionA.slice(0, 60)}… vs B: ${run.contradiction.positionB.slice(0, 60)}…`,
    },
    { n: '07', title: 'INTERJECTION', body: run.selectedInterjection },
    {
      n: '08',
      title: 'PAYOFF + AFTERSHOCK',
      body: `${run.payoffAftershock.intellectualPayoff} · ${run.payoffAftershock.aftershock}`,
    },
    {
      n: '09',
      title: 'DIRECTORIAL CONCEPTION',
      body: `${run.directorialConception.cameraLanguage} · ${run.directorialConception.pacing}`,
    },
    {
      n: '10',
      title: 'VISUAL AUTHORITY PLAN',
      body: run.visualAuthorityPlan.map((a) => `${a.authorityName} (${a.priority})`).join(' · '),
    },
    {
      n: '11',
      title: 'SELF-CRITIQUE',
      body:
        run.selfCritique.failureClasses.join(', ') ||
        `Dependency ${pkg.founderInterventionDependency} · Maturity ${pkg.creativeMaturity.substantivePass ? 'SUBSTANTIVE' : 'REVIEW'}`,
    },
    {
      n: '12',
      title: 'FOUNDER REVIEW',
      body: `Gate ${pkg.gateId} · Status ${pkg.status} · Judgment ${pkg.founderJudgment}`,
    },
  ];

  return (
    <section className="site00-ee-entry-003">
      <header>
        <span className="site00-ee-entry-003__kicker">ENTRY 003 · CINEMATIC CONTINUITY · C1.3</span>
        <h2>{sel.workingTitle}</h2>
        <p className="site00-ee-entry-003__subject">{sel.subject}</p>
        <p className="site00-ee-entry-003__thesis">{sel.thesis}</p>
        <div className="site00-ee-entry-003__meta">
          <span>TERRITORY — {winner?.name ?? run.winningDirection.territoryName}</span>
          <span>MATURITY — {pkg.creativeMaturity.substantivePass ? 'SUBSTANTIVE' : 'REVIEW'}</span>
          <span>DEPENDENCY — {pkg.founderInterventionDependency}</span>
          <span>CANDIDATES — {pkg.subjectCandidates.length}</span>
        </div>
      </header>

      <div className="site00-ee-entry-003__sections">
        {sections.map((s) => (
          <details key={s.n} className="site00-ee-entry-003__block" open={s.n === '01' || s.n === '12'}>
            <summary>
              <span>{s.n}</span> {s.title}
            </summary>
            <p>{s.body}</p>
          </details>
        ))}
      </div>

      {onJudgment ? (
        <div className="site00-ee-entry-003__judgment">
          <button type="button" className="site00-btn site00-btn--primary" disabled={judging} onClick={() => onJudgment('LOVE_IT')}>
            LOVE IT
          </button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('PUSH_FURTHER')}>
            PUSH FURTHER
          </button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('TOO_SAFE')}>
            TOO SAFE
          </button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('TOO_CLOSE')}>
            TOO CLOSE
          </button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('CHANGE_THE_WORLD')}>
            CHANGE THE WORLD
          </button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('CHANGE_THE_ROLE')}>
            CHANGE THE ROLE
          </button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('REVISE')}>
            REVISE
          </button>
          <button type="button" className="site00-btn" disabled={judging} onClick={() => onJudgment('NOT_FOR_ME')}>
            NOT FOR ME
          </button>
        </div>
      ) : null}
    </section>
  );
}
