import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { apiFetch } from '../../../../utils/api';

type DebugPayload = {
  label: string;
  organizations: Array<{ id: string; slug: string; name: string; classification: string; client_facing: boolean; reconciliation_state: string }>;
  infrastructureOrganizations: Array<{ slug: string; name: string; role: string | null; host: string | null }>;
  manifests: Array<{ id: string; target_name: string; target_type: string; is_active: boolean; approval_state: string; readiness?: { readinessScore: number; blockingRequirementsRemaining: number; requiredItems: number; completeItems: number } }>;
  commandQueue: Array<{ category: string; organizationName: string; requirementTitle: string; actionLabel: string; reason: string }>;
  nextActions: Array<{ organizationName: string; nextAction: string; blocker: string | null; attentionState: string }>;
  evolveRoadmap: Array<{ title: string; status: string; category: string }>;
  externalConnections: Array<{ logical_name: string; connection_state: string; external_system_key?: string }>;
  relationships: Array<{ source: string; target: string; type: string; note: string }>;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="site00-orchestration-section">
      <h2 className="site00-orchestration-section-title">{title}</h2>
      {children}
    </section>
  );
}

export default function OrchestrationDebugPage() {
  const [data, setData] = useState<DebugPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/admin/site00-orchestration?action=debug');
      const payload = (await res.json()) as DebugPayload;
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orchestration data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="DEBUG · PRODUCTION ORCHESTRATION"
        title="MULTI-PROJECT ORCHESTRATION"
        subtitle="Sprint 01 foundation — DEMO / UNRECONCILED fixtures only"
      />

      <p className="site00-marketing-note">
        <strong>{data?.label ?? 'DEMO / UNRECONCILED'}</strong> — Not authoritative production state. Sprint 02 will connect external repos and reconcile.
      </p>

      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.root}>← COMMAND</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.evolveMarketingDebug}>EVOLVE MARKETING DEBUG</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.emailPack}>EMAIL PACK</Link></li>
      </ul>

      {loading && <p>Loading orchestration data…</p>}
      {error && <p className="site00-orchestration-error">{error}</p>}

      {data && (
        <div className="site00-orchestration-grid">
          <Section title="PROJECT REGISTRY">
            <table className="site00-orchestration-table">
              <thead>
                <tr><th>SLUG</th><th>NAME</th><th>CLASSIFICATION</th><th>CLIENT FACING</th><th>STATE</th></tr>
              </thead>
              <tbody>
                {data.organizations.map((o) => (
                  <tr key={o.id}>
                    <td>{o.slug}</td>
                    <td>{o.name}</td>
                    <td>{o.classification}</td>
                    <td>{o.client_facing ? 'YES' : 'NO'}</td>
                    <td>{o.reconciliation_state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="INFRASTRUCTURE (NOT CLIENT BRANDS)">
            <ul>
              {data.infrastructureOrganizations.map((o) => (
                <li key={o.slug}>{o.name} — {o.role} @ {o.host ?? 'N/A'}</li>
              ))}
            </ul>
          </Section>

          <Section title="RELATIONSHIPS">
            <ul>
              {data.relationships.map((r) => (
                <li key={`${r.source}-${r.type}`}>{r.source} → {r.target} ({r.type}): {r.note}</li>
              ))}
            </ul>
          </Section>

          <Section title="LAUNCH MANIFESTS & READINESS">
            <table className="site00-orchestration-table">
              <thead>
                <tr><th>TARGET</th><th>TYPE</th><th>ACTIVE</th><th>APPROVAL</th><th>READINESS</th><th>BLOCKERS</th></tr>
              </thead>
              <tbody>
                {data.manifests.map((m) => (
                  <tr key={m.id}>
                    <td>{m.target_name}</td>
                    <td>{m.target_type}</td>
                    <td>{m.is_active ? 'YES' : 'NO'}</td>
                    <td>{m.approval_state}</td>
                    <td>{m.readiness ? `${m.readiness.readinessScore}%` : '—'}</td>
                    <td>{m.readiness?.blockingRequirementsRemaining ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="COMMAND QUEUE">
            <table className="site00-orchestration-table">
              <thead>
                <tr><th>CATEGORY</th><th>ORG</th><th>ITEM</th><th>ACTION</th><th>REASON</th></tr>
              </thead>
              <tbody>
                {data.commandQueue.slice(0, 15).map((item, i) => (
                  <tr key={i}>
                    <td>{item.category}</td>
                    <td>{item.organizationName}</td>
                    <td>{item.requirementTitle}</td>
                    <td>{item.actionLabel}</td>
                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="NEXT ACTIONS">
            <ul>
              {data.nextActions.slice(0, 10).map((a, i) => (
                <li key={i}>
                  [{a.attentionState}] {a.organizationName}: {a.nextAction}
                  {a.blocker ? ` — BLOCKER: ${a.blocker}` : ''}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="EVOLVE ROADMAP (DEFERRED)">
            <ul>
              {data.evolveRoadmap.map((e, i) => (
                <li key={i}>{e.title} — {e.status} ({e.category})</li>
              ))}
            </ul>
          </Section>

          <Section title="EXTERNAL CONNECTIONS">
            <ul>
              {data.externalConnections.map((c, i) => (
                <li key={i}>{c.logical_name}: {c.connection_state}</li>
              ))}
            </ul>
          </Section>
        </div>
      )}
    </Site00AdminShell>
  );
}
