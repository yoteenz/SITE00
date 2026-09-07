/**
 * Expression Engine — compact campaign summary + link to full workspace.
 */

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { site00ProjectExpressionEngineCampaignPath } from '../../config/routes';
import { expressionEngineApi } from '../../services/expressionEngineApi';

type Props = {
  projectSlug: string;
  compact?: boolean;
};

export function ExpressionEngineCampaignPanel({ projectSlug, compact = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entry002Title, setEntry002Title] = useState('ENTRY 002');
  const [territoryName, setTerritoryName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('—');
  const [anchorFormat, setAnchorFormat] = useState<string | null>(null);
  const [assetsGenerated, setAssetsGenerated] = useState(0);
  const [ready, setReady] = useState(false);
  const [blockerCount, setBlockerCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    expressionEngineApi
      .phase2()
      .then((data) => {
        if (cancelled) return;
        setEntry002Title(data.entry002.title);
        setTerritoryName(data.blueprint.territoryName);
        setStatus(data.entry002.status);
        setAnchorFormat(data.blueprint.creativeAnchorRecommendation.format);
        setAssetsGenerated(data.entry002.assetsGenerated);
        setReady(data.readiness002.ready);
        setBlockerCount(data.readiness002.blockers.length);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load Expression Engine';
          setError(
            msg.includes('Unexpected token') || msg.includes('<!DOCTYPE')
              ? 'Expression Engine API unavailable — redeploy Railway API from main, or use local dev with npm run dev'
              : msg,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const href = site00ProjectExpressionEngineCampaignPath(projectSlug);

  if (compact) {
    return (
      <section className="site00-expr-engine-panel site00-expr-engine-panel--compact">
        <p className="site00-expr-engine-panel__kicker">EXPRESSION ENGINE · B1</p>
        {loading ? <p className="site00-expr-engine-panel__meta">Loading blueprint…</p> : null}
        {error ? <p className="site00-expr-engine-panel__meta">{error}</p> : null}
        {!loading && !error ? (
          <>
            <p className="site00-expr-engine-panel__title">{entry002Title}</p>
            <p className="site00-expr-engine-panel__meta">
              {territoryName ?? '—'} · {status} · assets {assetsGenerated}
            </p>
            <p className="site00-expr-engine-panel__meta">
              Anchor: {anchorFormat ?? '—'} · {ready ? 'READY' : `${blockerCount} blocker(s)`}
            </p>
          </>
        ) : null}
        <Link to={href} className="site00-fws-ingest-link">
          OPEN EXPRESSION ENGINE →
        </Link>
      </section>
    );
  }

  return (
    <section className="site00-expr-engine-panel">
      <h2 className="site00-expr-engine-panel__heading">EXPRESSION ENGINE</h2>
      <p className="site00-expr-engine-panel__meta">Studio World entry production blueprint — B1 live proof</p>
      {loading ? <p className="site00-expr-engine-panel__meta">Loading…</p> : null}
      {error ? <p className="site00-expr-engine-panel__meta">{error}</p> : null}
      {!loading && !error ? (
        <dl className="site00-expr-engine-panel__dl">
          <dt>ENTRY 002</dt>
          <dd>{entry002Title}</dd>
          <dt>TERRITORY</dt>
          <dd>{territoryName ?? '—'}</dd>
          <dt>STATUS</dt>
          <dd>{status}</dd>
          <dt>ANCHOR</dt>
          <dd>{anchorFormat ?? '—'}</dd>
          <dt>ASSETS</dt>
          <dd>{assetsGenerated}</dd>
          <dt>READINESS</dt>
          <dd>{ready ? 'READY' : `${blockerCount} blocker(s)`}</dd>
        </dl>
      ) : null}
      <Link to={href} className="site00-btn site00-btn--primary">
        OPEN FULL BLUEPRINT →
      </Link>
    </section>
  );
}
