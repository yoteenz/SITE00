import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

const DEBUG_ORGS = ['site-00', 'frontal-slayer', 'all-in-one-enterprises', 'studio-world'];

export default function EvolveDebugPage() {
  const [orgSlug, setOrgSlug] = useState('frontal-slayer');
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPayload(await site00EvolveApi.debug(orgSlug));
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / DEBUG"
        title="EVOLVE MARKETING OS"
        subtitle="Explainable intelligence — assessment, manifest, NBA, lineage"
      />

      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.evolve}>← EVOLVE OVERVIEW</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.dashboard}>COMMAND</Link></li>
      </ul>

      <div className="site00-email-debug-filters">
        {DEBUG_ORGS.map((slug) => (
          <button key={slug} type="button" className={orgSlug === slug ? 'active' : ''} onClick={() => setOrgSlug(slug)}>
            {slug.toUpperCase()}
          </button>
        ))}
        <button type="button" disabled={loading} onClick={() => void load()}>REFRESH</button>
      </div>

      {loading ? <p>Loading debug payload…</p> : null}

      {payload ? (
        <pre className="site00-evolve-debug-pre site00-evolve-debug-pre--full">
          {JSON.stringify(payload, null, 2)}
        </pre>
      ) : null}
    </Site00AdminShell>
  );
}
