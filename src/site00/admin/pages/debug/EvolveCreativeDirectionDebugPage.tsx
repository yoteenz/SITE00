import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { renderTerritoryView, territoryRendererKeyFromIndex } from '../../../components/evolve/creative-direction/TerritoryRendererRegistry';
import '../../../styles/site00-creative-direction.css';

type Territory = {
  id: string;
  index: number;
  name: string;
  rendererKey: string;
  specimens: Array<{ id: string; specimenType: string; title: string; status: string }>;
};

type ComparisonSetSummary = {
  directionCount?: number;
  v1CompletionStatus?: {
    required?: boolean;
    overlaysApplied?: number;
    missingByDirection?: Record<string, string[]>;
  };
  proofAssetsByDirection?: Record<string, Record<string, { productionState?: string }>>;
  directions?: Array<{ directionName?: string; fieldCompleteness?: { complete?: boolean } }>;
};

type ProductionJob = {
  id?: string;
  status?: string;
  phase?: string;
  jobType?: string;
  progress?: { current?: number; total?: number; label?: string };
  errorMessage?: string | null;
  result?: Record<string, unknown> | null;
  updatedAt?: string;
};

const ORG_SLUG = 'ndxbook';
const POLL_MS = 5000;

function countReadyProofs(proofAssets?: ComparisonSetSummary['proofAssetsByDirection']): number {
  if (!proofAssets) return 0;
  let count = 0;
  for (const byType of Object.values(proofAssets)) {
    for (const asset of Object.values(byType ?? {})) {
      if (asset?.productionState === 'READY') count += 1;
    }
  }
  return count;
}

function isJobActive(job: ProductionJob | null): boolean {
  return job?.status === 'queued' || job?.status === 'running';
}

