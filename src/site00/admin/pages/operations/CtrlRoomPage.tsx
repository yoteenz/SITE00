import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

function formatCurrency(n?: number) {
  if (n == null) return '—';
  return `$${Number(n).toLocaleString()}`;
}

type CtrlRoomPayload = {
  blockers: Array<Record<string, unknown>>;
  approvals: Array<Record<string, unknown>>;
  newLeads: Array<Record<string, unknown>>;
  upcomingDiscovery: Array<Record<string, unknown>>;
  overdueInvoices: Array<Record<string, unknown>>;
};

export default function CtrlRoomPage() {
  const [data, setData] = useState<CtrlRoomPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ProductionApi
      .ctrlRoom()
      .then((payload) => setData(payload as unknown as CtrlRoomPayload))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD CTRL ROOM'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ CTRL ROOM ]</h1>
          <p className="site00-admin-page-subtitle">ADMIN ATTENTION CENTER — WHAT NEEDS ACTION NOW.</p>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading ctrl room" />
      ) : (
        <div className="site00-admin-dashboard-grid">
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">
              <Link to={SITE00_ADMIN_ROUTES.projects}>BLOCKERS →</Link>
            </h2>
            {(data?.blockers ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO OPEN BLOCKERS.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.blockers ?? []).map((b) => (
                  <li key={String(b.id)} className="site00-admin-activity-list__item">
                    <div>
                      <p className="site00-admin-activity-list__summary">{String(b.title ?? b.description ?? 'BLOCKER')}</p>
                      {(b.site00_projects as { id?: string; name?: string })?.id ? (
                        <Link
                          to={SITE00_ADMIN_ROUTES.project(String((b.site00_projects as { id: string }).id))}
                          className="site00-admin-activity-list__entity"
                        >
                          {String((b.site00_projects as { name: string }).name)}
                        </Link>
                      ) : b.project_id ? (
                        <Link
                          to={SITE00_ADMIN_ROUTES.project(String(b.project_id))}
                          className="site00-admin-activity-list__entity"
                        >
                          VIEW PROJECT →
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">
              <Link to={SITE00_ADMIN_ROUTES.approvals}>APPROVALS →</Link>
            </h2>
            {(data?.approvals ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO PENDING APPROVALS.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.approvals ?? []).map((a) => (
                  <li key={String(a.id)} className="site00-admin-activity-list__item">
                    <div>
                      <p className="site00-admin-activity-list__summary">{String(a.title ?? a.category ?? 'APPROVAL')}</p>
                      {(a.site00_projects as { id?: string; name?: string })?.id ? (
                        <Link
                          to={SITE00_ADMIN_ROUTES.projectApprovals(String((a.site00_projects as { id: string }).id))}
                          className="site00-admin-activity-list__entity"
                        >
                          {String((a.site00_projects as { name: string }).name)}
                        </Link>
                      ) : null}
                    </div>
                    <AdminStatusBadge status={String(a.status ?? 'ADMIN_REVIEW')} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">
              <Link to={`${SITE00_ADMIN_ROUTES.leads}?status=NEW`}>NEW LEADS →</Link>
            </h2>
            {(data?.newLeads ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO NEW LEADS.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.newLeads ?? []).map((lead) => (
                  <li key={String(lead.id)} className="site00-admin-activity-list__item">
                    <Link to={SITE00_ADMIN_ROUTES.lead(String(lead.id))}>{String(lead.contact_name)}</Link>
                    <span>{String(lead.email)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">
              <Link to={`${SITE00_ADMIN_ROUTES.discovery}?status=UPCOMING`}>UPCOMING DISCOVERY →</Link>
            </h2>
            {(data?.upcomingDiscovery ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO UPCOMING DISCOVERY CALLS.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.upcomingDiscovery ?? []).map((booking) => (
                  <li key={String(booking.id)} className="site00-admin-activity-list__item">
                    <Link to={SITE00_ADMIN_ROUTES.discoveryBooking(String(booking.id))}>
                      {String(booking.contact_name)}
                    </Link>
                    <time dateTime={String(booking.scheduled_at)}>{formatDate(String(booking.scheduled_at))}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">
              <Link to={SITE00_ADMIN_ROUTES.finance}>OVERDUE INVOICES →</Link>
            </h2>
            {(data?.overdueInvoices ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO OVERDUE INVOICES.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.overdueInvoices ?? []).map((inv) => (
                  <li key={String(inv.id)} className="site00-admin-activity-list__item">
                    <Link to={SITE00_ADMIN_ROUTES.invoice(String(inv.id))}>{String(inv.invoice_number)}</Link>
                    <span>{formatCurrency(Number(inv.amount))}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Site00AdminShell>
  );
}
