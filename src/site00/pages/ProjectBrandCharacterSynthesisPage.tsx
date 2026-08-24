import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { BrandCharacterSynthesisStatusPanel } from '../components/validation/BrandCharacterSynthesisStatusPanel';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';
import {
  site00ProjectBrandCharacterArtifactProofsPath,
  site00ProjectBrandCharacterDeepeningPath,
  site00ProjectBrandCharacterReadinessPath,
  site00ProjectPath,
} from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { BrandCharacterSynthesisRun } from '../../../shared/site00-brand-lore/brandCharacterSynthesis/types';
import '../styles/site00-replay-execution.css';

const POLL_MS = 5000;

function formatActionError(err: unknown): string {
  if (err instanceof Site00ProjectsApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Composite synthesis request failed';
}

function readinessAllowsSynthesis(run: BrandCharacterSynthesisRun | null): boolean {
  const state = run?.readinessRefresh?.newState ?? '';
  const override = run?.readinessRefresh?.founderOverride ?? false;
  if (override) return true;
  return state === 'CHARACTER_READY' || state === 'CHARACTER_PARTIAL';
}

export default function ProjectBrandCharacterSynthesisPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandCharacterSynthesisRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentHSynthesisGet(projectSlug);
      const nextRun = (result.run as BrandCharacterSynthesisRun | null) ?? null;
      setRun(nextRun);
      setLastRefreshedAt(new Date());
      if (nextRun?.status === 'SYNTHESIZING' || nextRun?.status === 'SYNTHESIZED') {
        setActionError(null);
      } else if (nextRun?.status === 'FAILED' && nextRun.error) {
        setActionError(nextRun.error);
      }
    } catch (err) {
      setRun(null);
      setActionError(formatActionError(err));
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (run?.status !== 'SYNTHESIZING') return;
    const id = window.setInterval(() => {
      void reload();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [run?.status, reload]);

  const runSynthesis = async (forceRetry = false) => {
    setStarting(true);
    setActionError(null);
    try {
      const result = await site00ProjectsApi.experimentHSynthesisRun(projectSlug, { forceRetry });
      const nextRun = (result.run as BrandCharacterSynthesisRun | null) ?? null;
      setRun(nextRun);
      setLastRefreshedAt(new Date());
      if (nextRun?.status === 'FAILED' && nextRun.error) {
        setActionError(nextRun.error);
      }
    } catch (err) {
      setActionError(formatActionError(err));
    } finally {
      setStarting(false);
    }
  };

  const judge = async (judgment: string) => {
    setStarting(true);
    setActionError(null);
    try {
      const result = await site00ProjectsApi.experimentHSynthesisJudgment(projectSlug, judgment);
      setRun((result.run as BrandCharacterSynthesisRun | null) ?? null);
    } catch (err) {
      setActionError(formatActionError(err));
    } finally {
      setStarting(false);
    }
  };

  const compileSystem = async () => {
    setStarting(true);
    setActionError(null);
    try {
      const result = await site00ProjectsApi.experimentHSynthesisCompileSystem(projectSlug);
      setRun((result.run as BrandCharacterSynthesisRun | null) ?? null);
    } catch (err) {
      setActionError(formatActionError(err));
    } finally {
      setStarting(false);
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
  const isSynthesizing = run?.status === 'SYNTHESIZING';
  const canRun = readinessAllowsSynthesis(run) && !isSynthesizing && !starting;
  const staleReadinessError =
    actionError &&
    actionError.toLowerCase().includes('insufficient') &&
    readinessAllowsSynthesis(run);

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
              <BrandCharacterSynthesisStatusPanel
                run={run}
                starting={starting}
                lastRefreshedAt={lastRefreshedAt}
                onRetry={() => void runSynthesis(true)}
                onRefresh={() => void reload()}
              />

              {actionError && !staleReadinessError && run?.status !== 'SYNTHESIZING' && (
                <section className="site00-experiment-g__panel" role="alert">
                  <h2>Synthesis could not run</h2>
                  <p>{actionError}</p>
                  {actionError.includes('Unknown action') && (
                    <p>The live API may still be deploying — retry in a minute or hard-refresh.</p>
                  )}
                  {actionError.toLowerCase().includes('readiness') && (
                    <>
                      <Link to={site00ProjectBrandCharacterReadinessPath(projectSlug)} className="site00-btn">
                        REVIEW READINESS
                      </Link>
                      <Link to={site00ProjectBrandCharacterDeepeningPath(projectSlug)} className="site00-btn">
                        CONTINUE DEEPENING
                      </Link>
                    </>
                  )}
                </section>
              )}

              {staleReadinessError && (
                <section className="site00-experiment-g__panel">
                  <p>
                    Readiness is now {run?.readinessRefresh?.newState?.replace(/_/g, ' ') ?? 'updated'} — tap{' '}
                    <strong>RUN COMPOSITE SYNTHESIS</strong> again.
                  </p>
                </section>
              )}

              <section className="site00-experiment-g__panel">
                <h2>Readiness refresh</h2>
                <p>
                  {run?.readinessRefresh?.previousState?.replace(/_/g, ' ') ?? '—'} →{' '}
                  {run?.readinessRefresh?.newState?.replace(/_/g, ' ') ?? 'NOT EVALUATED (tap Run to refresh)'}
                </p>
                <p>Deepening answers ingested: {run?.readinessRefresh?.deepeningAnswerCount ?? '—'}</p>
                {run?.readinessRefresh?.remainingBlockers?.length ? (
                  <ul>
                    {run.readinessRefresh.remainingBlockers.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                <button
                  type="button"
                  className="site00-btn site00-btn--primary"
                  disabled={!canRun}
                  onClick={() => void runSynthesis()}
                >
                  {starting
                    ? 'STARTING BACKGROUND SYNTHESIS…'
                    : isSynthesizing
                      ? 'SYNTHESIS RUNNING ON SERVER…'
                      : 'RUN COMPOSITE SYNTHESIS'}
                </button>
                {!readinessAllowsSynthesis(run) && !isSynthesizing && (
                  <p>Character readiness must be PARTIAL or READY before synthesis can start.</p>
                )}
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
                      <button type="button" className="site00-btn site00-btn--primary" disabled={starting} onClick={() => void judge('THATS_NDX')}>
                        THAT&apos;S NDX
                      </button>
                      <button type="button" className="site00-btn" disabled={starting} onClick={() => void judge('PROMISING_DEVELOP')}>
                        PROMISING — DEVELOP
                      </button>
                      <button type="button" className="site00-btn" disabled={starting} onClick={() => void judge('TOO_CLEAN')}>
                        TOO CLEAN
                      </button>
                      <button type="button" className="site00-btn" disabled={starting} onClick={() => void judge('NOT_NDXBOOK')}>
                        NOT NDX
                      </button>
                    </div>
                    {synthesis.founderJudgment && <p>Judgment: {synthesis.founderJudgment.replace(/_/g, ' ')}</p>}
                    {(synthesis.founderJudgment === 'THATS_NDX' || synthesis.founderJudgment === 'LOVE_THIS_CHARACTER') && (
                      <button type="button" className="site00-btn site00-btn--primary" disabled={starting} onClick={() => void compileSystem()}>
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
