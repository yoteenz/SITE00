import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import {
  site00ProjectBrandCharacterArtifactProofsPath,
  site00ProjectBrandCharacterReadinessPath,
  site00ProjectPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { BrandCharacterSynthesisRun } from '../../../shared/site00-brand-lore/brandCharacterSynthesis/types';
import '../styles/site00-replay-execution.css';

export default function ProjectBrandCharacterSynthesisPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandCharacterSynthesisRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentHSynthesisGet(projectSlug);
      setRun((result.run as BrandCharacterSynthesisRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const runSynthesis = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.experimentHSynthesisRun(projectSlug);
      setRun((result.run as BrandCharacterSynthesisRun | null) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const judge = async (judgment: string) => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.experimentHSynthesisJudgment(projectSlug, judgment);
      setRun((result.run as BrandCharacterSynthesisRun | null) ?? null);
    } finally {
      setBusy(false);
    }
  };

  const compileSystem = async () => {
    setBusy(true);
    try {
      const result = await site00ProjectsApi.experimentHSynthesisCompileSystem(projectSlug);
      setRun((result.run as BrandCharacterSynthesisRun | null) ?? null);
    } finally {
      setBusy(false);
    }
  };

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Character Synthesis is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const synthesis = run?.synthesis;
  const maturation = run?.maturationEvaluation;

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">COMPOSITE CHARACTER</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">BRAND CHARACTER SYNTHESIS</p>
            <Link to={site00ProjectBrandCharacterReadinessPath(projectSlug)}>← READINESS</Link>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p>Loading synthesis run…</p>
          ) : (
            <>
              <section className="site00-experiment-g__panel">
                <h2>Readiness refresh</h2>
                <p>
                  {run?.readinessRefresh?.previousState?.replace(/_/g, ' ') ?? '—'} →{' '}
                  {run?.readinessRefresh?.newState.replace(/_/g, ' ') ?? 'NOT EVALUATED'}
                </p>
                <p>Deepening answers ingested: {run?.readinessRefresh?.deepeningAnswerCount ?? 0}</p>
                {run?.readinessRefresh?.remainingBlockers.length ? (
                  <ul>
                    {run.readinessRefresh.remainingBlockers.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void runSynthesis()}>
                  RUN COMPOSITE SYNTHESIS
                </button>
              </section>

              {run?.founderHypothesis && (
                <section className="site00-experiment-g__card">
                  <h3>Founder character hypothesis</h3>
                  <p>
                    <strong>Raw (preserved):</strong> {run.founderHypothesis.rawWording}
                  </p>
                  <p>{run.founderHypothesis.maturationInsight}</p>
                  <p>Classification: {run.founderHypothesis.classification} — NOT Brand Canon</p>
                </section>
              )}

              {synthesis && (
                <>
                  <section className="site00-experiment-g__panel">
                    <h2>NDX THEN → NDX NOW</h2>
                    <div>
                      <strong>Younger instincts</strong>
                      <ul>
                        {synthesis.youngerInstincts.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Matured instincts</strong>
                      <ul>
                        {synthesis.maturedInstincts.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    </div>
                    <p>{synthesis.characterEssence}</p>
                    <p>{synthesis.characterThesis}</p>
                  </section>

                  <section className="site00-experiment-g__card">
                    <h3>Source character DNA</h3>
                    <ul>
                      {synthesis.sourceContributionMap.map((s) => (
                        <li key={s.territoryId}>
                          {s.territoryName} — {s.facultyHypothesis}
                        </li>
                      ))}
                    </ul>
                    <p>{synthesis.whyTheseThreeBelongTogether}</p>
                  </section>

                  <section className="site00-experiment-g__card">
                    <h3>Productive tensions</h3>
                    <ul>
                      {synthesis.productiveTensions.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </section>

                  {maturation && (
                    <section className="site00-experiment-g__card">
                      <h3>Maturation continuity</h3>
                      <p>
                        Sanitization risk: {maturation.personalitySanitizationRisk ? 'YES' : 'NO'} — passes:{' '}
                        {maturation.passesMaturationContinuity ? 'YES' : 'NO'}
                      </p>
                    </section>
                  )}

                  <section className="site00-experiment-g__panel">
                    <h2>Founder character review</h2>
                    <div className="site00-project-setup__actions">
                      <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void judge('THATS_NDX')}>
                        THAT&apos;S NDX
                      </button>
                      <button type="button" className="site00-btn" disabled={busy} onClick={() => void judge('PROMISING_DEVELOP')}>
                        PROMISING — DEVELOP
                      </button>
                      <button type="button" className="site00-btn" disabled={busy} onClick={() => void judge('TOO_CLEAN')}>
                        TOO CLEAN
                      </button>
                      <button type="button" className="site00-btn" disabled={busy} onClick={() => void judge('NOT_NDXBOOK')}>
                        NOT NDX
                      </button>
                    </div>
                    {synthesis.founderJudgment && <p>Judgment: {synthesis.founderJudgment.replace(/_/g, ' ')}</p>}
                    {(synthesis.founderJudgment === 'THATS_NDX' || synthesis.founderJudgment === 'LOVE_THIS_CHARACTER') && (
                      <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void compileSystem()}>
                        COMPILE BRAND CHARACTER SYSTEM
                      </button>
                    )}
                    {run?.characterSystem && (
                      <Link to={site00ProjectBrandCharacterArtifactProofsPath(projectSlug)} className="site00-btn">
                        ARTIFACT PROOF REVIEW →
                      </Link>
                    )}
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
