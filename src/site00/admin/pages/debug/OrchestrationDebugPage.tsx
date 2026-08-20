import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { apiFetch } from '../../../../utils/api';

type DebugPayload = {
  label: string;
  persistenceMode?: string;
  organizations: Array<{ id: string; slug: string; name: string; classification: string; client_facing: boolean; reconciliation_state: string; project_health?: string }>;
  infrastructureOrganizations: Array<{ slug: string; name: string; role: string | null; host: string | null }>;
  manifests: Array<{ id: string; target_name: string; target_type: string; is_active: boolean; approval_state: string; label?: string; readiness?: { readinessScore: number; blockingRequirementsRemaining: number; requiredItems: number; completeItems: number } }>;
  commandQueue: Array<{ category: string; organizationName: string; requirementTitle: string; actionLabel: string; reason: string }>;
  nextActions: Array<{ organizationName: string; nextAction: string; blocker: string | null; attentionState: string }>;
  evolveRoadmap: Array<{ title: string; status: string; category: string }>;
  externalConnections: Array<{ logical_name: string; connection_state: string; external_identifier?: string; site00_external_systems?: { system_key: string } }>;
  relationships: Array<{ source: string; target: string; type: string; note: string }>;
  reconciliations?: Array<{ id: string; organization_id?: string; declared_state: string; suggested_state: string; confidence: string; outcome: string; observed_evidence_summary?: string; admin_decision?: string | null; metadata?: { workstream_key?: string } }>;
  evidence?: Array<{ title: string; source_path?: string; confidence?: string; repository?: string }>;
  projectHealth?: Record<string, string>;
  reconciliationSummary?: Record<string, { total: number; requires_review: number }>;
  provisionalBaselines?: Array<{ target: string; readiness?: number; blockers?: number; pendingDecisions?: number }>;
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
  const [selectedOrg, setSelectedOrg] = useState('site-00');

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

  const decide = async (reconciliationId: string, decision: 'ACCEPT' | 'REJECT' | 'MODIFY') => {
    await apiFetch('/api/admin/site00-orchestration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reconcile-decide', reconciliationId, decision }),
    });
    await load();
  };

  useEffect(() => {
    void load();
  }, [load]);

  const selectedOrgId = data?.organizations.find((o) => o.slug === selectedOrg)?.id;
  const orgReconciliations = (data?.reconciliations ?? []).filter(
    (rec) => !selectedOrgId || rec.organization_id === selectedOrgId,
  );

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="DEBUG · PRODUCTION ORCHESTRATION"
        title="MULTI-PROJECT RECONCILIATION"
        subtitle={`Persistence: ${data?.persistenceMode ?? '…'} · Sprint 02 evidence-backed state`}
      />

      <p className="site00-marketing-note">
        <strong>{data?.label ?? 'Loading…'}</strong> — Provisional baselines require admin approval before becoming authoritative launch readiness.
      </p>

      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.root}>← COMMAND</Link></li>
        <li><button type="button" className="site00-orchestration-link-btn" onClick={() => void load()}>REFRESH</button></li>
      </ul>

      {loading && <p>Loading orchestration data…</p>}
      {error && <p className="site00-orchestration-error">{error}</p>}

      {data && (
        <div className="site00-orchestration-grid">
          <Section title="PROJECT HEALTH">
            <ul>
              {Object.entries(data.projectHealth ?? {}).map(([slug, health]) => (
                <li key={slug}>{slug.toUpperCase()}: {health}</li>
              ))}
            </ul>
          </Section>

          <Section title="PROVISIONAL LAUNCH BASELINES">
            <table className="site00-orchestration-table">
              <thead>
                <tr><th>TARGET</th><th>PROVISIONAL READINESS</th><th>BLOCKERS</th><th>PENDING DECISIONS</th></tr>
              </thead>
              <tbody>
                {(data.provisionalBaselines ?? []).map((b, i) => (
                  <tr key={i}>
                    <td>{b.target}</td>
                    <td>{b.readiness != null ? `${b.readiness}% (PROVISIONAL)` : '—'}</td>
                    <td>{b.blockers ?? '—'}</td>
                    <td>{b.pendingDecisions ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="PROJECT REGISTRY">
            <table className="site00-orchestration-table">
              <thead>
                <tr><th>SLUG</th><th>NAME</th><th>CLASSIFICATION</th><th>RECONCILIATION</th><th>HEALTH</th></tr>
              </thead>
              <tbody>
                {data.organizations.map((o) => (
                  <tr key={o.id}>
                    <td>{o.slug}</td>
                    <td>{o.name}</td>
                    <td>{o.classification}</td>
                    <td>{o.reconciliation_state}</td>
                    <td>{o.project_health ?? data.projectHealth?.[o.slug] ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="RECONCILIATION REVIEW">
            <label>
              Filter org:{' '}
              <select value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)}>
                {data.organizations.map((o) => (
                  <option key={o.slug} value={o.slug}>{o.name}</option>
                ))}
              </select>
            </label>
            <table className="site00-orchestration-table">
              <thead>
                <tr><th>WORKSTREAM</th><th>DECLARED</th><th>SUGGESTED</th><th>CONFIDENCE</th><th>EVIDENCE</th><th>DECISION</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {orgReconciliations.filter((r) => !r.admin_decision).slice(0, 20).map((r) => (
                  <tr key={r.id}>
                    <td>{r.metadata?.workstream_key ?? '—'}</td>
                    <td>{r.declared_state}</td>
                    <td>{r.suggested_state}</td>
                    <td>{r.confidence}</td>
                    <td>{(r.observed_evidence_summary ?? '').slice(0, 80)}</td>
                    <td>{r.admin_decision ?? 'PENDING'}</td>
                    <td>
                      <button type="button" onClick={() => void decide(r.id, 'ACCEPT')}>ACCEPT</button>{' '}
                      <button type="button" onClick={() => void decide(r.id, 'REJECT')}>REJECT</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="OBSERVED EVIDENCE (SAMPLE)">
            <ul>
              {(data.evidence ?? []).slice(0, 12).map((e, i) => (
                <li key={i}>[{e.confidence}] {e.title} — {e.repository ?? ''} {e.source_path ?? ''}</li>
              ))}
            </ul>
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

          <Section title="EXTERNAL CONNECTIONS">
            <ul>
              {data.externalConnections.map((c, i) => (
                <li key={i}>
                  {c.logical_name}: {c.connection_state}
                  {c.external_identifier ? ` (${c.external_identifier})` : ''}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="EVOLVE ROADMAP (DEFERRED)">
            <ul>
              {data.evolveRoadmap.map((e, i) => (
                <li key={i}>{e.title} — {e.status}</li>
              ))}
            </ul>
          </Section>
        </div>
      )}
    </Site00AdminShell>
  );
}
