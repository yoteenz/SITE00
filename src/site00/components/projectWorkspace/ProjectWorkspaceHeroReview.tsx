import { useCallback, useEffect, useState } from 'react';
import type { ProjectWorkspaceHeroRun } from '../../../../shared/site00-brand-lore/projectWorkspace/types.js';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';

type ProjectWorkspaceHeroReviewProps = {
  projectSlug: string;
};

export function ProjectWorkspaceHeroReview({ projectSlug }: ProjectWorkspaceHeroReviewProps) {
  const [run, setRun] = useState<ProjectWorkspaceHeroRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await site00ProjectsApi.projectWorkspaceHeroGet(projectSlug);
      setRun(res.run as ProjectWorkspaceHeroRun | null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load workspace hero');
    }
  }, [projectSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (fn: () => Promise<{ run: Record<string, unknown> }>) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fn();
      setRun(res.run as ProjectWorkspaceHeroRun);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (!run) {
    return <p className="site00-experiment-e__meta">Loading project workspace hero…</p>;
  }

  return (
    <section className="site00-pws-hero-review" aria-label="NDXBOOK hero proof">
      <h3 className="site00-experiment-e__title">PROJECT WORKSPACE · NDXBOOK HERO PROOF</h3>
      <p className="site00-experiment-e__meta">
        Ownership: {run.workspaceCanon.layer.replace(/_/g, ' ')} · Client expression fingerprint{' '}
        {run.clientExpression.fingerprint}
      </p>

      <details className="site00-experiment-e__canon" open>
        <summary>PROJECT WORKSPACE CANON</summary>
        <p>{run.workspaceCanon.conceptLabel}</p>
        <p>{run.workspaceCanon.experimentEDiscovery.summary}</p>
      </details>

      <details className="site00-experiment-e__canon">
        <summary>NDXBOOK CLIENT PROJECT EXPRESSION</summary>
        <p>{run.clientExpression.expressiveTypographyBehavior}</p>
        <p>Prohibited: {run.clientExpression.prohibitedTraits.join(' · ')}</p>
      </details>

      {run.heroSubset ? (
        <details className="site00-experiment-e__canon" open>
          <summary>HERO FRAME ASSET SUBSET</summary>
          <p>
            {run.heroSubset.roles.length} roles · full manifest had{' '}
            {run.heroSubset.fullManifestRequirementCount} · reusable {run.heroSubset.reusableAssetCount} · missing{' '}
            {run.heroSubset.missingAssetCount}
          </p>
          <p>
            Est. FAL: {run.heroSubset.estimatedFalRequests} · ${run.heroSubset.estimatedCostUsd.toFixed(3)} · scope{' '}
            {run.heroSubset.scopeValid ? 'valid' : run.heroSubset.scopeBlockReason}
          </p>
          <ul>
            {run.heroSubset.roles.map((r) => (
              <li key={r.roleId}>
                {r.assetFamily} — {r.missing ? 'MISSING' : r.reusableAssetId ? 'REUSE' : 'OK'}
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <button type="button" disabled={busy} onClick={() => void act(() => site00ProjectsApi.projectWorkspaceCompileHeroSubset(projectSlug))}>
          COMPILE HERO FRAME ASSET SUBSET
        </button>
      )}

      <div className="site00-experiment-e__controls">
        <button
          type="button"
          className="site00-btn site00-btn--primary"
          disabled={busy || !run.heroSubset?.scopeValid}
          onClick={() => void act(() => site00ProjectsApi.projectWorkspaceGenerateHero(projectSlug))}
        >
          {busy ? 'GENERATING…' : 'GENERATE HERO ASSETS (FOUNDER TRIGGER)'}
        </button>
        <button
          type="button"
          className="site00-btn site00-btn--primary"
          disabled={busy || (run.generatedAssets.length === 0 && !run.heroSubset?.reusableAssetCount)}
          onClick={() => void act(() => site00ProjectsApi.projectWorkspaceComposeHero(projectSlug))}
        >
          {busy ? 'COMPOSING…' : 'COMPOSE HERO FRAME'}
        </button>
      </div>

      {run.heroComposition ? (
        <div className="site00-pws-hero-review__preview">
          <p className="site00-experiment-e__meta">
            Hero preview · {run.heroGenerated ? 'READY FOR REVIEW' : 'PENDING'}
          </p>
          {run.heroComposition.publicUrl ? (
            <img
              src={run.heroComposition.publicUrl}
              alt="NDXBOOK project home hero frame"
              className="site00-pws-hero-review__image"
            />
          ) : (
            <p className="site00-experiment-e__meta">
              Proof stored at {run.heroComposition.storagePath ?? 'unknown path'} — preview URL unavailable until Railway
              has FAL_KEY and composition completes.
            </p>
          )}
        </div>
      ) : run.generationStarted ? (
        <p className="site00-experiment-e__pending">Assets generated — compose hero frame to render the full preview below.</p>
      ) : null}

      {run.heroComposition ? (
        <details className="site00-experiment-e__canon">
          <summary>HERO COMPOSITION METADATA</summary>
          <p>{run.heroComposition.storagePath}</p>
        </details>
      ) : null}

      {run.heroComposition ? (
        <div className="site00-experiment-e__judgment">
          {(['LOVE_THE_DIRECTION', 'PROMISING_REVISE', 'NOT_THE_DIRECTION'] as const).map((j) => (
            <button
              key={j}
              type="button"
              disabled={busy}
              onClick={() => void act(() => site00ProjectsApi.projectWorkspaceHeroJudgment(projectSlug, j))}
            >
              {j.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      ) : null}

      {run.heroJudgment ? <p className="site00-experiment-e__meta">Judgment: {run.heroJudgment}</p> : null}
      {error ? <p className="site00-experiment-e__error" role="alert">{error}</p> : null}
    </section>
  );
}
