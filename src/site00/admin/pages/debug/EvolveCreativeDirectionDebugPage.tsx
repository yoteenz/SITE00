import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

export default function EvolveCreativeDirectionDebugPage() {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00EvolveApi
      .creativeDirectionDebug('ndxbook')
      .then(setPayload)
      .catch((e) => setError(e instanceof Error ? e.message : 'LOAD FAILED'));
  }, []);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <h1 className="site00-admin-page-title">[ CREATIVE DIRECTION DEBUG ]</h1>
        <p className="site00-admin-page-subtitle">NDXBOOK · intelligence · territories · provenance · lifecycle</p>
      </header>
      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}
      <p>
        <Link to={SITE00_ADMIN_ROUTES.evolveCreativeDirection('ndxbook')}>← CREATIVE DIRECTION STUDIO</Link>
      </p>
      <pre className="site00-admin-panel" style={{ overflow: 'auto', fontSize: '0.65rem' }}>
        {payload ? JSON.stringify(payload, null, 2) : 'Loading…'}
      </pre>
    </Site00AdminShell>
  );
}
