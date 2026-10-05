import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { EvolveApprovalItem } from '../../types/evolve';

export default function EvolveApprovalsInboxPage() {
  const [items, setItems] = useState<EvolveApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { approvals } = await site00EvolveApi.approvalsInbox();
      setItems(approvals);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load approvals inbox');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: string, action: 'approve' | 'reject') {
    setBusyId(id);
    try {
      if (action === 'approve') await site00EvolveApi.approveItem(id);
      else await site00EvolveApi.rejectItem(id, 'Operator rejected');
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / EVOLVE"
        title="APPROVALS INBOX"
        subtitle="Cross-portfolio marketing approvals — strategy, campaigns, content, production"
      />

      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.dashboard}>← COMMAND</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.evolve}>EVOLVE PORTFOLIO</Link></li>
        <li>
          <button type="button" className="site00-orchestration-link-btn" onClick={() => void load()}>
            REFRESH
          </button>
        </li>
      </ul>

      {loading ? <p className="site00-evolve-ops-loading">Loading approvals…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading && items.length === 0 ? (
        <section className="site00-control-panel site00-evolve-ops-empty">
          <h2 className="site00-control-panel__title">INBOX CLEAR</h2>
          <p className="site00-control-empty">NO PENDING MARKETING APPROVALS</p>
        </section>
      ) : null}

      {!loading && items.length > 0 ? (
        <section className="site00-control-panel site00-evolve-ops-workspace">
          <h2 className="site00-control-panel__title">PENDING DECISIONS</h2>
          <ul className="site00-evolve-ops-approvals">
            {items.map((item) => (
              <li key={item.id} className="site00-evolve-ops-approvals__item">
                <div className="site00-evolve-ops-approvals__main">
                  <p className="site00-evolve-ops-list__title">
                    {formatEvolveLabel(item.approval_type)} · {formatEvolveLabel(item.subject_type)}
                  </p>
                  <p className="site00-orchestration-meta">
                    {item.organizationName ?? item.organizationSlug?.toUpperCase()}
                    {item.requested_by ? ` · requested by ${item.requested_by}` : ''}
                  </p>
                  <span className={`site00-control-priority__pill ${evolveStatusPillClass(item.status)}`}>
                    {formatEvolveLabel(item.status)}
                  </span>
                </div>
                <div className="site00-evolve-ops-approvals__actions">
                  {item.organizationSlug ? (
                    <Link to={SITE00_ADMIN_ROUTES.evolveOrg(item.organizationSlug)} className="site00-control-panel__link">
                      OPEN ORG →
                    </Link>
                  ) : null}
                  <button type="button" disabled={busyId === item.id} onClick={() => void decide(item.id, 'approve')}>
                    APPROVE
                  </button>
                  <button type="button" disabled={busyId === item.id} onClick={() => void decide(item.id, 'reject')}>
                    REJECT
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Site00AdminShell>
  );
}
