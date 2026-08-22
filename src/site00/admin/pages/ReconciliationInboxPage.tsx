import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ControlPageHeader } from '../components/control/ControlPageHeader';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { ProjectSwitcher } from '../components/orchestration/ProjectSwitcher';
import { site00OrchestrationApi } from '../services/orchestrationApi';
import type { ReconciliationInboxItem } from '../types/orchestration';
import { SITE00_ADMIN_ROUTES } from '../config/routes';

export default function ReconciliationInboxPage() {
  const [searchParams] = useSearchParams();
  const orgFilter = searchParams.get('org') ?? '';
  const [items, setItems] = useState<ReconciliationInboxItem[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dash = await site00OrchestrationApi.dashboard();
      setOrganizations(dash.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      const inbox = orgFilter
        ? dash.reconciliationInbox.filter((r) => r.organizationSlug === orgFilter)
        : dash.reconciliationInbox;
      setItems(inbox);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'FAILED TO LOAD RECONCILIATION INBOX');
    } finally {
      setLoading(false);
    }
  }, [orgFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (id: string, decision: 'ACCEPT' | 'REJECT') => {
    await site00OrchestrationApi.reconcileDecide(id, decision);
    await load();
  };

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / CONTROL · ORCHESTRATION"
        title="RECONCILIATION INBOX"
        subtitle="Evidence-backed suggestions requiring operator judgment"
        actions={<ProjectSwitcher organizations={organizations} selected={orgFilter || undefined} includeAll />}
      />

      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.dashboard}>← COMMAND</Link></li>
        <li><button type="button" className="site00-orchestration-link-btn" onClick={() => void load()}>REFRESH</button></li>
      </ul>

      {loading ? <p>Loading reconciliation inbox…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading && items.length === 0 ? (
        <p className="site00-control-empty">NO PENDING RECONCILIATION DECISIONS</p>
      ) : (
        <table className="site00-admin-table site00-control-table site00-orchestration-table">
          <thead>
            <tr>
              <th>PROJECT</th>
              <th>WORKSTREAM</th>
              <th>DECLARED</th>
              <th>SUGGESTED</th>
              <th>CONFIDENCE</th>
              <th>EVIDENCE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.organizationName}</td>
                <td>{r.workstreamKey ?? r.requirementKey ?? '—'}</td>
                <td>{r.declaredState}</td>
                <td>{r.suggestedState}</td>
                <td>{r.confidence}</td>
                <td>{r.evidenceSummary.slice(0, 120)}</td>
                <td>
                  <button type="button" onClick={() => void decide(r.id, 'ACCEPT')}>CONFIRM</button>{' '}
                  <button type="button" onClick={() => void decide(r.id, 'REJECT')}>REJECT</button>{' '}
                  <button type="button" onClick={() => void decide(r.id, 'REJECT')}>DEFER</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Site00AdminShell>
  );
}
