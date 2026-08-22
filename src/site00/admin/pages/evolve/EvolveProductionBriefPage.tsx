import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

const PRODUCTION_TYPES = [
  'CAMPAIGN_KEY_VISUALS',
  'SOCIAL_GRAPHICS',
  'SHORT_FORM_VIDEO',
  'VIDEO_PRODUCTION',
  'EMAIL_IMAGERY',
  'EDITORIAL',
  'BRAND_ASSETS',
  'OTHER',
] as const;

export default function EvolveProductionBriefPage() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();
  const [searchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [productionType, setProductionType] = useState(searchParams.get('type') ?? 'CAMPAIGN_KEY_VISUALS');
  const [objective, setObjective] = useState('');
  const [brief, setBrief] = useState('');
  const [campaignId, setCampaignId] = useState(searchParams.get('campaignId') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [orgs, { overview }] = await Promise.all([
          site00EvolveApi.organizations(),
          site00EvolveApi.overview(orgSlug),
        ]);
        setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
        setOrgName(overview.organizationName);
        if (!objective && overview.currentObjective) setObjective(overview.currentObjective);
      } finally {
        setLoading(false);
      }
    })();
  }, [orgSlug, objective]);

  async function submitBrief(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await site00EvolveApi.requestProduction(orgSlug, {
        productionType,
        objective: objective.trim() || undefined,
        brief: brief.trim() || undefined,
        campaignId: campaignId.trim() || undefined,
      });
      setResult({
        ok: res.ok,
        message: res.ok
          ? `Production request submitted${res.request?.id ? ` · ${String(res.request.id)}` : ''}`
          : res.error ?? 'Request failed',
      });
      if (res.ok) setBrief('');
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <EvolveOrgShell
      orgSlug={orgSlug}
      orgName={orgName}
      activeNav="production"
      title={`${orgName} · PRODUCTION BRIEF`}
      subtitle="Studio World production request — governance and lineage preserved"
      organizations={organizations}
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading brief builder…</p> : null}

      {!loading ? (
        <div className="site00-orchestration-grid">
          <section className="site00-control-panel site00-evolve-ops-brief">
            <h2 className="site00-control-panel__title">NEW PRODUCTION REQUEST</h2>
            <p className="site00-orchestration-meta">
              Product photography remains governance-blocked for client orgs. All requests retain campaign lineage.
            </p>

            <form className="site00-evolve-ops-form" onSubmit={(e) => void submitBrief(e)}>
              <label className="site00-evolve-ops-form__field">
                <span>PRODUCTION TYPE</span>
                <select value={productionType} onChange={(e) => setProductionType(e.target.value)}>
                  {PRODUCTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </label>

              <label className="site00-evolve-ops-form__field">
                <span>OBJECTIVE</span>
                <input type="text" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What should this production achieve?" />
              </label>

              <label className="site00-evolve-ops-form__field">
                <span>CAMPAIGN ID (OPTIONAL)</span>
                <input type="text" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} placeholder="Link to campaign for lineage" />
              </label>

              <label className="site00-evolve-ops-form__field">
                <span>BRIEF</span>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={6}
                  placeholder="Deliverables, references, canon constraints, timeline…"
                  required
                />
              </label>

              <button type="submit" disabled={submitting || !brief.trim()}>
                {submitting ? 'SUBMITTING…' : 'SUBMIT TO STUDIO WORLD'}
              </button>
            </form>

            {result ? (
              <p className={result.ok ? 'site00-evolve-ops-callout site00-evolve-ops-callout--ready' : 'site00-orchestration-error'}>
                {result.message}
              </p>
            ) : null}
          </section>

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">GOVERNANCE</h2>
            <ul className="site00-evolve-ops-list">
              <li>PRODUCT PHOTOGRAPHY — blocked by Studio World governance</li>
              <li>All requests require approval before production begins</li>
              <li>Campaign and calendar lineage preserved in metadata</li>
            </ul>
            <Link to={SITE00_ADMIN_ROUTES.evolveCampaigns(orgSlug)} className="site00-control-panel__link">
              VIEW CAMPAIGNS →
            </Link>
          </section>
        </div>
      ) : null}
    </EvolveOrgShell>
  );
}
