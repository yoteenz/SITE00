import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { renderTerritoryView, territoryRendererKeyFromIndex } from '../../../components/evolve/creative-direction/TerritoryRendererRegistry';

type Territory = {
  id: string;
  index: number;
  name: string;
  rendererKey: string;
  specimens: Array<{ id: string; specimenType: string; title: string; status: string }>;
};

export default function EvolveCreativeDirectionDebugPage() {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [inspector, setInspector] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [structuralDiff, setStructuralDiff] = useState(false);

  useEffect(() => {
    Promise.all([
      site00EvolveApi.creativeDirectionDebug('ndxbook'),
      site00EvolveApi.creativeDirectionFormationInspector('ndxbook'),
    ])
      .then(([debugPayload, formationInspector]) => {
        setPayload(debugPayload);
        setInspector(formationInspector);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'LOAD FAILED'));
  }, []);

  const engagement = payload?.engagement as { territories?: Territory[] } | undefined;
  const territories = engagement?.territories ?? [];
  const formation = inspector?.formation as Record<string, unknown> | null | undefined;
  const formationMeta = inspector?.inspector as Record<string, unknown> | null | undefined;

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <h1 className="site00-admin-page-title">[ CREATIVE DIRECTION DEBUG ]</h1>
        <p className="site00-admin-page-subtitle">NDXBOOK · formation inspector · structural differentiation</p>
      </header>
      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}
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
        <Link to={SITE00_ADMIN_ROUTES.evolveCreativeDirection('ndxbook')}>← CREATIVE DIRECTION STUDIO</Link>
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
      <pre className="site00-admin-panel" style={{ overflow: 'auto', fontSize: '0.65rem', marginTop: '1rem' }}>
        {payload ? JSON.stringify(payload, null, 2) : 'Loading…'}
      </pre>
    </Site00AdminShell>
  );
}
