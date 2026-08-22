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
  const [error, setError] = useState<string | null>(null);
  const [structuralDiff, setStructuralDiff] = useState(false);

  useEffect(() => {
    site00EvolveApi
      .creativeDirectionDebug('ndxbook')
      .then(setPayload)
      .catch((e) => setError(e instanceof Error ? e.message : 'LOAD FAILED'));
  }, []);

  const engagement = payload?.engagement as { territories?: Territory[] } | undefined;
  const territories = engagement?.territories ?? [];

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <h1 className="site00-admin-page-title">[ CREATIVE DIRECTION DEBUG ]</h1>
        <p className="site00-admin-page-subtitle">NDXBOOK · structural differentiation · renderer registry</p>
      </header>
      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}
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