export default function EvolveCreativeDirectionDebugPage() {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [inspector, setInspector] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [structuralDiff, setStructuralDiff] = useState(false);
  const [includeAllProofTypes, setIncludeAllProofTypes] = useState(true);
  const [activeJob, setActiveJob] = useState<ProductionJob | null>(null);
  const [startingJob, setStartingJob] = useState(false);
  const [productionError, setProductionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    const [debugPayload, formationInspector] = await Promise.all([
      site00EvolveApi.creativeDirectionDebug(ORG_SLUG),
      site00EvolveApi.creativeDirectionFormationInspector(ORG_SLUG),
    ]);
    setPayload(debugPayload);
    setInspector(formationInspector);
  }, []);

  const pollJob = useCallback(async (jobId?: string) => {
    const { job } = await site00EvolveApi.creativeDirectionProductionJob(ORG_SLUG, jobId);
    setActiveJob(job);
    if (job?.status === 'completed') {
      await reload();
    }
    return job;
  }, [reload]);

  useEffect(() => {
    reload().catch((e) => {
      const msg = e instanceof Error ? e.message : 'LOAD FAILED';
      setError(msg);
    });
    pollJob().catch(() => {
      /* no job yet is fine */
    });
  }, [reload, pollJob]);

  useEffect(() => {
    if (!isJobActive(activeJob)) return undefined;
    const id = window.setInterval(() => {
      void pollJob(activeJob?.id).catch((e) => {
        setProductionError(e instanceof Error ? e.message : 'JOB POLL FAILED');
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [activeJob, pollJob]);

  const comparisonSet = (payload?.founderComparisonSet ?? null) as ComparisonSetSummary | null;
  const readyProofCount = useMemo(
    () => countReadyProofs(comparisonSet?.proofAssetsByDirection),
    [comparisonSet?.proofAssetsByDirection],
  );
  const incompleteDirections = useMemo(
    () =>
      comparisonSet?.directions
        ?.filter((d) => !d.fieldCompleteness?.complete)
        .map((d) => d.directionName)
        .filter(Boolean) ?? [],
    [comparisonSet?.directions],
  );

  async function startBackgroundJob(
    jobType: 'v1_completion' | 'six_direction_proofs' | 'full_pipeline',
  ) {
    setStartingJob(true);
    setProductionError(null);
    try {
      const { job, message } = await site00EvolveApi.creativeDirectionStartProductionJob(ORG_SLUG, {
        jobType,
        includeAllProofTypes,
      });
      setActiveJob(job);
      if (message) {
        setProductionError(null);
      }
    } catch (e) {
      setProductionError(e instanceof Error ? e.message : 'FAILED TO START JOB');
    } finally {
      setStartingJob(false);
    }
  }

  const engagement = payload?.engagement as { territories?: Territory[] } | undefined;
  const territories = engagement?.territories ?? [];
  const formation = inspector?.formation as Record<string, unknown> | null | undefined;
  const formationMeta = inspector?.inspector as Record<string, unknown> | null | undefined;
  const jobRunning = isJobActive(activeJob) || startingJob;

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <h1 className="site00-admin-page-title">[ CREATIVE DIRECTION DEBUG ]</h1>
        <p className="site00-admin-page-subtitle">NDXBOOK · background production · formation inspector</p>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      <section className="site00-admin-panel site00-cd-production-panel" aria-labelledby="cd-production-controls">
        <h2 id="cd-production-controls" className="site00-admin-panel-title">
          SIX-DIRECTION PRODUCTION
        </h2>
        <p className="site00-cd-production-panel__lead">
          Jobs run on Railway in the background. Tap once, then you can leave this page — come back anytime and tap
          Refresh Status. Uses <strong>api.site00.com</strong> (not the fsbw-dev preview API).
        </p>
        {error?.includes('Sign in required') ? (
          <p className="site00-admin-panel site00-admin-panel--error">
            You must be signed in for production controls. Preview admin bypass does not apply to the API — sign in
            first, then reload.
          </p>
        ) : null}

        <dl className="site00-cd-production-panel__status">
          <div>
            <dt>V1 completion needed</dt>
            <dd>{comparisonSet?.v1CompletionStatus?.required ? 'YES' : 'NO'}</dd>
          </div>
          <div>
            <dt>Incomplete directions</dt>
            <dd>{incompleteDirections.length ? incompleteDirections.join(', ') : 'NONE'}</dd>
          </div>
          <div>
            <dt>Ready proof assets</dt>
            <dd>{readyProofCount}</dd>
          </div>
          <div>
            <dt>Server job</dt>
            <dd>{activeJob?.status?.toUpperCase() ?? 'NONE'}</dd>
          </div>
        </dl>

        {activeJob ? (
          <div className="site00-cd-production-panel__job" role="status" aria-live="polite">
            <p className="site00-cd-production-panel__job-label">
              {activeJob.progress?.label ?? activeJob.phase ?? activeJob.status}
            </p>
            {activeJob.progress?.total ? (
              <p className="site00-cd-production-panel__job-progress">
                Step {activeJob.progress.current ?? 0} / {activeJob.progress.total}
              </p>
            ) : null}
            {activeJob.status === 'failed' && activeJob.errorMessage ? (
              <p className="site00-admin-panel site00-admin-panel--error">{activeJob.errorMessage}</p>
            ) : null}
          </div>
        ) : null}

        <div className="site00-cd-production-panel__actions">
          <button
            type="button"
            className="site00-cd-production-panel__btn site00-cd-production-panel__btn--primary"
            disabled={jobRunning}
            onClick={() => void startBackgroundJob('full_pipeline')}
          >
            {startingJob
              ? 'STARTING…'
              : jobRunning
                ? 'PIPELINE RUNNING ON SERVER…'
                : 'RUN FULL PIPELINE (BACKGROUND)'}
          </button>

          <label className="site00-cd-production-panel__check">
            <input
              type="checkbox"
              checked={includeAllProofTypes}
              onChange={(e) => setIncludeAllProofTypes(e.target.checked)}
              disabled={jobRunning}
            />
            Include material, typographic, and motion proofs
          </label>

          <button
            type="button"
            className="site00-cd-production-panel__btn"
            disabled={jobRunning}
            onClick={() => void startBackgroundJob('v1_completion')}
          >
            STEP 1 ONLY · V1 COMPLETION
          </button>

          <button
            type="button"
            className="site00-cd-production-panel__btn"
            disabled={jobRunning}
            onClick={() => void startBackgroundJob('six_direction_proofs')}
          >
            STEP 2 ONLY · PROOF PRODUCTION
          </button>

          <button
            type="button"
            className="site00-cd-production-panel__btn site00-cd-production-panel__btn--ghost"
            onClick={() => {
              void pollJob(activeJob?.id).catch((e) =>
                setProductionError(e instanceof Error ? e.message : 'REFRESH FAILED'),
              );
              void reload().catch((e) => setError(e instanceof Error ? e.message : 'REFRESH FAILED'));
            }}
          >
            REFRESH STATUS
          </button>
        </div>

        {productionError ? (
          <p className="site00-admin-panel site00-admin-panel--error site00-cd-production-panel__result">
            {productionError}
          </p>
        ) : null}

        {activeJob?.status === 'completed' && activeJob.result ? (
          <pre className="site00-evolve-debug-pre site00-cd-production-panel__result" aria-live="polite">
            {JSON.stringify(activeJob.result, null, 2)}
          </pre>
        ) : null}

        <p className="site00-cd-production-panel__footer">
          <Link to={SITE00_ADMIN_ROUTES.evolveCreativeDirection(ORG_SLUG)}>OPEN FOUNDER COMPARISON VIEW →</Link>
        </p>
      </section>

      <section className="site00-admin-panel" style={{ marginBottom: '1rem' }}>
        <h2 className="site00-admin-panel-title">FORMATION INSPECTOR</h2>
        <ul style={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
          <li>Brand Lore version: {String(formationMeta?.brandLoreProfileVersion ?? '—')}</li>
          <li>Fingerprint: {String(formationMeta?.brandLoreFingerprint ?? '—')}</li>
          <li>Provider: {String(formationMeta?.providerId ?? (inspector?.creativeIntelligence as Record<string, unknown> | undefined)?.providerId ?? '—')}</li>
          <li>Model: {String(formationMeta?.modelId ?? '—')}</li>
          <li>Formation version: {String(formationMeta?.formationVersion ?? '—')}</li>
          <li>Status: {String(formationMeta?.status ?? formation?.status ?? '—')}</li>
          <li>Candidate count: {String(formationMeta?.candidateCount ?? 0)}</li>
          <li>Revision rounds: {String(formationMeta?.revisionRounds ?? 0)}</li>
          <li>Final directions: {(formationMeta?.finalDirectionNames as string[] | undefined)?.join(', ') || '—'}</li>
          <li>Request count: {String((formationMeta?.providerAccounting as { requestCount?: number } | undefined)?.requestCount ?? 0)}</li>
          <li>Created: {String(formationMeta?.createdAt ?? '—')}</li>
          <li>Updated: {String(formationMeta?.updatedAt ?? '—')}</li>
          <li>Safe error: {String(formationMeta?.error ?? formation?.error ?? '—')}</li>
        </ul>
      </section>

      <p>
        <Link to={SITE00_ADMIN_ROUTES.evolveCreativeDirection(ORG_SLUG)}>← CREATIVE DIRECTION STUDIO</Link>
      </p>

      <label className="site00-cd__structural-toggle">
        <input type="checkbox" checked={structuralDiff} onChange={(e) => setStructuralDiff(e.target.checked)} />
        STRUCTURAL DIFFERENTIATION (hide labels · grayscale)
      </label>

      {territories.length === 3 ? (
        <section className="site00-cd__native-compare site00-cd" style={{ marginTop: '1rem' }}>
          {territories.map((t) => (
            <div key={t.id} data-renderer={territoryRendererKeyFromIndex(t.index)} data-testid={`debug-territory-${t.index}`}>
              {!structuralDiff ? <p>{t.name} · {t.rendererKey}</p> : null}
              {renderTerritoryView(t.index, {
                specimens: t.specimens.slice(0, 4),
                options: { structuralDiffMode: structuralDiff, grayscale: structuralDiff, hideLabels: structuralDiff },
              })}
            </div>
          ))}
        </section>
      ) : null}

      <pre className="site00-admin-panel site00-evolve-debug-pre site00-evolve-debug-pre--full" style={{ marginTop: '1rem' }}>
        {payload ? JSON.stringify(payload, null, 2) : 'Loading…'}
      </pre>
    </Site00AdminShell>
  );
}
